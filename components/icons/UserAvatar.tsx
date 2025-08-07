import React from 'react';

// FPS-style avatars
const SgtStealth: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="sgtHelmet" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#2c3e50" />
        <stop offset="100%" stopColor="#1a2531" />
      </linearGradient>
      <radialGradient id="sgtLensGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="60%" stopColor="#34d399" stopOpacity="1" />
        <stop offset="100%" stopColor="#059669" stopOpacity="1" />
      </radialGradient>
    </defs>
    <rect width="100" height="100" rx="15" fill="#111827" />
    <g transform="translate(0, 5)">
      <path d="M50 20 L85 45 V 80 H 15 V 45 Z" fill="url(#sgtHelmet)" stroke="#4a5a6a" strokeWidth="1.5"/>
      <path d="M50 20 L20 48 H 80 Z" fill="#1f2937" />
      <path d="M25 60 H 75 V 75 H 25 Z" fill="#1f2937" />
      <path d="M18 80 H 82" stroke="#4a5a6a" strokeWidth="2" strokeLinecap="round" />
      {/* Goggles */}
      <g transform="translate(0, 5)">
        <path d="M20 55 H 80 L 75 70 H 25 Z" fill="#111827"/>
        <circle cx="35" cy="62" r="8" fill="url(#sgtLensGlow)" />
        <circle cx="50" cy="62" r="8" fill="url(#sgtLensGlow)" />
        <circle cx="65" cy="62" r="8" fill="url(#sgtLensGlow)" />
        <circle cx="35" cy="62" r="4" fill="rgba(255,255,255,0.7)" />
        <circle cx="50" cy="62" r="4" fill="rgba(255,255,255,0.7)" />
        <circle cx="65" cy="62" r="4" fill="rgba(255,255,255,0.7)" />
      </g>
    </g>
  </svg>
);
const Pyro: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="pyroMask" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#6b7280" />
        <stop offset="100%" stopColor="#4b5563" />
      </linearGradient>
      <radialGradient id="pyroVisorReflection" cx="0.3" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>
    <rect width="100" height="100" rx="15" fill="#991b1b" />
    <g>
      <path d="M50 15 A 40 40 0 0 1 90 55 V 90 H 10 V 55 A 40 40 0 0 1 50 15 Z" fill="url(#pyroMask)" stroke="#374151" strokeWidth="1.5" />
      <circle cx="50" cy="60" r="30" fill="#111827" />
      <circle cx="50" cy="60" r="30" fill="url(#pyroVisorReflection)" />
      {/* Filter */}
      <circle cx="50" cy="85" r="15" fill="#374151" />
      <circle cx="50" cy="85" r="12" fill="#1f2937" />
      <g stroke="#6b7280" strokeWidth="2">
        <line x1="50" y1="75" x2="50" y2="95" />
        <line x1="40" y1="85" x2="60" y2="85" />
        <line x1="43" y1="78" x2="57" y2="92" />
        <line x1="43" y1="92" x2="57" y2="78" />
      </g>
      {/* Hoses */}
      <path d="M25 75 Q 10 85, 20 95" fill="none" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
      <path d="M75 75 Q 90 85, 80 95" fill="none" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
    </g>
  </svg>
);
const Deadeye: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="deadeyeMask" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#e5e7eb" />
        <stop offset="100%" stopColor="#9ca3af" />
      </linearGradient>
      <radialGradient id="deadeyeOpticGlow">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="50%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </radialGradient>
    </defs>
    <rect width="100" height="100" rx="15" fill="#4b5563" />
    <g>
      <path d="M50 15 C 20 25, 20 70, 25 85 H 75 C 80 70, 80 25, 50 15 Z" fill="url(#deadeyeMask)" />
      <path d="M50 35 C 40 40, 60 40, 50 35 L 45 80 H 55 L 50 35 Z" fill="#d1d5db" opacity="0.5" />
      {/* Mouth part */}
      <path d="M35 70 C 40 80, 60 80, 65 70 L 60 85 H 40 Z" fill="#4b5563" />
      <g stroke="#9ca3af" strokeWidth="1.5" fill="none">
        <path d="M42 75 H 58" />
        <path d="M44 80 H 56" />
      </g>
      {/* Optic */}
      <circle cx="50" cy="50" r="20" fill="#111827" />
      <circle cx="50" cy="50" r="15" fill="url(#deadeyeOpticGlow)" />
      <circle cx="50" cy="50" r="7" fill="#dc2626" />
      <circle cx="50" cy="50" r="3" fill="#fca5a5" />
    </g>
  </svg>
);
const Boomer: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="boomerHelmet" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#4d7c0f" />
          <stop offset="100%" stopColor="#1a2e05" />
        </linearGradient>
        <linearGradient id="boomerVisor" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <radialGradient id="visorShine" cx="0.7" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" rx="15" fill="#1c1917" />
      <g>
        <path d="M10 40 C 10 20, 90 20, 90 40 V 85 H 10 Z" fill="url(#boomerHelmet)" stroke="#65a30d" strokeWidth="1.5"/>
        <path d="M20 30 H 80 V 50 H 20 Z" fill="#1a2e05" />
        {/* Blast Shield */}
        <rect x="25" y="45" width="50" height="25" rx="5" fill="url(#boomerVisor)" />
        <rect x="25" y="45" width="50" height="25" rx="5" fill="url(#visorShine)" />
        <rect x="20" y="42" width="60" height="31" rx="8" fill="none" stroke="#1c1917" strokeWidth="4" />
        {/* Chin Guard */}
        <path d="M25 80 h 50 v 10 q -25 10, -50 0 Z" fill="#365314" />
        {/* Ear Pieces */}
        <circle cx="15" cy="65" r="10" fill="#365314" />
        <circle cx="85" cy="65" r="10" fill="#365314" />
        <circle cx="15" cy="65" r="5" fill="#1a2e05" />
        <circle cx="85" cy="65" r="5" fill="#1a2e05" />
      </g>
  </svg>
);


const AvatarComponents: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  'sgt_stealth': SgtStealth,
  'pyro': Pyro,
  'deadeye': Deadeye,
  'boomer': Boomer,
};

interface UserAvatarProps extends React.SVGProps<SVGSVGElement> {
  avatarKey: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarKey, ...props }) => {
  const AvatarComponent = AvatarComponents[avatarKey] || SgtStealth; // Default if key is invalid
  return <AvatarComponent {...props} />;
};

export default UserAvatar;