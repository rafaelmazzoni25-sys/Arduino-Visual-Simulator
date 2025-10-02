import React from 'react';

// Defines a terminal on the protoboard.
export interface ProtoPin {
  id: string;
  x: number;
  y: number;
}

const terminals: ProtoPin[] = [];
const holeSpacing = 10.15;
const startX = 25;
const numCols = 30;

// Corrected Y-coordinates for a realistic layout
const yCoords = {
    topPlus: 15,
    topMinus: 25,
    strip1_start: 45,
    strip2_start: 105,
    bottomMinus: 165,
    bottomPlus: 175,
};


// Top power rails (Horizontal connection)
for (let i = 0; i < numCols; i++) {
  terminals.push({ id: `p-top-plus-${i+1}`, x: startX + i * holeSpacing, y: yCoords.topPlus });
  terminals.push({ id: `p-top-minus-${i+1}`, x: startX + i * holeSpacing, y: yCoords.topMinus });
}

// Main strips (Vertical connection)
const rows1 = ['A', 'B', 'C', 'D', 'E'];
const rows2 = ['F', 'G', 'H', 'I', 'J'];
for (let col = 0; col < numCols; col++) {
  for (let row = 0; row < rows1.length; row++) {
    terminals.push({ id: `${rows1[row]}-${col+1}`, x: startX + col * holeSpacing, y: yCoords.strip1_start + row * holeSpacing });
  }
  for (let row = 0; row < rows2.length; row++) {
    terminals.push({ id: `${rows2[row]}-${col+1}`, x: startX + col * holeSpacing, y: yCoords.strip2_start + row * holeSpacing });
  }
}

// Bottom power rails (Horizontal connection)
for (let i = 0; i < numCols; i++) {
  terminals.push({ id: `p-bottom-minus-${i+1}`, x: startX + i * holeSpacing, y: yCoords.bottomMinus });
  terminals.push({ id: `p-bottom-plus-${i+1}`, x: startX + i * holeSpacing, y: yCoords.bottomPlus });
}

export const protoboardTerminals = terminals;

export const ProtoBoardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const holeRadius = 1.8;
  const holeColor = "#475569";
  const textColor = "#64748b";

  // Creates a horizontal line of holes
  const HoleRow = ({ y, startX, count }: { y: number, startX: number, count: number }) => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <circle key={`h-${y}-${i}`} cx={startX + i * holeSpacing} cy={y} r={holeRadius} fill={holeColor} className="pointer-events-none" />
      ))}
    </>
  );

  // Creates the main terminal strips (5 rows)
  const TerminalStrip = ({ startY, count }: { startY: number, count: number }) => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <HoleRow key={`ts-${startY}-${i}`} y={startY + i * holeSpacing} startX={startX} count={count} />
      ))}
    </>
  );

  // Corrected logic to render numbers 1, 5, 10, 15...
  const ColumnNumbers = ({ y, count }: { y: number, count: number }) => (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const colNum = i + 1;
        if (colNum === 1 || colNum % 5 === 0) {
            return (
                 <text key={`num-${colNum}`} x={startX + i * holeSpacing} y={y} fontSize="8" fill={textColor} textAnchor="middle" className="font-mono pointer-events-none">
                    {colNum}
                </text>
            )
        }
        return null;
      })}
    </>
  );

  const RowLetters = ({ x, y, letters }: { x: number, y: number, letters: string[] }) => (
    <>
      {letters.map((letter, i) => (
        <text key={`letter-${letter}`} x={x} y={y + i * holeSpacing + 3} fontSize="8" fill={textColor} textAnchor="middle" className="font-mono pointer-events-none">{letter}</text>
      ))}
    </>
  );

  return (
    <svg viewBox="0 0 350 200" {...props}>
      {/* Base */}
      <rect width="350" height="200" rx="10" fill="#f8fafc" />
      <rect x="2" y="2" width="346" height="196" rx="8" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

      {/* Power Rails */}
      <line x1="20" y1="8" x2="330" y2="8" stroke="#ef4444" strokeWidth="2" />
      <HoleRow y={yCoords.topPlus} startX={startX} count={numCols} />
      <line x1="20" y1="32" x2="330" y2="32" stroke="#3b82f6" strokeWidth="2" />
      <HoleRow y={yCoords.topMinus} startX={startX} count={numCols} />
      <text x={10} y="18" fontSize="12" fill="#ef4444" className="font-bold pointer-events-none">+</text>
      <text x={10} y="28" fontSize="12" fill="#3b82f6" className="font-bold pointer-events-none">-</text>

      <line x1="20" y1="158" x2="330" y2="158" stroke="#3b82f6" strokeWidth="2" />
      <HoleRow y={yCoords.bottomMinus} startX={startX} count={numCols} />
      <line x1="20" y1="182" x2="330" y2="182" stroke="#ef4444" strokeWidth="2" />
      <HoleRow y={yCoords.bottomPlus} startX={startX} count={numCols} />
      <text x={10} y="168" fontSize="12" fill="#3b82f6" className="font-bold pointer-events-none">-</text>
      <text x={10} y="178" fontSize="12" fill="#ef4444" className="font-bold pointer-events-none">+</text>

      {/* Main Strips and Labels */}
      <ColumnNumbers y={38} count={numCols} />
      <RowLetters x={15} y={yCoords.strip1_start} letters={['A', 'B', 'C', 'D', 'E']} />
      <TerminalStrip startY={yCoords.strip1_start} count={numCols} />
      
      <TerminalStrip startY={yCoords.strip2_start} count={numCols} />
      <RowLetters x={15} y={yCoords.strip2_start} letters={['F', 'G', 'H', 'I', 'J']} />
      <ColumnNumbers y={yCoords.strip2_start + 5 * holeSpacing + 8} count={numCols} />
    </svg>
  );
};