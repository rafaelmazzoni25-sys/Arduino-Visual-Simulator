import React from 'react';

export const RelayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 80 50" {...props}>
    {/* Base */}
    <rect x="0" y="0" width="80" height="50" rx="5" fill="#0369a1" />
    
    {/* Relay Body */}
    <rect x="30" y="5" width="45" height="40" rx="3" fill="#1e3a8a" />
    
    {/* Control Pins */}
    <g className="font-mono text-[7px]" textAnchor="middle">
      <rect x="5" y="5" width="20" height="10" fill="#71717a" />
      <text x="15" y="12" fill="white">IN</text>
      <rect x="5" y="20" width="20" height="10" fill="#71717a" />
      <text x="15" y="27" fill="white">GND</text>
      <rect x="5" y="35" width="20" height="10" fill="#71717a" />
      <text x="15" y="42" fill="white">VCC</text>
    </g>

    {/* Screw Terminals */}
    <g className="font-mono text-[7px]" textAnchor="middle">
      <rect x="35" y="10" width="10" height="30" fill="#d1d5db" />
      <text x="40" y="48" fill="white">NO</text>
      <rect x="50" y="10" width="10" height="30" fill="#d1d5db" />
      <text x="55" y="48" fill="white">COM</text>
      <rect x="65" y="10" width="10" height="30" fill="#d1d5db" />
      <text x="70" y="48" fill="white">NC</text>
    </g>
  </svg>
);