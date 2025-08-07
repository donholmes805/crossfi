
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
  <form onSubmit={onSubmit} className="flex flex-col items-center">
    <h2 className="text-2xl text-cyan-400 text-glow-cyan mb-6">Create New Profile</h2>
    
    <UserAvatar avatarKey={selectedAvatar} className="w-32 h-32 rounded-lg mb-4 border-2 border-cyan-500/50" />

    {error && <p className="bg-red-900/50 border border-red-700 text-red-300 p-2 rounded-md mb-4 text-sm w-full text-center">{error}</p>}

    <div className="mb-4 w-full max-w-sm">
      <label htmlFor="name-login" className="block text-gray-400 text-sm font-bold mb-2 text-left">Player Name</label>
      <input
        type="text"
        id="name-login"
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
        {Object.entries(AVATARS).map(([key, avatarName]) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selectedAvatar === key}
            onClick={() => setSelectedAvatar(key)}
            className={`p-1 rounded-md transition-all border-2 ${selectedAvatar === key ? 'border-cyan-400 ring-2 ring-cyan-400' : 'border-gray-700 hover:border-cyan-400'}`}
            aria-label={avatarName}
          >
            <UserAvatar avatarKey={key} className="w-full h-full rounded-sm" />
          </button>
        ))}
      </div>
    </div>
    <div className="flex items-center w-full max-w-sm">
      {hasExistingUsers && (
        <button type="button" onClick={onBack} className="text-sm text-blue-400 hover:underline mr-auto">
          &larr; Back to Sign In
        </button>
      )}
      <button type="submit" className="btn btn-primary ml-auto" disabled={!name.trim()}>
        Create & Sign In
      </button>
    </div>
  </form>
);

interface SelectViewProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onCreateNew: () => void;
}

const SelectView: React.FC<SelectViewProps> = ({ users, onSelectUser, onCreateNew }) => (
  <div className="flex flex-col items-center">
    <h2 className="text-2xl text-cyan-400 text-glow-cyan mb-6">Sign In</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[20rem] overflow-y-auto pr-2 mb-6 w-full">
      {users.map(user => (
        <button
          key={user.id}
          onClick={() => onSelectUser(user)}
          className="panel p-3 flex items-center gap-3 w-full text-left hover:border-blue-500 hover:bg-gray-700/80 transition-all group"
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
      <button onClick={onCreateNew} className="btn btn-secondary">
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
    <div className="modal-backdrop" aria-modal="true" role="dialog">
      <div className="panel p-8 w-full max-w-2xl m-4 animate-fade-in">
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