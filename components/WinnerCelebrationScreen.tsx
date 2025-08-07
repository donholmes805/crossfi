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
    const timer = setTimeout(() => {
      onComplete();
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative w-full max-w-2xl text-center bg-gray-900/50 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl border-2 border-yellow-400 flex flex-col items-center overflow-hidden">
      <Confetti />
      <div className="relative z-10 flex flex-col items-center">
        <TrophyIcon className="w-24 h-24 text-yellow-400 mb-4 animate-pulse-urgent" style={{ animationDuration: '2s' }} />
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-4">
          VICTORY!
        </h1>
        <div className="flex flex-col items-center gap-4 bg-black/30 p-6 rounded-xl">
            <UserAvatar avatarKey={winner.avatar} className="w-32 h-32 rounded-2xl" />
            <h2 className="text-3xl font-bold text-gray-100">{winner.name}</h2>
        </div>
        <p className="text-gray-400 mt-6 text-lg">You are the champion!</p>
      </div>
    </div>
  );
};

export default WinnerCelebrationScreen;
