import React from 'react';
import { GameState, User } from '../types';
import UserAvatar from './icons/UserAvatar';

interface ProfileScreenProps {
  currentUser: User;
  onNavigate: () => void;
  onDelete: () => void;
}

const StatCard = ({ label, value, className = '' }: { label: string; value: string | number; className?: string }) => (
    <div className={`card bg-dark text-center ${className}`}>
        <div className="card-body">
            <h6 className="card-subtitle mb-2 text-body-secondary text-uppercase">{label}</h6>
            <p className="card-text display-6 text-light">{value}</p>
        </div>
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
        <div className="card bg-dark text-light w-100" style={{maxWidth: '800px'}}>
            <div className="card-body p-4 p-md-5">
                <h2 className="card-title text-center h1 mb-4 text-info text-glow-cyan">Your Combat Record</h2>

                <div className="text-center mb-4">
                    <UserAvatar avatarKey={currentUser.avatar} className="rounded-circle mb-3" style={{width: '128px', height: '128px'}} />
                    <h3 className="h1 text-info text-glow-cyan">{currentUser.name}</h3>
                </div>
                
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <StatCard label="Total Games" value={totalGames} />
                    </div>
                     <div className="col-md-8">
                        <StatCard label="Win Rate" value={winRate} />
                    </div>
                    <div className="col-6 col-md-4"><StatCard label="Wins" value={currentUser.wins} /></div>
                    <div className="col-6 col-md-4"><StatCard label="Losses" value={currentUser.losses} /></div>
                    <div className="col-12 col-md-4"><StatCard label="Bonuses Earned" value={currentUser.totalBonuses} /></div>
                </div>
                
                <hr className="my-4" />
                
                <div className="card border-danger bg-danger-subtle text-danger-emphasis p-4">
                    <h4 className="h5 text-danger">Danger Zone</h4>
                    <p className="small">
                        Permanently delete your profile and all associated data. This action cannot be undone.
                    </p>
                    <button onClick={handleDelete} className="btn btn-danger mt-2 align-self-center">
                        Delete My Profile
                    </button>
                </div>

                <div className="text-center mt-4">
                    <button onClick={onNavigate} className="btn btn-secondary">
                        Back to Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;
