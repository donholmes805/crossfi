import React, { useState, useEffect } from 'react';
import { Player, User } from '../types';
import { THEMES } from '../services/gameService';
import UserAvatar from './icons/UserAvatar';
import { p2pService } from '../services/p2pService';

interface ThemeVotingScreenProps {
  players: Player[];
  onThemeSelected: (theme: string) => void;
  currentUser: User;
}

const getRandomThemes = () => [...THEMES].sort(() => 0.5 - Math.random()).slice(0, 3);

const ThemeVotingScreen: React.FC<ThemeVotingScreenProps> = ({ players, onThemeSelected, currentUser }) => {
    const [themes] = useState<string[]>(getRandomThemes);
    const [votes, setVotes] = useState<Record<string, string>>({});
    
    const [player1, player2] = players;
    const isPvc = players.some(p => p.isAI);
    const humanPlayer = isPvc ? players.find(p => !p.isAI)! : currentUser;

    const handleVote = (playerId: string, theme: string) => {
        if (votes[playerId] || playerId !== humanPlayer.id) return;
        setVotes(prev => ({ ...prev, [playerId]: theme }));
        if(!isPvc) {
          // p2pService.sendMessage({ type: 'VOTE', payload: { theme }});
        }
    };
    
    // AI or Host logic for voting
    useEffect(() => {
        if (isPvc) {
            const aiPlayer = players.find(p => p.isAI)!;
            if (!votes[aiPlayer.id]) {
                const randomTheme = themes[Math.floor(Math.random() * themes.length)];
                setTimeout(() => setVotes(prev => ({ ...prev, [aiPlayer.id]: randomTheme })), 1500);
            }
        }
    }, [isPvc, players, votes, themes]);

    useEffect(() => {
        if (Object.keys(votes).length === 2) {
            const vote1 = votes[player1.id];
            const vote2 = votes[player2.id];
            const winningTheme = vote1 === vote2 ? vote1 : (Math.random() < 0.5 ? vote1 : vote2);
            setTimeout(() => onThemeSelected(winningTheme), 2000);
        }
    }, [votes, onThemeSelected, player1.id, player2.id]);
    
    const allVoted = Object.keys(votes).length === 2;
    const renderPlayerVoteStatus = (player: Player) => (votes[player.id] ? <p className="text-success fw-semibold mt-2">Voted!</p> : <p className="text-body-secondary fw-semibold mt-2">Voting...</p>);

    return (
        <div className="card bg-dark text-light w-100" style={{maxWidth: '900px'}}>
            <div className="card-body text-center p-4 p-md-5">
                <h2 className="card-title h1 mb-2 text-info text-glow-cyan">Rematch: Vote for the Next Theme!</h2>
                <p className="text-body-secondary mb-4">The next battleground will be decided by your votes.</p>

                <div className="row g-3 mb-4">
                    {themes.map(theme => (
                        <div key={theme} className="col-md-4">
                            <div className="card card-body bg-dark h-100 position-relative p-3">
                                <h3 className="h5 text-light mb-3">{theme}</h3>
                                {!allVoted && (
                                    <button onClick={() => handleVote(humanPlayer.id, theme)} disabled={!!votes[humanPlayer.id]} className="btn btn-sm btn-outline-info">
                                        Vote
                                    </button>
                                )}
                                <div className="position-absolute top-0 start-0 m-2 d-flex gap-1">
                                    {votes[player1.id] === theme && <UserAvatar avatarKey={player1.avatar} className="rounded-circle border border-2 border-primary" style={{ width: '32px', height: '32px' }} />}
                                </div>
                                <div className="position-absolute top-0 end-0 m-2 d-flex gap-1">
                                    {votes[player2.id] === theme && <UserAvatar avatarKey={player2.avatar} className="rounded-circle border border-2 border-danger" style={{ width: '32px', height: '32px' }} />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row align-items-center justify-content-center">
                    <div className="col-5 d-flex flex-column align-items-center gap-2">
                        <UserAvatar avatarKey={player1.avatar} className="rounded" style={{width: '80px', height: '80px'}} />
                        <span className="fw-bold">{player1.name}</span>
                        {renderPlayerVoteStatus(player1)}
                    </div>
                    <div className="col-2 text-center"><span className="h2 fw-bold text-secondary">VS</span></div>
                    <div className="col-5 d-flex flex-column align-items-center gap-2">
                        <UserAvatar avatarKey={player2.avatar} className="rounded" style={{width: '80px', height: '80px'}} />
                        <span className="fw-bold">{player2.name}</span>
                        {renderPlayerVoteStatus(player2)}
                    </div>
                </div>

                {allVoted && <p className="mt-4 h5 text-purple-500 animate-pulse text-glow-purple">Tallying votes... preparing the next battlefield!</p>}
            </div>
        </div>
    );
};

export default ThemeVotingScreen;
