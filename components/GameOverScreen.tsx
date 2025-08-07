import React, { useEffect } from 'react';
import { Player, User } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import UserAvatar from './icons/UserAvatar';
import { p2pService } from '../services/p2pService';

interface GameOverScreenProps {
  winner: Player;
  players: Player[];
  onRematchRequest: (playerId: string) => void;
  onExit: () => void;
  rematchRequests: string[];
  currentUser: User;
}

const PlayerRematchCard: React.FC<{ player: Player; onRematch: () => void; hasRequested: boolean; hasButton: boolean }> = ({ player, onRematch, hasRequested, hasButton }) => (
  <div className="card bg-dark text-light w-100">
    <div className="card-body d-flex flex-column align-items-center text-center p-4">
      <UserAvatar avatarKey={player.avatar} className="rounded mb-3" style={{ width: '96px', height: '96px' }} />
      <h3 className="card-title h5 text-truncate w-100" title={player.name}>{player.name}</h3>
      {hasRequested ? (
        <p className="mt-3 h6 text-success">Wants a rematch!</p>
      ) : (
        hasButton ? (
          <button onClick={onRematch} className="btn btn-secondary mt-3">Request Rematch</button>
        ) : <p className="mt-3 text-body-secondary">Waiting...</p>
      )}
    </div>
  </div>
);

const GameOverScreen: React.FC<GameOverScreenProps> = ({ winner, players, onRematchRequest, onExit, rematchRequests, currentUser }) => {
  const isPvc = players.some(p => p.isAI);
  const aiPlayer = isPvc ? players.find(p => p.isAI) : null;
  const humanPlayer = isPvc ? players.find(p => !p.isAI) : null;
  
  useEffect(() => {
    if (aiPlayer && humanPlayer && !rematchRequests.includes(aiPlayer.id)) {
      const timeout = setTimeout(() => {
        onRematchRequest(aiPlayer.id);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [aiPlayer, humanPlayer, rematchRequests, onRematchRequest]);

  return (
    <div className="card bg-dark text-light w-100" style={{maxWidth: '800px'}}>
      <div className="card-body text-center p-4 p-md-5">
        <TrophyIcon className="text-warning mb-3" style={{width: '80px', height: '80px'}} />
        <h2 className="card-title display-4">GAME OVER</h2>
        <p className="h3 text-info text-glow-blue mb-4">
          {winner.name} is the winner!
        </p>

        <div className="row align-items-center g-3 mb-4">
          {players.map(player => (
            <div className="col-md-5" key={player.id}>
              <PlayerRematchCard
                player={player}
                onRematch={() => onRematchRequest(player.id)}
                hasRequested={rematchRequests.includes(player.id)}
                hasButton={!player.isAI && !rematchRequests.includes(player.id)}
              />
            </div>
          )).reduce((prev, curr, i) => i === 0 ? [curr] : [...prev, <div key={`vs-${i}`} className="col-md-2 d-none d-md-block"><span className="display-4 fw-black text-secondary">VS</span></div>, curr], [] as JSX.Element[])}
        </div>

        <button onClick={onExit} className="btn btn-secondary">Back to Menu</button>
      </div>
    </div>
  );
};

export default GameOverScreen;
