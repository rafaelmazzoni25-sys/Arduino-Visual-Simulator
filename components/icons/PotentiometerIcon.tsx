import React from 'react';

interface PotentiometerIconProps extends React.SVGProps<SVGSVGElement> {
  value?: number; // 0-1023
}

export const PotentiometerIcon: React.FC<PotentiometerIconProps> = ({ value = 512, className, ...props }) => {
  const rotation = ((value / 1023) * 270) - 135;

  return (
    <svg 
      viewBox="0 0 50 50" 
      className={className} 
      {...props}
    >
      {/* Base */}
      <circle cx="25" cy="25" r="15" fill="#71717a" stroke="#a1a1aa" strokeWidth="2" />
      <circle cx="25" cy="25" r="12" fill="#3f3f46" />

      {/* Knob Indicator */}
      <g transform={`rotate(${rotation} 25 25)`}>
        <line x1="25" y1="25" x2="25" y2="15" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Pins */}
      <path d="M15 40 v5" stroke="#a1a1aa" strokeWidth="2" />
      <path d="M25 40 v5" stroke="#a1a1aa" strokeWidth="2" />
      <path d="M35 40 v5" stroke="#a1a1aa" strokeWidth="2" />
    </svg>
  );
};
