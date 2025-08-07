import React, { useState, useRef, useEffect } from 'react';
import { User, GameState } from '../types';
import UserAvatar from './icons/UserAvatar';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface ProfileWidgetProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (state: GameState) => void;
}

const ProfileWidget: React.FC<ProfileWidgetProps> = ({ currentUser, onLogout, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  if (!currentUser) {
    return null;
  }

  return (
    <div ref={wrapperRef} className="absolute top-4 right-4 z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
      >
        <UserAvatar avatarKey={currentUser.avatar} className="w-10 h-10 rounded-md" />
        <span className="hidden sm:inline font-semibold text-gray-200">{currentUser.name}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 animate-fade-in">
          <button
            onClick={() => {
              onNavigate(GameState.Profile);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-slate-700"
          >
            View Profile
          </button>
          <div className="border-t border-gray-700 my-1"></div>
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileWidget;