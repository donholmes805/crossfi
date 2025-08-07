
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { signup, getUsers, deleteUser, AVATARS } from '../services/authService';
import UserAvatar from './icons/UserAvatar';
import XCircleIcon from './icons/XCircleIcon';

interface CreateViewProps {
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  name: string;
  setName: (name: string) => void;
  selectedAvatar: string;
  setSelectedAvatar: (key: string) => void;
  otherPlayer: User | null;
  hasExistingUsers: boolean;
  onBack: () => void;
}

const CreateView: React.FC<CreateViewProps> = ({
  onSubmit, error, name, setName, selectedAvatar, setSelectedAvatar, otherPlayer, hasExistingUsers, onBack
}) => (
  <form onSubmit={onSubmit} className="flex flex-col items-center">
    <h2 className="text-2xl text-cyan-400 text-glow-cyan mb-6">Create New Profile</h2>
    
    <UserAvatar avatarKey={selectedAvatar} className="w-32 h-32 rounded-lg mb-4 border-2 border-cyan-500/50" />

    {error && <p className="bg-red-900/50 border border-red-700 text-red-300 p-2 rounded-md mb-4 text-sm w-full text-center">{error}</p>}

    <div className="mb-4 w-full max-w-sm">
      <label htmlFor="name-auth" className="block text-gray-400 text-sm font-bold mb-2 text-left">Player Name</label>
      <input
        type="text"
        id="name-auth"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="form-input w-full"
        placeholder="Enter your unique name"
        required
      />
    </div>
    <div className="mb-6 w-full max-w-sm">
      <p className="block text-gray-400 text-sm font-bold mb-2 text-left">Choose Your Avatar</p>
      <div role="radiogroup" className="grid grid-cols-4 gap-2 bg-black/20 p-2 rounded-md">
        {Object.entries(AVATARS).map(([key, avatarName]) => {
          const isTaken = key === otherPlayer?.avatar;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selectedAvatar === key}
              onClick={() => !isTaken && setSelectedAvatar(key)}
              disabled={isTaken}
              className={`p-1 rounded-md transition-all border-2 ${selectedAvatar === key ? 'border-cyan-400 ring-2 ring-cyan-400' : 'border-gray-700'} ${isTaken ? 'opacity-30 cursor-not-allowed' : 'hover:border-cyan-400'}`}
              aria-label={avatarName}
            >
              <UserAvatar avatarKey={key} className="w-full h-full rounded-sm" />
            </button>
          )
        })}
      </div>
    </div>
    <div className="flex items-center w-full max-w-sm">
      {hasExistingUsers &&
        <button type="button" onClick={onBack} className="text-sm text-blue-400 hover:underline mr-auto">
          &larr; Back to Select
        </button>
      }
      <button type="submit" className="btn btn-primary ml-auto" disabled={!name.trim()}>
        Create & Join
      </button>
    </div>
  </form>
);


interface SelectViewProps {
  users: User[];
  otherPlayer: User | null;
  onSelectUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onCreateNew: () => void;
}

const SelectView: React.FC<SelectViewProps> = ({
  users, otherPlayer, onSelectUser, onDeleteUser, onCreateNew
}) => (
  <div className="flex flex-col items-center">
    <h2 className="text-2xl text-cyan-400 text-glow-cyan mb-6">Select Your Profile</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[20rem] overflow-y-auto pr-2 mb-6 w-full">
      {users.map(user => {
        const isTaken = user.id === otherPlayer?.id;
        return (
          <div key={user.id} className="relative group">
            <button
              onClick={() => onSelectUser(user)}
              disabled={isTaken}
              className="panel p-3 flex items-center gap-3 w-full text-left hover:border-blue-500 hover:bg-gray-700/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <UserAvatar avatarKey={user.avatar} className="w-14 h-14 rounded-md flex-shrink-0" />
              <div className="overflow-hidden">
                <span className="font-bold text-md text-gray-200 truncate w-full block group-hover:text-white">{user.name}</span>
                <p className="text-sm text-gray-400">
                  <span className="font-semibold text-green-400">W:</span> {user.wins} | <span className="font-semibold text-red-400">L:</span> {user.losses}
                </p>
                <p className="text-xs text-gray-500">Bonuses: {user.totalBonuses}</p>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteUser(user.id);
              }}
              className="absolute -top-2 -right-2 p-0 bg-gray-800 rounded-full text-gray-400 hover:bg-red-600 hover:text-white scale-90 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              title={`Delete profile ${user.name}`}
              aria-label={`Delete profile ${user.name}`}
            >
              <XCircleIcon className="w-7 h-7" />
            </button>
          </div>
        );
      })}
    </div>
    <div className="border-t border-gray-700 pt-4 flex flex-col items-center gap-4">
      <p className="text-gray-400">
        {users.length > 0 ? 'Or create a new one:' : 'Create a profile to get started:'}
      </p>
      <button onClick={onCreateNew} className="btn btn-secondary">
        Create New Profile
      </button>
    </div>
  </div>
);


interface AuthModalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
  otherPlayer: User | null;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose, otherPlayer }) => {
  const [view, setView] = useState<'select' | 'create'>('select');
  const [existingUsers, setExistingUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(
    Object.keys(AVATARS).find(key => key !== otherPlayer?.avatar) || Object.keys(AVATARS)[0]
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const users = getUsers();
    setExistingUsers(users);
    if (users.length === 0) {
      setView('create');
    }
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim()) {
      const result = signup(name.trim(), selectedAvatar);
      if (result.user) {
        onLogin(result.user);
      } else {
        setError(result.error ?? 'An unknown error occurred.');
      }
    }
  };

  const handleDeleteUser = (userIdToDelete: string) => {
    if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
        deleteUser(userIdToDelete);
        const updatedUsers = getUsers();
        setExistingUsers(updatedUsers);
        if (updatedUsers.length === 0) {
            setView('create');
        }
    }
  };

  return (
    <div className="modal-backdrop" aria-modal="true" role="dialog">
      <div className="panel p-8 w-full max-w-2xl m-4 animate-fade-in">
        {view === 'select' ? 
          <SelectView 
            users={existingUsers}
            otherPlayer={otherPlayer}
            onSelectUser={onLogin}
            onDeleteUser={handleDeleteUser}
            onCreateNew={() => { setView('create'); setError(null); }}
          /> 
          : 
          <CreateView 
            onSubmit={handleSignup}
            error={error}
            name={name}
            setName={setName}
            selectedAvatar={selectedAvatar}
            setSelectedAvatar={setSelectedAvatar}
            otherPlayer={otherPlayer}
            hasExistingUsers={existingUsers.length > 0}
            onBack={() => { setView('select'); setError(null); }}
          />
        }
      </div>
    </div>
  );
};

export default AuthModal;