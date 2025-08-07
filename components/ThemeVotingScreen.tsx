import React, { useState, useEffect } from 'react';
import { Player, User } from '../types';
import { THEMES } from '../services/gameService';
import UserAvatar from './icons/UserAvatar';

interface ThemeVotingScreenProps {
  players: Player[];
  onVote: (theme: string) => void;
  currentUser: User;
  votes: Record<string, string>;
}

const getRandomThemes = () => [...THEMES].sort(() => 0.5 - Math.random()).slice(0, 3);

const ThemeVotingScreen: React.FC<ThemeVotingScreenProps> = ({ players, onVote, currentUser, votes }) => {
    const [themes] = useState<string[]>(getRandomThemes);
    const [player1, player2] = players;

    const handleVote = (theme: string) => {
        if (votes[currentUser.id]) return; // Can't vote twice
        onVote(theme);
    };

    const allVoted = Object.keys(votes).length === 2;
    const renderPlayerVoteStatus = (player: Player) => {
        if (allVoted) {
            const votedFor = votes[player.id];
            return <p className="text-light fw-semibold mt-2 small">Voted for: <br/><span className="text-info">{votedFor}</span></p>;
        }
        return votes[player.id] ? <p className="text-success fw-semibold mt-2">Voted!</p> : <p className="text-body-secondary fw-semibold mt-2">Voting...</p>
    };

    return (
        <div className="card bg-dark text-light w-100" style={{maxWidth: '900px'}}>
            <div className="card-body text-center p-4 p-md-5">
                <h2 className="card-title h1 mb-2 text-info text-glow-cyan">Rematch: Vote for the Next Theme!</h2>
                <p className="text-body-secondary mb-4">The next battleground will be decided by your votes. In case of a tie, the winner is chosen randomly.</p>

                <div className="row g-3 mb-4">
                    {themes.map(theme => (
                        <div key={theme} className="col-md-4">
                            <div className="card card-body bg-dark h-100 position-relative p-3 d-flex flex-column justify-content-between">
                                <h3 className="h5 text-light mb-3">{theme}</h3>
                                {!allVoted && (
                                    <button onClick={() => handleVote(theme)} disabled={!!votes[currentUser.id]} className="btn btn-sm btn-outline-info mt-auto">
                                        {!!votes[currentUser.id] ? 'Waiting...' : 'Vote'}
                                    </button>
                                )}
                                <div className="position-absolute top-0 start-0 m-2 d-flex gap-1">
                                    {votes[player1.id] === theme && <span title={`${player1.name} voted for ${theme}`}><UserAvatar avatarKey={player1.avatar} className="rounded-circle border border-2 border-primary" style={{ width: '32px', height: '32px' }} /></span>}
                                </div>
                                <div className="position-absolute top-0 end-0 m-2 d-flex gap-1">
                                    {votes[player2.id] === theme && <span title={`${player2.name} voted for ${theme}`}><UserAvatar avatarKey={player2.avatar} className="rounded-circle border border-2 border-danger" style={{ width: '32px', height: '32px' }} /></span>}
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

                {allVoted && <p className="mt-4 h5 text-glow-purple animate-pulse">Tallying votes... preparing the next battlefield!</p>}
            </div>
        </div>
    );
};

export default ThemeVotingScreen;