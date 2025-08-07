import React, { useEffect } from 'react';
import { Player } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import UserAvatar from './icons/UserAvatar';

interface GameOverScreenProps {
  winner: Player;
  players: Player[];
  onRematchRequest: (playerId: string) => void;
  onExit: () => void;
  rematchRequests: string[];
}

const PlayerRematchCard: React.FC<{ player: Player; onRematch: () => void; hasRequested: boolean; hasButton: boolean }> = ({ player, onRematch, hasRequested, hasButton }) => (
  <div className="bg-black/20 p-6 rounded-lg w-full flex flex-col items-center text-center border border-gray-700">
    <UserAvatar avatarKey={player.avatar} className="w-24 h-24 rounded-xl mb-4" />
    <h3 className="text-xl font-bold text-gray-100 truncate w-full" title={player.name}>{player.name}</h3>
    {hasRequested ? (
      <p className="mt-4 text-lg font-semibold text-green-500 animate-pulse">Wants a rematch!</p>
    ) : (
      hasButton && (
        <button
          onClick={onRematch}
          className="btn btn-secondary mt-4"
        >
          Request Rematch
        </button>
      )
    )}
    {!hasRequested && !hasButton && <p className="mt-4 text-lg font-semibold text-gray-400">Waiting...</p>}
  </div>
);


const GameOverScreen: React.FC<GameOverScreenProps> = ({ winner, players, onRematchRequest, onExit, rematchRequests }) => {
  const aiPlayer = players.find(p => p.isAI);

  useEffect(() => {
    if (aiPlayer && !rematchRequests.includes(aiPlayer.id)) {
      const timeout = setTimeout(() => {
        onRematchRequest(aiPlayer.id);
      }, 1500); // AI requests rematch after 1.5s
      return () => clearTimeout(timeout);
    }
  }, [aiPlayer, rematchRequests, onRematchRequest]);

  return (
    <div className="panel text-center p-10 flex flex-col items-center w-full max-w-4xl">
      <TrophyIcon className="w-20 h-20 text-yellow-400 mb-4" />
      <h2 className="text-4xl mb-2 text-gray-100">GAME OVER</h2>
      <p className="text-2xl text-blue-400 font-semibold mb-8 text-glow-blue">
        {winner.name} is the winner!
      </p>

      <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8 mb-8">
        {players.map(player => {
            const humanPlayerCanRequest = !player.isAI && !rematchRequests.includes(player.id)
            return (
                <PlayerRematchCard 
                    key={player.id}
                    player={player}
                    onRematch={() => onRematchRequest(player.id)}
                    hasRequested={rematchRequests.includes(player.id)}
                    hasButton={humanPlayerCanRequest}
                />
            )
        })}
        <div className="hidden md:block text-4xl font-black text-gray-500 my-4 md:my-0 order-first md:order-none transform md:-translate-x-1/2 left-1/2 absolute glitch">VS</div>
      </div>

      <button
        onClick={onExit}
        className="btn btn-secondary"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default GameOverScreen;