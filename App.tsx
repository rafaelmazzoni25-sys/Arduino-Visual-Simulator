import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { Breadboard } from './components/Breadboard';
import { SerialMonitor } from './components/SerialMonitor';
import { Controls } from './components/Controls';
import { ComponentPalette } from './components/ComponentPalette';
import { EditComponentModal } from './components/EditComponentModal';
import { ArduinoComponent, SerialLog, ComponentType, Wire, Point } from './types';
import { generateCodeFromPrompt } from './services/geminiService';

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

function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [components, setComponents] = useState<ArduinoComponent[]>([
    { id: 'led-1', type: 'led', pin: 13, label: 'L LED', isOn: false, x: 100, y: 280 },
    { id: 'resistor-1', type: 'resistor', pin: 13, label: '220Ω Resistor', x: 250, y: 280 },
  ]);
  const [arduinoPosition, setArduinoPosition] = useState<Point>({ x: 350, y: 50 });
  const [wires, setWires] = useState<Wire[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [logs, setLogs] = useState<SerialLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<ArduinoComponent | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopSimulation = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setLogs(prev => [...prev, { timestamp: Date.now(), message: "Simulation stopped." }]);
    setComponents(prev => prev.map(c => ({...c, isOn: false, isPressed: false, value: c.type === 'potentiometer' ? c.value : 0})));
  }, []);

  const runSimulation = useCallback(() => {
    console.log("Starting simulation with code:", code);
    setLogs([{ timestamp: Date.now(), message: "Simulation started." }]);

    // This is a very basic mock simulation for the default "Blink" example.
    if (code.includes('pinMode(13, OUTPUT)') && code.includes('digitalWrite(13, HIGH)')) {
      simulationIntervalRef.current = setInterval(() => {
        setComponents(prev => prev.map(c => c.pin === 13 && c.type === 'led' ? {...c, isOn: !c.isOn} : c));
        setLogs(prev => [...prev, { timestamp: Date.now(), message: `LED on pin 13 toggled`}]);
      }, 1000);
    } else {
      setLogs(prev => [...prev, { timestamp: Date.now(), message: "Code not recognized by mock simulator. No components will change."}]);
    }
  }, [code]);

  const handleRunToggle = () => {
    if (isSimulating) {
      setIsSimulating(false);
    } else {
      setError(null);
      setLogs([]);
      setIsSimulating(true);
    }
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
    setArduinoPosition({ x: 350, y: 50 });
    setWires([]);
    setPrompt('');
    setError(null);
  };

  const handleGenerateCode = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    try {
        const generatedCode = await generateCodeFromPrompt(prompt, components, wires);
        setCode(generatedCode);
    } catch (e) {
        setError("Failed to generate code. Please try again.");
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
            <p className="text-sm text-slate-400 mb-4">Tell the AI what you want the Arduino to do. It will generate the code for you.</p>
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
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
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