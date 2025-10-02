import React from 'react';

interface ServoIconProps extends React.SVGProps<SVGSVGElement> {
  value?: number; // Angle 0-180
}

export const ServoIcon: React.FC<ServoIconProps> = ({ value = 90, className, ...props }) => {
  const angle = value || 0;
  return (
    <svg
      viewBox="0 0 60 60"
      className={className}
      {...props}
    >
      {/* Body */}
      <rect x="10" y="20" width="40" height="30" rx="3" fill="#3b82f6" />
      <rect x="12" y="22" width="36" height="26" fill="#60a5fa" />
      
      {/* Mounting Tabs */}
      <rect x="2" y="30" width="8" height="10" rx="2" fill="#3b82f6" />
      <rect x="50" y="30" width="8"height="10" rx="2" fill="#3b82f6" />
      <circle cx="6" cy="35" r="1.5" fill="#1e40af" />
      <circle cx="54" cy="35" r="1.5" fill="#1e40af" />

      {/* Servo Head */}
      <circle cx="30" cy="20" r="8" fill="#a1a1aa" />
      <circle cx="30"cy="20" r="6" fill="#e5e7eb" />
      
      {/* Servo Arm */}
      <g transform={`rotate(${angle} 30 20)`}>
        <rect x="28" y="5" width="4" height="15" rx="1" fill="#e5e7eb" />
      </g>
      
      {/* Pins */}
      <path d="M20 50 v5" stroke="#333" strokeWidth="2" /> {/* GND */}
      <path d="M30 50 v5" stroke="#dc2626" strokeWidth="2" /> {/* VCC */}
      <path d="M40 50 v5" stroke="#f59e0b" strokeWidth="2" /> {/* Signal */}

      {/* Pin Labels */}
      <text x="20" y="59" fontSize="6" fill="#a1a1aa" textAnchor="middle">G</text>
      <text x="30" y="59" fontSize="6" fill="#a1a1aa" textAnchor="middle">V</text>
      <text x="40" y="59" fontSize="6" fill="#a1a1aa" textAnchor="middle">S</text>
    </svg>
  );
};
