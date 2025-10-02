import React, { useState, MouseEvent, useMemo, useRef, DragEvent, WheelEvent } from 'react';
import { ArduinoComponent, Wire, Point, Terminal, ComponentType } from '../types';
import { ArduinoBoard, allPins as arduinoPins, Pin } from './ArduinoBoard';
import { LedIcon } from './icons/LedIcon';
import { ButtonIcon } from './icons/ButtonIcon';
import { PotentiometerIcon } from './icons/PotentiometerIcon';
import { ResistorIcon } from './icons/ResistorIcon';
import { ServoIcon } from './icons/ServoIcon';
import { ProtoBoardIcon, protoboardTerminals } from './icons/ProtoBoardIcon';
import { BuzzerIcon } from './icons/BuzzerIcon';
import { SevenSegmentIcon } from './icons/SevenSegmentIcon';
import { LcdIcon } from './icons/LcdIcon';
import { UltrasonicSensorIcon } from './icons/UltrasonicSensorIcon';
import { JoystickIcon } from './icons/JoystickIcon';
import { PirSensorIcon } from './icons/PirSensorIcon';
import { TempSensorIcon } from './icons/TempSensorIcon';
import { RgbLedIcon } from './icons/RgbLedIcon';
import { RelayIcon } from './icons/RelayIcon';
import { KeypadIcon } from './icons/KeypadIcon';
import { DcMotorIcon } from './icons/DcMotorIcon';

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

const protoTerminalsForDimensions: Record<string, Point> = {};
protoboardTerminals.forEach(t => {
  protoTerminalsForDimensions[t.id] = { x: t.x, y: t.y };
});


// Defines component dimensions and terminal locations for precise wiring.
const componentDimensions: Record<string, {width: number, height: number, terminals: Record<string, Point>}> = {
    led: { width: 50, height: 50, terminals: { anode: {x: 20, y: 50}, cathode: {x: 30, y: 50} }},
    resistor: { width: 100, height: 40, terminals: { p1: {x: 0, y: 20}, p2: {x: 100, y: 20} }},
    button: { width: 50, height: 50, terminals: { p1: {x: 18, y: 40}, p2: {x: 32, y: 40} }},
    potentiometer: { width: 50, height: 50, terminals: { p1: {x: 20, y: 50}, p2: {x: 25, y: 50}, p3: {x: 30, y: 50} }},
    servo: { width: 60, height: 60, terminals: { gnd: {x: 20, y: 55}, vcc: {x: 30, y: 55}, signal: {x: 40, y: 55} }},
    buzzer: { width: 40, height: 40, terminals: { p1: {x: 10, y: 40}, p2: {x: 30, y: 40} }},
    seven_segment_display: { width: 50, height: 100, terminals: {
        a: {x: 25, y: 0}, b: {x: 50, y: 25}, c: {x: 50, y: 75}, d: {x: 25, y: 100},
        e: {x: 0, y: 75}, f: {x: 0, y: 25}, g: {x: 0, y: 50}, dp: {x: 50, y: 100},
        com: {x: 25, y: 50} // A central common pin
    }},
    ultrasonic_sensor: { width: 80, height: 50, terminals: {
        vcc: { x: 14, y: 50 },
        trig: { x: 32, y: 50 },
        echo: { x: 50, y: 50 },
        gnd: { x: 68, y: 50 },
    }},
    lcd: { width: 160, height: 50, terminals: {
        vss: { x: 7, y: 0 }, vdd: { x: 16.6, y: 0 }, vo: { x: 26.2, y: 0 }, rs: { x: 35.8, y: 0 },
        rw: { x: 45.4, y: 0 }, e: { x: 55, y: 0 }, d0: { x: 64.6, y: 0 }, d1: { x: 74.2, y: 0 },
        d2: { x: 83.8, y: 0 }, d3: { x: 93.4, y: 0 }, d4: { x: 103, y: 0 }, d5: { x: 112.6, y: 0 },
        d6: { x: 122.2, y: 0 }, d7: { x: 131.8, y: 0 }, a: { x: 141.4, y: 0 }, k: { x: 151, y: 0 },
    }},
    protoboard: { width: 350, height: 200, terminals: protoTerminalsForDimensions },
    joystick: { width: 70, height: 70, terminals: { gnd: {x: 10, y: 0}, vcc: {x: 25, y: 0}, vrx: {x: 40, y: 0}, vry: {x: 55, y: 0}, sw: {x: 70, y: 0} }},
    pir_sensor: { width: 50, height: 60, terminals: { vcc: {x: 15, y: 60}, out: {x: 25, y: 60}, gnd: {x: 35, y: 60} }},
    temp_sensor: { width: 50, height: 50, terminals: { vcc: {x: 20, y: 50}, vout: {x: 25, y: 50}, gnd: {x: 30, y: 50} }},
    rgb_led: { width: 50, height: 60, terminals: { r: {x: 16, y: 60}, gnd: {x: 22, y: 60}, g: {x: 28, y: 60}, b: {x: 34, y: 60} }},
    relay: { width: 80, height: 50, terminals: { In: {x: 15, y: 10}, gnd: {x: 15, y: 25}, vcc: {x: 15, y: 40} }},
    keypad: { width: 100, height: 120, terminals: { 
        r1: {x: 14, y: 120}, r2: {x: 24, y: 120}, r3: {x: 34, y: 120}, r4: {x: 44, y: 120},
        c1: {x: 54, y: 120}, c2: {x: 64, y: 120}, c3: {x: 74, y: 120}, c4: {x: 84, y: 120}
    }},
    dc_motor: { width: 60, height: 50, terminals: { p1: {x: 15, y: 50}, p2: {x: 45, y: 50} }},
};

