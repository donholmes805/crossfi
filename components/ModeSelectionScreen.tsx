import React, { useState } from 'react';
import { GameMode, Difficulty } from '../types';

interface ModeSelectionScreenProps {
  onModeSelected: (mode: GameMode, difficulty: Difficulty) => void;
  onBack: () => void; // Kept for future flexibility, currently not used
  onViewLeaderboard: () => void;
}

const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({ onModeSelected, onViewLeaderboard }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);

  const handleContinue = () => {
    if (selectedMode !== null) {
      onModeSelected(selectedMode, difficulty);
    }
  };

  return (
    <div className="card bg-dark text-light w-100" style={{maxWidth: '700px'}}>
      <div className="card-body text-center p-4 p-md-5">
        <h2 className="card-title h1 mb-4 text-info text-glow-cyan">Choose Your Battle</h2>
        
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <button
              onClick={() => setSelectedMode(GameMode.PlayerVsPlayer)}
              className={`card card-body text-center h-100 ${selectedMode === GameMode.PlayerVsPlayer ? 'border-primary' : ''}`}
            >
              <h3 className="h4 text-primary">Player vs Player</h3>
              <p className="small text-body-secondary mb-0">Challenge a friend to a duel of wits over the internet.</p>
            </button>
          </div>
          <div className="col-md-6">
            <button
              onClick={() => setSelectedMode(GameMode.PlayerVsComputer)}
               className={`card card-body text-center h-100 ${selectedMode === GameMode.PlayerVsComputer ? 'border-info' : ''}`}
            >
              <h3 className="h4 text-info">Player vs AI</h3>
              <p className="small text-body-secondary mb-0">Hone your skills against an AI-controlled opponent.</p>
            </button>
          </div>
        </div>

        {selectedMode === GameMode.PlayerVsComputer && (
          <div className="mb-4 card bg-darker p-3 animate-fade-in">
            <h3 className="h5 mb-3 text-light">Select Difficulty</h3>
            <div className="btn-group w-100" role="group">
              {(Object.values(Difficulty) as Difficulty[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`btn ${difficulty === d ? 'btn-info' : 'btn-outline-info'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="d-grid gap-2 d-sm-flex justify-content-center">
          <button onClick={onViewLeaderboard} className="btn btn-secondary">Leaderboard</button>
          <button onClick={handleContinue} disabled={selectedMode === null} className="btn btn-primary">Continue</button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectionScreen;
