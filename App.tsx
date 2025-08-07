import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Player, GridData, User, ChatMessage, GameMode, Difficulty, Room } from './types';
import LobbyScreen from './components/LobbyScreen';
import GameBoardScreen from './components/GameBoardScreen';
import GameOverScreen from './components/GameOverScreen';
import CoinFlipScreen from './components/CoinFlipScreen';
import ThemeVotingScreen from './components/ThemeVotingScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import ModeSelectionScreen from './components/ModeSelectionScreen';
import GameRoomsScreen from './components/GameRoomsScreen';
import WinnerCelebrationScreen from './components/WinnerCelebrationScreen';
import { generateWordsAndGrid } from './services/gameService';
import { updateStats, AVATARS } from './services/authService';
import * as roomService from './services/roomService';
import { PVP_WORDS_TO_WIN, PVP_TOTAL_WORDS_IN_PUZZLE, PVC_WORDS_TO_WIN, PVC_TOTAL_WORDS_IN_PUZZLE } from './constants';
import Logo from './components/icons/Logo';
import Footer from './components/common/Footer';

const createGuestUser = (): User => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const avatarKeys = Object.keys(AVATARS);
    const randomAvatar = avatarKeys[Math.floor(Math.random() * avatarKeys.length)];
    return {
      id: guestId,
      name: `Player-${guestId.slice(-4)}`,
      avatar: randomAvatar,
      wins: 0,
      losses: 0,
      totalBonuses: 0,
    };
  };

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.GameRooms);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PlayerVsPlayer);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [firstPlayerIndex, setFirstPlayerIndex] = useState(0);
  const [wordsToWin, setWordsToWin] = useState(PVP_WORDS_TO_WIN);

  // Auth state is now a temporary guest user
  const [currentUser] = useState<User>(createGuestUser());
  
  // Room state
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  // Rematch state
  const [rematchRequests, setRematchRequests] = useState<string[]>([]);

  // Effect to handle joining a room from a URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = searchParams.get('room');

    if (roomIdFromUrl) {
      if (currentRoomId === roomIdFromUrl) return;

      const joinedRoom = roomService.joinRoom(roomIdFromUrl, currentUser);
      // Clean the URL to prevent re-joining on refresh
      window.history.replaceState({}, document.title, window.location.pathname);

      if (joinedRoom) {
          setCurrentRoomId(roomIdFromUrl);
          setGameMode(GameMode.PlayerVsPlayer);
          setGameState(GameState.Lobby);
      } else {
          setError('Could not join room. It might be full or no longer exist.');
          setGameState(GameState.GameRooms);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // This should run once when the guest user is created.

  const handleModeSelected = useCallback((mode: GameMode, diff: Difficulty) => {
    setGameMode(mode);
    setDifficulty(diff);
    setError(null);

    if (mode === GameMode.PlayerVsComputer) {
        // No room needed for PvC
        setCurrentRoomId(null);
        setGameState(GameState.Lobby);
    } else {
        // Create a new PvP room and go to lobby
        const newRoom = roomService.createRoom(currentUser);
        setCurrentRoomId(newRoom.id);
        setGameState(GameState.Lobby);
    }
  }, [currentUser]);

  const handleNewGame = useCallback(() => {
    setError(null);
    setGameState(GameState.ModeSelection);
  }, []);

  const handleJoinRoom = useCallback((roomId: string) => {
    setError(null);
    const joinedRoom = roomService.joinRoom(roomId, currentUser);
    if (joinedRoom) {
        setCurrentRoomId(roomId);
        setGameState(GameState.Lobby);
    } else {
        setError('Could not join room. It might be full or no longer exists.');
    }
  }, [currentUser]);

  const handleLeaveLobby = useCallback(() => {
    if (currentRoomId) {
        roomService.leaveRoom(currentRoomId, currentUser.id);
        setCurrentRoomId(null);
    }
    setGameState(GameState.GameRooms);
  }, [currentRoomId, currentUser]);

  const handleReadyToStart = useCallback((player1: User, player2: User) => {
    const newPlayers = [
      { ...player1, score: 0, bonusTime: 0, bonusesEarned: 0 },
      { ...player2, score: 0, bonusTime: 0, bonusesEarned: 0 },
    ];
    setPlayers(newPlayers);
    
    if (gameMode === GameMode.PlayerVsComputer) {
      startNewGame(0);
    } else {
      setGameState(GameState.CoinFlip);
    }
  }, [gameMode]);
  
  const startNewGame = useCallback(async (fpIndex: number, theme?: string) => {
    setIsLoading(true);
    setError(null);

    const isPvc = gameMode === GameMode.PlayerVsComputer;
    const wordsToWinForGame = isPvc ? PVC_WORDS_TO_WIN : PVP_WORDS_TO_WIN;
    const totalWordsForGame = isPvc ? PVC_TOTAL_WORDS_IN_PUZZLE : PVP_TOTAL_WORDS_IN_PUZZLE;
    
    setWordsToWin(wordsToWinForGame);

    try {
      const data = await generateWordsAndGrid(totalWordsForGame, theme);
      setGridData(data);
      setFirstPlayerIndex(fpIndex);
      setGameState(GameState.InGame);
      setWinner(null);
      setMessages([]); 
      setRematchRequests([]);
      setPlayers(currentPlayers => currentPlayers.map(p => ({ ...p, score: 0, bonusTime: 0, bonusesEarned: 0 })));
    } catch (err) {
        if (err instanceof Error) {
            setError(`Failed to start game: ${err.message}. Please ensure your API key is set up correctly.`);
        } else {
            setError("An unknown error occurred.");
        }
        setGameState(GameState.Lobby);
    } finally {
      setIsLoading(false);
    }
  }, [gameMode]);

  const handleFlipComplete = useCallback(async (fpIndex: number) => {
    await startNewGame(fpIndex);
  }, [startNewGame]);

  const handleGameOver = useCallback((winningPlayer: Player, finalPlayersState: Player[]) => {
    setWinner(winningPlayer);
    setPlayers(finalPlayersState);
    setGameState(GameState.WinnerCelebration);

    if (gameMode === GameMode.PlayerVsPlayer && currentRoomId && winningPlayer.id === roomService.getRoom(currentRoomId)?.host.id) {
        roomService.deleteRoom(currentRoomId);
    }

    const losingPlayer = finalPlayersState.find(p => p.id !== winningPlayer.id);
    if (!losingPlayer) return;

    const winnerFromState = finalPlayersState.find(p => p.id === winningPlayer.id)!;
    
    if (!winnerFromState.isAI && !losingPlayer.isAI) {
      updateStats(winnerFromState, losingPlayer);
    }
  }, [gameMode, currentRoomId]);

  const handleCelebrationEnd = useCallback(() => {
    setGameState(GameState.GameOver);
  }, []);
  
  const handleExitToGameRooms = useCallback(() => {
    if (gameMode === GameMode.PlayerVsPlayer && currentRoomId) {
        roomService.deleteRoom(currentRoomId);
    }
    setCurrentRoomId(null);
    setGameState(GameState.GameRooms);
    setPlayers([]);
    setGridData(null);
    setWinner(null);
    setError(null);
    setMessages([]);
    setRematchRequests([]);
  }, [gameMode, currentRoomId]);
  
  const handleRematchRequest = useCallback((playerId: string) => {
    setRematchRequests(prev => {
        if(prev.includes(playerId)) return prev;
        return [...prev, playerId]
    });
  }, []);
  
  useEffect(() => {
    if (rematchRequests.length === 2 && players.length === 2) {
      setGameState(GameState.ThemeVoting);
    }
  }, [rematchRequests, players]);

  const handleThemeSelected = useCallback(async (theme: string) => {
    const nextFirstPlayerIndex = gameMode === GameMode.PlayerVsComputer ? 0 : (firstPlayerIndex + 1) % 2;
    await startNewGame(nextFirstPlayerIndex, theme);
  }, [firstPlayerIndex, startNewGame, gameMode]);


  const handleSendMessage = useCallback((message: string, user: Player) => {
    const newMessage: ChatMessage = {
      userId: user.id,
      userName: user.name,
      message,
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.Leaderboard:
        return <LeaderboardScreen onBack={() => setGameState(GameState.GameRooms)} />;
       case GameState.ModeSelection:
        return <ModeSelectionScreen onModeSelected={handleModeSelected} onBack={() => setGameState(GameState.GameRooms)} />;
      case GameState.GameRooms:
        return <GameRoomsScreen currentUser={currentUser} onNewGame={handleNewGame} onJoinRoom={handleJoinRoom} onViewLeaderboard={() => setGameState(GameState.Leaderboard)} error={error} />;
      case GameState.Lobby:
        return <LobbyScreen 
                    onReadyToStart={handleReadyToStart} 
                    isLoading={isLoading} 
                    error={error} 
                    currentUser={currentUser} 
                    onBack={gameMode === GameMode.PlayerVsPlayer ? handleLeaveLobby : () => setGameState(GameState.ModeSelection)}
                    gameMode={gameMode}
                    difficulty={difficulty}
                    roomId={currentRoomId}
                />;
      case GameState.CoinFlip:
        return <CoinFlipScreen players={players} onFlipComplete={handleFlipComplete} />;
      case GameState.InGame:
        return (
          gridData && <GameBoardScreen 
            initialPlayers={players}
            initialGridData={gridData}
            firstPlayerIndex={firstPlayerIndex}
            onGameOver={handleGameOver}
            chatMessages={messages}
            onSendMessage={handleSendMessage}
            wordsToWin={wordsToWin}
          />
        );
      case GameState.WinnerCelebration:
        return winner && <WinnerCelebrationScreen winner={winner} onComplete={handleCelebrationEnd} />;
      case GameState.GameOver:
        return winner && <GameOverScreen 
                    winner={winner} 
                    players={players}
                    onRematchRequest={handleRematchRequest}
                    onExit={handleExitToGameRooms}
                    rematchRequests={rematchRequests}
                />;
      case GameState.ThemeVoting:
        return <ThemeVotingScreen players={players} onThemeSelected={handleThemeSelected} />;
      default:
        return <GameRoomsScreen currentUser={currentUser} onNewGame={handleNewGame} onJoinRoom={handleJoinRoom} onViewLeaderboard={() => setGameState(GameState.Leaderboard)} error={error} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-8 relative">
        <header className="w-full max-w-5xl mx-auto text-center mb-8 flex flex-col items-center">
            <Logo className="w-full max-w-lg h-auto" />
            <p className="mt-4 text-lg text-gray-400">An AI-Powered 1v1 Crossword Battle</p>
        </header>
        <main className="w-full flex-grow flex items-center justify-center">
            <div key={gameState} className="w-full animate-fade-in flex justify-center">
              {renderContent()}
            </div>
        </main>
        <Footer />
    </div>
  );
};

export default App;