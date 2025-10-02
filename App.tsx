import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { Breadboard } from './components/Breadboard';
import { SerialMonitor } from './components/SerialMonitor';
import { Controls } from './components/Controls';
import { ComponentPalette } from './components/ComponentPalette';
import { EditComponentModal } from './components/EditComponentModal';
import { ArduinoComponent, SerialLog, ComponentType, Wire, Point, Terminal } from './types';
import { generateSolutionFromPrompt } from './services/geminiService';

const DEFAULT_CODE = `/*
  Blink
  Turns an LED on for one second, then off for one second, repeatedly.
  This example code is in the public domain.
*/

// the setup function runs once when you press reset or power the board
void setup() {
  // initialize digital pin 13 as an output.
  pinMode(13, OUTPUT);
}

// the loop function runs over and over again forever
void loop() {
  digitalWrite(13, HIGH);   // turn the LED on (HIGH is the voltage level)
  delay(1000);              // wait for a second
  digitalWrite(13, LOW);    // turn the LED off by making the voltage LOW
  delay(1000);              // wait for a second
}
`;

/**
 * Validates the circuit connections using a more robust net-based graph analysis.
 * This approach correctly traces connections through protoboards.
 * @param components An array of components in the circuit.
 * @param wires An array of wires connecting the components.
 * @returns An array of error message strings. If the array is empty, the circuit is valid.
 */
