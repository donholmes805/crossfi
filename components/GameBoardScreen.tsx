import React, { useState, useEffect, useCallback } from 'react';
import { Player, GridData, ChatMessage, WordLocation } from '../types';
import { TURN_DURATION, BONUS_TIME_THRESHOLD, BONUS_TIME_AWARD } from '../constants';
import PlayerInfo from './common/PlayerInfo';
import Timer from './common/Timer';
import WordGrid from './common/WordGrid';
import ChatBox from './common/ChatBox';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';

interface GameBoardScreenProps {
  initialPlayers: Player[];
  initialGridData: GridData;
  firstPlayerIndex: number;
  chatMessages: ChatMessage[];
  onGameOver: (winner: Player, finalPlayers: Player[]) => void;
  onSendMessage: (message: string, user: Player) => void;
  wordsToWin: number;
}

type TurnType = 'normal' | 'steal';

const GameBoardScreen: React.FC<GameBoardScreenProps> = ({ initialPlayers, initialGridData, firstPlayerIndex, chatMessages, onGameOver, onSendMessage, wordsToWin }) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [gridData, setGridData] = useState<GridData>(initialGridData);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(firstPlayerIndex);
  const [turnType, setTurnType] = useState<TurnType>('normal');
  const [wordToFind, setWordToFind] = useState<WordLocation | null>(null);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION);
  const [isTurnActive, setIsTurnActive] = useState(true);
  const [turnResult, setTurnResult] = useState<'success' | 'fail' | null>(null);
  const [isSpectatorView, setIsSpectatorView] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const isSpectatorOrAI = isSpectatorView || (currentPlayer && currentPlayer.isAI);

  const advanceTurn = useCallback((currentPlayers: Player[], currentGridData: GridData, nextPlayerIdx: number) => {
    setIsTurnActive(false);
    
    setTimeout(() => {
      // Check for win condition
      const p1Score = currentGridData.words.filter(w => w.foundBy === currentPlayers[0].id).length;
      const p2Score = currentGridData.words.filter(w => w.foundBy === currentPlayers[1].id).length;

      if(p1Score >= wordsToWin) {
        onGameOver(currentPlayers[0], currentPlayers);
        return;
      }
      if(p2Score >= wordsToWin) {
        onGameOver(currentPlayers[1], currentPlayers);
        return;
      }

      const nextWord = currentGridData.words.find(w => !w.found);
      if (!nextWord) {
        // No more words, determine winner by score
        const winner = p1Score > p2Score ? currentPlayers[0] : p2Score > p1Score ? currentPlayers[1] : players[firstPlayerIndex]; // Default to first player on tie
        onGameOver(winner, currentPlayers);
        return;
      }

      setWordToFind(nextWord);
      setCurrentPlayerIndex(nextPlayerIdx);
      setTurnType('normal');
      setTimeLeft(TURN_DURATION);
      setIsTurnActive(true);
      setTurnResult(null);
    }, 2000);
  }, [onGameOver, players, firstPlayerIndex, wordsToWin]);
  
  useEffect(() => {
    // Set initial word
    if (!wordToFind) {
      setWordToFind(gridData.words.find(w => !w.found) || null);
    }
  }, [gridData.words, wordToFind]);

  // Main turn timer
  useEffect(() => {
    if (!isTurnActive || !wordToFind || (currentPlayer && currentPlayer.isAI)) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTurnActive(false);
          setTurnResult('fail');

          if (turnType === 'normal') {
            // Normal turn failed, opponent gets a steal attempt
            setTimeout(() => {
              setCurrentPlayerIndex(p => (p + 1) % 2);
              setTurnType('steal');
              setTimeLeft(TURN_DURATION);
              setIsTurnActive(true);
              setTurnResult(null);
            }, 2000);
          } else {
            // Steal turn failed, move to next player's normal turn
            const nextPlayerOriginal = (currentPlayerIndex + 1) % 2;
            advanceTurn(players, gridData, nextPlayerOriginal);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTurnActive, turnType, wordToFind, players, gridData, advanceTurn, currentPlayerIndex, currentPlayer]);

  const handleWordSelected = useCallback((word: string) => {
    if (!isTurnActive || word.toUpperCase() !== wordToFind?.text.toUpperCase()) return;

    setIsTurnActive(false);
    setTurnResult('success');

    if (turnType === 'steal') {
      // KNOCKOUT! The stealer wins the whole game.
      onGameOver(currentPlayer, players);
      return;
    }
    
    // Normal turn success
    const updatedPlayers = players.map(p => {
        if (p.id === currentPlayer.id) {
            const bonusTimeAwarded = timeLeft >= BONUS_TIME_THRESHOLD ? BONUS_TIME_AWARD : 0;
            return { 
                ...p, 
                score: p.score + 1, 
                bonusTime: p.bonusTime + bonusTimeAwarded,
                bonusesEarned: p.bonusesEarned + (bonusTimeAwarded > 0 ? 1 : 0)
            };
        }
        return p;
    });
    setPlayers(updatedPlayers);
    
    const updatedGridData = {
        ...gridData,
        words: gridData.words.map(w => w.text === wordToFind.text ? { ...w, found: true, foundBy: currentPlayer.id } : w)
    };
    setGridData(updatedGridData);
    
    advanceTurn(updatedPlayers, updatedGridData, (currentPlayerIndex + 1) % 2);

  }, [isTurnActive, wordToFind, turnType, currentPlayer, players, gridData, timeLeft, advanceTurn, onGameOver, currentPlayerIndex]);

  // AI Turn Logic
  useEffect(() => {
    if (isTurnActive && wordToFind && currentPlayer?.isAI) {
      const difficultyDelay = {
        easy: Math.random() * 5000 + 5000, // 5-10s
        medium: Math.random() * 3000 + 3000, // 3-6s
        hard: Math.random() * 2000 + 1000, // 1-3s
      };

      const aiId = currentPlayer.id.split('_')[1] as 'easy' | 'medium' | 'hard';
      const delay = difficultyDelay[aiId] || 7000;

      const aiTurnTimeout = setTimeout(() => {
        handleWordSelected(wordToFind.text);
      }, delay);

      return () => clearTimeout(aiTurnTimeout);
    }
  }, [isTurnActive, wordToFind, currentPlayer, handleWordSelected]);
  
  const handleUseBonusTime = useCallback(() => {
    if (currentPlayer.bonusTime >= BONUS_TIME_AWARD && isTurnActive) {
      setPlayers(ps => ps.map(p => p.id === currentPlayer.id ? { ...p, bonusTime: p.bonusTime - BONUS_TIME_AWARD } : p));
      setTimeLeft(t => t + BONUS_TIME_AWARD);
    }
  }, [currentPlayer, isTurnActive]);

  const getTurnMessage = () => {
      if(turnType === 'steal') {
          return <span className="text-red-500 animate-pulse">STEAL ATTEMPT!</span>
      }
      return <span className="text-gray-400">Find this word:</span>
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto p-4 md:p-6 bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <PlayerInfo player={players[0]} isCurrent={currentPlayer.id === players[0].id} gridData={gridData} wordsToWin={wordsToWin} />
            </div>
            
            <div className="flex flex-col items-center justify-start lg:col-span-6 order-first lg:order-none">
                <Timer timeLeft={timeLeft} turnDuration={TURN_DURATION} />
                <div className="my-4 text-center relative w-full">
                    <p className="text-lg font-semibold">{getTurnMessage()}</p>
                    <p className="text-3xl font-bold tracking-widest text-blue-400">{wordToFind?.text || 'GAME OVER'}</p>
                    <button onClick={() => setIsSpectatorView(!isSpectatorView)} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors" title="Toggle Spectator View">
                      {isSpectatorView ? <EyeSlashIcon className="w-6 h-6"/> : <EyeIcon className="w-6 h-6"/>}
                    </button>
                </div>
                <WordGrid 
                  gridData={gridData}
                  onWordSelected={handleWordSelected}
                  turnResult={turnResult}
                  revealWords={isSpectatorView}
                  activePlayerId={currentPlayer.id}
                  isTurnActive={!isSpectatorOrAI && isTurnActive}
                />

                {!isSpectatorOrAI && isTurnActive && turnType === 'normal' && (
                  <button 
                    onClick={handleUseBonusTime} 
                    disabled={currentPlayer.bonusTime < BONUS_TIME_AWARD}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Use Bonus (+{BONUS_TIME_AWARD}s)
                  </button>
                )}
                <ChatBox 
                  messages={chatMessages}
                  onSendMessage={(msg) => onSendMessage(msg, currentPlayer)}
                  isLocked={!isTurnActive || isSpectatorOrAI}
                  currentUserName={currentPlayer.name}
                />
            </div>
            
            <div className="lg:col-span-3">
              <PlayerInfo player={players[1]} isCurrent={currentPlayer.id === players[1].id} gridData={gridData} wordsToWin={wordsToWin} />
            </div>
        </div>
    </div>
  );
};

export default GameBoardScreen;