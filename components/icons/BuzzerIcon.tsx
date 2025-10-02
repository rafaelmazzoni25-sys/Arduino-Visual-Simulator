import React from 'react';

export const BuzzerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 40 40" {...props}>
    {/* Base */}
    <circle cx="20" cy="20" r="15" fill="#3f3f46" stroke="#71717a" strokeWidth="2"/>
    <circle cx="20" cy="20" r="5" fill="#1f2937" />
    <text x="20" y="15" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">+</text>

    {/* Pins */}
    <path d="M10 35 v5" stroke="#a1a1aa" strokeWidth="2" />
    <path d="M30 35 v5" stroke="#a1a1aa" strokeWidth="2" />
  </svg>
);
