import React from 'react';

// A more robust Pin definition including the display label and offsets for clarity.
export interface Pin {
  id: string;
  label: string;
  x: number;
  y: number;
  labelXOffset?: number; // Optional horizontal adjustment for crowded labels
  labelYOffset?: number; // Used to stagger crowded labels
}

// All pin coordinates have been meticulously recalibrated for perfect visual alignment,
// correct spacing (including the D7-D8 gap), and label clarity.
const allPins: Pin[] = [
  // Top Digital Header (left to right, with correct gap)
  { id: 'aref',   label: 'AREF',  x: 282.0, y: 4 },
  { id: 'gnd-1',  label: 'GND',   x: 298.6, y: 4 },
  { id: 'pin-13', label: '13',    x: 315.2, y: 4 },
  { id: 'pin-12', label: '12',    x: 331.8, y: 4 },
  { id: 'pin-11', label: '~11',   x: 348.4, y: 4 },
  { id: 'pin-10', label: '~10',   x: 365.0, y: 4 },
  { id: 'pin-9',  label: '~9',    x: 381.6, y: 4 },
  { id: 'pin-8',  label: '8',     x: 398.2, y: 4 },
  // Characteristic GAP between D7 and D8
  { id: 'pin-7',  label: '7',     x: 431.6, y: 4 },
  { id: 'pin-6',  label: '~6',    x: 448.2, y: 4 },
  { id: 'pin-5',  label: '~5',    x: 464.8, y: 4 },
  { id: 'pin-4',  label: '4',     x: 481.4, y: 4 },
  { id: 'pin-3',  label: '~3',    x: 498.0, y: 4 },
  { id: 'pin-2',  label: '2',     x: 514.6, y: 4 },
  { id: 'pin-1',  label: '1 TX',  x: 531.2, y: 4, labelXOffset: -4 },
  { id: 'pin-0',  label: '0 RX',  x: 547.8, y: 4, labelXOffset: 4 },
  
  // Bottom Power Header - with more pronounced staggered labels to prevent overlap
  { id: 'io-ref', label: 'IOREF', x: 197.0, y: 251, labelYOffset: 0 },
  { id: 'reset',  label: 'RESET', x: 213.6, y: 251, labelYOffset: 18 },
  { id: '3.3v',   label: '3.3V',  x: 230.2, y: 251, labelYOffset: 0 },
  { id: '5v',     label: '5V',    x: 246.8, y: 251, labelYOffset: 18 },
  { id: 'gnd-2',  label: 'GND',   x: 263.4, y: 251, labelYOffset: 0 },
  { id: 'gnd-3',  label: 'GND',   x: 280.0, y: 251, labelYOffset: 18 },
  { id: 'vin',    label: 'VIN',   x: 296.6, y: 251, labelYOffset: 0 },

  // Bottom Analog Header (with integrated SDA/SCL labels and adjusted offsets)
  { id: 'A0', label: 'A0',     x: 322.5, y: 251 },
  { id: 'A1', label: 'A1',     x: 339.1, y: 251 },
  { id: 'A2', label: 'A2',     x: 355.7, y: 251 },
  { id: 'A3', label: 'A3',     x: 372.3, y: 251 },
  { id: 'A4', label: 'A4/SDA', x: 388.9, y: 251, labelXOffset: 6 },
  { id: 'A5', label: 'A5/SCL', x: 405.5, y: 251, labelXOffset: 6 },
];

export { allPins };

interface ArduinoBoardProps {
    x: number;
    y: number;
    onPinMouseDown: (e: React.MouseEvent, pinId: string) => void;
    onPinMouseUp: (e: React.MouseEvent, pinId: string) => void;
    onBoardMouseDown: (e: React.MouseEvent) => void;
    onPinMouseEnter: (e: React.MouseEvent, pin: Pin) => void;
    onPinMouseLeave: (e: React.MouseEvent) => void;
}

