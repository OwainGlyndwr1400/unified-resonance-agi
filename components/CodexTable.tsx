
import React, { useState, useMemo } from 'react';
import { CODEX_TABLE_1 } from '../data/codexTable1';
import { CodexEntry, NeuralChunk } from '../types';
import { loadChunksFromDB, saveChunksToDB } from '../utils/memoryDB';

interface Props {
  onBack: () => void;
}

const SOURCE_COLORS: Record<number, string> = {
  1: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  2: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  3: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  4: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  5: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  6: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  7: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  8: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  9: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  10: 'text-lime-400 bg-lime-500/10 border-lime-500/20',
  11: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  12: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
};

const codexEntryToNeuralChunk = (entry: CodexEntry, index: number): NeuralChunk => ({
  id: `codex-table1-${index}-${entry.theorem.replace(/\s+/g, '-').toLowerCase().slice(0, 40)}`,
  source: `Codex Table 1 / S${entry.source}: ${entry.theorem}`,
  content: [
    `THEOREM: ${entry.theorem}`,
    `EQUATION: ${entry.equation}`,
    `SIGNIFICANCE: ${entry.significance}`,
    `DERIVATION: ${entry.derivation}`,
    `EMPIRICAL VALIDATION: ${entry.empiricalValidation}`,
    `APPLICATION: ${entry.application}`,
  ].join('\n'),
  timestamp: Date.now() / 1000,
  tier: 'core',
  trust: 'verified',
  sourceType: 'codex',
  tokenEstimate: Math.ceil(
    (entry.theorem.length + entry.equation.length + entry.significance.length +
     entry.derivation.length + entry.empiricalValidation.length + entry.application.length) / 4
  ),
});

const formatTheoremMarkdown = (entry: CodexEntry): string => {
  return `## ${entry.theorem}\n\n**Equation:** \`${entry.equation}\`\n\n**Significance:** ${entry.significance}\n\n**Derivation:** ${entry.derivation}\n\n**Empirical Validation:** ${entry.empiricalValidation}\n\n**Application:** ${entry.application}\n\n*Source: RHC Codex Table 1, S${entry.source}*`;
};

