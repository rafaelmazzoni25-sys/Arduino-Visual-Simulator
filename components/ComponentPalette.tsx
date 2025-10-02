import React, { DragEvent } from 'react';
import { ComponentType } from '../types';
import { LedIcon } from './icons/LedIcon';
import { ButtonIcon } from './icons/ButtonIcon';
import { PotentiometerIcon } from './icons/PotentiometerIcon';
import { ResistorIcon } from './icons/ResistorIcon';
import { ServoIcon } from './icons/ServoIcon';
import { ProtoBoardIcon } from './icons/ProtoBoardIcon';
import { BuzzerIcon } from './icons/BuzzerIcon';
import { SevenSegmentIcon } from './icons/SevenSegmentIcon';

const availableComponents: { type: ComponentType; name: string; icon: React.ReactNode }[] = [
    { type: 'led', name: 'LED', icon: <LedIcon isOn={false} className="w-10 h-10 mx-auto" /> },
    { type: 'button', name: 'Button', icon: <ButtonIcon isPressed={false} className="w-10 h-10 mx-auto" /> },
    { type: 'resistor', name: 'Resistor', icon: <ResistorIcon className="w-16 h-10 mx-auto" /> },
    { type: 'potentiometer', name: 'Potentiometer', icon: <PotentiometerIcon className="w-10 h-10 mx-auto" /> },
    { type: 'servo', name: 'Servo Motor', icon: <ServoIcon className="w-12 h-12 mx-auto" /> },
    { type: 'buzzer', name: 'Buzzer', icon: <BuzzerIcon className="w-10 h-10 mx-auto" /> },
    { type: 'seven_segment_display', name: '7-Segment', icon: <SevenSegmentIcon className="w-8 h-12 mx-auto" /> },
    { type: 'protoboard', name: 'ProtoBoard', icon: <ProtoBoardIcon className="w-24 h-12 mx-auto" /> },
];

const PaletteItem: React.FC<{ type: ComponentType, name: string, icon: React.ReactNode }> = ({ type, name, icon }) => {
    
    const handleDragStart = (e: DragEvent) => {
        e.dataTransfer.setData('componentType', type);
    };

    return (
        <div
            draggable="true"
            onDragStart={handleDragStart}
            className="flex flex-col items-center justify-center p-2 rounded-md bg-slate-800/50 border border-slate-700 cursor-grab hover:bg-slate-700/50 hover:border-cyan-500 transition-all text-center"
            title={`Drag to add a ${name}`}
        >
            <div className="h-12 flex items-center justify-center">{icon}</div>
            <span className="text-xs font-medium text-slate-300 mt-2">{name}</span>
        </div>
    );
};

export const ComponentPalette: React.FC = () => {
    return (
        <div className="flex flex-col gap-4 bg-slate-800/50 rounded-lg p-4 border border-slate-700 shadow-lg w-48">
            <h2 className="text-lg font-bold text-cyan-400 text-center mb-2">Components</h2>
            <div className="flex flex-col gap-3">
                {availableComponents.map(comp => (
                    <PaletteItem key={comp.type} {...comp} />
                ))}
            </div>
        </div>
    );
};
