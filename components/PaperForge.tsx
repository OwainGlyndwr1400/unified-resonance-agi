import React, { useState, useEffect } from 'react';
import { NeuralChunk } from '../types';
import { askGnosis } from '../services/geminiService';
import { retrieveNeuralContext, loadChunksFromDB } from '../utils/memoryDB';

interface PaperForgeProps {
  onBack: () => void;
}

export const PaperForge: React.FC<PaperForgeProps> = ({ onBack }) => {
  const [neuralArchive, setNeuralArchive] = useState<NeuralChunk[]>([]);
  const [topic, setTopic] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChunksFromDB().then(chunks => {
      if (chunks) setNeuralArchive(chunks);
    }).catch(err => console.error("Failed to load archive for forge", err));

    // Check for codex theorem import
    const codexImport = sessionStorage.getItem('paperforge_codex_import');
    if (codexImport) {
      setTopic(prev => prev ? prev + '\n\n' + codexImport : codexImport);
      sessionStorage.removeItem('paperforge_codex_import');
    }

    // Check for Gnosis conversation import
    const gnosisImport = sessionStorage.getItem('paperforge_gnosis_import');
    if (gnosisImport) {
      setDraft(prev => prev ? prev + '\n\n' + gnosisImport : gnosisImport);
      sessionStorage.removeItem('paperforge_gnosis_import');
    }
  }, []);

  const handleAction = async (action: string) => {
    if (!topic.trim() && !draft.trim()) return;
    setLoading(true);

    let prompt = '';
    const { contextString } = retrieveNeuralContext(topic || draft, neuralArchive, 'api');

    switch (action) {
      case 'title':
        prompt = `Generate 5 compelling academic titles for a paper about:\n${topic || draft}\n\nUse the following context if relevant:\n${contextString}`;
        break;
      case 'abstract':
        prompt = `Draft a professional academic abstract (250 words max) based on the following topic/notes:\n${topic || draft}\n\nUse the following context to enrich the abstract:\n${contextString}`;
        break;
      case 'contradictions':
        prompt = `Analyze the following text for logical contradictions, weak arguments, or inconsistencies with known physics/math:\n${draft || topic}\n\nCross-reference with this context:\n${contextString}`;
        break;
      case 'style':
        prompt = `Rewrite the following text to sound more like a formal academic paper published in a high-impact physics or mathematics journal:\n${draft || topic}`;
        break;
      case 'evidence':
        prompt = `Find the strongest supporting evidence and citations from the neural archive for the following claims:\n${draft || topic}\n\nArchive Context:\n${contextString}`;
        break;
    }

    try {
      const response = await askGnosis(prompt, "", "", contextString, "", [], 'gemini-3.1-pro-preview', 'research');
      setDraft(prev => prev + `\n\n--- [${action.toUpperCase()}] ---\n` + response);
    } catch (err) {
      console.error(err);
      setDraft(prev => prev + `\n\n--- [ERROR] ---\nFailed to generate ${action}.`);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-hidden">
      <header className="h-16 flex-shrink-0 flex items-center px-8 border-b border-slate-800 bg-slate-900/50">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors mr-4">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-xl font-bold text-amber-400 flex items-center gap-2 uppercase tracking-widest">
          <i className="fa-solid fa-hammer"></i> Paper Forge
        </h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tools */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Forge Tools</h2>
          
          <button onClick={() => handleAction('title')} disabled={loading} className="text-left px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-3">
            <i className="fa-solid fa-heading text-amber-400 w-5 text-center"></i>
            <span className="text-sm font-medium">Generate Titles</span>
          </button>
          
          <button onClick={() => handleAction('abstract')} disabled={loading} className="text-left px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-3">
            <i className="fa-solid fa-align-left text-amber-400 w-5 text-center"></i>
            <span className="text-sm font-medium">Draft Abstract</span>
          </button>

          <button onClick={() => handleAction('evidence')} disabled={loading} className="text-left px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-3">
            <i className="fa-solid fa-magnifying-glass text-amber-400 w-5 text-center"></i>
            <span className="text-sm font-medium">Bundle Evidence</span>
          </button>

          <button onClick={() => handleAction('contradictions')} disabled={loading} className="text-left px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-3">
            <i className="fa-solid fa-shield-halved text-amber-400 w-5 text-center"></i>
            <span className="text-sm font-medium">Spot Contradictions</span>
          </button>

          <button onClick={() => handleAction('style')} disabled={loading} className="text-left px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-3">
            <i className="fa-solid fa-pen-nib text-amber-400 w-5 text-center"></i>
            <span className="text-sm font-medium">Academic Shift</span>
          </button>

          {loading && (
            <div className="mt-4 text-amber-400 text-sm flex items-center justify-center gap-2 animate-pulse">
              <i className="fa-solid fa-spinner fa-spin"></i> Forging...
            </div>
          )}
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col p-6 gap-4 bg-slate-950">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Topic / Seed Notes</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your core thesis, topic, or rough notes here..."
              className="w-full h-24 bg-slate-900 border border-slate-800 rounded-lg p-4 text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
              <span>Draft Workspace</span>
              <button onClick={() => setDraft('')} className="text-slate-500 hover:text-rose-400 transition-colors">
                <i className="fa-solid fa-trash"></i> Clear
              </button>
            </label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Your drafted paper will appear here. You can also paste existing text here to analyze or rewrite it."
              className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-4 text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none font-serif leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
