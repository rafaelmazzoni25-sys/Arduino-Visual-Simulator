import React from 'react';

interface LedIconProps extends React.SVGProps<SVGSVGElement> {
  isOn: boolean;
}

export const LedIcon: React.FC<LedIconProps> = ({ isOn, className, ...props }) => {
  const color = isOn ? '#65a30d' : '#3f3f46'; // lime-600 or zinc-700
  const glowColor = isOn ? '#a3e635' : 'transparent'; // lime-400

  return (
    <svg 
      viewBox="0 0 50 50" 
      className={className} 
      {...props}
    >
      {isOn && (
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      {/* Base */}
      <path d="M22 45 h6 v-5 h-6 z" fill="#71717a" /> 
      <path d="M18 40 h14 v-5 h-14 z" fill="#a1a1aa" /> 
      {/* Pins */}
      <path d="M20 50 v-10" stroke="#a1a1aa" strokeWidth="2" />
      <path d="M30 50 v-10" stroke="#a1a1aa" strokeWidth="2" />
      {/* Polarity Indicators */}
      <text x="16" y="48" fontSize="8" fill="#a1a1aa" textAnchor="middle">+</text>
      <text x="34" y="48" fontSize="8" fill="#a1a1aa" textAnchor="middle">-</text>
      {/* LED Bulb */}
      <path
        d="M 15,35 C 15,25 35,25 35,35 L 35,40 L 15,40 Z"
        fill={color}
        stroke={glowColor}
        strokeWidth="1"
        style={{ transition: 'fill 0.2s ease-in-out', filter: isOn ? 'url(#glow)' : 'none' }}
      />
      <path
        d="M 15,35 C 15,25 35,25 35,35"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
      />
    </svg>
  );
};
