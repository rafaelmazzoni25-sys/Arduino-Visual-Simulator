import React, { useState, useEffect } from 'react';
import { ArduinoComponent } from '../types';

interface EditComponentModalProps {
  component: ArduinoComponent;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<ArduinoComponent>) => void;
  onDelete: (id:string) => void;
}

export const EditComponentModal: React.FC<EditComponentModalProps> = ({ component, onClose, onUpdate, onDelete }) => {
  const [label, setLabel] = useState(component.label);

  useEffect(() => {
    setLabel(component.label);
  }, [component]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(component.id, { label });
    onClose();
  };
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${component.label}"? This will also remove any connected wires.`)) {
        onDelete(component.id);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold text-cyan-400 mb-1">Edit Component</h2>
        <p className="text-sm text-slate-400 mb-6">Component ID: <span className="font-mono">{component.id}</span></p>
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label htmlFor="label" className="block text-slate-300 mb-2 font-medium">Label</label>
            <input
              id="label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="pin" className="block text-slate-300 mb-2 font-medium">Main Pin</label>
            <input
              id="pin"
              type="number"
              value={component.pin}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-400 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-slate-500 mt-1">The pin is determined by how you wire the component to the Arduino.</p>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-all shadow-lg"
            >
                Delete
            </button>
            <div className="flex gap-4">
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
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
