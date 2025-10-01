// FIX: import useCallback from react to resolve 'Cannot find name' error.
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ArduinoComponent, Wire, Terminal, Point } from '../types';
import { ArduinoBoard, getPinPosition } from './ArduinoBoard';
import { LedIcon } from './icons/LedIcon';
import { ButtonIcon } from './icons/ButtonIcon';
import { PotentiometerIcon } from './icons/PotentiometerIcon';
import { ResistorIcon } from './icons/ResistorIcon';
import { ServoIcon } from './icons/ServoIcon';

interface BreadboardProps {
  components: ArduinoComponent[];
  wires: Wire[];
  onComponentUpdate: (id: string, updates: Partial<ArduinoComponent>) => void;
  onAddWire: (wire: Omit<Wire, 'id'>) => void;
  onDeleteWire: (id: string) => void;
  isSimulating: boolean;
}

type Draggable = { type: 'component'; id: string } | { type: 'wire-start'; terminal: Terminal } | null;

const componentIconMap: Record<ArduinoComponent['type'], React.FC<any>> = {
  led: LedIcon, button: ButtonIcon, potentiometer: PotentiometerIcon, resistor: ResistorIcon, servo: ServoIcon,
};

// Relative terminal positions for each component type
const componentTerminals: Record<string, { id: string; x: number; y: number }[]> = {
  led: [{ id: 'anode', x: 0, y: -25 }, { id: 'cathode', x: 0, y: 25 }],
  resistor: [{ id: 't1', x: -50, y: 0 }, { id: 't2', x: 50, y: 0 }],
  button: [{ id: 't1', x: -10, y: 15 }, { id: 't2', x: 10, y: 15 }],
  potentiometer: [{ id: 't1', x: -15, y: 20 }, { id: 'gnd', x: 0, y: 20 }, { id: 't2', x: 15, y: 20 }],
  servo: [{ id: 'signal', x: -15, y: 25 }, { id: 'vcc', x: 0, y: 25 }, { id: 'gnd', x: 15, y: 25 }],
};

