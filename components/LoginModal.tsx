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

const CreateView: React.FC<CreateViewProps> = ({ onSubmit, error, name, setName, selectedAvatar, setSelectedAvatar, hasExistingUsers, onBack }) => (
  <form onSubmit={onSubmit} className="d-flex flex-column align-items-center">
    <h2 className="h3 text-info text-glow-cyan mb-4">Create New Profile</h2>
    <UserAvatar avatarKey={selectedAvatar} className="rounded mb-3 border border-info" style={{ width: '128px', height: '128px' }} />
    {error && <div className="alert alert-danger w-100">{error}</div>}
    <div className="mb-3 w-100" style={{ maxWidth: '320px' }}>
      <label htmlFor="name-login" className="form-label">Player Name</label>
      <input type="text" id="name-login" value={name} onChange={(e) => setName(e.target.value)} className="form-control" placeholder="Enter your unique name" required />
    </div>
    <div className="mb-4 w-100" style={{ maxWidth: '320px' }}>
      <p className="form-label">Choose Your Avatar</p>
      <div className="d-flex justify-content-center gap-2 bg-dark p-2 rounded">
        {Object.entries(AVATARS).map(([key, avatarName]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedAvatar(key)}
            className={`btn p-1 ${selectedAvatar === key ? 'btn-info' : 'btn-outline-secondary'}`}
            aria-label={avatarName}
          >
            <UserAvatar avatarKey={key} className="rounded-sm" style={{ width: '48px', height: '48px' }}/>
          </button>
        ))}
      </div>
    </div>
    <div className="d-flex align-items-center w-100" style={{ maxWidth: '320px' }}>
      {hasExistingUsers && (
        <button type="button" onClick={onBack} className="btn btn-link text-decoration-none p-0 me-auto">
          &larr; Back to Sign In
        </button>
      )}
      <button type="submit" className="btn btn-primary ms-auto" disabled={!name.trim()}>
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
  <div className="d-flex flex-column align-items-center">
    <h2 className="h3 text-info text-glow-cyan mb-4">Sign In</h2>
    <div className="w-100 mb-4" style={{ maxHeight: '20rem', overflowY: 'auto' }}>
      <div className="list-group">
        {users.map(user => (
          <button key={user.id} onClick={() => onSelectUser(user)} className="list-group-item list-group-item-action d-flex align-items-center gap-3">
            <UserAvatar avatarKey={user.avatar} className="rounded flex-shrink-0" style={{ width: '56px', height: '56px' }} />
            <div className="flex-grow-1 overflow-hidden">
              <strong className="d-block text-truncate">{user.name}</strong>
              <small className="text-body-secondary">W: {user.wins} | L: {user.losses}</small>
            </div>
          </button>
        ))}
      </div>
    </div>
    <div className="border-top border-secondary pt-3 mt-2 d-flex flex-column align-items-center gap-2">
      <p className="text-body-secondary">Don't have a profile?</p>
      <button onClick={onCreateNew} className="btn btn-secondary">
        Create New Profile
      </button>
    </div>
  </div>
);

interface LoginModalProps {
  onLogin: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [view, setView] = useState('login');
  const [existingUsers, setExistingUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(Object.keys(AVATARS)[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const users = getUsers();
    setExistingUsers(users);
    if (users.length === 0) setView('signup');
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim()) {
      const result = signup(name.trim(), selectedAvatar);
      if (result.user) onLogin(result.user);
      else setError(result.error ?? 'An unknown error occurred.');
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body p-4">
            {view === 'login' ?
              <SelectView users={existingUsers} onSelectUser={onLogin} onCreateNew={() => { setView('signup'); setError(null); }} />
              :
              <CreateView onSubmit={handleSignup} error={error} name={name} setName={setName} selectedAvatar={selectedAvatar} setSelectedAvatar={setSelectedAvatar} hasExistingUsers={existingUsers.length > 0} onBack={() => { setView('login'); setError(null); }} />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
