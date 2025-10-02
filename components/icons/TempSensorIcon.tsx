import React from 'react';

export const TempSensorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 50 50" {...props}>
    {/* Body */}
    <path d="M 15 20 H 35 V 40 A 10 10 0 0 1 25 50 A 10 10 0 0 1 15 40 Z" fill="#1f2937" />
    
    {/* Pins */}
    <g stroke="#a1a1aa" strokeWidth="2">
      <path d="M20 50 v-10" />
      <path d="M25 50 v-10" />
      <path d="M30 50 v-10" />
    </g>

    {/* Labels */}
     <g fill="white" className="font-mono text-[6px]" textAnchor="middle">
        <text x="20" y="18">VCC</text>
        <text x="25" y="18">Vout</text>
        <text x="30" y="18">GND</text>
     </g>
  </svg>
);