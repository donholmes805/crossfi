import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { THEMES } from '../services/gameService';
import UserAvatar from './icons/UserAvatar';

interface ThemeVotingScreenProps {
  players: Player[];
  onThemeSelected: (theme: string) => void;
}

// Function to get 3 unique random themes
const getRandomThemes = () => {
    const shuffled = [...THEMES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
};

const ThemeVotingScreen: React.FC<ThemeVotingScreenProps> = ({ players, onThemeSelected }) => {
    if (!players || players.length < 2) {
        return null; // or a loading spinner
    }

    const [themes] = useState<string[]>(getRandomThemes);
    const [votes, setVotes] = useState<Record<string, string>>({}); // { playerId: themeName }
    
    const [player1, player2] = players;
    const aiPlayer = players.find(p => p.isAI);

    const handleVote = (playerId: string, theme: string) => {
        if (votes[playerId]) return; // Already voted
        setVotes(prev => ({ ...prev, [playerId]: theme }));
    };

    // AI Voting Logic
    useEffect(() => {
        if(aiPlayer && !votes[aiPlayer.id]){
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];
            const timeout = setTimeout(() => {
                handleVote(aiPlayer.id, randomTheme);
            }, 1500); // AI votes after 1.5s
            return () => clearTimeout(timeout);
        }
    }, [aiPlayer, votes, themes]);

    useEffect(() => {
        if (Object.keys(votes).length === 2) {
            // Both players voted, determine winner
            const vote1 = votes[player1.id];
            const vote2 = votes[player2.id];

            let winningTheme: string;
            if (vote1 === vote2) {
                winningTheme = vote1;
            } else {
                // Tie, randomly pick one of the two votes
                winningTheme = Math.random() < 0.5 ? vote1 : vote2;
            }

            setTimeout(() => {
                onThemeSelected(winningTheme);
            }, 2000); // Wait a bit to show result
        }
    }, [votes, onThemeSelected, player1.id, player2.id]);
    
    const allVoted = Object.keys(votes).length === 2;
    const humanPlayer = players.find(p => !p.isAI)!;

    const renderPlayerVoteStatus = (player: Player) => {
        const vote = votes[player.id];
        if (vote) {
            return <p className="text-green-500 font-semibold mt-2">Voted!</p>
        }
        return <p className="text-gray-400 font-semibold mt-2 animate-pulse">Voting...</p>
    };

    return (
        <div className="w-full max-w-4xl text-center bg-gray-900/70 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-xl border border-gray-700 flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-2 text-gray-100">Rematch: Vote for the Next Theme!</h2>
            <p className="text-gray-400 mb-8">The next battleground will be decided by your votes.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
                {themes.map(theme => {
                    const player1VotedThis = votes[player1.id] === theme;
                    const player2VotedThis = votes[player2.id] === theme;
                    
                    return (
                        <div key={theme} className="relative p-4 border-2 border-gray-700 rounded-xl transition-all duration-300 flex flex-col items-center justify-center min-h-[150px] bg-gray-800/50">
                            <h3 className="text-xl font-bold text-gray-200 mb-4 text-center">{theme}</h3>
                            {!allVoted && !aiPlayer && (
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <button 
                                        onClick={() => handleVote(player1.id, theme)} 
                                        disabled={!!votes[player1.id]}
                                        className="px-3 py-1 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Vote as {player1.name.split(' ')[0]}
                                    </button>
                                     <button 
                                        onClick={() => handleVote(player2.id, theme)} 
                                        disabled={!!votes[player2.id]}
                                        className="px-3 py-1 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    >
                                        Vote as {player2.name.split(' ')[0]}
                                    </button>
                                </div>
                            )}
                             {!allVoted && aiPlayer && (
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <button 
                                        onClick={() => handleVote(humanPlayer.id, theme)} 
                                        disabled={!!votes[humanPlayer.id]}
                                        className="px-3 py-1 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Vote as {humanPlayer.name.split(' ')[0]}
                                    </button>
                                </div>
                            )}
                            <div className="absolute top-2 left-2 flex gap-1">
                                {player1VotedThis && <span title={player1.name}><UserAvatar avatarKey={player1.avatar} className="w-8 h-8 rounded-full ring-2 ring-blue-500" /></span>}
                            </div>
                             <div className="absolute top-2 right-2 flex gap-1">
                                {player2VotedThis && <span title={player2.name}><UserAvatar avatarKey={player2.avatar} className="w-8 h-8 rounded-full ring-2 ring-red-500" /></span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-around w-full max-w-lg">
                <div className="flex flex-col items-center gap-2">
                    <UserAvatar avatarKey={player1.avatar} className="w-20 h-20 rounded-lg" />
                    <span className="font-bold text-gray-200">{player1.name}</span>
                    {renderPlayerVoteStatus(player1)}
                </div>
                <span className="text-3xl font-bold text-gray-500">VS</span>
                <div className="flex flex-col items-center gap-2">
                    <UserAvatar avatarKey={player2.avatar} className="w-20 h-20 rounded-lg" />
                    <span className="font-bold text-gray-200">{player2.name}</span>
                    {renderPlayerVoteStatus(player2)}
                </div>
            </div>

            {allVoted && (
                <p className="mt-8 text-xl font-bold text-purple-500 animate-pulse">Tallying votes... preparing the next battlefield!</p>
            )}
        </div>
    );
};

export default ThemeVotingScreen;
