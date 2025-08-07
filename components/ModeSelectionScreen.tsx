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
    <div className="panel w-full max-w-2xl text-center p-8">
      <h2 className="text-3xl mb-6 text-gray-100 text-glow-cyan">Choose Your Battle</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setSelectedMode(GameMode.PlayerVsPlayer)}
          className={`p-6 rounded-lg border-2 transition-all duration-300 transform hover:-translate-y-1 ${selectedMode === GameMode.PlayerVsPlayer ? 'bg-blue-900/50 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-black/20 border-gray-700 hover:border-blue-600'}`}
        >
          <h3 className="text-2xl text-glow-blue" style={{color: 'var(--color-blue)'}}>Player vs Player</h3>
          <p className="text-gray-400 mt-2 text-sm">Challenge another human combatant in a duel of wits.</p>
        </button>
        <button
          onClick={() => setSelectedMode(GameMode.PlayerVsComputer)}
          className={`p-6 rounded-lg border-2 transition-all duration-300 transform hover:-translate-y-1 ${selectedMode === GameMode.PlayerVsComputer ? 'bg-purple-900/50 border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-black/20 border-gray-700 hover:border-purple-600'}`}
        >
          <h3 className="text-2xl text-glow-purple" style={{color: 'var(--color-purple)'}}>Player vs AI</h3>
          <p className="text-gray-400 mt-2 text-sm">Hone your skills against an AI-controlled opponent.</p>
        </button>
      </div>

      {selectedMode === GameMode.PlayerVsComputer && (
        <div className="mb-8 p-6 bg-black/20 rounded-lg border border-gray-700 animate-fade-in">
          <h3 className="text-xl mb-4 text-gray-200">Select Difficulty</h3>
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
          className="btn btn-secondary"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={selectedMode === null}
          className="btn btn-primary w-full max-w-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ModeSelectionScreen;