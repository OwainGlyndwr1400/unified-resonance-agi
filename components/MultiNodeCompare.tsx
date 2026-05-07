import React, { useState, useEffect } from 'react';
import { NeuralChunk } from '../types';
import { askGnosis } from '../services/geminiService';
import { askLocalGnosis } from '../services/localLlmService';
import { retrieveNeuralContext, loadChunksFromDB } from '../utils/memoryDB';
import { GEMINI_MODELS } from '../constants';

interface MultiNodeCompareProps {
  appStateContext: string;
  onBack: () => void;
}

interface ModelResult {
  modelId: string;
  response: string;
  latency: number;
  tokensUsed: number;
  error?: string;
}

export const MultiNodeCompare: React.FC<MultiNodeCompareProps> = ({ appStateContext, onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ModelResult[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>(['local', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-preview']);
  const [neuralArchive, setNeuralArchive] = useState<NeuralChunk[]>([]);

  useEffect(() => {
    loadChunksFromDB().then(chunks => {
      if (chunks) setNeuralArchive(chunks);
    }).catch(err => console.error("Failed to load archive for comparison", err));
  }, []);

  const handleCompare = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResults([]);

    const promises = selectedModels.map(async (modelId) => {
      const startTime = Date.now();
      let responseText = '';
      let errorText = '';
      let tokensUsed = 0;

      try {
        const isLocal = modelId === 'local';
        const { contextString, inspectionData } = retrieveNeuralContext(prompt, neuralArchive, isLocal ? 'local' : 'api');
        
        if (isLocal) {
          responseText = await askLocalGnosis(prompt, "", "", contextString, appStateContext, [], 'local-model', 'http://127.0.0.1:1234/v1', 'research');
          tokensUsed = inspectionData?.totalBudgetUsed || 0;
        } else {
          responseText = await askGnosis(prompt, "", "", contextString, appStateContext, [], modelId, 'research');
          tokensUsed = inspectionData?.totalBudgetUsed || 0;
        }
      } catch (err: any) {
        errorText = err.message || 'Error generating response';
      }

      const latency = Date.now() - startTime;

      return {
        modelId,
        response: responseText,
        latency,
        tokensUsed,
        error: errorText
      };
    });

    const completedResults = await Promise.all(promises);
    setResults(completedResults);
    setLoading(false);
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) ? prev.filter(id => id !== modelId) : [...prev, modelId]
    );
  };

  const allModels = [
    { id: 'local', name: 'Local Model (Qwen/Nemotron)' },
    ...GEMINI_MODELS
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 p-4 overflow-hidden">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
          <i className="fa-solid fa-code-compare"></i> Multi-Node Comparison
        </h2>
      </div>

      <div className="mb-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
        <label className="block text-sm font-medium text-slate-400 mb-2">Select Models to Compare</label>
        <div className="flex flex-wrap gap-2">
          {allModels.map(model => (
            <button
              key={model.id}
              onClick={() => toggleModel(model.id)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedModels.includes(model.id) ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'}`}
            >
              {model.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter prompt for comparison..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none h-24"
        />
        <button
          onClick={handleCompare}
          disabled={loading || !prompt.trim() || selectedModels.length === 0}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center min-w-[120px]"
        >
          {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Compare'}
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {results.map((result, idx) => {
            const modelName = allModels.find(m => m.id === result.modelId)?.name || result.modelId;
            return (
              <div key={idx} className="w-96 flex flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                <div className="bg-slate-900 p-3 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="font-semibold text-cyan-400 truncate pr-2">{modelName}</h3>
                  <div className="text-xs text-slate-400 flex flex-col items-end">
                    <span><i className="fa-solid fa-stopwatch"></i> {(result.latency / 1000).toFixed(2)}s</span>
                    <span><i className="fa-solid fa-coins"></i> {result.tokensUsed.toLocaleString()} ctx</span>
                  </div>
                </div>
                <div className="p-4 overflow-y-auto flex-1 text-sm whitespace-pre-wrap">
                  {result.error ? (
                    <div className="text-red-400 flex items-center gap-2">
                      <i className="fa-solid fa-triangle-exclamation"></i> {result.error}
                    </div>
                  ) : (
                    result.response
                  )}
                </div>
              </div>
            );
          })}
          {!loading && results.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-slate-500 italic">
              Run a comparison to see results here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
