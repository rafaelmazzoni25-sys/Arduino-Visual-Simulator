import React from 'react';

interface PotentiometerIconProps extends React.SVGProps<SVGSVGElement> {
  value?: number; // 0-1023
}

export const PotentiometerIcon: React.FC<PotentiometerIconProps> = ({ value = 512, className, ...props }) => {
  // Map value from 0-1023 to a rotation angle from -135 to 135 degrees
  const rotation = ((value / 1023) * 270) - 135;

  return (
    <svg 
      viewBox="0 0 50 60" 
      className={className} 
      {...props}
    >
      {/* Base */}
      <rect x="5" y="5" width="40" height="40" rx="5" fill="#3b82f6" stroke="#1e40af" strokeWidth="1" />
      
      {/* Knob */}
      <circle cx="25" cy="25" r="12" fill="#e5e7eb" />
      <circle cx="25" cy="25" r="10" fill="#f8fafc" stroke="#9ca3af" strokeWidth="0.5" />
      
      {/* Knob Indicator (screw head) */}
      <g transform={`rotate(${rotation} 25 25)`}>
        <rect x="24" y="17" width="2" height="16" rx="1" fill="#9ca3af" />
        <rect x="17" y="24" width="16" height="2" rx="1" fill="#9ca3af" />
      </g>

      {/* Pins */}
      <g stroke="#a1a1aa" strokeWidth="2">
        <path d="M15 45 v15" />
        <path d="M25 45 v15" />
        <path d="M35 45 v15" />
      </g>
    </svg>
  );
};
