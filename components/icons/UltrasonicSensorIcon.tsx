import React from 'react';

export const UltrasonicSensorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 80 50" {...props}>
    {/* Base */}
    <rect x="0" y="0" width="80" height="40" rx="3" fill="#047857" />
    
    {/* "Eyes" */}
    <circle cx="25" cy="20" r="12" fill="#1f2937" />
    <circle cx="25" cy="20" r="10" fill="#374151" />
    <circle cx="55" cy="20" r="12" fill="#1f2937" />
    <circle cx="55" cy="20" r="10" fill="#374151" />
    
    {/* Labels */}
    <text x="25" y="15" fontSize="8" fill="#a1a1aa" textAnchor="middle" className="font-mono">T</text>
    <text x="55" y="15" fontSize="8" fill="#a1a1aa" textAnchor="middle" className="font-mono">R</text>

    {/* Pins */}
    <g fill="#a1a1aa" className="font-mono text-[7px]" textAnchor="middle">
      <rect x="10" y="40" width="8" height="10" fill="#71717a" />
      <text x="14" y="48">VCC</text>
      
      <rect x="28" y="40" width="8" height="10" fill="#71717a" />
      <text x="32" y="48">Trig</text>
      
      <rect x="46" y="40" width="8" height="10" fill="#71717a" />
      <text x="50" y="48">Echo</text>
      
      <rect x="64" y="40" width="8" height="10" fill="#71717a" />
      <text x="68" y="48">GND</text>
    </g>
  </svg>
);
