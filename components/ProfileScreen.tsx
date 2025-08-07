import React from 'react';
import { GameState, User } from '../types';
import UserAvatar from './icons/UserAvatar';

interface ProfileScreenProps {
  currentUser: User;
  onNavigate: (state: GameState) => void;
  onDelete: () => void;
}

const StatCard = ({ label, value, className = '' }: { label: string; value: string | number; className?: string }) => (
    <div className={`bg-gray-800/60 p-4 rounded-xl text-center shadow-lg border border-gray-700 ${className}`}>
        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentUser, onNavigate, onDelete }) => {
    const totalGames = currentUser.wins + currentUser.losses;
    const winRate = totalGames > 0 ? ((currentUser.wins / totalGames) * 100).toFixed(1) + '%' : 'N/A';
    
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to permanently delete your profile? All your stats will be lost. This action cannot be undone.')) {
            onDelete();
        }
    };

    return (
        <div className="w-full max-w-3xl text-center bg-gray-900/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-gray-100">Your Combat Record</h2>

            <div className="flex flex-col items-center gap-4 mb-8">
                <UserAvatar avatarKey={currentUser.avatar} className="w-32 h-32 rounded-2xl" />
                <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{currentUser.name}</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <StatCard label="Total Games" value={totalGames} className="md:col-span-1" />
                <StatCard label="Win Rate" value={winRate} className="md:col-span-2" />
                <StatCard label="Wins" value={currentUser.wins} />
                <StatCard label="Losses" value={currentUser.losses} />
                <StatCard label="Bonuses Earned" value={currentUser.totalBonuses} />
            </div>
            
            <div className="border-t-2 border-dashed border-gray-700 my-8"></div>
            
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-6">
                <h4 className="text-xl font-bold text-red-300">Danger Zone</h4>
                <p className="text-red-400/80 mt-2 mb-4 text-sm">
                    Permanently delete your profile and all associated data. This action cannot be undone.
                </p>
                <button
                    onClick={handleDelete}
                    className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-4 focus:ring-red-500/50"
                >
                    Delete My Profile
                </button>
            </div>

            <div className="mt-8">
                <button
                    onClick={() => onNavigate(GameState.MainMenu)}
                    className="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 focus:outline-none transition-all duration-300"
                >
                    Back to Menu
                </button>
            </div>
        </div>
    );
};

export default ProfileScreen;