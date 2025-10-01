
import React, { useState, useEffect } from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  disabled: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, disabled }) => {
  const [lineCount, setLineCount] = useState(code.split('\n').length);

  useEffect(() => {
    setLineCount(code.split('\n').length);
  }, [code]);

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden h-full flex flex-col border border-slate-700 shadow-lg">
      <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-700 text-cyan-400 font-mono text-sm font-bold">
        Logic Blueprint (Arduino C++)
      </div>
      <div className="flex flex-grow relative">
        <div className="bg-slate-900/30 p-2 text-right text-slate-500 select-none font-mono text-sm">
          <pre className="pr-2">{lineNumbers}</pre>
        </div>
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-grow p-2 bg-transparent text-slate-200 font-mono resize-none focus:outline-none text-sm leading-normal"
          spellCheck="false"
        />
      </div>
    </div>
  );
};
