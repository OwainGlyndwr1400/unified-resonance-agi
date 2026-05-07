import React, { useState } from 'react';

interface Props {
  title: string;
  description: string;
  technicalDetails?: string[];
}

export const InfoButton: React.FC<Props> = ({ title, description, technicalDetails }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block ml-2 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-500 hover:text-cyan-400 transition-colors"
        title="Module Information"
      >
        <i className="fa-regular fa-circle-question"></i>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-6 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-bold text-cyan-400 uppercase">{title}</h4>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed mb-3">
              {description}
            </p>
            {technicalDetails && (
              <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                <h5 className="text-[9px] font-bold text-slate-500 uppercase mb-1">Technical Specs</h5>
                <ul className="space-y-1">
                  {technicalDetails.map((detail, i) => (
                    <li key={i} className="text-[9px] mono text-emerald-400/80 flex items-start gap-1">
                      <span className="text-emerald-500/50">›</span> {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
