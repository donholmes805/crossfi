
import React, { useCallback, useState } from 'react';
import { Player, GridData, ChatMessage, WordLocation, User } from '../types';
import { BONUS_TIME_AWARD, TURN_DURATION } from '../constants';
import PlayerInfo from './common/PlayerInfo';
import Timer from './common/Timer';
import WordGrid from './common/WordGrid';
import ChatBox from './common/ChatBox';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';

interface GameBoardScreenProps {
  players: Player[];
  gridData: GridData;
  currentPlayerIndex: number;
  onWordSelected: (word: string) => void;
  onUseBonusTime: () => void;
  turnType: 'normal' | 'steal';
  wordToFind: WordLocation | null;
  timeLeft: number;
  isTurnActive: boolean;
  turnResult: 'success' | 'fail' | null;
  chatMessages: ChatMessage[];
  onGameOver: (winner: Player, finalPlayers: Player[]) => void;
  onSendMessage: (message: string, user: Player) => void;
  wordsToWin: number;
  currentUser: User;
}

const GameBoardScreen: React.FC<GameBoardScreenProps> = (props) => {
  const {
    players, gridData, currentPlayerIndex, onWordSelected, onUseBonusTime,
    turnType, wordToFind, timeLeft, isTurnActive, turnResult,
    chatMessages, onGameOver, onSendMessage, wordsToWin, currentUser
  } = props;

  const [isSpectatorView, setIsSpectatorView] = useState(false);
  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === currentUser.id;
  const isSpectatorOrAI = isSpectatorView || (currentPlayer && currentPlayer.isAI);

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
                onWordSelected={onWordSelected}
                turnResult={turnResult}
                revealWords={isSpectatorView}
                isTurnActive={isMyTurn && isTurnActive && !isSpectatorView}
              />
              <div className="mt-3 d-flex gap-2 justify-content-center align-items-center">
                {isMyTurn && isTurnActive && turnType === 'normal' && (
                  <button onClick={onUseBonusTime} disabled={currentPlayer.bonusTime < BONUS_TIME_AWARD} className="btn btn-secondary">
                    Use Bonus (+{BONUS_TIME_AWARD}s)
                  </button>
                )}
                {!isSpectatorView && (
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