const validateCircuit = (components: ArduinoComponent[], wires: Wire[]): string[] => {
    const errors: string[] = [];
    const adj: Map<string, string[]> = new Map();
    const terminalKey = (t: Terminal) => `${t.componentId}::${t.terminalId}`;

    const addEdge = (t1: Terminal, t2: Terminal) => {
        const key1 = terminalKey(t1);
        const key2 = terminalKey(t2);
        if (!adj.has(key1)) adj.set(key1, []);
        if (!adj.has(key2)) adj.set(key2, []);
        adj.get(key1)!.push(key2);
        adj.get(key2)!.push(key1);
    };

    // 1. Build adjacency list from wires
    wires.forEach(w => addEdge(w.start, w.end));

    // 2. Add internal connections for protoboards
    components.filter(c => c.type === 'protoboard').forEach(proto => {
        const numCols = 30;
        // Horizontal Power Rails
        for (let i = 1; i < numCols; i++) {
            addEdge({componentId: proto.id, terminalId: `p-top-plus-${i}`}, {componentId: proto.id, terminalId: `p-top-plus-${i+1}`});
            addEdge({componentId: proto.id, terminalId: `p-top-minus-${i}`}, {componentId: proto.id, terminalId: `p-top-minus-${i+1}`});
            addEdge({componentId: proto.id, terminalId: `p-bottom-plus-${i}`}, {componentId: proto.id, terminalId: `p-bottom-plus-${i+1}`});
            addEdge({componentId: proto.id, terminalId: `p-bottom-minus-${i}`}, {componentId: proto.id, terminalId: `p-bottom-minus-${i+1}`});
        }
        // Vertical Terminal Strips
        const rows1 = ['A', 'B', 'C', 'D', 'E'];
        const rows2 = ['F', 'G', 'H', 'I', 'J'];
        for (let col = 1; col <= numCols; col++) {
            for (let row = 0; row < rows1.length - 1; row++) {
                addEdge({componentId: proto.id, terminalId: `${rows1[row]}-${col}`}, {componentId: proto.id, terminalId: `${rows1[row+1]}-${col}`});
            }
            for (let row = 0; row < rows2.length - 1; row++) {
                 addEdge({componentId: proto.id, terminalId: `${rows2[row]}-${col}`}, {componentId: proto.id, terminalId: `${rows2[row+1]}-${col}`});
            }
        }
    });

    // 3. Build electrical nets
    const terminalToNetId = new Map<string, number>();
    const netContents = new Map<number, Terminal[]>();
    let currentNetId = 0;

    for (const startNodeKey of adj.keys()) {
        if (terminalToNetId.has(startNodeKey)) continue;

        currentNetId++;
        const currentNetTerminals: Terminal[] = [];
        const q: string[] = [startNodeKey];
        const visitedInNet = new Set<string>([startNodeKey]);

        while (q.length > 0) {
            const currKey = q.shift()!;
            terminalToNetId.set(currKey, currentNetId);
            const [componentId, terminalId] = currKey.split('::');
            currentNetTerminals.push({ componentId, terminalId });
            
            const neighbors = adj.get(currKey) || [];
            for (const neighborKey of neighbors) {
                if (!visitedInNet.has(neighborKey)) {
                    visitedInNet.add(neighborKey);
                    q.push(neighborKey);
                }
            }
        }
        netContents.set(currentNetId, currentNetTerminals);
    }

    // 4. Validation logic using the nets
    const isArduinoPin = (terminal: Terminal | null, type: 'digital' | 'analog' | 'gnd' | '5v' | '3.3v') => {
        if (!terminal || terminal.componentId !== 'arduino') return false;
        const pinId = terminal.terminalId;
        if (type === 'gnd') return pinId.startsWith('gnd');
        if (type === '5v') return pinId === '5v';
        if (type === '3.3v') return pinId === '3.3v';
        if (type === 'analog') return pinId.startsWith('A');
        if (type === 'digital') {
            if (pinId.startsWith('A')) return false; // Analog pins are not digital for this check
            const pinNumStr = pinId.startsWith('pin-') ? pinId.substring(4) : pinId;
            const pinNum = parseInt(pinNumStr, 10);
            return !isNaN(pinNum) && pinNum >= 0 && pinNum <= 13;
        }
        return false;
    }
    
    const getNet = (componentId: string, terminalId: string) => {
        const netId = terminalToNetId.get(terminalKey({ componentId, terminalId }));
        return netId ? netContents.get(netId) || [] : [];
    };

    components.forEach(comp => {
        if (comp.type === 'led') {
            const anodeNet = getNet(comp.id, 'anode');
            const cathodeNet = getNet(comp.id, 'cathode');

            if (anodeNet.length === 0 || cathodeNet.length === 0) {
                errors.push(`LED "${comp.label}" is not fully connected.`);
                return;
            }

            if (!cathodeNet.some(t => isArduinoPin(t, 'gnd'))) {
                 errors.push(`The negative leg (cathode) of LED "${comp.label}" must be connected to a GND pin.`);
                 return;
            }
            
            const connectedResistor = anodeNet.find(t => components.some(c => c.id === t.componentId && c.type === 'resistor'));
            if (!connectedResistor) {
                 errors.push(`LED "${comp.label}" must be connected to a resistor on its positive leg (anode).`);
                 return;
            }

            const resComp = components.find(c => c.id === connectedResistor.componentId)!;
            const otherResTerminalId = connectedResistor.terminalId === 'p1' ? 'p2' : 'p1';
            const digitalPinNet = getNet(resComp.id, otherResTerminalId);
            
            if (digitalPinNet.length === 0) {
                 errors.push(`Resistor for LED "${comp.label}" is not fully connected.`);
                 return;
            }
            if (!digitalPinNet.some(t => isArduinoPin(t, 'digital'))) {
                 errors.push(`The resistor for LED "${comp.label}" must be connected to a digital pin.`);
            }
        }
        if (comp.type === 'button') {
            const p1Net = getNet(comp.id, 'p1');
            const p2Net = getNet(comp.id, 'p2');
            if (p1Net.length === 0 || p2Net.length === 0) { errors.push(`Button "${comp.label}" is not fully connected.`); return; }

            const p1ToDigital = p1Net.some(t => isArduinoPin(t, 'digital'));
            const p2ToGnd = p2Net.some(t => isArduinoPin(t, 'gnd'));
            const p1ToGnd = p1Net.some(t => isArduinoPin(t, 'gnd'));
            const p2ToDigital = p2Net.some(t => isArduinoPin(t, 'digital'));
            
            if (!((p1ToDigital && p2ToGnd) || (p2ToDigital && p1ToGnd))) {
                errors.push(`Button "${comp.label}" must be connected between a digital pin and a GND pin.`);
            }
        }
         if (comp.type === 'potentiometer') {
            const p1Net = getNet(comp.id, 'p1'); // Power
            const p2Net = getNet(comp.id, 'p2'); // Wiper
            const p3Net = getNet(comp.id, 'p3'); // Ground
            if (p1Net.length === 0 || p2Net.length === 0 || p3Net.length === 0) { errors.push(`Potentiometer "${comp.label}" is not fully connected.`); return; }

            const wiperOk = p2Net.some(t => isArduinoPin(t, 'analog'));
            const powerOk = (p1Net.some(t => isArduinoPin(t, '5v')) && p3Net.some(t => isArduinoPin(t, 'gnd'))) ||
                            (p3Net.some(t => isArduinoPin(t, '5v')) && p1Net.some(t => isArduinoPin(t, 'gnd')));

            if (!wiperOk || !powerOk) {
                errors.push(`Potentiometer "${comp.label}" must have its outer pins connected to 5V and GND, and the middle pin to an Analog pin (A0-A5).`);
            }
        }
        if (comp.type === 'servo') {
            const signalNet = getNet(comp.id, 'signal');
            const vccNet = getNet(comp.id, 'vcc');
            const gndNet = getNet(comp.id, 'gnd');
            if (signalNet.length === 0 || vccNet.length === 0 || gndNet.length === 0) { errors.push(`Servo "${comp.label}" is not fully connected.`); return; }

            if (!signalNet.some(t => isArduinoPin(t, 'digital')) || !vccNet.some(t => isArduinoPin(t, '5v')) || !gndNet.some(t => isArduinoPin(t, 'gnd'))) {
                errors.push(`Servo "${comp.label}" must have its signal pin connected to a digital pin, VCC to 5V, and GND to a GND pin.`);
            }
        }
        if (comp.type === 'buzzer') {
            const p1Net = getNet(comp.id, 'p1');
            const p2Net = getNet(comp.id, 'p2');
            if (p1Net.length === 0 || p2Net.length === 0) { errors.push(`Buzzer "${comp.label}" is not fully connected.`); return; }

            const p1ToDigital = p1Net.some(t => isArduinoPin(t, 'digital'));
            const p2ToGnd = p2Net.some(t => isArduinoPin(t, 'gnd'));
            const p1ToGnd = p1Net.some(t => isArduinoPin(t, 'gnd'));
            const p2ToDigital = p2Net.some(t => isArduinoPin(t, 'digital'));
            
            if (!((p1ToDigital && p2ToGnd) || (p2ToDigital && p1ToGnd))) {
                errors.push(`Buzzer "${comp.label}" must be connected between a digital pin and a GND pin.`);
            }
        }
        if (comp.type === 'seven_segment_display') {
            const comNet = getNet(comp.id, 'com');
            if (comNet.length > 0) {
                if (!comNet.some(t => isArduinoPin(t, 'gnd'))) {
                    errors.push(`7-Segment Display "${comp.label}" common pin must be connected to a GND pin (assuming common cathode).`);
                }
            }
            const segmentTerminals = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'];
            for (const term of segmentTerminals) {
                const segNet = getNet(comp.id, term);
                if (segNet.length > 0) {
                    if (!segNet.some(t => isArduinoPin(t, 'digital'))) {
                        errors.push(`Segment '${term}' of 7-Segment Display "${comp.label}" is connected, but not to a digital pin.`);
                    }
                }
            }
        }
        if (comp.type === 'ultrasonic_sensor') {
            const vccNet = getNet(comp.id, 'vcc');
            const trigNet = getNet(comp.id, 'trig');
            const echoNet = getNet(comp.id, 'echo');
            const gndNet = getNet(comp.id, 'gnd');
            if (vccNet.length === 0 || trigNet.length === 0 || echoNet.length === 0 || gndNet.length === 0) {
                errors.push(`Ultrasonic Sensor "${comp.label}" is not fully connected.`);
                return;
            }
            if (!vccNet.some(t => isArduinoPin(t, '5v'))) errors.push(`Ultrasonic Sensor "${comp.label}" VCC pin must be connected to 5V.`);
            if (!gndNet.some(t => isArduinoPin(t, 'gnd'))) errors.push(`Ultrasonic Sensor "${comp.label}" GND pin must be connected to GND.`);
            if (!trigNet.some(t => isArduinoPin(t, 'digital'))) errors.push(`Ultrasonic Sensor "${comp.label}" Trig pin must be connected to a digital pin.`);
            if (!echoNet.some(t => isArduinoPin(t, 'digital'))) errors.push(`Ultrasonic Sensor "${comp.label}" Echo pin must be connected to a digital pin.`);
        }
        if (comp.type === 'lcd') {
            const vssNet = getNet(comp.id, 'vss'); // Pin 1
            const vddNet = getNet(comp.id, 'vdd'); // Pin 2
            const rsNet = getNet(comp.id, 'rs');   // Pin 4
            const eNet = getNet(comp.id, 'e');     // Pin 6
            const d4Net = getNet(comp.id, 'd4');   // Pin 11
            const d5Net = getNet(comp.id, 'd5');   // Pin 12
            const d6Net = getNet(comp.id, 'd6');   // Pin 13
            const d7Net = getNet(comp.id, 'd7');   // Pin 14

            if ([vssNet, vddNet, rsNet, eNet, d4Net, d5Net, d6Net, d7Net].some(net => net.length === 0)) {
                errors.push(`LCD "${comp.label}" is not fully connected. Ensure at least VSS, VDD, RS, E, and D4-D7 are wired.`);
                return;
            }
            if (!vssNet.some(t => isArduinoPin(t, 'gnd'))) errors.push(`LCD "${comp.label}" VSS pin must be connected to GND.`);
            if (!vddNet.some(t => isArduinoPin(t, '5v'))) errors.push(`LCD "${comp.label}" VDD pin must be connected to 5V.`);
            if (!rsNet.some(t => isArduinoPin(t, 'digital'))) errors.push(`LCD "${comp.label}" RS pin must be connected to a digital pin.`);
            if (!eNet.some(t => isArduinoPin(t, 'digital'))) errors.push(`LCD "${comp.label}" E pin must be connected to a digital pin.`);
            if (!d4Net.some(t => isArduinoPin(t, 'digital'))) errors.push(`LCD "${comp.label}" D4 pin must be connected to a digital pin.`);
            if (!d5Net.some(t => isArduinoPin(t, 'digital'))) errors.push(`LCD "${comp.label}" D5 pin must be connected to a digital pin.`);
            if (!d6Net.some(t => isArduinoPin(t, 'digital'))) errors.push(`LCD "${comp.label}" D6 pin must be connected to a digital pin.`);
            if (!d7Net.some(t => isArduinoPin(t, 'digital'))) errors.push(`LCD "${comp.label}" D7 pin must be connected to a digital pin.`);
        }
        if (comp.type === 'joystick') {
            if (!getNet(comp.id, 'gnd').some(t => isArduinoPin(t, 'gnd'))) errors.push(`Joystick "${comp.label}" GND must be connected to a GND pin.`);
            if (!getNet(comp.id, 'vcc').some(t => isArduinoPin(t, '5v'))) errors.push(`Joystick "${comp.label}" +5V must be connected to a 5V pin.`);
            if (!getNet(comp.id, 'vrx').some(t => isArduinoPin(t, 'analog'))) errors.push(`Joystick "${comp.label}" VRx must be connected to an Analog pin.`);
            if (!getNet(comp.id, 'vry').some(t => isArduinoPin(t, 'analog'))) errors.push(`Joystick "${comp.label}" VRy must be connected to an Analog pin.`);
            if (getNet(comp.id, 'sw').length > 0 && !getNet(comp.id, 'sw').some(t => isArduinoPin(t, 'digital'))) {
                 errors.push(`Joystick "${comp.label}" SW pin is connected, but not to a digital pin.`);
            }
        }
        if (comp.type === 'pir_sensor') {
            if (!getNet(comp.id, 'gnd').some(t => isArduinoPin(t, 'gnd'))) errors.push(`PIR Sensor "${comp.label}" GND must be connected to a GND pin.`);
            if (!getNet(comp.id, 'vcc').some(t => isArduinoPin(t, '5v'))) errors.push(`PIR Sensor "${comp.label}" VCC must be connected to a 5V pin.`);
            if (!getNet(comp.id, 'out').some(t => isArduinoPin(t, 'digital'))) errors.push(`PIR Sensor "${comp.label}" OUT must be connected to a digital pin.`);
        }
        if (comp.type === 'temp_sensor') {
            if (!getNet(comp.id, 'gnd').some(t => isArduinoPin(t, 'gnd'))) errors.push(`Temp Sensor "${comp.label}" GND must be connected to a GND pin.`);
            if (!getNet(comp.id, 'vcc').some(t => isArduinoPin(t, '5v'))) errors.push(`Temp Sensor "${comp.label}" VCC must be connected to a 5V pin.`);
            if (!getNet(comp.id, 'vout').some(t => isArduinoPin(t, 'analog'))) errors.push(`Temp Sensor "${comp.label}" Vout must be connected to an Analog pin.`);
        }
        if (comp.type === 'rgb_led') {
            if (!getNet(comp.id, 'gnd').some(t => isArduinoPin(t, 'gnd'))) errors.push(`RGB LED "${comp.label}" common cathode (GND) must be connected to a GND pin.`);
            if (getNet(comp.id, 'r').length > 0 && !getNet(comp.id, 'r').some(t => isArduinoPin(t, 'digital'))) errors.push(`RGB LED "${comp.label}" R pin is connected, but not to a digital pin.`);
            if (getNet(comp.id, 'g').length > 0 && !getNet(comp.id, 'g').some(t => isArduinoPin(t, 'digital'))) errors.push(`RGB LED "${comp.label}" G pin is connected, but not to a digital pin.`);
            if (getNet(comp.id, 'b').length > 0 && !getNet(comp.id, 'b').some(t => isArduinoPin(t, 'digital'))) errors.push(`RGB LED "${comp.label}" B pin is connected, but not to a digital pin.`);
        }
        if (comp.type === 'relay') {
            if (!getNet(comp.id, 'gnd').some(t => isArduinoPin(t, 'gnd'))) errors.push(`Relay "${comp.label}" GND must be connected to a GND pin.`);
            if (!getNet(comp.id, 'vcc').some(t => isArduinoPin(t, '5v'))) errors.push(`Relay "${comp.label}" VCC must be connected to a 5V pin.`);
            if (!getNet(comp.id, 'In').some(t => isArduinoPin(t, 'digital'))) errors.push(`Relay "${comp.label}" IN must be connected to a digital pin.`);
        }
        if (comp.type === 'keypad') {
            const pins = ['r1', 'r2', 'r3', 'r4', 'c1', 'c2', 'c3', 'c4'];
            for (const pin of pins) {
                if (getNet(comp.id, pin).length > 0 && !getNet(comp.id, pin).some(t => isArduinoPin(t, 'digital'))) {
                    errors.push(`Keypad "${comp.label}" pin ${pin.toUpperCase()} is connected, but not to a digital pin.`);
                }
            }
        }
        if (comp.type === 'dc_motor') {
             const p1Net = getNet(comp.id, 'p1');
             const p2Net = getNet(comp.id, 'p2');
             if (p1Net.length === 0 || p2Net.length === 0) { errors.push(`DC Motor "${comp.label}" is not fully connected.`); return; }
             const p1IsGnd = p1Net.some(t => isArduinoPin(t, 'gnd'));
             const p2IsGnd = p2Net.some(t => isArduinoPin(t, 'gnd'));
             const p1IsDigital = p1Net.some(t => isArduinoPin(t, 'digital'));
             const p2IsDigital = p2Net.some(t => isArduinoPin(t, 'digital'));

             if (!((p1IsGnd && p2IsDigital) || (p2IsGnd && p1IsDigital))) {
                 errors.push(`DC Motor "${comp.label}" must be connected between a digital pin and a GND pin. (Note: A motor driver is recommended in real circuits).`);
             }
        }

    });

    return errors;
};

