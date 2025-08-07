
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
  
  const timeColorClass = progress > 0.5 ? 'text-success' : progress > 0.25 ? 'text-warning' : 'text-danger';
  const isUrgent = timeLeft <= 5 && timeLeft > 0;

  return (
    <div 
        className={`position-relative d-flex flex-column align-items-center justify-content-center ${isUrgent ? 'animate-pulse-urgent' : ''}`}
        style={{width: '8rem', height: '8rem'}}
    >
      <svg className="position-absolute w-100 h-100" viewBox="0 0 120 120">
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
          className={timeColorClass}
          style={{transition: 'all 0.5s linear'}}
        />
      </svg>
      <div className="position-relative z-1 d-flex flex-column align-items-center justify-content-center">
        <ClockIcon className={`mb-1 ${timeColorClass}`} style={{width: '1.5rem', height: '1.5rem'}} />
        <span className={`fs-2 fw-bold ${timeColorClass} ${!isUrgent && timeLeft < 10 && timeLeft > 0 ? 'animate-pulse' : ''}`}>
          {timeLeft}
        </span>
      </div>
    </div>
  );
};

export default Timer;