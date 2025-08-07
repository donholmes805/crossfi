import React from 'react';

const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.042m-7.332 0c-.055.194-.084.4-.084.612v3.042m0 0a2.25 2.25 0 002.25 2.25h3a2.25 2.25 0 002.25-2.25V6.75m-7.5 0V6.75m0 0H4.5m1.5.75H3a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003 21h18a2.25 2.25 0 002.25-2.25V9.75A2.25 2.25 0 0019.5 7.5h-1.5m-7.5 0h7.5"
    />
  </svg>
);

export default ClipboardIcon;
