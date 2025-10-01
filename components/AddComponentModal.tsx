import React, { useState } from 'react';
import { ComponentType } from '../types';

interface AddComponentModalProps {
  onClose: () => void;
  onAddComponent: (type: ComponentType, pin: number, label: string) => void;
}

const availableComponents: { type: ComponentType; name: string; isAnalog?: boolean }[] = [
    { type: 'led', name: 'LED' },
    { type: 'button', name: 'Push Button' },
    { type: 'potentiometer', name: 'Potentiometer', isAnalog: true },
    { type: 'servo', name: 'Servo Motor' },
    { type: 'resistor', name: 'Resistor' },
];

export const AddComponentModal: React.FC<AddComponentModalProps> = ({ onClose, onAddComponent }) => {
  const [componentType, setComponentType] = useState<ComponentType>('led');
  const [pin, setPin] = useState<number>(13);
  const [label, setLabel] = useState<string>('My LED');

  const selectedComponent = availableComponents.find(c => c.type === componentType);
  const isAnalog = selectedComponent?.isAnalog || false;


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const maxPin = isAnalog ? 5 : 13;
    if (!label.trim() || pin < 0 || pin > maxPin) {
      alert(`Please provide a valid label and a pin number between 0 and ${maxPin}.`);
      return;
    }
    onAddComponent(componentType, pin, label);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">Add New Component</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="componentType" className="block text-slate-300 mb-2 font-medium">Component Type</label>
            <select
              id="componentType"
              value={componentType}
              onChange={(e) => setComponentType(e.target.value as ComponentType)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            >
              {availableComponents.map(c => (
                <option key={c.type} value={c.type}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="label" className="block text-slate-300 mb-2 font-medium">Label</label>
            <input
              id="label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="e.g., 'Red LED'"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="pin" className="block text-slate-300 mb-2 font-medium">{isAnalog ? 'Analog Pin (A0-A5)' : 'Digital Pin (0-13)'}</label>
            <input
              id="pin"
              type="number"
              value={pin}
              onChange={(e) => setPin(parseInt(e.target.value, 10))}
              min="0"
              max={isAnalog ? 5 : 13}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-600 text-white font-bold rounded-md hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-cyan-500 text-white font-bold rounded-md hover:bg-cyan-600 transition-all"
            >
              Add Component
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};