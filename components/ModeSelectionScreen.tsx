import React, { useState } from 'react';
import { GameMode, Difficulty } from '../types';

interface ModeSelectionScreenProps {
  onModeSelected: (mode: GameMode, difficulty: Difficulty) => void;
  onBack: () => void;
}

const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({ onModeSelected, onBack }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);

  const handleContinue = () => {
    if (selectedMode !== null) {
      onModeSelected(selectedMode, difficulty);
    }
  };

  return (
    <div className="w-full max-w-2xl text-center bg-gray-900/70 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold mb-6 text-gray-100">Choose Your Battle</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setSelectedMode(GameMode.PlayerVsPlayer)}
          className={`p-6 rounded-lg border-2 transition-all duration-300 ${selectedMode === GameMode.PlayerVsPlayer ? 'bg-blue-900/50 border-blue-500' : 'bg-gray-800/50 border-gray-700 hover:border-blue-600'}`}
        >
          <h3 className="text-2xl font-bold text-blue-400">Player vs Player</h3>
          <p className="text-gray-400 mt-2">Challenge another human combatant in a duel of wits.</p>
        </button>
        <button
          onClick={() => setSelectedMode(GameMode.PlayerVsComputer)}
          className={`p-6 rounded-lg border-2 transition-all duration-300 ${selectedMode === GameMode.PlayerVsComputer ? 'bg-purple-900/50 border-purple-500' : 'bg-gray-800/50 border-gray-700 hover:border-purple-600'}`}
        >
          <h3 className="text-2xl font-bold text-purple-400">Player vs Computer</h3>
          <p className="text-gray-400 mt-2">Hone your skills against an AI-controlled opponent.</p>
        </button>
      </div>

      {selectedMode === GameMode.PlayerVsComputer && (
        <div className="mb-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700 animate-fade-in">
          <h3 className="text-xl font-bold mb-4 text-gray-200">Select Difficulty</h3>
          <div className="flex justify-center gap-4">
            {(Object.values(Difficulty) as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-6 py-2 rounded-lg font-semibold capitalize transition-colors ${difficulty === d ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all duration-300"
        >
          Back to Menu
        </button>
        <button
          onClick={handleContinue}
          disabled={selectedMode === null}
          className="w-full max-w-sm px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ModeSelectionScreen;
