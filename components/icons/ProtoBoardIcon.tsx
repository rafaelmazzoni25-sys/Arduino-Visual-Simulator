
import React from 'react';

export const ProtoBoardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 100" {...props}>
    {/* Base */}
    <rect width="200" height="100" rx="5" fill="#f1f5f9" />
    <rect x="2" y="2" width="196" height="96" rx="3" fill="#e2e8f0" />

    {/* Power Rails */}
    <rect x="5" y="8" width="190" height="4" fill="#ef4444" /> {/* Red */}
    <rect x="5" y="16" width="190" height="4" fill="#3b82f6" /> {/* Blue */}
    <rect x="5" y="80" width="190" height="4" fill="#3b82f6" /> {/* Blue */}
    <rect x="5" y="88" width="190" height="4" fill="#ef4444" /> {/* Red */}

    {/* Connection Holes Pattern */}
    <defs>
      <pattern id="holes" patternUnits="userSpaceOnUse" width="10" height="10">
        <circle cx="5" cy="5" r="1.5" fill="#475569" />
      </pattern>
    </defs>
    
    {/* Main area for components */}
    <rect x="25" y="28" width="150" height="44" fill="url(#holes)" />
  </svg>
);
