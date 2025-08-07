import React from 'react';
import { Player, GridData } from '../../types';
import { BONUS_TIME_AWARD } from '../../constants';
import ClockIcon from '../icons/ClockIcon';
import StarIcon from '../icons/StarIcon';
import UserAvatar from '../icons/UserAvatar';

interface PlayerInfoProps {
  player: Player;
  isCurrent: boolean;
  gridData: GridData;
  wordsToWin: number;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, isCurrent, gridData, wordsToWin }) => {
  const score = gridData.words.filter(w => w.foundBy === player.id).length;
  const scoreDots = Array.from({ length: wordsToWin }).map((_, i) => (
    <div key={i} className={`w-5 h-5 rounded-full transition-all duration-500 ${i < score ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
  ));

  return (
    <div className={`p-4 md:p-6 rounded-2xl transition-all duration-300 ${isCurrent ? 'bg-gray-800/50 ring-2 ring-blue-400 shadow-lg animate-pulse-glow' : 'bg-gray-800/50 border border-gray-700'}`}>
      <div className="flex items-center gap-4 mb-4">
        <UserAvatar avatarKey={player.avatar} className="w-16 h-16 rounded-lg flex-shrink-0" />
        <div className="overflow-hidden">
          <h3 className={`text-xl font-bold truncate ${isCurrent ? 'text-blue-400' : 'text-gray-200'}`} title={player.name}>{player.name}</h3>
          {player.isAI ? 
            <p className="text-xs text-red-400 font-bold">[AI OPPONENT]</p>
            : <p className="text-xs text-gray-400">W: {player.wins} | L: {player.losses}</p>
          }
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-400 mb-2">Score</p>
          <div className="flex items-center flex-wrap gap-3">
            {scoreDots}
          </div>
        </div>
        
        {isCurrent && !player.isAI && (
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-2">Bonuses</p>
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-yellow-400" title="Available bonus tokens">
                      <StarIcon className="w-6 h-6"/>
                      <span className="text-lg font-bold">{Math.floor(player.bonusTime / BONUS_TIME_AWARD)}</span>
                  </div>
                   <div className="flex items-center gap-2 text-gray-200" title="Total bonus time available">
                      <ClockIcon className="w-5 h-5"/>
                      <span className="text-lg font-bold">{player.bonusTime}s</span>
                  </div>
              </div>
            </div>
        )}
        
        <div>
          <p className="text-sm font-semibold text-gray-400 mb-2">Words Found</p>
          <ul className="h-24 overflow-y-auto space-y-1 pr-2 rounded-md bg-black/20 p-1">
              {gridData.words.filter(w => w.foundBy === player.id).map(w => (
                  <li key={w.text} className="text-sm bg-gray-700/50 border border-gray-600 px-2 py-1 rounded text-gray-300 tracking-wider">
                      {w.text}
                  </li>
              ))}
              {score === 0 && <li className="text-sm text-gray-400 px-2 py-1">No words found yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;