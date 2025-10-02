import React from 'react';

export const KeypadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const keys = [
    ['1', '2', '3', 'A'],
    ['4', '5', '6', 'B'],
    ['7', '8', '9', 'C'],
    ['*', '0', '#', 'D'],
  ];
  return (
    <svg viewBox="0 0 100 120" {...props}>
      {/* Base */}
      <rect x="0" y="0" width="100" height="100" rx="5" fill="#475569" />
      
      {/* Keys */}
      {keys.map((row, r) =>
        row.map((key, c) => (
          <g key={`${r}-${c}`}>
            <rect
              x={10 + c * 22}
              y={10 + r * 22}
              width="18"
              height="18"
              rx="3"
              fill="#d1d5db"
            />
            <text
              x={19 + c * 22}
              y={23 + r * 22}
              textAnchor="middle"
              fontSize="12"
              fill="#1f2937"
              className="font-mono font-bold"
            >
              {key}
            </text>
          </g>
        ))
      )}

      {/* Pins */}
      <g className="font-mono text-[7px]" textAnchor="middle">
        {Array.from({length: 8}).map((_, i) => (
           <rect key={i} x={10 + i * 10} y={105} width="8" height="15" fill="#71717a" />
        ))}
         <text x="14" y="118" fill="white">R1</text>
         <text x="24" y="118" fill="white">R2</text>
         <text x="34" y="118" fill="white">R3</text>
         <text x="44" y="118" fill="white">R4</text>
         <text x="54" y="118" fill="white">C1</text>
         <text x="64" y="118" fill="white">C2</text>
         <text x="74" y="118" fill="white">C3</text>
         <text x="84" y="118" fill="white">C4</text>
      </g>
    </svg>
  );
};