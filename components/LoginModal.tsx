
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { signup, getUsers, AVATARS } from '../services/authService';
import UserAvatar from './icons/UserAvatar';

interface CreateViewProps {
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  name: string;
  setName: (name: string) => void;
  selectedAvatar: string;
  setSelectedAvatar: (key: string) => void;
  hasExistingUsers: boolean;
  onBack: () => void;
}

const CreateView: React.FC<CreateViewProps> = ({
  onSubmit, error, name, setName, selectedAvatar, setSelectedAvatar, hasExistingUsers, onBack
}) => (
  <form onSubmit={onSubmit}>
    <h2 className="text-2xl font-bold text-gray-100 mb-4">Create New Profile</h2>
    {error && <p className="text-red-400 bg-red-900/50 p-2 rounded-md mb-4 text-sm">{error}</p>}
    <div className="mb-4">
      <label htmlFor="name-login" className="block text-gray-400 text-sm font-bold mb-2">Player Name</label>
      <input
        type="text"
        id="name-login"
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
        {Object.entries(AVATARS).map(([key, avatarName]) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selectedAvatar === key}
            onClick={() => setSelectedAvatar(key)}
            className={`p-2 rounded-lg transition-all border-2 ${selectedAvatar === key ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700 hover:border-blue-500'}`}
            aria-label={avatarName}
          >
            <UserAvatar avatarKey={key} className="w-full h-full rounded-md" />
          </button>
        ))}
      </div>
    </div>
    <div className="flex items-center">
      {hasExistingUsers && (
        <button type="button" onClick={onBack} className="text-sm text-blue-400 hover:underline mr-auto">
          &larr; Back to Sign In
        </button>
      )}
      <div className={`flex justify-end gap-4 ${!hasExistingUsers ? 'w-full' : ''}`}>
        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50" disabled={!name.trim()}>
          Create & Sign In
        </button>
      </div>
    </div>
  </form>
);

interface SelectViewProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onCreateNew: () => void;
}

const SelectView: React.FC<SelectViewProps> = ({ users, onSelectUser, onCreateNew }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-100 mb-6">Sign In</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[20rem] overflow-y-auto pr-2 mb-6">
      {users.map(user => (
        <button
          key={user.id}
          onClick={() => onSelectUser(user)}
          className="p-3 bg-gray-800/80 rounded-lg flex items-center gap-3 w-full text-left border-2 border-gray-700 hover:border-blue-500 hover:bg-gray-700/80 transition-all group"
        >
          <UserAvatar avatarKey={user.avatar} className="w-14 h-14 rounded-md flex-shrink-0" />
          <div className="overflow-hidden">
            <span className="font-bold text-md text-gray-200 truncate w-full block group-hover:text-white">{user.name}</span>
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-green-400">W:</span> {user.wins} | <span className="font-semibold text-red-400">L:</span> {user.losses}
            </p>
          </div>
        </button>
      ))}
    </div>
    <div className="border-t border-gray-700 pt-4 flex flex-col items-center gap-4">
      <p className="text-gray-400">Don't have a profile?</p>
      <button onClick={onCreateNew} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
        Create New Profile
      </button>
    </div>
  </div>
);


interface LoginModalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
  initialView: 'login' | 'signup';
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose, initialView }) => {
  const [view, setView] = useState(initialView);
  const [existingUsers, setExistingUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(Object.keys(AVATARS)[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const users = getUsers();
    setExistingUsers(users);
    if (users.length === 0 && initialView === 'login') {
      setView('signup');
    }
  }, [initialView]);

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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 w-full max-w-2xl m-4 animate-fade-in">
        {view === 'login' ?
          <SelectView
            users={existingUsers}
            onSelectUser={onLogin}
            onCreateNew={() => { setView('signup'); setError(null); }}
          />
          :
          <CreateView
            onSubmit={handleSignup}
            error={error}
            name={name}
            setName={setName}
            selectedAvatar={selectedAvatar}
            setSelectedAvatar={setSelectedAvatar}
            hasExistingUsers={existingUsers.length > 0}
            onBack={() => { setView('login'); setError(null); }}
          />
        }
      </div>
    </div>
  );
};

export default LoginModal;
