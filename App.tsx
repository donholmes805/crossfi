
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Player, User, ChatMessage, GameMode, Difficulty, GridData, WordLocation, FullGameState, ChatEventType } from './types';
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
import * as aiService from './services/aiService';
import { p2pService, P2PMessage } from './services/p2pService';
import { PVP_WORDS_TO_WIN, PVC_WORDS_TO_WIN, AI_OPPONENTS, PVP_TOTAL_WORDS_IN_PUZZLE, PVC_TOTAL_WORDS_IN_PUZZLE, TURN_DURATION, BONUS_TIME_THRESHOLD, BONUS_TIME_AWARD } from './constants';
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
  const [winner, setWinner] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wordsToWin, setWordsToWin] = useState(PVP_WORDS_TO_WIN);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [rematchRequests, setRematchRequests] = useState<string[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});

  // Centralized Game State
  const [players, setPlayers] = useState<Player[]>([]);
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turnType, setTurnType] = useState<'normal' | 'steal'>('normal');
  const [wordToFind, setWordToFind] = useState<WordLocation | null>(null);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION);
  const [isTurnActive, setIsTurnActive] = useState(false);
  const [turnResult, setTurnResult] = useState<'success' | 'fail' | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiCanChat, setAiCanChat] = useState(true);

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
            p2pService.initializeAsGuestAndConnect(peerIdFromUrl);
            setGameMode(GameMode.PlayerVsPlayer);
            setGameState(GameState.Lobby);
            
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
  }, [currentUser]);

  const handleNavigate = useCallback((state: GameState) => {
    setError(null);
    setGameState(state);
  }, []);

  const handleP2PData = useCallback((data: P2PMessage) => {
    switch (data.type) {
        case 'USER_PROFILE': {
             const opponentUser = data.payload.user;
             setPlayers(current => {
                 const newPlayers = [...current];
                 if (newPlayers.length < 2) {
                     newPlayers.push({ ...opponentUser, score: 0, bonusTime: 0, bonusesEarned: 0 });
                 } else {
                     const opponentIndex = newPlayers.findIndex(p => p.id !== currentUser?.id);
                     if (opponentIndex !== -1) {
                         const existingPlayer = newPlayers[opponentIndex];
                         newPlayers[opponentIndex] = { ...opponentUser, score: existingPlayer.score, bonusTime: existingPlayer.bonusTime, bonusesEarned: existingPlayer.bonusesEarned };
                     }
                 }
                 return newPlayers;
             });
             break;
         }
        case 'GAME_STATE_UPDATE': {
            const newState = data.payload;
            setPlayers(newState.players);
            setGridData(newState.gridData);
            setCurrentPlayerIndex(newState.currentPlayerIndex);
            setTurnType(newState.turnType);
            setWordToFind(newState.wordToFind);
            setTimeLeft(newState.timeLeft);
            setIsTurnActive(newState.isTurnActive);
            setTurnResult(newState.turnResult);
            setMessages(newState.chatMessages);
            break;
        }
        case 'START_GAME':
            setGridData(data.payload.gridData);
            setCurrentPlayerIndex(data.payload.firstPlayerIndex);
            setWordsToWin(data.payload.wordsToWin);
            setWinner(null);
            setMessages([]);
            setRematchRequests([]);
            setVotes({});
            setPlayers(currentPlayers => currentPlayers.map(p => ({ ...p, score: 0, bonusTime: 0, bonusesEarned: 0 })));
            setWordToFind(data.payload.gridData.words.find(w => !w.found) || null);
            setIsTurnActive(true);
            setGameState(GameState.InGame);
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

  const handleGameOver = useCallback((winningPlayer: Player, finalPlayersState: Player[]) => {
    setWinner(winningPlayer);
    setPlayers(finalPlayersState);
    handleNavigate(GameState.WinnerCelebration);
    setIsTurnActive(false);
    
    if (gameMode === GameMode.PlayerVsPlayer && p2pService.isHost) {
        p2pService.sendMessage({ type: 'GAME_OVER', payload: { winner: winningPlayer, finalPlayers: finalPlayersState } });
    }

    const losingPlayer = finalPlayersState.find(p => p.id !== winningPlayer.id);
    if (losingPlayer && !winningPlayer.isAI && !losingPlayer.isAI) {
      authService.updateStats(winningPlayer, losingPlayer);
    }
  }, [gameMode, handleNavigate]);

  const advanceTurn = useCallback((currentPlayers: Player[], currentGridData: GridData, nextPlayerIdx: number) => {
    setIsTurnActive(false);
    
    setTimeout(() => {
      const p1Score = currentGridData.words.filter(w => w.foundBy === currentPlayers[0].id).length;
      const p2Score = currentGridData.words.filter(w => w.foundBy === currentPlayers[1].id).length;

      if(p1Score >= wordsToWin) { handleGameOver(currentPlayers[0], currentPlayers); return; }
      if(p2Score >= wordsToWin) { handleGameOver(currentPlayers[1], currentPlayers); return; }

      const nextWord = currentGridData.words.find(w => !w.found);
      if (!nextWord) {
        const winner = p1Score > p2Score ? currentPlayers[0] : p2Score > p1Score ? currentPlayers[1] : currentPlayers[0];
        handleGameOver(winner, currentPlayers);
        return;
      }

      setWordToFind(nextWord);
      setCurrentPlayerIndex(nextPlayerIdx);
      setTurnType('normal');
      setTimeLeft(TURN_DURATION);
      setIsTurnActive(true);
      setTurnResult(null);
    }, 2000);
  }, [handleGameOver, wordsToWin, players]);

  const handleSendMessage = useCallback((message: string, user: Player) => {
    const newMessage: ChatMessage = { userId: user.id, userName: user.name, message };
    setMessages(prev => [...prev, newMessage]);
    if (gameMode === GameMode.PlayerVsPlayer) {
        p2pService.sendMessage({ type: 'CHAT_MESSAGE', payload: newMessage });
    }
  }, [gameMode]);

  const triggerAiChat = useCallback(async (eventType: ChatEventType, playersOverride?: Player[]) => {
    const currentPlayers = playersOverride || players;
    const aiPlayer = currentPlayers.find(p => p.isAI);
    const humanPlayer = currentPlayers.find(p => !p.isAI);

    if (gameMode !== GameMode.PlayerVsComputer || !aiPlayer || !humanPlayer || !aiCanChat) return;
    
    setAiCanChat(false);
    setTimeout(() => setAiCanChat(true), 4000 + Math.random() * 3000); // Cooldown of 4-7s

    const message = await aiService.generateAiChatMessage(aiPlayer, humanPlayer, eventType);
    if (message) {
        handleSendMessage(message, aiPlayer);
    }
  }, [players, handleSendMessage, aiCanChat, gameMode]);

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
      
      const resetPlayers = players.map(p => ({ ...p, score: 0, bonusTime: 0, bonusesEarned: 0 }));
      setPlayers(resetPlayers);
      setGridData(data);
      setCurrentPlayerIndex(fpIndex);
      setWinner(null);
      setMessages([]); 
      setRematchRequests([]);
      setVotes({});
      setTurnType('normal');
      setTimeLeft(TURN_DURATION);
      setTurnResult(null);
      setWordToFind(data.words.find(w => !w.found) || null);
      setIsTurnActive(true);
      handleNavigate(GameState.InGame);
      
      if (!isPvc) {
        p2pService.sendMessage({ type: 'START_GAME', payload: { firstPlayerIndex: fpIndex, gridData: data, wordsToWin: wordsToWinForGame } });
      } else {
        triggerAiChat(ChatEventType.GameStart, resetPlayers);
      }
    } catch (err) {
        setError(err instanceof Error ? `Failed to start game: ${err.message}` : "An unknown error occurred.");
        handleNavigate(GameState.Lobby);
    } finally {
      setIsLoading(false);
    }
  }, [gameMode, players, handleNavigate, triggerAiChat]);

  const handleTimeUp = useCallback(() => {
    setIsTurnActive(false);
    setTurnResult('fail');

    if (turnType === 'normal') {
      if (players[(currentPlayerIndex + 1) % 2]?.isAI) triggerAiChat(ChatEventType.AiStealTurn);
      setTimeout(() => {
        setCurrentPlayerIndex(p => (p + 1) % 2);
        setTurnType('steal');
        setTimeLeft(TURN_DURATION);
        setIsTurnActive(true);
        setTurnResult(null);
      }, 2000);
    } else {
      advanceTurn(players, gridData!, (currentPlayerIndex + 1) % 2);
    }
  }, [players, currentPlayerIndex, gridData, turnType, advanceTurn, triggerAiChat]);

  // Game Timer Logic
   useEffect(() => {
    if (gameState !== GameState.InGame || !isTurnActive || !wordToFind) return;

    const currentPlayer = players[currentPlayerIndex];
    if (gameMode === GameMode.PlayerVsPlayer && currentPlayer?.id !== currentUser?.id) return; // Only run timer for the active player on their client

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTimeLeft = prev - 1;
        if (newTimeLeft < 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return newTimeLeft;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTurnActive, wordToFind, players, currentPlayerIndex, gameState, currentUser, gameMode, handleTimeUp]);

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
  }, [currentUser, handleNavigate]);

  const handleLeaveLobby = useCallback(() => {
    p2pService.disconnect();
    setPeerId(null);
    setPlayers([]);
    handleNavigate(GameState.ModeSelection);
  }, [handleNavigate]);

  const broadcastGameState = useCallback(() => {
     if (gameMode !== GameMode.PlayerVsPlayer) return;

     const fullState: FullGameState = {
        players, gridData: gridData!, currentPlayerIndex, turnType, wordToFind, timeLeft, isTurnActive, turnResult, chatMessages: messages
     };
     p2pService.sendMessage({ type: 'GAME_STATE_UPDATE', payload: fullState });

  }, [players, gridData, currentPlayerIndex, turnType, wordToFind, timeLeft, isTurnActive, turnResult, messages, gameMode]);

  useEffect(() => {
    if (gameState === GameState.InGame && p2pService.isHost) {
        broadcastGameState();
    }
  }, [players, gridData, currentPlayerIndex, turnType, wordToFind, timeLeft, isTurnActive, turnResult, messages, gameState, broadcastGameState]);

  const handleWordSelected = useCallback((word: string) => {
    if (!isTurnActive || word.toUpperCase() !== wordToFind?.text.toUpperCase()) return;
    
    setIsTurnActive(false);
    setTurnResult('success');
    
    const currentPlayer = players[currentPlayerIndex];
    if (turnType === 'steal') { handleGameOver(currentPlayer, players); return; }
    
    const updatedPlayers = players.map(p => p.id === currentPlayer.id ? { ...p, score: p.score + 1, bonusTime: p.bonusTime + (timeLeft >= BONUS_TIME_THRESHOLD ? BONUS_TIME_AWARD : 0), bonusesEarned: p.bonusesEarned + (timeLeft >= BONUS_TIME_THRESHOLD ? 1 : 0) } : p);
    
    if (gameMode === GameMode.PlayerVsComputer) {
        if (currentPlayer.isAI) triggerAiChat(ChatEventType.AiFoundWord, updatedPlayers);
        else triggerAiChat(ChatEventType.PlayerFoundWord, updatedPlayers);
    }
    
    setPlayers(updatedPlayers);
    
    const updatedGridData = { ...gridData!, words: gridData!.words.map(w => w.text === wordToFind.text ? { ...w, found: true, foundBy: currentPlayer.id } : w) };
    setGridData(updatedGridData);
    
    advanceTurn(updatedPlayers, updatedGridData, (currentPlayerIndex + 1) % 2);
  }, [isTurnActive, wordToFind, turnType, players, gridData, timeLeft, advanceTurn, handleGameOver, currentPlayerIndex, gameMode, triggerAiChat]);
  
  const handleUseBonusTime = useCallback(() => {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer.bonusTime >= BONUS_TIME_AWARD && isTurnActive) {
      setPlayers(ps => ps.map(p => p.id === currentPlayer.id ? { ...p, bonusTime: p.bonusTime - BONUS_TIME_AWARD } : p));
      setTimeLeft(t => t + BONUS_TIME_AWARD);
    }
  }, [players, currentPlayerIndex, isTurnActive]);
  
  // AI Turn Logic
  useEffect(() => {
    if (gameState === GameState.InGame && isTurnActive && wordToFind && players[currentPlayerIndex]?.isAI) {
      const aiPlayer = players[currentPlayerIndex];
      const difficultyDelay = { easy: 5000 + Math.random() * 5000, medium: 3000 + Math.random() * 3000, hard: 1000 + Math.random() * 2000 };
      const aiId = aiPlayer.id.split('_')[1] as 'easy' | 'medium' | 'hard';
      const delay = difficultyDelay[aiId] || 7000;
      const timeout = setTimeout(() => handleWordSelected(wordToFind.text), delay);
      return () => clearTimeout(timeout);
    }
  }, [gameState, isTurnActive, wordToFind, players, currentPlayerIndex, handleWordSelected]);


  const handleFlipComplete = useCallback(async (fpIndex: number) => {
    if (p2pService.isHost) {
      await startNewGame(fpIndex);
    }
  }, [startNewGame]);

  const handleCelebrationEnd = useCallback(() => handleNavigate(GameState.GameOver), [handleNavigate]);
  
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
  }, [handleNavigate]);
  
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
  }, [rematchRequests, players, handleNavigate]);

  const handleVote = (theme: string) => {
    if (!currentUser) return;
    setVotes(prev => ({ ...prev, [currentUser.id]: theme }));
    if (gameMode === GameMode.PlayerVsPlayer) {
        p2pService.sendMessage({ type: 'THEME_VOTE', payload: { theme } });
    } else { // Assumes gameMode is PlayerVsComputer
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
    } else {
        // In PlayerVsPlayer mode, this is only called by the host,
        // so no need to check gameMode or isHost here.
        const nextFirstPlayerIndex = (currentPlayerIndex + 1) % 2;
        await startNewGame(nextFirstPlayerIndex, theme);
    }
  }, [currentPlayerIndex, startNewGame, gameMode]);

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
            const host = p2pService.isHost ? currentUser! : players.find(p => p.id !== currentUser!.id)!;
            winningTheme = votes[host.id];
        } else {
            winningTheme = Math.random() < 0.5 ? vote1 : vote2;
        }
        
        if (gameMode === GameMode.PlayerVsPlayer && !p2pService.isHost) return;

        setTimeout(() => {
            handleThemeSelected(winningTheme);
        }, 2000);
    }
  }, [votes, players, gameState, gameMode, handleThemeSelected, currentUser]);
  
  const handleReadyToStart = useCallback(() => {
    if (gameMode === GameMode.PlayerVsComputer) {
      startNewGame(0);
    } else {
      handleNavigate(GameState.CoinFlip);
    }
  }, [gameMode, startNewGame, handleNavigate]);

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
                    players={players}
                    peerId={peerId}
                />;
      case GameState.CoinFlip:
        return <CoinFlipScreen players={players} onFlipComplete={handleFlipComplete} />;
      case GameState.InGame:
        return gridData && <GameBoardScreen 
            players={players}
            gridData={gridData}
            currentPlayerIndex={currentPlayerIndex}
            onWordSelected={handleWordSelected}
            onUseBonusTime={handleUseBonusTime}
            turnType={turnType}
            wordToFind={wordToFind}
            timeLeft={timeLeft}
            isTurnActive={isTurnActive}
            turnResult={turnResult}
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
