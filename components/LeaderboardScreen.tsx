import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers } from '../services/authService';
import UserAvatar from './icons/UserAvatar';
import TrophyIcon from './icons/TrophyIcon';

interface LeaderboardScreenProps {
  onBack: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const sortedUsers = getUsers().sort((a, b) => b.wins - a.wins);
    setUsers(sortedUsers);
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400 text-glow-yellow';
    if (rank === 1) return 'text-gray-300';
    if (rank === 2) return 'text-yellow-600';
    return 'text-gray-400';
  };

  return (
    <div className="panel w-full max-w-3xl text-center p-6 md:p-8">
      <h2 className="text-3xl mb-6 text-gray-100 flex items-center justify-center gap-3 text-glow-cyan">
        <TrophyIcon className="w-8 h-8 text-yellow-400" />
        Leaderboard
      </h2>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {users.length > 0 ? (
          users.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center gap-4 bg-black/20 p-3 rounded-lg border border-gray-700/50"
            >
              <div className={`w-10 text-xl font-bold text-center flex-shrink-0 ${getRankColor(index)}`}>
                {index + 1}
              </div>
              <UserAvatar avatarKey={user.avatar} className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-grow text-left overflow-hidden">
                <p className="font-bold text-lg text-gray-200 truncate">{user.name}</p>
              </div>
              <div className="flex-shrink-0 text-right space-y-1 text-sm">
                <p className="font-semibold text-green-400">Wins: {user.wins}</p>
                <p className="font-semibold text-red-400">Losses: {user.losses}</p>
              </div>
               <div className="flex-shrink-0 text-right text-sm w-24">
                <p className="font-semibold text-purple-400">Bonuses: {user.totalBonuses}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 py-8">No players have registered yet. Be the first!</p>
        )}
      </div>
      <div className="mt-8">
        <button
          onClick={onBack}
          className="btn btn-secondary"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default LeaderboardScreen;