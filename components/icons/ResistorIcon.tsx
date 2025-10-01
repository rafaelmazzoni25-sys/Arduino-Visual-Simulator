import React from 'react';

export const ResistorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        viewBox="0 0 100 40"
        {...props}
    >
        <line x1="0" y1="20" x2="20" y2="20" stroke="#a1a1aa" strokeWidth="2" />
        <rect x="20" y="10" width="60" height="20" fill="#81b2d9" rx="5" />
        <rect x="35" y="10" width="5" height="20" fill="#ef4444" />
        <rect x="45" y="10" width="5" height="20" fill="#ef4444" />
        <rect x="55" y="10" width="5" height="20" fill="#ca8a04" />
        <line x1="80" y1="20" x2="100" y2="20" stroke="#a1a1aa" strokeWidth="2" />
    </svg>
);