export const ArduinoBoard: React.FC<ArduinoBoardProps> = ({ x, y, onPinMouseDown, onPinMouseUp, onBoardMouseDown, onPinMouseEnter, onPinMouseLeave }) => {
  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-grab">
      <svg viewBox="0 0 600 300" width="600" height="300">
        {/* Base board with drag handler */}
        <rect x="0" y="0" width="600" height="260" rx="10" fill="#0891b2" onMouseDown={onBoardMouseDown} />
        <rect x="10" y="10" width="580" height="240" rx="5" fill="#06b6d4" className="pointer-events-none" />

        {/* Silkscreen and decorative elements */}
        <g fill="white" className="font-mono text-xs select-none pointer-events-none">
            <text x="470" y="240">MADE IN ITALY</text>
            <text x="25" y="25">ARDUINO™</text>
            <text x="200" y="25">DIGITAL (PWM~)</text>
            <text x="220" y="225">POWER</text>
            <text x="340" y="225">ANALOG IN</text>
            <text x="550" y="25">UNO</text>
            
            {/* Detailed Labels */}
            <text x="260" y="200" className="text-[9px]">ICSP</text>
            <text x="540" y="80" className="text-[9px]">ICSP</text>
            <text x="135" y="88" className="text-[9px]">RESET</text>
            <text x="520" y="55" className="text-amber-400 font-bold text-[9px]">TX ></text>
            <text x="520" y="68" className="text-amber-400 font-bold text-[9px]">{'< RX'}</text>
            <text x="298" y="20" className="text-amber-400 font-bold">L</text>
            <text x="170" y="225" className="text-green-400 font-bold">ON</text>

            {/* Pin labels */}
            <g className="text-[10px]">
              {allPins.map(p => {
                const isBottom = p.y > 100;
                // Base Y position for labels: below for top pins, above for bottom pins.
                const labelBaseY = isBottom ? p.y - 15 : p.y + 28;
                // Apply the vertical offset for staggering.
                const labelY = isBottom 
                  ? labelBaseY - (p.labelYOffset || 0)
                  : labelBaseY + (p.labelYOffset || 0);
                  
                return (
                  <text
                    key={`${p.id}-label`}
                    x={p.x + 6 + (p.labelXOffset || 0)}
                    y={labelY}
                    textAnchor="middle"
                  >
                    {p.label}
                  </text>
                );
              })}
            </g>
        </g>
        
        {/* Components */}
        <g className="pointer-events-none">
            {/* USB Port */}
            <rect x="40" y="90" width="60" height="60" fill="#E5E7EB" rx="3" />
            <rect x="45" y="95" width="50" height="50" fill="#4B5563" />
            {/* Power Jack */}
            <circle cx="70" cy="190" r="18" fill="#4B5563" />
            <circle cx="70" cy="190" r="10" fill="#1F2937" />
            {/* Main Chip */}
            <rect x="250" y="90" width="100" height="100" fill="#374151" />
             {/* Crystal Oscillator */}
            <rect x="220" y="160" width="20" height="10" fill="#d1d5db" rx="2" />
            {/* Reset Button */}
            <rect x="110" y="75" width="20" height="20" rx="3" fill="#DC2626" />
            
            {/* On-board LEDs */}
            <rect x="525" y="45" width="5" height="8" rx="1" fill="#f59e0b" /> {/* TX LED */}
            <rect x="525" y="58" width="5" height="8" rx="1" fill="#f59e0b" /> {/* RX LED */}
            <rect x="300" y="25" width="8" height="5" rx="1" fill="#f59e0b" /> {/* L (Pin 13) LED */}
            <rect x="170" y="230" width="8" height="5" rx="1" fill="#16a34a" /> {/* ON LED */}
        </g>

        {/* Pin Headers - Updated to match new pin layout */}
        <g>
          <rect x="279" y="0" width="136" height="20" fill="#1F2937" />
          <rect x="428" y="0" width="137" height="20" fill="#1F2937" />
          <rect x="194" y="247" width="117" height="20" fill="#1F2937" />
          <rect x="319" y="247" width="101" height="20" fill="#1F2937" />
          
          {/* Render all pins */}
          {allPins.map(pin => (
            <rect
                key={pin.id}
                x={pin.x}
                y={pin.y}
                width="12"
                height="12"
                fill={'#374151'}
                stroke="#9CA3AF"
                strokeWidth="1"
                className="cursor-crosshair transition-all hover:fill-cyan-400"
                onMouseDown={(e) => { e.stopPropagation(); onPinMouseDown(e, pin.id); }}
                onMouseUp={(e) => { e.stopPropagation(); onPinMouseUp(e, pin.id); }}
                onMouseEnter={(e) => onPinMouseEnter(e, pin)}
                onMouseLeave={(e) => onPinMouseLeave(e)}
            />
          ))}
        </g>
      </svg>
    </g>
  );
};