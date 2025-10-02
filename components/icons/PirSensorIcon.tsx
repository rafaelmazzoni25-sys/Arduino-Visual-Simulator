import React from 'react';

export const PirSensorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 50 60" {...props}>
    {/* Base */}
    <rect x="5" y="20" width="40" height="30" rx="3" fill="#166534" />
    
    {/* Lens */}
    <path d="M 25 0 A 20 20 0 0 1 45 20 L 5 20 A 20 20 0 0 1 25 0 Z" fill="#f0f9ff" opacity="0.8" />
    
    {/* Pins */}
    <g fill="white" className="font-mono text-[7px]" textAnchor="middle">
      <text x="15" y="58">VCC</text>
      <rect x="11" y="50" width="8" height="10" fill="#71717a" />
      <text x="25" y="58">OUT</text>
      <rect x="21" y="50" width="8" height="10" fill="#71717a" />
      <text x="35" y="58">GND</text>
      <rect x="31" y="50" width="8" height="10" fill="#71717a" />
    </g>
  </svg>
);