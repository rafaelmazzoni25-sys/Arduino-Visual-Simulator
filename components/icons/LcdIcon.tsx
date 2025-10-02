import React from 'react';

export const LcdIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 160 50" {...props}>
    {/* Base */}
    <rect x="0" y="0" width="160" height="50" rx="3" fill="#1e3a8a" />
    <rect x="2" y="2" width="156" height="46" rx="2" fill="#3b82f6" />
    
    {/* Screen */}
    <rect x="15" y="10" width="130" height="30" fill="#064e3b" />
    <rect x="17" y="12" width="126" height="26" fill="#10b981" />

    {/* Pins */}
    {Array.from({ length: 16 }).map((_, i) => (
      <rect key={`pin-${i}`} x={4 + i * 9.6} y="0" width="6" height="8" fill="#78716c" />
    ))}
    <g fill="white" className="font-mono text-[5px] select-none pointer-events-none">
        {['VSS', 'VDD', 'VO', 'RS', 'RW', 'E', '', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'A', 'K'].map((label, i) => (
            <text key={`label-${i}`} x={7 + i * 9.6} y="15" textAnchor="middle" transform={`rotate(90, ${7 + i * 9.6}, 15)`}>{label}</text>
        ))}
    </g>

  </svg>
);
