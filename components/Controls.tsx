
import React from 'react';

interface ControlsProps {
    isSimulating: boolean;
    onRun: () => void;
    onReset: () => void;
}

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
    </svg>
);

const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
);

export const Controls: React.FC<ControlsProps> = ({ isSimulating, onRun, onReset }) => {
    return (
        <div className="flex items-center space-x-4">
            <button
                onClick={onRun}
                disabled={isSimulating}
                className="flex items-center justify-center px-6 py-2 bg-cyan-500 text-white font-bold rounded-md shadow-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-105"
            >
                {isSimulating ? <StopIcon/> : <PlayIcon />}
                {isSimulating ? 'Simulating...' : 'Run'}
            </button>
            <button
                onClick={onReset}
                className="flex items-center justify-center px-6 py-2 bg-slate-600 text-white font-bold rounded-md shadow-lg hover:bg-slate-700 transition-all duration-200 ease-in-out transform hover:scale-105"
            >
                <ResetIcon />
                Reset
            </button>
        </div>
    );
};
