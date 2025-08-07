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
    <div key={i} className={`rounded-circle ${i < score ? 'bg-info' : 'bg-secondary'}`} style={{ width: '16px', height: '16px', transition: 'background-color 0.5s' }}></div>
  ));

  return (
    <div className={`card h-100 ${isCurrent ? 'border-info' : ''}`}>
      <div className="card-body p-3">
        <div className="d-flex align-items-center gap-3 mb-3">
          <UserAvatar avatarKey={player.avatar} className="rounded flex-shrink-0" style={{width: '64px', height: '64px'}} />
          <div className="overflow-hidden">
            <h3 className={`h5 text-truncate ${isCurrent ? 'text-info text-glow-cyan' : 'text-light'}`} title={player.name}>{player.name}</h3>
            {player.isAI ? 
              <p className="small text-danger">[AI OPPONENT]</p>
              : <p className="small text-body-secondary">W: {player.wins} | L: {player.losses}</p>
            }
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          <div>
            <p className="small fw-semibold text-body-secondary mb-2">SCORE</p>
            <div className="d-flex flex-wrap gap-2">
              {scoreDots}
            </div>
          </div>
          
          {isCurrent && !player.isAI && (
            <div>
              <p className="small fw-semibold text-body-secondary mb-2">BONUSES</p>
              <div className="d-flex align-items-center gap-4">
                  <div className="d-flex align-items-center gap-2 text-warning" title="Available bonus tokens">
                      <StarIcon style={{width: '24px', height: '24px'}}/>
                      <span className="h5 mb-0 fw-bold">{Math.floor(player.bonusTime / BONUS_TIME_AWARD)}</span>
                  </div>
                   <div className="d-flex align-items-center gap-2 text-light" title="Total bonus time available">
                      <ClockIcon style={{width: '20px', height: '20px'}}/>
                      <span className="h5 mb-0 fw-bold">{player.bonusTime}s</span>
                  </div>
              </div>
            </div>
          )}
          
          <div>
            <p className="small fw-semibold text-body-secondary mb-2">WORDS FOUND</p>
            <ul className="list-unstyled overflow-y-auto p-1 bg-black bg-opacity-25 rounded" style={{ height: '96px' }}>
                {gridData.words.filter(w => w.foundBy === player.id).map(w => (
                    <li key={w.text} className="small bg-secondary bg-opacity-25 border border-secondary rounded px-2 py-1 mb-1 text-light">
                        {w.text}
                    </li>
                ))}
                {score === 0 && <li className="small text-body-secondary p-2">No words found yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
