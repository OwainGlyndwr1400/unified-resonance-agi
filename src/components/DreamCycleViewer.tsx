import React from 'react';
import { DreamCycle } from '../types';
import { BrainCircuit, GitCommit, ChevronRight } from 'lucide-react';

interface DreamCycleViewerProps {
  dreams: DreamCycle[];
}

export const DreamCycleViewer: React.FC<DreamCycleViewerProps> = ({ dreams }) => {
  return (
    <div className="bg-black/80 border border-white/10 rounded-xl p-4 backdrop-blur-md">
      <h2 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <BrainCircuit className="w-3 h-3" /> Dream Cycles
      </h2>
      <div className="space-y-4">
        {dreams.map((dream) => (
          <div key={dream.id} className="border border-white/5 rounded-lg p-3 bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-purple-400 uppercase">{dream.lens}</span>
                <span className="text-[10px] text-gray-500 font-mono">ID: {dream.sigil}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${dream.status === 'active' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-gray-700 text-gray-500'}`}>
                {dream.status}
              </span>
            </div>
            
            <div className="text-sm text-gray-300 font-serif italic mb-3 pl-2 border-l-2 border-purple-500/30">
              "{dream.seed}"
            </div>

            <div className="space-y-1 pl-4 border-l border-white/5">
              {dream.chain.map((link, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                  <GitCommit className="w-3 h-3 text-gray-700" />
                  <span className="truncate">{link}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
