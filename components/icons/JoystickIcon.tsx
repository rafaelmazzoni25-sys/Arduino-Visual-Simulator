import React from 'react';

export const JoystickIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 70 70" {...props}>
    {/* Base */}
    <rect x="0" y="10" width="70" height="50" rx="5" fill="#1e40af" />
    <rect x="2" y="12" width="66" height="46" rx="3" fill="#3b82f6" />
    
    {/* Joystick stick */}
    <g transform="translate(35, 35)">
      <circle cx="0" cy="0" r="12" fill="#1f2937" />
      <circle cx="0" cy="0" r="10" fill="#4b5563" />
      <circle cx="0" cy="0" r="5" fill="#ef4444" />
    </g>
    
    {/* Pins */}
    <g fill="white" className="font-mono text-[7px]" textAnchor="middle">
      <text x="10" y="8">GND</text>
      <rect x="5" y="0" width="10" height="10" fill="#71717a" />
      <text x="25" y="8">+5V</text>
      <rect x="20" y="0" width="10" height="10" fill="#71717a" />
      <text x="40" y="8">VRx</text>
      <rect x="35" y="0" width="10" height="10" fill="#71717a" />
      <text x="55" y="8">VRy</text>
      <rect x="50" y="0" width="10" height="10" fill="#71717a" />
      <text x="70" y="8">SW</text>
      <rect x="65" y="0" width="10" height="10" fill="#71717a" />
    </g>
  </svg>
);