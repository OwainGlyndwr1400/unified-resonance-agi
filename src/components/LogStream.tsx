import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal, AlertCircle, Info } from 'lucide-react';

interface LogStreamProps {
  logs: LogEntry[];
}

function levelClass(level: LogEntry['level']): string {
  if (level === 'ERROR')  return 'text-red-400';
  if (level === 'WARN')   return 'text-amber-400';
  if (level === 'SYSTEM') return 'text-blue-300 font-bold';
  return 'text-gray-300';
}

function LevelIcon({ level }: { level: LogEntry['level'] }) {
  if (level === 'ERROR')  return <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />;
  if (level === 'WARN')   return <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />;
  if (level === 'SYSTEM') return <Terminal className="w-3 h-3 text-blue-400 shrink-0" />;
  return <Info className="w-3 h-3 text-slate-500 shrink-0" />;
}

export const LogStream: React.FC<LogStreamProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-black/90 border border-slate-800 rounded-xl p-4 font-mono text-xs h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2 shrink-0">
        <h2 className="text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Terminal className="w-3 h-3" /> Cognitive Relay
        </h2>
        <span className="text-[10px] text-emerald-500 animate-pulse">● LIVE</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
        {logs.length === 0 && (
          <div className="text-slate-600 text-[10px] pt-2">Awaiting system events...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 items-start hover:bg-white/5 p-1 rounded transition-colors">
            <span className="text-slate-600 w-20 shrink-0 select-none pt-px">
              {log.timestamp.split(' ')[1] || log.timestamp}
            </span>
            <LevelIcon level={log.level} />
            <span className={`break-all ${levelClass(log.level)}`}>
              <span className="text-slate-600 mr-1">[{log.source}]</span>
              {log.message}
            </span>
          </div>
        ))}
        <div className="h-2" />
      </div>
    </div>
  );
};
