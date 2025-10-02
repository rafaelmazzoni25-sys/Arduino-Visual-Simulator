import React, { useState, MouseEvent, useMemo, useRef, DragEvent } from 'react';
import { ArduinoComponent, Wire, Point, Terminal, ComponentType } from '../types';
import { ArduinoBoard, allPins as arduinoPins } from './ArduinoBoard';
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
  onDropComponent: (type: ComponentType, position: Point) => void;
  onComponentDoubleClick: (id: string) => void;
  isSimulating: boolean;
  arduinoPosition: Point;
  onArduinoPositionUpdate: (newPosition: Point) => void;
}

// Defines component dimensions and terminal locations for precise wiring.
const componentDimensions: Record<string, {width: number, height: number, terminals: Record<string, Point>}> = {
    led: { width: 50, height: 50, terminals: { anode: {x: 20, y: 50}, cathode: {x: 30, y: 50} }},
    resistor: { width: 100, height: 40, terminals: { p1: {x: 0, y: 20}, p2: {x: 100, y: 20} }},
    button: { width: 50, height: 50, terminals: { p1: {x: 18, y: 40}, p2: {x: 32, y: 40} }},
    potentiometer: { width: 50, height: 50, terminals: { p1: {x: 15, y: 45}, p2: {x: 25, y: 45}, p3: {x: 35, y: 45} }},
    servo: { width: 60, height: 60, terminals: { gnd: {x: 20, y: 50}, vcc: {x: 30, y: 50}, signal: {x: 40, y: 50} }},
};

const getTerminalPosition = (terminal: Terminal, components: ArduinoComponent[], arduinoPosition: Point): Point | null => {
    if (terminal.componentId === 'arduino') {
        const pin = arduinoPins.find(p => p.id === terminal.terminalId);
        if (!pin) return null;
        return { x: arduinoPosition.x + 50 + pin.x + 6, y: arduinoPosition.y + pin.y + 6 };
    }

    const component = components.find(c => c.id === terminal.componentId);
    if (!component || component.x === undefined || component.y === undefined) return null;

    const dimensions = componentDimensions[component.type];
    const terminalOffset = dimensions?.terminals[terminal.terminalId];
    
    if (terminalOffset) {
        return { x: component.x + terminalOffset.x, y: component.y + terminalOffset.y };
    }

    return { x: component.x, y: component.y };
};


