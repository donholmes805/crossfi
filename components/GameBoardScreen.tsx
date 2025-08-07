import React, { useState, useEffect, useCallback } from 'react';
import { Player, GridData, ChatMessage, WordLocation, ChatEventType, User } from '../types';
import { TURN_DURATION, BONUS_TIME_THRESHOLD, BONUS_TIME_AWARD } from '../constants';
import * as aiService from '../services/aiService';
import { p2pService } from '../services/p2pService';
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
  currentUser: User;
}

type TurnType = 'normal' | 'steal';

const GameBoardScreen: React.FC<GameBoardScreenProps> = ({ initialPlayers, initialGridData, firstPlayerIndex, chatMessages, onGameOver, onSendMessage, wordsToWin, currentUser }) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [gridData, setGridData] = useState<GridData>(initialGridData);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(firstPlayerIndex);
  const [turnType, setTurnType] = useState<TurnType>('normal');
  const [wordToFind, setWordToFind] = useState<WordLocation | null>(null);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION);
  const [isTurnActive, setIsTurnActive] = useState(true);
  const [turnResult, setTurnResult] = useState<'success' | 'fail' | null>(null);
  const [isSpectatorView, setIsSpectatorView] = useState(false);
  const [aiCanChat, setAiCanChat] = useState(true);

  const currentPlayer = players[currentPlayerIndex];
  const isSpectatorOrAI = isSpectatorView || (currentPlayer && currentPlayer.isAI);
  const isPvcGame = players.some(p => p.isAI);
  const isMyTurn = currentPlayer?.id === currentUser.id;

  const triggerAiChat = useCallback(async (eventType: ChatEventType, playersOverride?: Player[]) => {
    const currentPlayers = playersOverride || players;
    const aiPlayer = currentPlayers.find(p => p.isAI);
    const humanPlayer = currentPlayers.find(p => !p.isAI);

    if (!isPvcGame || !aiPlayer || !humanPlayer || !aiCanChat) return;
    
    setAiCanChat(false);
    setTimeout(() => setAiCanChat(true), 4000 + Math.random() * 3000); // Cooldown of 4-7s

    const message = await aiService.generateAiChatMessage(aiPlayer, humanPlayer, eventType);
    if (message) {
        onSendMessage(message, aiPlayer);
    }
  }, [players, onSendMessage, aiCanChat, isPvcGame]);

  useEffect(() => {
    const timer = setTimeout(() => triggerAiChat(ChatEventType.GameStart), 1500);
    return () => clearTimeout(timer);
  }, []);

  const advanceTurn = useCallback((currentPlayers: Player[], currentGridData: GridData, nextPlayerIdx: number) => {
    setIsTurnActive(false);
    
    setTimeout(() => {
      const p1Score = currentGridData.words.filter(w => w.foundBy === currentPlayers[0].id).length;
      const p2Score = currentGridData.words.filter(w => w.foundBy === currentPlayers[1].id).length;

      if(p1Score >= wordsToWin) { onGameOver(currentPlayers[0], currentPlayers); return; }
      if(p2Score >= wordsToWin) { onGameOver(currentPlayers[1], currentPlayers); return; }

      const nextWord = currentGridData.words.find(w => !w.found);
      if (!nextWord) {
        const winner = p1Score > p2Score ? currentPlayers[0] : p2Score > p1Score ? currentPlayers[1] : players[firstPlayerIndex];
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
    if (!wordToFind) setWordToFind(gridData.words.find(w => !w.found) || null);
  }, [gridData.words, wordToFind]);

  useEffect(() => {
    if (!isTurnActive || !wordToFind || !isMyTurn) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
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
            advanceTurn(players, gridData, (currentPlayerIndex + 1) % 2);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTurnActive, turnType, wordToFind, players, gridData, advanceTurn, currentPlayerIndex, triggerAiChat, isMyTurn]);

  const handleWordSelected = useCallback((word: string) => {
    if (!isTurnActive || word.toUpperCase() !== wordToFind?.text.toUpperCase() || !isMyTurn) return;
    
    setIsTurnActive(false);
    setTurnResult('success');

    if (turnType === 'steal') { onGameOver(currentPlayer, players); return; }
    
    const updatedPlayers = players.map(p => p.id === currentPlayer.id ? { ...p, score: p.score + 1, bonusTime: p.bonusTime + (timeLeft >= BONUS_TIME_THRESHOLD ? BONUS_TIME_AWARD : 0), bonusesEarned: p.bonusesEarned + (timeLeft >= BONUS_TIME_THRESHOLD ? 1 : 0) } : p);
    
    if (currentPlayer.isAI) triggerAiChat(ChatEventType.AiFoundWord, updatedPlayers);
    else triggerAiChat(ChatEventType.PlayerFoundWord, updatedPlayers);
    
    setPlayers(updatedPlayers);
    
    const updatedGridData = { ...gridData, words: gridData.words.map(w => w.text === wordToFind.text ? { ...w, found: true, foundBy: currentPlayer.id } : w) };
    setGridData(updatedGridData);
    
    advanceTurn(updatedPlayers, updatedGridData, (currentPlayerIndex + 1) % 2);
  }, [isTurnActive, wordToFind, turnType, currentPlayer, players, gridData, timeLeft, advanceTurn, onGameOver, currentPlayerIndex, triggerAiChat, isMyTurn]);

  useEffect(() => {
    if (isTurnActive && wordToFind && currentPlayer?.isAI) {
      const difficultyDelay = { easy: 5000 + Math.random() * 5000, medium: 3000 + Math.random() * 3000, hard: 1000 + Math.random() * 2000 };
      const aiId = currentPlayer.id.split('_')[1] as 'easy' | 'medium' | 'hard';
      const delay = difficultyDelay[aiId] || 7000;
      const timeout = setTimeout(() => handleWordSelected(wordToFind.text), delay);
      return () => clearTimeout(timeout);
    }
  }, [isTurnActive, wordToFind, currentPlayer, handleWordSelected]);
  
  const handleUseBonusTime = useCallback(() => {
    if (currentPlayer.bonusTime >= BONUS_TIME_AWARD && isTurnActive && isMyTurn) {
      setPlayers(ps => ps.map(p => p.id === currentPlayer.id ? { ...p, bonusTime: p.bonusTime - BONUS_TIME_AWARD } : p));
      setTimeLeft(t => t + BONUS_TIME_AWARD);
    }
  }, [currentPlayer, isTurnActive, isMyTurn]);

  const handleForfeit = useCallback(() => {
    if (window.confirm('Are you sure you want to forfeit? This will count as a loss.')) {
      const winner = players.find(p => p.id !== currentUser.id);
      if (winner) onGameOver(winner, players);
    }
  }, [currentUser.id, players, onGameOver]);

  return (
    <div className="card bg-dark text-light w-100">
      <div className="card-body p-2 p-md-3">
        <div className="row g-3">
          <div className="col-lg-3">
            <PlayerInfo player={players[0]} isCurrent={currentPlayer.id === players[0].id} gridData={gridData} wordsToWin={wordsToWin} />
          </div>
          
          <div className="col-lg-6 order-first order-lg-0">
            <div className="d-flex flex-column align-items-center justify-content-start h-100">
              <Timer timeLeft={timeLeft} turnDuration={TURN_DURATION} />
              <div className="my-3 text-center position-relative w-100">
                <p className="h5 fw-semibold">{turnType === 'steal' ? <span className="text-danger">STEAL ATTEMPT!</span> : <span className="text-body-secondary">Find this word:</span>}</p>
                <p className="display-6 fw-bold text-info text-glow-cyan">{wordToFind?.text || 'GAME OVER'}</p>
                <button onClick={() => setIsSpectatorView(!isSpectatorView)} className="btn btn-outline-secondary position-absolute top-0 end-0 p-2" title="Toggle Spectator View">
                  {isSpectatorView ? <EyeSlashIcon style={{width: '24px', height: '24px'}}/> : <EyeIcon style={{width: '24px', height: '24px'}}/>}
                </button>
              </div>
              <WordGrid 
                gridData={gridData}
                onWordSelected={handleWordSelected}
                turnResult={turnResult}
                revealWords={isSpectatorView}
                isTurnActive={!isSpectatorOrAI && isTurnActive}
              />
              <div className="mt-3 d-flex gap-2 justify-content-center align-items-center">
                {!isSpectatorOrAI && isTurnActive && turnType === 'normal' && (
                  <button onClick={handleUseBonusTime} disabled={currentPlayer.bonusTime < BONUS_TIME_AWARD} className="btn btn-secondary">
                    Use Bonus (+{BONUS_TIME_AWARD}s)
                  </button>
                )}
                {isMyTurn && !isSpectatorView && (
                  <button onClick={handleForfeit} className="btn btn-danger">Forfeit Match</button>
                )}
              </div>
              <ChatBox 
                messages={chatMessages}
                onSendMessage={(msg) => onSendMessage(msg, currentPlayer)}
                isLocked={!isTurnActive || isSpectatorOrAI}
                currentUserName={currentPlayer.name}
              />
            </div>
          </div>
          
          <div className="col-lg-3">
            <PlayerInfo player={players[1]} isCurrent={currentPlayer.id === players[1].id} gridData={gridData} wordsToWin={wordsToWin} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoardScreen;
