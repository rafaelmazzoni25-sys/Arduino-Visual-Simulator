
import React, { useRef, useEffect } from 'react';
import type { SerialLog } from '../types';

interface SerialMonitorProps {
  logs: SerialLog[];
}

export const SerialMonitor: React.FC<SerialMonitorProps> = ({ logs }) => {
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black/50 rounded-lg overflow-hidden h-full flex flex-col border border-slate-700 shadow-lg">
      <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-700 text-cyan-400 font-mono text-sm font-bold">
        Serial Monitor
      </div>
      <div className="flex-grow p-4 font-mono text-lime-400 text-sm overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="flex">
            <span className="text-slate-500 mr-4">{log.timestamp.toString().padStart(5, ' ')}ms:</span>
            <span>{log.message}</span>
          </div>
        ))}
         <div ref={endOfLogsRef} />
      </div>
    </div>
  );
};
