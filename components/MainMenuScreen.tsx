import React from 'react';
import { GameState, User } from '../types';

interface MainMenuScreenProps {
  onNavigate: (state: GameState) => void;
  currentUser: User;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onNavigate, currentUser }) => {
  return (
    <div className="w-full max-w-md text-center bg-gray-900/70 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-200">Welcome, <span className="text-blue-400">{currentUser.name}</span>!</h2>
      <div className="flex flex-col gap-4">
            <button
              onClick={() => onNavigate(GameState.ModeSelection)}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
              Play Game
          </button>
            <button
              onClick={() => onNavigate(GameState.Leaderboard)}
              className="w-full px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
              Leaderboard
          </button>
      </div>
    </div>
  );
};

export default MainMenuScreen;