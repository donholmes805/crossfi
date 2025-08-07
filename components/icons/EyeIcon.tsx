import React from 'react';

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.436-7.854a1.012 1.012 0 011.59-.442L10.5 8.236a1.012 1.012 0 010 1.528l-2.436 4.318a1.012 1.012 0 01-1.589.442l-4.437-7.854zM12 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.964 12.322a1.012 1.012 0 000-.639l-4.436-7.854a1.012 1.012 0 00-1.59-.442L13.5 8.236a1.012 1.012 0 000 1.528l2.436 4.318a1.012 1.012 0 001.59.442l4.436-7.854z" />
  </svg>
);

export default EyeIcon;