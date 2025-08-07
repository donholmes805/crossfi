
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Player, User, ChatMessage, GameMode, Difficulty, GridData } from './types';
import LobbyScreen from './components/LobbyScreen';
import GameBoardScreen from './components/GameBoardScreen';
import GameOverScreen from './components/GameOverScreen';
import CoinFlipScreen from './components/CoinFlipScreen';
import ThemeVotingScreen from './components/ThemeVotingScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import ModeSelectionScreen from './components/ModeSelectionScreen';
import WinnerCelebrationScreen from './components/WinnerCelebrationScreen';
import { generateWordsAndGrid, THEMES } from './services/gameService';
import * as authService from './services/authService';
import { p2pService, P2PMessage } from './services/p2pService';
import { PVP_WORDS_TO_WIN, PVC_WORDS_TO_WIN, AI_OPPONENTS, PVP_TOTAL_WORDS_IN_PUZZLE, PVC_TOTAL_WORDS_IN_PUZZLE } from './constants';
import Logo from './components/icons/Logo';
import Footer from './components/common/Footer';
import LoginModal from './components/LoginModal';
import AuthModal from './components/AuthModal';
import ProfileWidget from './components/ProfileWidget';
import ProfileScreen from './components/ProfileScreen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.ModeSelection);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [firstPlayerIndex, setFirstPlayerIndex] = useState(0);
  const [wordsToWin, setWordsToWin] = useState(PVP_WORDS_TO_WIN);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [rematchRequests, setRematchRequests] = useState<string[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});

  // Auth & P2P system initialization
  useEffect(() => {
    const user = authService.getLoggedInUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsAuthLoading(false);

    const handlePeerId = (id: string) => setPeerId(id);
    const handleConnectionOpen = () => {
      if (p2pService.isHost) {
        setGameState(GameState.Lobby);
      }
    };
    const handleConnectionClosed = () => {
        setError("Opponent disconnected.");
        p2pService.disconnect();
        handleNavigate(GameState.ModeSelection);
    };
    const handleError = (err: Error) => {
        console.error("P2P Error:", err);
        setError(`Connection error: ${err.message}. Please refresh and try again.`);
        p2pService.disconnect();
    };

    const unsubscribes = [
      p2pService.on('peer-id-generated', handlePeerId),
      p2pService.on('connection-open', handleConnectionOpen),
      p2pService.on('connection-closed', handleConnectionClosed),
      p2pService.on('error', handleError),
    ];

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  // Handle joining a game via URL after user is authenticated
  useEffect(() => {
    if (currentUser && !p2pService.peer) {
        const searchParams = new URLSearchParams(window.location.search);
        const peerIdFromUrl = searchParams.get('join');
        
        if (peerIdFromUrl) {
            // A join link was found. Initialize as a guest.
            p2pService.initializeAsGuestAndConnect(peerIdFromUrl);
            setGameMode(GameMode.PlayerVsPlayer);
            setGameState(GameState.Lobby);
            
            // Clean the URL to prevent re-joining on refresh.
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
  }, [currentUser]);

  const handleP2PData = useCallback((data: P2PMessage) => {
    switch (data.type) {
        case 'START_GAME':
            setGridData(data.payload.gridData);
            setFirstPlayerIndex(data.payload.firstPlayerIndex);
            setWordsToWin(data.payload.wordsToWin);
            setWinner(null);
            setMessages([]);
            setRematchRequests([]);
            setVotes({});
            setPlayers(currentPlayers => currentPlayers.map(p => ({ ...p, score: 0, bonusTime: 0, bonusesEarned: 0 })));
            setGameState(GameState.InGame);
            break;
        case 'GAME_STATE_UPDATE':
            setPlayers(data.payload.players);
            setGridData(data.payload.gridData);
            break;
        case 'GAME_OVER':
            setWinner(data.payload.winner);
            setPlayers(data.payload.finalPlayers);
            setGameState(GameState.WinnerCelebration);
            break;
        case 'CHAT_MESSAGE':
            setMessages(prev => [...prev, data.payload]);
            break;
        case 'REMATCH_REQUEST':
            setRematchRequests(prev => {
                const otherPlayerId = players.find(p => p.id !== currentUser?.id)?.id;
                if (!otherPlayerId || prev.includes(otherPlayerId)) return prev;
                return [...prev, otherPlayerId];
            });
            break;
        case 'THEME_VOTE': {
            const opponent = players.find(p => p.id !== currentUser?.id);
            if (opponent) {
                setVotes(prev => ({ ...prev, [opponent.id]: data.payload.theme }));
            }
            break;
        }
    }
  }, [players, currentUser]);
  
  // Subscribe to P2P data events
  useEffect(() => {
    return p2pService.on('data-received', handleP2PData);
  }, [handleP2PData]);

  const handleLogin = (user: User) => {
    authService.setCurrentUserId(user.id);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.clearCurrentUserId();
    setCurrentUser(null);
    p2pService.disconnect();
    setGameState(GameState.ModeSelection);
  };
  
  const handleDeleteCurrentUser = () => {
    if (currentUser) {
        authService.deleteUser(currentUser.id);
        handleLogout();
    }
  };

  const handleNavigate = (state: GameState) => {
    setError(null);
    setGameState(state);
  };

  const handleModeSelected = useCallback((mode: GameMode, diff: Difficulty) => {
    if (!currentUser) return;
    setGameMode(mode);
    setDifficulty(diff);
    setError(null);

    if (mode === GameMode.PlayerVsComputer) {
        const aiOpponent = AI_OPPONENTS[diff];
        const initialPlayers = [
          { ...currentUser, score: 0, bonusTime: 0, bonusesEarned: 0 },
          { ...aiOpponent, score: 0, bonusTime: 0, bonusesEarned: 0 },
        ];
        setPlayers(initialPlayers);
        handleNavigate(GameState.Lobby);
    } else {
        p2pService.initializeAsHost();
        const hostPlayer = { ...currentUser, score: 0, bonusTime: 0, bonusesEarned: 0 };
        setPlayers([hostPlayer]);
        handleNavigate(GameState.Lobby);
    }
  }, [currentUser]);

  const handleLeaveLobby = useCallback(() => {
    p2pService.disconnect();
    setPeerId(null);
    setPlayers([]);
    handleNavigate(GameState.ModeSelection);
  }, []);
  
  const startNewGame = useCallback(async (fpIndex: number, theme?: string) => {
    if (!gameMode || (gameMode === GameMode.PlayerVsPlayer && !p2pService.isHost)) return;

    setIsLoading(true);
    setError(null);

    const isPvc = gameMode === GameMode.PlayerVsComputer;
    const wordsToWinForGame = isPvc ? PVC_WORDS_TO_WIN : PVP_WORDS_TO_WIN;
    const totalWordsForGame = isPvc ? PVC_TOTAL_WORDS_IN_PUZZLE : PVP_TOTAL_WORDS_IN_PUZZLE;
    setWordsToWin(wordsToWinForGame);

    try {
      const data = await generateWordsAndGrid(totalWordsForGame, theme);
      if (isPvc) {
        setGridData(data);
        setFirstPlayerIndex(fpIndex);
        setWinner(null);
        setMessages([]); 
        setRematchRequests([]);
        setVotes({});
        setPlayers(currentPlayers => currentPlayers.map(p => ({ ...p, score: 0, bonusTime: 0, bonusesEarned: 0 })));
        handleNavigate(GameState.InGame);
      } else {
        p2pService.sendMessage({ type: 'START_GAME', payload: { firstPlayerIndex: fpIndex, gridData: data, wordsToWin: wordsToWinForGame } });
        setGridData(data);
        setFirstPlayerIndex(fpIndex);
        setWinner(null);
        setMessages([]);
        setRematchRequests([]);
        setVotes({});
        setPlayers(currentPlayers => currentPlayers.map(p => ({ ...p, score: 0, bonusTime: 0, bonusesEarned: 0 })));
        handleNavigate(GameState.InGame);
      }
    } catch (err) {
        setError(err instanceof Error ? `Failed to start game: ${err.message}` : "An unknown error occurred.");
        handleNavigate(GameState.Lobby);
    } finally {
      setIsLoading(false);
    }
  }, [gameMode]);

  const handleFlipComplete = useCallback(async (fpIndex: number) => {
    if (p2pService.isHost) {
      await startNewGame(fpIndex);
    }
  }, [startNewGame]);

  const handleGameOver = useCallback((winningPlayer: Player, finalPlayersState: Player[]) => {
    setWinner(winningPlayer);
    setPlayers(finalPlayersState);
    handleNavigate(GameState.WinnerCelebration);
    
    if (p2pService.isHost) {
        p2pService.sendMessage({ type: 'GAME_OVER', payload: { winner: winningPlayer, finalPlayers: finalPlayersState } });
    }

    const losingPlayer = finalPlayersState.find(p => p.id !== winningPlayer.id);
    if (losingPlayer && !winningPlayer.isAI && !losingPlayer.isAI) {
      authService.updateStats(winningPlayer, losingPlayer);
    }
  }, []);

  const handleCelebrationEnd = useCallback(() => handleNavigate(GameState.GameOver), []);
  
  const handleExitToMenu = useCallback(() => {
    p2pService.disconnect();
    setPeerId(null);
    handleNavigate(GameState.ModeSelection);
    setPlayers([]);
    setGridData(null);
    setWinner(null);
    setError(null);
    setMessages([]);
    setRematchRequests([]);
    setVotes({});
  }, []);
  
  const handleRematchRequest = useCallback((playerId: string) => {
    setRematchRequests(prev => {
        if(prev.includes(playerId)) return prev;
        const newRequests = [...prev, playerId];
        if (gameMode === GameMode.PlayerVsPlayer) {
            p2pService.sendMessage({ type: 'REMATCH_REQUEST' });
        }
        return newRequests;
    });
  }, [gameMode]);
  
  useEffect(() => {
    if (rematchRequests.length === 2 && players.length === 2) {
      handleNavigate(GameState.ThemeVoting);
    }
  }, [rematchRequests, players]);

  const handleVote = (theme: string) => {
    if (!currentUser) return;
    setVotes(prev => ({ ...prev, [currentUser.id]: theme }));
    if (gameMode === GameMode.PlayerVsPlayer) {
        p2pService.sendMessage({ type: 'THEME_VOTE', payload: { theme } });
    } else if (gameMode === GameMode.PlayerVsComputer) {
        const aiPlayer = players.find(p => p.isAI);
        if (aiPlayer) {
            const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
            setTimeout(() => setVotes(prev => ({ ...prev, [aiPlayer.id]: randomTheme })), 1500);
        }
    }
  };

  const handleThemeSelected = useCallback(async (theme: string) => {
    if (!gameMode) return;
    if (gameMode === GameMode.PlayerVsComputer) {
        await startNewGame(0, theme);
    } else if (gameMode === GameMode.PlayerVsPlayer && p2pService.isHost) {
        const nextFirstPlayerIndex = (firstPlayerIndex + 1) % 2;
        await startNewGame(nextFirstPlayerIndex, theme);
    }
  }, [firstPlayerIndex, startNewGame, gameMode]);

  useEffect(() => {
    if (gameState !== GameState.ThemeVoting || players.length < 2) return;

    const allVoted = Object.keys(votes).length === players.length;

    if (allVoted) {
        let winningTheme: string;
        const [p1, p2] = players;
        const vote1 = votes[p1.id];
        const vote2 = votes[p2.id];

        if (vote1 === vote2) {
            winningTheme = vote1;
        } else if (gameMode === GameMode.PlayerVsPlayer) {
            // Host's vote wins tie to ensure deterministic result on both clients
            const opponent = players.find(p => p.id !== currentUser!.id);
            const hostVote = p2pService.isHost
                ? votes[currentUser!.id]
                : votes[opponent!.id];
            winningTheme = hostVote;
        } else { // PlayerVsComputer
            winningTheme = Math.random() < 0.5 ? vote1 : vote2;
        }
        
        // Only host initiates the next game in PvP
        if (gameMode === GameMode.PlayerVsPlayer && !p2pService.isHost) return;

        setTimeout(() => {
            handleThemeSelected(winningTheme);
        }, 2000);
    }
  }, [votes, players, gameState, gameMode, handleThemeSelected, currentUser]);


  const handleSendMessage = useCallback((message: string, user: Player) => {
    const newMessage: ChatMessage = { userId: user.id, userName: user.name, message };
    setMessages(prev => [...prev, newMessage]);
    if (gameMode === GameMode.PlayerVsPlayer) {
        p2pService.sendMessage({ type: 'CHAT_MESSAGE', payload: newMessage });
    }
  }, [gameMode]);
  
  const handleReadyToStart = (player1: User, player2: User) => {
    const newPlayers = [
      { ...player1, score: 0, bonusTime: 0, bonusesEarned: 0 },
      { ...player2, score: 0, bonusTime: 0, bonusesEarned: 0 },
    ];
    setPlayers(newPlayers);
    if (gameMode === GameMode.PlayerVsComputer) {
      startNewGame(0);
    } else {
      handleNavigate(GameState.CoinFlip);
    }
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (gameState) {
      case GameState.Profile:
        return <ProfileScreen currentUser={currentUser} onDelete={handleDeleteCurrentUser} onNavigate={() => handleNavigate(GameState.ModeSelection)} />;
      case GameState.Leaderboard:
        return <LeaderboardScreen onBack={() => handleNavigate(GameState.ModeSelection)} />;
      case GameState.ModeSelection:
        return <ModeSelectionScreen onModeSelected={handleModeSelected} onBack={() => {}} onViewLeaderboard={() => handleNavigate(GameState.Leaderboard)} />;
      case GameState.Lobby:
        return <LobbyScreen 
                    onReadyToStart={handleReadyToStart} 
                    isLoading={isLoading} 
                    error={error} 
                    currentUser={currentUser} 
                    onBack={handleLeaveLobby}
                    gameMode={gameMode!}
                    difficulty={difficulty}
                    peerId={peerId}
                    setPlayers={setPlayers}
                />;
      case GameState.CoinFlip:
        return <CoinFlipScreen players={players} onFlipComplete={handleFlipComplete} />;
      case GameState.InGame:
        return gridData && <GameBoardScreen 
            initialPlayers={players}
            initialGridData={gridData}
            firstPlayerIndex={firstPlayerIndex}
            onGameOver={handleGameOver}
            chatMessages={messages}
            onSendMessage={handleSendMessage}
            wordsToWin={wordsToWin}
            currentUser={currentUser}
          />;
      case GameState.WinnerCelebration:
        return winner && <WinnerCelebrationScreen winner={winner} onComplete={handleCelebrationEnd} />;
      case GameState.GameOver:
        return winner && <GameOverScreen 
                    winner={winner} 
                    players={players}
                    onRematchRequest={handleRematchRequest}
                    onExit={handleExitToMenu}
                    rematchRequests={rematchRequests}
                    currentUser={currentUser}
                />;
      case GameState.ThemeVoting:
        return <ThemeVotingScreen players={players} onVote={handleVote} currentUser={currentUser} votes={votes} />;
      default:
        return <ModeSelectionScreen onModeSelected={handleModeSelected} onBack={() => {}} onViewLeaderboard={() => handleNavigate(GameState.Leaderboard)} />;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <p className="h3">Loading Game...</p>
      </div>
    );
  }

  if (!currentUser) {
    const searchParams = new URLSearchParams(window.location.search);
    const peerIdFromUrl = searchParams.get('join');
    return peerIdFromUrl ? 
        <AuthModal onLogin={handleLogin} /> 
        : <LoginModal onLogin={handleLogin} />;
  }

  return (
    <div className="d-flex flex-column align-items-center p-3 p-sm-4 p-md-5 vh-100">
        <ProfileWidget currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />
        <header className="w-100 text-center mb-5">
            <Logo className="w-100 h-auto mx-auto" style={{maxWidth: '500px', filter: 'drop-shadow(0 0 10px #22d3ee)'}}/>
            <h1 className="mt-2 h6 text-info text-glow-cyan">An AI-Powered 1v1 Crossword Battle</h1>
        </header>
        <main className="w-100 flex-grow-1 d-flex align-items-center justify-content-center">
            <div key={gameState} className="w-100 animate-fade-in d-flex justify-content-center">
              {renderContent()}
            </div>
        </main>
        <Footer />
    </div>
  );
};

export default App;
