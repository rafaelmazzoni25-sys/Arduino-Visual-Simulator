import React from 'react';

export const DcMotorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 60 50" {...props}>
    {/* Body */}
    <circle cx="30" cy="25" r="20" fill="#d1d5db" />
    <circle cx="30" cy="25" r="18" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
    
    {/* Shaft */}
    <rect x="28" y="0" width="4" height="10" fill="#9ca3af" />
    
    {/* Terminals */}
    <rect x="10" y="40" width="10" height="10" fill="#ef4444" />
    <rect x="40" y="40" width="10" height="10" fill="#374151" />
  </svg>
);