export const Breadboard: React.FC<BreadboardProps> = ({
  components,
  wires,
  onComponentUpdate,
  onAddWire,
  onDeleteWire,
  onDropComponent,
  onComponentDoubleClick,
  isSimulating,
  arduinoPosition,
  onArduinoPositionUpdate,
}) => {
  const [drawingWire, setDrawingWire] = useState<{ start: Terminal; end: Point } | null>(null);
  const [draggingInfo, setDraggingInfo] = useState<{ id: string; type: 'component' | 'arduino'; offset: Point } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getSVGPoint = (e: MouseEvent | DragEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const transformed = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType') as ComponentType;
    if (type) {
        const point = getSVGPoint(e);
        const dimensions = componentDimensions[type];
        // Adjust drop position to center the component on the cursor
        const x = dimensions ? point.x - dimensions.width / 2 : point.x;
        const y = dimensions ? point.y - dimensions.height / 2 : point.y;
        onDropComponent(type, { x, y });
    }
  };

  const handleMouseDownOnPin = (e: MouseEvent, componentId: string, terminalId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSimulating) return;
    const startTerminal = { componentId, terminalId };
    const startPoint = getTerminalPosition(startTerminal, components, arduinoPosition);
    if(startPoint) {
      setDrawingWire({ start: startTerminal, end: startPoint });
    }
  };

  const handleMouseUpOnPin = (e: MouseEvent, componentId: string, terminalId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSimulating || !drawingWire) return;
    const endTerminal = { componentId, terminalId };
    
    if(drawingWire.start.componentId === endTerminal.componentId && drawingWire.start.terminalId === endTerminal.terminalId) {
        setDrawingWire(null);
        return;
    }

    onAddWire({ start: drawingWire.start, end: endTerminal });
    setDrawingWire(null);
  };
  
  const handleMouseDownOnComponent = (e: MouseEvent, componentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSimulating) return;
    const component = components.find(c => c.id === componentId);
    if (!component || component.x === undefined || component.y === undefined) return;
    const point = getSVGPoint(e);
    setDraggingInfo({
      id: componentId,
      type: 'component',
      offset: { x: point.x - component.x, y: point.y - component.y },
    });
  };

  const handleMouseDownOnArduino = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSimulating) return;
    const point = getSVGPoint(e);
    setDraggingInfo({
      id: 'arduino',
      type: 'arduino',
      offset: { x: point.x - arduinoPosition.x, y: point.y - arduinoPosition.y },
    });
  }

  const handleMouseMove = (e: MouseEvent) => {
    const point = getSVGPoint(e);

    if (drawingWire) {
      setDrawingWire({ ...drawingWire, end: point });
    }
    
    if (draggingInfo) {
      const newX = point.x - draggingInfo.offset.x;
      const newY = point.y - draggingInfo.offset.y;

      if(draggingInfo.type === 'component') {
        onComponentUpdate(draggingInfo.id, { x: newX, y: newY });
      } else if (draggingInfo.type === 'arduino') {
        onArduinoPositionUpdate({ x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    setDrawingWire(null);
    setDraggingInfo(null);
  };

  const renderComponent = (component: ArduinoComponent) => {
    const commonProps = {
        key: component.id,
        onMouseDown: (e: MouseEvent) => handleMouseDownOnComponent(e, component.id),
        onDoubleClick: () => onComponentDoubleClick(component.id),
        className: `cursor-grab ${isSimulating ? 'cursor-not-allowed' : ''}`,
        transform: `translate(${component.x || 0}, ${component.y || 0})`
    };

    const terminalRadius = 6;
    const TerminalCircle = ({ terminalId, cx, cy }: { terminalId: string, cx: number, cy: number }) => (
        <circle 
            cx={cx} cy={cy} r={terminalRadius}
            fill="transparent"
            onMouseDown={(e) => handleMouseDownOnPin(e, component.id, terminalId)}
            onMouseUp={(e) => handleMouseUpOnPin(e, component.id, terminalId)}
            className="cursor-crosshair"
        />
    );

    const dims = componentDimensions[component.type];
    if (!dims) return null;

    const terminals = Object.entries(dims.terminals).map(([id, pos]) => (
      <TerminalCircle key={id} terminalId={id} cx={pos.x} cy={pos.y} />
    ));

    switch (component.type) {
      case 'led':
        return <g {...commonProps}><LedIcon isOn={!!component.isOn} width={dims.width} height={dims.height} />{terminals}</g>;
      case 'resistor':
        return <g {...commonProps}><ResistorIcon width={dims.width} height={dims.height} />{terminals}</g>;
      case 'button':
        return <g {...commonProps}><ButtonIcon isPressed={!!component.isPressed} width={dims.width} height={dims.height} />{terminals}</g>;
      case 'potentiometer':
        return <g {...commonProps}><PotentiometerIcon value={component.value} width={dims.width} height={dims.height} />{terminals}</g>;
      case 'servo':
        return <g {...commonProps}><ServoIcon value={component.value} width={dims.width} height={dims.height} />{terminals}</g>;
      default:
        return null;
    }
  };

  const wirePaths = useMemo(() => wires.map(wire => {
    const startPos = getTerminalPosition(wire.start, components, arduinoPosition);
    const endPos = getTerminalPosition(wire.end, components, arduinoPosition);
    if (!startPos || !endPos) return null;
    return {
        id: wire.id,
        path: `M ${startPos.x} ${startPos.y} L ${endPos.x} ${endPos.y}`
    };
  }).filter((p): p is { id: string, path: string } => !!p), [wires, components, arduinoPosition]);
  
  const drawingWirePath = useMemo(() => {
    if (!drawingWire) return null;
    const startPos = getTerminalPosition(drawingWire.start, components, arduinoPosition);
    if (!startPos) return null;
    return `M ${startPos.x} ${startPos.y} L ${drawingWire.end.x} ${drawingWire.end.y}`;
  }, [drawingWire, components, arduinoPosition]);

  return (
    <div className="bg-slate-900 rounded-lg w-full h-full border border-slate-700 overflow-hidden shadow-lg relative select-none">
        <svg
            ref={svgRef}
            className="w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(45, 212, 191, 0.1)" strokeWidth="1"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <ArduinoBoard 
                x={arduinoPosition.x}
                y={arduinoPosition.y}
                onBoardMouseDown={handleMouseDownOnArduino}
                onPinMouseDown={(e, pinId) => handleMouseDownOnPin(e, 'arduino', pinId)}
                onPinMouseUp={(e, pinId) => handleMouseUpOnPin(e, 'arduino', pinId)}
            />

            {components.map(renderComponent)}
            
            {wirePaths.map(wire => (
                <g key={wire.id}>
                    <path d={wire.path} stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" className="cursor-pointer transition-all hover:stroke-red-500" onClick={() => !isSimulating && onDeleteWire(wire.id)} />
                    <path d={wire.path} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" className="pointer-events-none" />
                </g>
            ))}

            {drawingWirePath && (
                <path
                    d={drawingWirePath}
                    stroke="#fbbf24"
                    strokeWidth="3"
                    strokeDasharray="5 5"
                    className="pointer-events-none"
                />
            )}
        </svg>
    </div>
  );
};
