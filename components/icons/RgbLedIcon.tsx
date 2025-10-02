import React from 'react';

export const RgbLedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 50 60" {...props}>
      {/* LED Bulb */}
      <path
        d="M 10,40 C 10,25 40,25 40,35 L 40,45 L 10,45 Z"
        fill="rgba(255, 255, 255, 0.5)"
        stroke="#e5e7eb"
        strokeWidth="1"
      />
      
      {/* Base */}
      <path d="M14 50 h22 v-5 h-22 z" fill="#a1a1aa" />
      
      {/* Pins */}
      <g stroke="#a1a1aa" strokeWidth="2">
          <path d="M16 60 v-10" />
          <path d="M22 60 v-10" />
          <path d="M28 60 v-10" />
          <path d="M34 60 v-10" />
      </g>

      {/* Pin Labels */}
      <g className="font-mono text-[8px]" textAnchor="middle">
        <text x="16" y="58" fill="#ef4444">R</text>
        <text x="22" y="58" fill="#a1a1aa">GND</text>
        <text x="28" y="58" fill="#22c55e">G</text>
        <text x="34" y="58" fill="#3b82f6">B</text>
      </g>
    </svg>
);