/**
 * Calculates the absolute position of a terminal on the SVG canvas.
 * @param terminal The terminal to locate.
 * @param components The list of all components.
 * @param arduinoPosition The position of the Arduino board.
 * @returns The {x, y} coordinates of the terminal, or null if not found.
 */
const getTerminalPosition = (terminal: Terminal, components: ArduinoComponent[], arduinoPosition: Point): Point | null => {
    if (terminal.componentId === 'arduino') {
        const pin = arduinoPins.find(p => p.id === terminal.terminalId);
        if (!pin) return null;
        return { x: arduinoPosition.x + pin.x + 6, y: arduinoPosition.y + pin.y + 6 };
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

/**
 * Generates an SVG path string for a clean, U-shaped orthogonal wire.
 * @param startPos The starting point of the wire.
 * @param endPos The ending point of the wire.
 * @returns An SVG path data string.
 */
const getOrthogonalPath = (startPos: Point, endPos: Point): string => {
  const midX = startPos.x + (endPos.x - startPos.x) / 2;
  // Creates a path that goes: Move -> Horizontal -> Vertical -> Horizontal
  return `M ${startPos.x} ${startPos.y} H ${midX} V ${endPos.y} H ${endPos.x}`;
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
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSVGPoint = (e: MouseEvent | DragEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const transformed = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return {
      x: (transformed.x - view.x) / view.scale,
      y: (transformed.y - view.y) / view.scale,
    };
  };
  
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;

    const zoomSpeed = 0.1;
    const direction = e.deltaY > 0 ? -1 : 1;
    const scaleFactor = 1 + direction * zoomSpeed;
    const newScale = Math.max(0.2, Math.min(3, view.scale * scaleFactor));

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const mousePoint = pt.matrixTransform(svg.getScreenCTM()!.inverse());

    setView(prevView => ({
        scale: newScale,
        x: mousePoint.x - (mousePoint.x - prevView.x) * scaleFactor,
        y: mousePoint.y - (mousePoint.y - prevView.y) * scaleFactor,
    }));
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
        const x = dimensions ? point.x - dimensions.width / 2 : point.x;
        const y = dimensions ? point.y - dimensions.height / 2 : point.y;
        onDropComponent(type, { x, y });
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      setIsPanning(true);
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
    if (e.button !== 0) return; // Only allow left-click drag
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
    if (e.button !== 0) return;
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

    if (isPanning) {
        setView(prev => ({
            ...prev,
            x: prev.x + e.movementX,
            y: prev.y + e.movementY,
        }));
        return;
    }

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
    setIsPanning(false);
  };

  const handlePinMouseEnter = (e: React.MouseEvent, pin: Pin) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    
    setTooltip({
        text: pin.label,
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top + 15,
    });
  };

  const handlePinMouseLeave = () => {
      setTooltip(null);
  };

  const renderComponent = (component: ArduinoComponent) => {
    const commonProps = {
        key: component.id,
        onMouseDown: (e: MouseEvent) => handleMouseDownOnComponent(e, component.id),
        onDoubleClick: () => onComponentDoubleClick(component.id),
        className: `cursor-grab ${isSimulating ? 'cursor-not-allowed' : ''}`,
        transform: `translate(${component.x || 0}, ${component.y || 0})`
    };

    const terminalRadius = component.type === 'protoboard' ? 2 : 6;
    const TerminalCircle = ({ terminalId, cx, cy }: { terminalId: string, cx: number, cy: number }) => (
        <circle 
            cx={cx} cy={cy} r={terminalRadius}
            fill="transparent"
            stroke="transparent"
            strokeWidth={10} // Increase clickable area
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
        return <g {...commonProps}><PotentiometerIcon value={typeof component.value === 'number' ? component.value : 0} width={dims.width} height={dims.height} />{terminals}</g>;
      case 'servo':
        return <g {...commonProps}><ServoIcon value={typeof component.value === 'number' ? component.value : 0} width={dims.width} height={dims.height} />{terminals}</g>;
      case 'buzzer':
        return <g {...commonProps}><BuzzerIcon width={dims.width} height={dims.height} />{terminals}</g>;
      case 'seven_segment_display':
        return <g {...commonProps}><SevenSegmentIcon segments={typeof component.value === 'object' ? component.value : {}} width={dims.width} height={dims.height} />{terminals}</g>;
      case 'ultrasonic_sensor':
        return <g {...commonProps}><UltrasonicSensorIcon width={dims.width} height={dims.height} />{terminals}</g>;
      case 'lcd':
        return <g {...commonProps}><LcdIcon width={dims.width} height={dims.height} />{terminals}</g>;
      case 'protoboard':
        return <g {...commonProps}><ProtoBoardIcon width={dims.width} height={dims.height} />{terminals}</g>;
      case 'joystick':
        return <g {...commonProps}><JoystickIcon width={dims.width} height={dims.height} />{terminals}</g>;
      case 'pir_sensor':
        return <g {...commonProps}><PirSensorIcon width={dims.width} height={dims.height} />{terminals}</g>;
      case 'temp_sensor':
        return <g {...commonProps}><TempSensorIcon width={dims.width} height={dims.height} />{terminals}</g>;
      case 'rgb_led':
        return <g {...commonProps}><RgbLedIcon width={dims.width} height={dims.height} />{terminals}</g>;
      case 'relay':
        return <g {...commonProps}><RelayIcon width={dims.width} height={dims.height} />{terminals}</g>;
      case 'keypad':
        return <g {...commonProps}><KeypadIcon width={dims.width} height={dims.height} />{terminals}</g>;
      case 'dc_motor':
        return <g {...commonProps}><DcMotorIcon width={dims.width} height={dims.height} />{terminals}</g>;
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
        path: getOrthogonalPath(startPos, endPos)
    };
  }).filter((p): p is { id: string, path: string } => !!p), [wires, components, arduinoPosition]);
  
  const drawingWirePath = useMemo(() => {
    if (!drawingWire) return null;
    const startPos = getTerminalPosition(drawingWire.start, components, arduinoPosition);
    if (!startPos) return null;
    return getOrthogonalPath(startPos, drawingWire.end);
  }, [drawingWire, components, arduinoPosition]);

  return (
    <div ref={containerRef} className={`bg-slate-900 rounded-lg w-full h-full border border-slate-700 overflow-hidden shadow-lg relative select-none ${isPanning ? 'cursor-grabbing' : ''}`}>
        <svg
            ref={svgRef}
            className="w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onWheel={handleWheel}
        >
            <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(45, 212, 191, 0.1)" strokeWidth="1"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <g transform={`translate(${view.x}, ${view.y}) scale(${view.scale})`}>
              <ArduinoBoard 
                  x={arduinoPosition.x}
                  y={arduinoPosition.y}
                  onBoardMouseDown={handleMouseDownOnArduino}
                  onPinMouseDown={(e, pinId) => handleMouseDownOnPin(e, 'arduino', pinId)}
                  onPinMouseUp={(e, pinId) => handleMouseUpOnPin(e, 'arduino', pinId)}
                  onPinMouseEnter={handlePinMouseEnter}
                  onPinMouseLeave={handlePinMouseLeave}
              />

              {components.map(renderComponent)}
              
              {wirePaths.map(wire => (
                  <g key={wire.id}>
                      <path d={wire.path} stroke="transparent" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" className="cursor-pointer" onClick={() => !isSimulating && onDeleteWire(wire.id)} />
                      <path d={wire.path} stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className="pointer-events-none transition-all hover:stroke-red-500" />
                  </g>
              ))}

              {drawingWirePath && (
                  <path
                      d={drawingWirePath}
                      stroke="#fbbf24"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      fill="none"
                      className="pointer-events-none"
                  />
              )}
            </g>
        </svg>
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button onClick={() => setView(v => ({ ...v, scale: Math.min(3, v.scale + 0.2) }))} className="w-10 h-10 bg-slate-700/80 rounded-full text-xl font-bold hover:bg-slate-600/80 transition-all">+</button>
            <button onClick={() => setView(v => ({ ...v, scale: Math.max(0.2, v.scale - 0.2) }))} className="w-10 h-10 bg-slate-700/80 rounded-full text-xl font-bold hover:bg-slate-600/80 transition-all">-</button>
            <button onClick={() => setView({ scale: 1, x: 0, y: 0 })} className="w-10 h-10 bg-slate-700/80 rounded-full text-sm font-bold hover:bg-slate-600/80 transition-all">Reset</button>
        </div>
        {tooltip && (
            <div
                className="absolute bg-slate-900/90 text-white text-xs font-mono px-2 py-1 rounded-md shadow-lg pointer-events-none z-50 border border-slate-700"
                style={{
                    left: tooltip.x,
                    top: tooltip.y,
                }}
            >
                {tooltip.text}
            </div>
        )}
    </div>
  );
};