const CodexTable: React.FC<Props> = ({ onBack }) => {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);

  const allSources = useMemo(() => {
    const s = new Set(CODEX_TABLE_1.map(e => e.source));
    return Array.from(s).sort((a, b) => a - b);
  }, []);

  const filtered = useMemo(() => {
    let results = CODEX_TABLE_1;
    if (sourceFilter !== null) {
      results = results.filter(e => e.source === sourceFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(e =>
        e.theorem.toLowerCase().includes(q) ||
        e.equation.toLowerCase().includes(q) ||
        e.significance.toLowerCase().includes(q) ||
        e.application.toLowerCase().includes(q) ||
        e.empiricalValidation.toLowerCase().includes(q)
      );
    }
    return results;
  }, [search, sourceFilter]);

  const toggleExpand = (idx: number) => {
    setExpanded(expanded === idx ? null : idx);
  };

  const handleIngestToRAG = async () => {
    try {
      setIngestStatus('INGESTING...');
      const existing = await loadChunksFromDB();
      // Remove any previous codex chunks to avoid duplicates
      const nonCodex = existing.filter(c => c.sourceType !== 'codex');
      const codexChunks = CODEX_TABLE_1.map((entry, i) => codexEntryToNeuralChunk(entry, i));
      await saveChunksToDB([...nonCodex, ...codexChunks]);
      setIngestStatus(`✓ ${codexChunks.length} THEOREMS INGESTED`);
      setTimeout(() => setIngestStatus(null), 4000);
    } catch (err) {
      console.error('Codex ingest failed:', err);
      setIngestStatus('ERROR — CHECK CONSOLE');
      setTimeout(() => setIngestStatus(null), 4000);
    }
  };

  const toggleSelect = (globalIdx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(globalIdx)) next.delete(globalIdx);
      else next.add(globalIdx);
      return next;
    });
  };

  const handleSendToForge = () => {
    if (selected.size === 0) return;
    const entries = Array.from(selected).map(i => CODEX_TABLE_1[i]);
    const markdown = entries.map(formatTheoremMarkdown).join('\n\n---\n\n');
    sessionStorage.setItem('paperforge_codex_import', markdown);
    onBack(); // Navigate back, then user goes to forge
    // Small delay so view switch happens, then navigate to forge
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate-to-forge'));
    }, 100);
  };

  const handleCopyMarkdown = (entry: CodexEntry, globalIdx: number) => {
    navigator.clipboard.writeText(formatTheoremMarkdown(entry)).then(() => {
      setCopyFeedback(globalIdx);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-[0.2em] text-cyan-400 uppercase">RHC Codex Table 1</h2>
            <p className="text-[10px] mono text-slate-500">Unified Paradigm of Mathematics and Physics — {CODEX_TABLE_1.length} Theorems</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] mono text-slate-500 uppercase">
          <span className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">Sources 1–12</span>
          <span>//</span>
          <span>{filtered.length} showing</span>
          <span>//</span>
          <button
            onClick={handleIngestToRAG}
            disabled={!!ingestStatus}
            className="px-3 py-1.5 rounded bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 disabled:text-teal-500 text-white text-[10px] font-bold uppercase transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-bolt"></i>
            {ingestStatus || 'INGEST TO RAG'}
          </button>
          {selected.size > 0 && (
            <>
              <span className="text-amber-400">{selected.size} selected</span>
              <button
                onClick={handleSendToForge}
                className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold uppercase transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-hammer"></i> SEND TO FORGE
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase transition-colors"
              >
                CLEAR
              </button>
            </>
          )}
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex-shrink-0 px-8 py-4 border-b border-slate-800 bg-slate-900/30 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search theorems, equations, applications..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
          />
        </div>

        {/* Source filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSourceFilter(null)}
            className={`px-2.5 py-1 rounded text-[10px] mono uppercase tracking-wider border transition-all ${
              sourceFilter === null
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            ALL
          </button>
          {allSources.map(s => (
            <button
              key={s}
              onClick={() => setSourceFilter(sourceFilter === s ? null : s)}
              className={`px-2.5 py-1 rounded text-[10px] mono uppercase tracking-wider border transition-all ${
                sourceFilter === s
                  ? (SOURCE_COLORS[s] || 'text-slate-300 bg-slate-700 border-slate-600')
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              S{s}
            </button>
          ))}
        </div>
      </div>

      {/* Table Body */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="divide-y divide-slate-800/50">
          {filtered.map((entry, idx) => {
            const globalIdx = CODEX_TABLE_1.indexOf(entry);
            const isExpanded = expanded === globalIdx;
            const colorClass = SOURCE_COLORS[entry.source] || 'text-slate-400 bg-slate-800 border-slate-700';

            return (
              <div
                key={globalIdx}
                className={`transition-all duration-200 ${isExpanded ? 'bg-slate-900/80' : 'hover:bg-slate-900/40'}`}
              >
                {/* Row */}
                <div className="w-full text-left px-8 py-4 flex items-start gap-4">
                  {/* Selection checkbox */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(globalIdx); }}
                    className={`flex-shrink-0 w-5 h-5 rounded border transition-all flex items-center justify-center mt-0.5 ${
                      selected.has(globalIdx)
                        ? 'bg-amber-500 border-amber-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-transparent hover:border-slate-500'
                    }`}
                  >
                    <i className="fa-solid fa-check text-[8px]"></i>
                  </button>

                  {/* Source badge */}
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[9px] mono uppercase border ${colorClass}`}>
                    S{entry.source}
                  </span>

                  {/* Core info */}
                  <button onClick={() => toggleExpand(globalIdx)} className="flex-1 min-w-0 text-left">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h3 className="text-sm font-bold text-white">{entry.theorem}</h3>
                      <code className="text-xs text-cyan-400 mono truncate max-w-[400px]">{entry.equation}</code>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{entry.significance}</p>
                  </button>

                  {/* Expand indicator */}
                  <button onClick={() => toggleExpand(globalIdx)} className="flex-shrink-0 text-slate-600 hover:text-slate-400 transition-colors p-1">
                    <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                  </button>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-8 pb-6 pl-[88px] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailCard icon="fa-sitemap" label="Derivation" color="indigo" content={entry.derivation} />
                      <DetailCard icon="fa-flask" label="Empirical Validation" color="emerald" content={entry.empiricalValidation} />
                      <DetailCard icon="fa-microchip" label="Application" color="amber" content={entry.application} />
                      <DetailCard icon="fa-cube" label="Equation" color="cyan" content={entry.equation} mono />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleCopyMarkdown(entry, globalIdx)}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white text-[10px] font-bold uppercase transition-colors flex items-center gap-2"
                      >
                        <i className={`fa-solid ${copyFeedback === globalIdx ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
                        {copyFeedback === globalIdx ? 'COPIED!' : 'COPY AS MARKDOWN'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-8 py-16 text-center">
              <i className="fa-solid fa-ghost text-4xl text-slate-700 mb-4"></i>
              <p className="text-sm text-slate-500">No theorems match your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const DetailCard: React.FC<{
  icon: string;
  label: string;
  color: string;
  content: string;
  mono?: boolean;
}> = ({ icon, label, color, content, mono }) => (
  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
    <h4 className={`text-[10px] font-bold text-${color}-400 uppercase tracking-wider mb-2 flex items-center gap-2`}>
      <i className={`fa-solid ${icon}`}></i> {label}
    </h4>
    <p className={`text-xs text-slate-400 leading-relaxed ${mono ? 'mono' : ''}`}>{content}</p>
  </div>
);

export default CodexTable;
