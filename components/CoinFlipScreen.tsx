import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import UserAvatar from './icons/UserAvatar';
import CoinIcon from './icons/CoinIcon';

interface CoinFlipScreenProps {
  players: Player[];
  onFlipComplete: (firstPlayerIndex: number) => void;
}

const CoinFlipScreen: React.FC<CoinFlipScreenProps> = ({ players, onFlipComplete }) => {
  if (!players || players.length < 2) {
    return null; // or a loading spinner
  }

  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'Heads' | 'Tails' | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [player1Call, setPlayer1Call] = useState<'Heads' | 'Tails' | null>(null);

  useEffect(() => {
    if (result && winnerIndex === null) { // ensure this runs only once
      const firstPlayerGoesFirst = player1Call === result;
      const winner = firstPlayerGoesFirst ? 0 : 1;
      setWinnerIndex(winner);
      
      setTimeout(() => {
        onFlipComplete(winner);
      }, 3000);
    }
  }, [result, player1Call, onFlipComplete, winnerIndex]);

  const handleFlip = (call: 'Heads' | 'Tails') => {
    if (isFlipping) return;
    setPlayer1Call(call);
    setIsFlipping(true);

    setTimeout(() => {
      const flipResult = Math.random() < 0.5 ? 'Heads' : 'Tails';
      setResult(flipResult);
      setIsFlipping(false);
    }, 2500);
  };
  
  const [player1, player2] = players;

  return (
    <div className="panel w-full max-w-2xl text-center p-8 md:p-12 flex flex-col items-center">
        <h2 className="text-3xl mb-4 text-gray-100 text-glow-cyan">The Coin Flip</h2>
        {!result ? (
            <>
                <p className="text-gray-400 mb-8">{player1.name}, make your call to decide who goes first.</p>
                <div className="flex items-center justify-around w-full mb-8">
                    <div className="flex flex-col items-center gap-2">
                        <UserAvatar avatarKey={player1.avatar} className="w-24 h-24 rounded-lg" />
                        <span className="font-bold text-gray-200">{player1.name}</span>
                    </div>
                    <span className="text-3xl font-bold text-gray-500 glitch">VS</span>
                    <div className="flex flex-col items-center gap-2">
                        <UserAvatar avatarKey={player2.avatar} className="w-24 h-24 rounded-lg" />
                        <span className="font-bold text-gray-200">{player2.name}</span>
                    </div>
                </div>
                <CoinIcon isFlipping={isFlipping} className="w-32 h-32 mb-8" />
                <div className="flex gap-4">
                    <button 
                        onClick={() => handleFlip('Heads')} 
                        disabled={isFlipping}
                        className="btn btn-secondary"
                    >
                        Heads
                    </button>
                    <button 
                        onClick={() => handleFlip('Tails')}
                        disabled={isFlipping}
                        className="btn btn-secondary"
                    >
                        Tails
                    </button>
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center">
                 <CoinIcon isFlipping={false} result={result} className="w-32 h-32 mb-8" />
                 <p className="text-xl text-gray-400 mb-2">
                    {player1.name} called <span className="font-bold text-blue-400">{player1Call}</span>. The result is <span className="font-bold text-blue-400">{result}</span>.
                 </p>
                 <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse">
                    {winnerIndex !== null ? players[winnerIndex].name : '...'} goes first!
                 </h3>
                 <p className="mt-4 text-gray-400">Starting game...</p>
            </div>
        )}
    </div>
  );
};

export default CoinFlipScreen;