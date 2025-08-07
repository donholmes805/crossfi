import React from 'react';

const CONFETTI_COUNT = 100;
const COLORS = ['#fde047', '#ff7b54', '#4b7bec', '#34d399', '#a78bfa'];

const Confetti: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
            opacity: 0,
            animationName: 'fall',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDuration: `${Math.random() * 3 + 4}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
