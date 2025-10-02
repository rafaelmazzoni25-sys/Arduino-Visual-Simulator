import React from 'react';

interface Pin {
  id: string;
  x: number;
  y: number;
}

const DIGITAL_HEADER_Y = 3.5;
const POWER_HEADER_Y = 250.5;

const digitalPins: Pin[] = [
    // Top digital pins D8-D13
    { id: 'pin-13', x: 298.5 },
    { id: 'pin-12', x: 314.8 },
    { id: 'pin-11', x: 331.1 },
    { id: 'pin-10', x: 347.4 },
    { id: 'pin-9', x: 363.7 },
    { id: 'pin-8', x: 380.0 },
    // Top digital pins D0-D7
    { id: 'pin-7', x: 423.5 },
    { id: 'pin-6', x: 439.8 },
    { id: 'pin-5', x: 456.1 },
    { id: 'pin-4', x: 472.4 },
    { id: 'pin-3', x: 488.7 },
    { id: 'pin-2', x: 505.0 },
    { id: 'pin-1', x: 521.3 },
    { id: 'pin-0', x: 537.6 },
].map(p => ({ ...p, y: DIGITAL_HEADER_Y }));

const powerPins: Pin[] = [
    { id: 'gnd-1', x: 396.3, y: DIGITAL_HEADER_Y },
    { id: 'aref', x: 410.0, y: DIGITAL_HEADER_Y },
    // Bottom power pins
    { id: 'io-ref', x: 197.0 },
    { id: 'reset', x: 213.3 },
    { id: '3.3v', x: 229.6 },
    { id: '5v', x: 245.9 },
    { id: 'gnd-2', x: 262.2 },
    { id: 'gnd-3', x: 278.5 },
    { id: 'vin', x: 294.8 },
].map(p => ({ ...p, y: POWER_HEADER_Y }));

const analogPins: Pin[] = [
    { id: 'A0', x: 322.0 },
    { id: 'A1', x: 338.3 },
    { id: 'A2', x: 354.6 },
    { id: 'A3', x: 370.9 },
    { id: 'A4', x: 387.2 },
    { id: 'A5', x: 403.5 },
].map(p => ({ ...p, y: POWER_HEADER_Y }));

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
            
            {/* Pin labels */}
            <g className="text-[10px]">
                {digitalPins.map(p => <text key={p.id} x={p.x + 6} y={p.y + 20} textAnchor="middle">{p.id.replace('pin-','')}{['11','10','9','6','5','3'].includes(p.id.replace('pin-','')) ? '~' : ''}</text>)}
                <text x={396.3+6} y={DIGITAL_HEADER_Y+20} textAnchor="middle">GND</text>
                <text x={410.0+6} y={DIGITAL_HEADER_Y+20} textAnchor="middle">AREF</text>

                {powerPins.filter(p => p.y === POWER_HEADER_Y).map(p => <text key={p.id} x={p.x + 6} y={p.y - 8} textAnchor="middle">{p.id.toUpperCase().replace('-','').replace('IOREF','IO').replace('3.3V','3V3')}</text>)}
                {analogPins.map(p => <text key={p.id} x={p.x + 6} y={p.y - 8} textAnchor="middle">{p.id}</text>)}
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
        </g>

        {/* Pin Headers */}
        <g>
          <rect x="295" y="0" width="102" height="20" fill="#1F2937" />
          <rect x="420" y="0" width="134" height="20" fill="#1F2937" />
          <rect x="194" y="247" width="117" height="20" fill="#1F2937" />
          <rect x="319" y="247" width="101" height="20" fill="#1F2937" />
          <rect x="393" y="0" width="24" height="20" fill="#1F2937" />

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
            />
          ))}
        </g>
      </svg>
    </g>
  );
};
