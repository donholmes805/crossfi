
import React from 'react';
import ClockIcon from '../icons/ClockIcon';

interface TimerProps {
  timeLeft: number;
  turnDuration: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, turnDuration }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / turnDuration;
  const strokeDashoffset = circumference * (1 - progress);
  
  const timeColorClass = progress > 0.5 ? 'text-green-500' : progress > 0.25 ? 'text-yellow-500' : 'text-red-500';
  const isUrgent = timeLeft <= 5 && timeLeft > 0;

  return (
    <div className={`relative w-32 h-32 flex flex-col items-center justify-center ${isUrgent ? 'animate-pulse-urgent' : ''}`}>
      <svg className="absolute w-full h-full" viewBox="0 0 120 120">
        {/* Background Circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="8"
        />
        {/* Progress Circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          className={`transition-all duration-500 ease-linear ${timeColorClass}`}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center">
        <ClockIcon className={`w-6 h-6 mb-1 ${timeColorClass}`} />
        <span className={`text-3xl font-bold ${timeColorClass} ${!isUrgent && timeLeft < 10 && timeLeft > 0 ? 'animate-pulse' : ''}`}>
          {timeLeft}
        </span>
      </div>
    </div>
  );
};

export default Timer;