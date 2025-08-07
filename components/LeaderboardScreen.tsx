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
    if (rank === 0) return 'text-warning text-glow-yellow';
    if (rank === 1) return 'text-light';
    if (rank === 2) return 'text-warning-emphasis';
    return 'text-body-secondary';
  };

  return (
    <div className="card bg-dark text-light w-100" style={{maxWidth: '800px'}}>
      <div className="card-body p-4 p-md-5">
        <h2 className="card-title text-center h1 mb-4 d-flex align-items-center justify-content-center gap-3 text-info text-glow-cyan">
          <TrophyIcon className="text-warning" style={{width: '32px', height: '32px'}} />
          Leaderboard
        </h2>
        <div className="list-group" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {users.length > 0 ? (
            users.map((user, index) => (
              <div
                key={user.id}
                className="list-group-item bg-dark d-flex align-items-center gap-3"
              >
                <div className={`fw-bold text-center ${getRankColor(index)}`} style={{width: '30px'}}>
                  {index + 1}
                </div>
                <UserAvatar avatarKey={user.avatar} className="rounded flex-shrink-0" style={{width: '48px', height: '48px'}} />
                <div className="flex-grow-1 text-start overflow-hidden">
                  <p className="fw-bold text-light text-truncate mb-0">{user.name}</p>
                </div>
                <div className="text-end small">
                  <p className="mb-0 text-success-emphasis">Wins: {user.wins}</p>
                  <p className="mb-0 text-danger-emphasis">Losses: {user.losses}</p>
                </div>
                 <div className="text-end small" style={{width: '80px'}}>
                  <p className="mb-0 text-info-emphasis">Bonuses: {user.totalBonuses}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-body-secondary text-center py-5">No players have registered yet. Be the first!</p>
          )}
        </div>
        <div className="text-center mt-4">
          <button onClick={onBack} className="btn btn-secondary">Back to Menu</button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
