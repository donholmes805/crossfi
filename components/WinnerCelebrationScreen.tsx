import React, { useEffect } from 'react';
import { Player } from '../types';
import UserAvatar from './icons/UserAvatar';
import Confetti from './common/Confetti';
import TrophyIcon from './icons/TrophyIcon';

interface WinnerCelebrationScreenProps {
  winner: Player;
  onComplete: () => void;
}

const WinnerCelebrationScreen: React.FC<WinnerCelebrationScreenProps> = ({ winner, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="card bg-dark text-light position-relative w-100 border-2 border-warning shadow" style={{maxWidth: '600px', overflow: 'hidden'}}>
      <Confetti />
      <div className="card-body text-center p-4 p-md-5 position-relative">
        <TrophyIcon className="text-warning mb-3" style={{ width: '96px', height: '96px', filter: 'drop-shadow(0 0 10px #facc15)' }} />
        <h1 className="display-3 fw-bold text-warning text-glow-yellow">
          VICTORY!
        </h1>
        <div className="d-inline-flex flex-column align-items-center gap-3 bg-black bg-opacity-25 p-4 rounded-3 mt-3">
            <UserAvatar avatarKey={winner.avatar} className="rounded-circle" style={{width: '128px', height: '128px'}} />
            <h2 className="h1 text-light">{winner.name}</h2>
        </div>
        <p className="text-body-secondary mt-4 h5">You are the champion!</p>
      </div>
    </div>
  );
};

export default WinnerCelebrationScreen;
