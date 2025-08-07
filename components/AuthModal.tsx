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
  onClose: () => void;
}

const CreateView: React.FC<CreateViewProps> = ({
  onSubmit, error, name, setName, selectedAvatar, setSelectedAvatar, otherPlayer, hasExistingUsers, onBack, onClose
}) => (
  <form onSubmit={onSubmit}>
    <h2 className="text-2xl font-bold text-gray-100 mb-4">Create New Profile</h2>
    {error && <p className="text-red-400 bg-red-900/50 p-2 rounded-md mb-4 text-sm">{error}</p>}
    <div className="mb-4">
      <label htmlFor="name-auth" className="block text-gray-400 text-sm font-bold mb-2">Player Name</label>
      <input
        type="text"
        id="name-auth"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your unique name"
        required
      />
    </div>
    <div className="mb-6">
      <p className="block text-gray-400 text-sm font-bold mb-2">Choose Your Avatar</p>
      <div role="radiogroup" className="grid grid-cols-4 gap-4">
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
              className={`p-2 rounded-lg transition-all border-2 ${selectedAvatar === key ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'} ${isTaken ? 'opacity-30 cursor-not-allowed' : 'hover:border-blue-500'}`}
              aria-label={avatarName}
            >
              <UserAvatar avatarKey={key} className="w-full h-full rounded-md" />
            </button>
          )
        })}
      </div>
    </div>
    <div className="flex justify-between items-center">
      {hasExistingUsers &&
        <button type="button" onClick={onBack} className="text-sm text-blue-400 hover:underline">
          &larr; Back to Select Profile
        </button>
      }
      <div className={`flex justify-end gap-4 ${hasExistingUsers ? '' : 'w-full'}`}>
        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">Cancel</button>
        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50" disabled={!name.trim()}>
          Create & Join
        </button>
      </div>
    </div>
  </form>
);


interface SelectViewProps {
  users: User[];
  otherPlayer: User | null;
  onSelectUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onCreateNew: () => void;
  onClose: () => void;
}

const SelectView: React.FC<SelectViewProps> = ({
  users, otherPlayer, onSelectUser, onDeleteUser, onCreateNew, onClose
}) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-100 mb-6">Select Your Profile</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[20rem] overflow-y-auto pr-2 mb-6">
      {users.map(user => {
        const isTaken = user.id === otherPlayer?.id;
        return (
          <div key={user.id} className="relative group">
            <button
              onClick={() => onSelectUser(user)}
              disabled={isTaken}
              className="p-3 bg-gray-800/80 rounded-lg flex items-center gap-3 w-full text-left border-2 border-gray-700 hover:border-blue-500 hover:bg-gray-700/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
      <button onClick={onCreateNew} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
        Create New Profile
      </button>
    </div>
    <div className="flex justify-end mt-6">
      <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">Cancel</button>
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 w-full max-w-2xl m-4">
        {view === 'select' ? 
          <SelectView 
            users={existingUsers}
            otherPlayer={otherPlayer}
            onSelectUser={onLogin}
            onDeleteUser={handleDeleteUser}
            onCreateNew={() => { setView('create'); setError(null); }}
            onClose={onClose}
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
            onClose={onClose}
          />
        }
      </div>
    </div>
  );
};

export default AuthModal;
