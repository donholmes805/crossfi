
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import UserAvatar from './icons/UserAvatar';
import CoinIcon from './icons/CoinIcon';
import { p2pService, P2PMessage } from '../services/p2pService';

interface CoinFlipScreenProps {
  players: Player[];
  onFlipComplete: (firstPlayerIndex: number) => void;
}

const CoinFlipScreen: React.FC<CoinFlipScreenProps> = ({ players, onFlipComplete }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'Heads' | 'Tails' | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [player1Call, setPlayer1Call] = useState<'Heads' | 'Tails' | null>(null);

  const [player1, player2] = players;
  const isHost = p2pService.isHost;

  useEffect(() => {
    const handleData = (data: P2PMessage) => {
        if (data.type === 'COIN_FLIP_RESULT') {
            setPlayer1Call(data.payload.player1Call);
            setIsFlipping(true);

            // Simulate the flip animation duration
            setTimeout(() => {
                setResult(data.payload.result);
                setWinnerIndex(data.payload.winnerIndex);
                setIsFlipping(false);

                // After displaying the result, only the host proceeds
                if (isHost) {
                   setTimeout(() => {
                       onFlipComplete(data.payload.winnerIndex);
                   }, 3000); // Wait 3s to show the winner
                }
            }, 2500); // Animation duration
        }
    };
    
    const unsubscribe = p2pService.on('data-received', handleData);
    return () => unsubscribe();
  }, [isHost, onFlipComplete]);


  const handleFlip = (call: 'Heads' | 'Tails') => {
    // Only the host can initiate the flip
    if (isFlipping || !isHost) return;

    // The host determines the outcome and broadcasts it
    const flipResult = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const winner = call === flipResult ? 0 : 1;

    p2pService.sendMessage({
      type: 'COIN_FLIP_RESULT',
      payload: {
        result: flipResult,
        winnerIndex: winner,
        player1Call: call,
      }
    });
  };
  
  return (
    <div className="card bg-dark text-light w-100" style={{maxWidth: '700px'}}>
      <div className="card-body text-center p-4 p-md-5">
        <h2 className="card-title h1 mb-3 text-info text-glow-cyan">The Coin Flip</h2>
        {!result ? (
            <>
                <p className="text-body-secondary mb-4">{isHost ? `${player1.name}, make your call to decide who goes first.` : `Waiting for ${player1.name} to call the coin flip...`}</p>
                <div className="row align-items-center justify-content-center mb-4 g-3">
                    <div className="col-5 d-flex flex-column align-items-center gap-2">
                        <UserAvatar avatarKey={player1.avatar} className="rounded" style={{width: '96px', height: '96px'}} />
                        <span className="fw-bold">{player1.name}</span>
                    </div>
                    <div className="col-2 text-center">
                        <span className="h2 fw-bold text-secondary">VS</span>
                    </div>
                     <div className="col-5 d-flex flex-column align-items-center gap-2">
                        <UserAvatar avatarKey={player2.avatar} className="rounded" style={{width: '96px', height: '96px'}} />
                        <span className="fw-bold">{player2.name}</span>
                    </div>
                </div>
                <CoinIcon isFlipping={isFlipping} className="mx-auto my-4" style={{width: '128px', height: '128px'}} />
                {isHost && 
                    <div className="d-grid gap-2 d-sm-flex justify-content-center">
                        <button onClick={() => handleFlip('Heads')} disabled={isFlipping} className="btn btn-secondary">Heads</button>
                        <button onClick={() => handleFlip('Tails')} disabled={isFlipping} className="btn btn-secondary">Tails</button>
                    </div>
                }
            </>
        ) : (
            <div className="d-flex flex-column align-items-center">
                 <CoinIcon isFlipping={false} result={result} className="mx-auto my-4" style={{width: '128px', height: '128px'}} />
                 <p className="h5 text-body-secondary mb-2">
                    {player1.name} called <span className="fw-bold text-info">{player1Call}</span>. The result is <span className="fw-bold text-info">{result}</span>.
                 </p>
                 <h3 className="display-5 fw-bold text-primary">
                    {winnerIndex !== null ? players[winnerIndex].name : '...'} goes first!
                 </h3>
                 <p className="mt-3 text-body-secondary">Starting game...</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CoinFlipScreen;
