import React from 'react';

interface Pin {
  id: string;
  x: number;
  y: number;
  label?: string;
  labelYOffset?: number;
}

const digitalPins: Pin[] = Array.from({ length: 8 }, (_, i) => ({
    id: `pin-${7-i}`,
    x: 178 + i * 16.3,
    y: 3.5,
    label: `${7 - i}`,
    labelYOffset: 22,
})).concat(
    Array.from({ length: 6 }, (_, i) => ({
        id: `pin-${i + 8}`,
        x: 298 + i * 16.3,
        y: 3.5,
        label: `${i + 8}`,
        labelYOffset: 22,
    }))
);
digitalPins.find(p => p.id === 'pin-11')!.label = '11~';
digitalPins.find(p => p.id === 'pin-10')!.label = '10~';
digitalPins.find(p => p.id === 'pin-9')!.label = '9~';


const powerPins: Pin[] = [
    { id: 'gnd-1', x: 279, y: 3.5, label: 'GND', labelYOffset: 22 },
    { id: 'gnd-2', x: 260, y: 226, label: 'GND', labelYOffset: -8},
    { id: 'gnd-3', x: 276, y: 226, label: 'GND', labelYOffset: -8},
    { id: '5v', x: 244, y: 226, label: '5V', labelYOffset: -8},
];

const analogPins: Pin[] = Array.from({ length: 6 }, (_, i) => ({
    id: `A${i}`,
    x: 170 + i * 16.3,
    y: 226,
    label: `A${i}`,
    labelYOffset: -8,
}));

export const allPins = [...digitalPins, ...powerPins, ...analogPins];

interface ArduinoBoardProps {
    x: number;
    y: number;
    onPinMouseDown: (e: React.MouseEvent, pinId: string) => void;
    onPinMouseUp: (e: React.MouseEvent, pinId: string) => void;
    onBoardMouseDown: (e: React.MouseEvent) => void;
}

export const ArduinoBoard: React.FC<ArduinoBoardProps> = ({ x, y, onPinMouseDown, onPinMouseUp, onBoardMouseDown }) => {
  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-grab">
      <svg viewBox="0 0 550 300" width="550" height="300">
        {/* Base board with drag handler */}
        <rect 
          x="50" 
          width="450" 
          height="230" 
          rx="10" 
          fill="#009999" 
          onMouseDown={onBoardMouseDown}
        />
        <rect x="65" y="15" width="420" height="200" rx="5" fill="#008a8a" className="pointer-events-none" />

        {/* Decorative elements */}
        <g className="pointer-events-none">
          {/* USB Port */}
          <rect x="100" y="80" width="50" height="50" fill="#E5E7EB" />
          <rect x="105" y="85" width="40" height="40" fill="#4B5563" />

          {/* Power Jack */}
          <circle cx="125" cy="170" r="15" fill="#4B5563" />
          <circle cx="125" cy="170" r="8" fill="#1F2937" />

          {/* Main Chip */}
          <rect x="230" y="80" width="90" height="90" fill="#374151" />
          <text x="275" y="120" textAnchor="middle" fill="#9CA3AF" fontSize="12" className="font-mono">ATmega328P</text>
          
          {/* Reset Button */}
          <rect x="160" y="65" width="15" height="15" rx="2" fill="#DC2626" />
        </g>
        
        {/* Pin Headers */}
        <g transform="translate(50, 0)">
          <rect x="170" y="0" width="225" height="20" fill="#1F2937" />
          <rect x="170" y="210" width="170" height="20" fill="#1F2937" />

          {/* Render all pins */}
          {allPins.map(pin => (
            <g key={pin.id} transform={`translate(${pin.x}, ${pin.y})`}>
              <rect
                x="0"
                y="0"
                width="12"
                height="12"
                fill={'#9CA3AF'}
                className="cursor-crosshair transition-all hover:fill-cyan-300"
                onMouseDown={(e) => { e.stopPropagation(); onPinMouseDown(e, pin.id); }}
                onMouseUp={(e) => { e.stopPropagation(); onPinMouseUp(e, pin.id); }}
              />
              {pin.label && (
                <text
                    x="6"
                    y={pin.labelYOffset || 22}
                    textAnchor="middle"
                    fill="#E5E7EB"
                    fontSize="10"
                    className="font-mono select-none pointer-events-none"
                >
                    {pin.label}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
    </g>
  );
};
