import React from 'react';
import { User, GameState } from '../types';
import UserAvatar from './icons/UserAvatar';

interface ProfileWidgetProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (state: GameState) => void;
}

const ProfileWidget: React.FC<ProfileWidgetProps> = ({ currentUser, onLogout, onNavigate }) => {
  if (!currentUser) return null;

  return (
    <div className="dropdown position-absolute top-0 end-0 m-3 z-3">
      <button
        className="btn btn-dark d-flex align-items-center"
        type="button"
        id="profileDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <UserAvatar avatarKey={currentUser.avatar} className="rounded me-2" style={{ width: '40px', height: '40px' }}/>
        <span className="d-none d-sm-inline fw-semibold">{currentUser.name}</span>
      </button>
      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
        <li>
          <button
            onClick={() => onNavigate(GameState.Profile)}
            className="dropdown-item"
          >
            View Profile
          </button>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button
            onClick={onLogout}
            className="dropdown-item text-danger"
          >
            Sign Out
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ProfileWidget;
