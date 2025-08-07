import React from 'react';

interface CoinIconProps extends React.SVGProps<SVGSVGElement> {
  isFlipping: boolean;
  result?: 'Heads' | 'Tails' | null;
}

const CoinIcon: React.FC<CoinIconProps> = ({ isFlipping, result, ...props }) => {
  const flipAnimation = {
    animation: isFlipping ? 'flip 2.5s cubic-bezier(0.45, 0, 0.55, 1) forwards' : 'none',
  };
  
  const faceContent = result === 'Heads' ? 'H' : result === 'Tails' ? 'T' : '?';

  return (
    <>
      <style>{`
        @keyframes flip {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(1800deg) scale(1.2); }
          100% { transform: rotateY(3600deg) scale(1); }
        }
      `}</style>
      <svg viewBox="0 0 100 100" {...props} style={flipAnimation}>
        <g>
            <circle cx="50" cy="50" r="48" fill="#fde047" stroke="#ca8a04" strokeWidth="4" />
            {!isFlipping && (
                 <text x="50" y="68" fontSize="60" fill="#854d0e" textAnchor="middle" fontWeight="bold">
                    {faceContent}
                 </text>
            )}
            {isFlipping && (
                <>
                    <circle cx="50" cy="50" r="35" fill="rgba(133, 77, 14, 0.3)" />
                </>
            )}
        </g>
      </svg>
    </>
  );
};

export default CoinIcon;