export const Breadboard: React.FC<BreadboardProps> = ({ components, wires, onComponentUpdate, onAddWire, onDeleteWire, isSimulating }) => {
  const [dragging, setDragging] = useState<Draggable>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [newWireEnd, setNewWireEnd] = useState<Point | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getSVGPoint = (e: React.MouseEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const transformed = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: transformed.x, y: transformed.y };
  };
  
  const getTerminalPosition = useCallback((terminal: Terminal): Point | null => {
    if (terminal.componentId === 'arduino') {
      return getPinPosition(terminal.terminalId);
    }
    const component = components.find(c => c.id === terminal.componentId);
    const terminalDef = componentTerminals[component?.type as string]?.find(t => t.id === terminal.terminalId);
    if (component && terminalDef && component.x && component.y) {
      // Adjust for component scaling
      const scale = 0.6;
      return { x: component.x + (terminalDef.x * scale), y: component.y + (terminalDef.y * scale) };
    }
    return null;
  }, [components]);

  const handleMouseDown = (e: React.MouseEvent, type: 'component' | 'terminal', id: string, terminalId?: string) => {
    const point = getSVGPoint(e);
    setSelectedWireId(null);
    if (type === 'component') {
      const component = components.find(c => c.id === id);
      if (component && component.x && component.y) {
        setDragging({ type: 'component', id });
        setDragOffset({ x: point.x - component.x, y: point.y - component.y });
      }
    } else if (type === 'terminal' && terminalId) {
      const terminal = { componentId: id, terminalId };
      setDragging({ type: 'wire-start', terminal });
      setNewWireEnd(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const point = getSVGPoint(e);
    if (dragging.type === 'component') {
      onComponentUpdate(dragging.id, { x: point.x - dragOffset.x, y: point.y - dragOffset.y });
    } else if (dragging.type === 'wire-start') {
      setNewWireEnd(point);
    }
  };

  const handleMouseUp = (e: React.MouseEvent, hoverTerminal?: Terminal) => {
    if (dragging?.type === 'wire-start' && hoverTerminal && (dragging.terminal.componentId !== hoverTerminal.componentId || dragging.terminal.terminalId !== hoverTerminal.terminalId)) {
        onAddWire({ start: dragging.terminal, end: hoverTerminal });
    }
    setDragging(null);
    setNewWireEnd(null);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if((e.key === 'Delete' || e.key === 'Backspace') && selectedWireId) {
            onDeleteWire(selectedWireId);
            setSelectedWireId(null);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWireId, onDeleteWire]);

  const newWireStartPos = useMemo(() => {
    if (dragging?.type === 'wire-start') {
      return getTerminalPosition(dragging.terminal);
    }
    return null;
  }, [dragging, getTerminalPosition]);
  
  const draggedComponent = useMemo(() => {
    return dragging?.type === 'component' ? components.find(c => c.id === dragging.id) : null;
  }, [dragging, components]);


  const ComponentG = ({ component }: { component: ArduinoComponent }) => {
    const Icon = componentIconMap[component.type];
    const scale = 0.6;
    const isBeingDragged = draggedComponent?.id === component.id;

    return (
        <g 
            transform={`translate(${component.x || 0}, ${component.y || 0})`}
            className={isBeingDragged ? "cursor-grabbing" : "cursor-grab"}
            onMouseDown={!isBeingDragged ? (e) => handleMouseDown(e, 'component', component.id) : undefined}
            style={isBeingDragged ? { filter: 'url(#drag-shadow)' } : {}}
        >
            <g transform={`scale(${scale})`}>
                <Icon
                    isOn={component.type === 'led' ? component.isOn : undefined}
                    isPressed={component.type === 'button' ? component.isPressed : undefined}
                    value={component.type === 'potentiometer' || component.type === 'servo' ? component.value : undefined}
                />
            </g>
            {/* Render terminals */}
            {componentTerminals[component.type]?.map(term => (
                <circle 
                    key={term.id} 
                    cx={term.x * scale} 
                    cy={term.y * scale} 
                    r="5" 
                    fill="rgba(255,255,0,0.3)" 
                    stroke="rgba(255,255,0,0.5)" 
                    strokeWidth="1" 
                    className="cursor-crosshair" 
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'terminal', component.id, term.id); }} 
                    onMouseUp={(e) => { e.stopPropagation(); handleMouseUp(e, { componentId: component.id, terminalId: term.id }); }} 
                />
            ))}
            <text x="0" y="35" textAnchor="middle" fill="#e2e8f0" fontSize="12" className="font-sans select-none pointer-events-none">{component.label}</text>
        </g>
    );
};

  return (
    <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700 shadow-lg h-full flex flex-col">
      <div className="flex-grow relative bg-slate-900/30 rounded-md overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          onMouseMove={handleMouseMove}
          onMouseUp={(e) => handleMouseUp(e)}
          className="select-none"
        >
          <defs>
            <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#334155" />
            </pattern>
            <filter id="drag-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="3" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />

          <ArduinoBoard onPinClick={() => {}} selectedPin={null} onPinMouseDown={(e, pinId) => handleMouseDown(e, 'terminal', 'arduino', pinId)} onPinMouseUp={(e, pinId) => handleMouseUp(e, {componentId: 'arduino', terminalId: pinId})} />
          
          {/* Render existing wires */}
          {wires.map(wire => {
             const startPos = getTerminalPosition(wire.start);
             const endPos = getTerminalPosition(wire.end);
             if(!startPos || !endPos) return null;
             const isSelected = wire.id === selectedWireId;
             return <line key={wire.id} x1={startPos.x} y1={startPos.y} x2={endPos.x} y2={endPos.y} stroke={isSelected ? '#22d3ee' : '#a1a1aa'} strokeWidth={isSelected ? 3 : 1.5} className="cursor-pointer" onClick={() => setSelectedWireId(wire.id)} />
          })}

          {/* Render new wire being drawn */}
          {newWireStartPos && newWireEnd && (
            <line x1={newWireStartPos.x} y1={newWireStartPos.y} x2={newWireEnd.x} y2={newWireEnd.y} stroke="#67e8f9" strokeWidth="2" strokeDasharray="4 4" />
          )}

          {/* Render components that are NOT being dragged */}
          {components
            .filter(c => c.id !== draggedComponent?.id)
            .map((c) => <ComponentG key={c.id} component={c} />)
          }
          
          {/* Render the dragged component last so it's on top */}
          {draggedComponent && <ComponentG key={draggedComponent.id} component={draggedComponent} />}

        </svg>
      </div>
    </div>
  );
};