function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [components, setComponents] = useState<ArduinoComponent[]>([
    { id: 'led-1', type: 'led', pin: 13, label: 'L LED', isOn: false, x: 100, y: 280 },
    { id: 'resistor-1', type: 'resistor', pin: 13, label: '220Ω Resistor', x: 250, y: 280 },
  ]);
  const [arduinoPosition, setArduinoPosition] = useState<Point>({ x: 50, y: 20 });
  const [wires, setWires] = useState<Wire[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [logs, setLogs] = useState<SerialLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wiringInstructions, setWiringInstructions] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<ArduinoComponent | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationStartTimeRef = useRef<number | null>(null);

  const stopSimulation = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    if (simulationStartTimeRef.current) {
      const elapsed = Date.now() - simulationStartTimeRef.current;
      setLogs(prev => [...prev, { timestamp: elapsed, message: "Simulation stopped." }]);
    }
    setComponents(prev => prev.map(c => ({...c, isOn: false, isPressed: false, value: c.type === 'potentiometer' ? c.value : 0})));
  }, []);

  const runSimulation = useCallback(() => {
    if (!simulationStartTimeRef.current) return;
    const startTime = simulationStartTimeRef.current;
    
    console.log("Starting simulation with code:", code);
    setLogs([{ timestamp: 0, message: "Simulation started." }]);

    // This is a very basic mock simulation for the default "Blink" example.
    if (code.includes('pinMode(13, OUTPUT)') && code.includes('digitalWrite(13, HIGH)')) {
      simulationIntervalRef.current = setInterval(() => {
        setComponents(prev => prev.map(c => c.pin === 13 && c.type === 'led' ? {...c, isOn: !c.isOn} : c));
        const elapsed = Date.now() - startTime;
        setLogs(prev => [...prev, { timestamp: elapsed, message: `LED on pin 13 toggled`}]);
      }, 1000);
    } else {
      const elapsed = Date.now() - startTime;
      setLogs(prev => [...prev, { timestamp: elapsed, message: "Code not recognized by mock simulator. No components will change."}]);
    }
  }, [code]);

  const handleRunToggle = () => {
    if (isSimulating) {
      setIsSimulating(false);
      return;
    }

    setError(null);
    const validationErrors = validateCircuit(components, wires);
    if (validationErrors.length > 0) {
        setError(validationErrors.join('\n'));
        return; // Block simulation
    }
    
    setLogs([]);
    simulationStartTimeRef.current = Date.now();
    setIsSimulating(true);
  };
  
  useEffect(() => {
    if (isSimulating) {
      runSimulation();
    } else {
      stopSimulation();
    }
    return stopSimulation;
  }, [isSimulating, runSimulation, stopSimulation]);


  const handleReset = () => {
    if(isSimulating) setIsSimulating(false);
    setLogs([]);
    setCode(DEFAULT_CODE);
    setComponents([
        { id: 'led-1', type: 'led', pin: 13, label: 'L LED', isOn: false, x: 100, y: 280 },
        { id: 'resistor-1', type: 'resistor', pin: 13, label: '220Ω Resistor', x: 250, y: 280 },
    ]);
    setArduinoPosition({ x: 50, y: 20 });
    setWires([]);
    setPrompt('');
    setError(null);
    setWiringInstructions(null);
    simulationStartTimeRef.current = null;
  };

  const handleGenerateCode = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    setWiringInstructions(null);
    try {
        const solution = await generateSolutionFromPrompt(prompt, components, wires);
        setCode(solution.code);
        setWiringInstructions(solution.wiring);
    } catch (e) {
        setError("Failed to generate solution. Please try again.");
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDropComponent = (type: ComponentType, position: Point) => {
    const newComponent: ArduinoComponent = {
        id: `${type}-${Date.now()}`,
        type,
        pin: 0, // Default pin, can be changed by wiring
        label: `New ${type}`,
        x: position.x,
        y: position.y,
        ...(type === 'led' && { isOn: false }),
        ...(type === 'button' && { isPressed: false }),
        ...(type === 'potentiometer' && { value: 0 }),
        ...(type === 'servo' && { value: 0 }),
        ...(type === 'seven_segment_display' && { value: {} }),
    };
    setComponents(prev => [...prev, newComponent]);
  };

  const handleComponentUpdate = (id: string, updates: Partial<ArduinoComponent>) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingComponent(prev => prev ? { ...prev, ...updates } : null);
  };
  
  const handleArduinoPositionUpdate = (newPosition: Point) => {
    setArduinoPosition(newPosition);
  };

  const handleAddWire = (wire: Omit<Wire, 'id'>) => {
    setWires(prev => [...prev, { ...wire, id: `wire-${Date.now()}` }]);
  };

  const handleDeleteWire = (id: string) => {
    setWires(prev => prev.filter(w => w.id !== id));
  };

  const handleEditComponent = useCallback((componentId: string) => {
    const componentToEdit = components.find(c => c.id === componentId);
    setEditingComponent(componentToEdit || null);
  }, [components]);

  const handleCloseEditModal = () => {
    setEditingComponent(null);
  };
  
  const handleDeleteComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    setWires(prev => prev.filter(w => w.start.componentId !== id && w.end.componentId !== id));
    handleCloseEditModal();
  };


  return (
    <div className="bg-slate-900/50 text-slate-100 min-h-screen font-sans flex flex-col p-4 gap-4 max-w-screen-2xl mx-auto w-full">
      <header className="flex flex-wrap justify-between items-center pb-4 border-b border-slate-700 gap-4">
        <h1 className="text-3xl font-bold text-cyan-400">Arduino GPT Simulator</h1>
        <Controls isSimulating={isSimulating} onRun={handleRunToggle} onReset={handleReset} />
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow min-h-0">
        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 shadow-lg">
            <h2 className="text-xl font-bold text-cyan-400 mb-2">1. Describe Your Logic</h2>
            <p className="text-sm text-slate-400 mb-4">Tell the AI what you want the Arduino to do. It will generate the code and wiring instructions for you.</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Make the LED on pin 13 blink every half second'"
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    disabled={isLoading || isSimulating}
                />
                <button
                    onClick={handleGenerateCode}
                    disabled={isLoading || isSimulating || !prompt}
                    className="px-6 py-2 bg-cyan-500 text-white font-bold rounded-md shadow-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </div>
            {error && <p className="text-red-400 mt-2 text-sm whitespace-pre-line">{error}</p>}
             {wiringInstructions && (
                <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700 rounded-md max-h-48 overflow-y-auto">
                    <h3 className="text-lg font-bold text-amber-400 mb-2">Wiring Instructions</h3>
                    <div className="text-slate-300 text-sm whitespace-pre-line">
                        {wiringInstructions}
                    </div>
                </div>
            )}
          </div>
          <div className="flex-grow min-h-[300px]">
            <CodeEditor code={code} onChange={setCode} disabled={isSimulating} />
          </div>
          <div className="min-h-[200px]">
            <SerialMonitor logs={logs} />
          </div>
        </div>

        <div className="lg:col-span-7 flex gap-4 min-h-0">
          <ComponentPalette />
          <div className="flex-grow min-h-[400px]">
            <Breadboard
              components={components}
              wires={wires}
              onComponentUpdate={handleComponentUpdate}
              onAddWire={handleAddWire}
              onDeleteWire={handleDeleteWire}
              onDropComponent={handleDropComponent}
              onComponentDoubleClick={handleEditComponent}
              isSimulating={isSimulating}
              arduinoPosition={arduinoPosition}
              onArduinoPositionUpdate={handleArduinoPositionUpdate}
            />
          </div>
        </div>
      </main>
      {editingComponent && (
        <EditComponentModal
            component={editingComponent}
            onClose={handleCloseEditModal}
            onUpdate={handleComponentUpdate}
            onDelete={handleDeleteComponent}
        />
      )}
    </div>
  );
}

export default App;
