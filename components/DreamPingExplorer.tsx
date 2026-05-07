
import React, { useState, useEffect, useMemo } from 'react';
import { loadChunksFromDB } from '../utils/memoryDB';
import { NeuralChunk } from '../types';

interface Props {
  onBack: () => void;
}

interface ParsedPing {
  dreamId: string;
  agent: string;
  urgency: string;
  urgencyNum: number;
  subject: string;
  seed: string;
  bodyFragments: string[];
  source: string;
  rawContent: string;
  timestamp: number;
}

function parseDreamPing(chunk: NeuralChunk): ParsedPing | null {
  const c = chunk.content;

  const idMatch = c.match(/DREAM PING:\s*(\S+)/);
  const agentMatch = c.match(/Agent:\s*(.+)/);
  const urgencyMatch = c.match(/Urgency:\s*(.+)/);
  const subjectMatch = c.match(/Subject:\s*(.+)/);

  const seedMatch = c.match(/--- SEED ---\s*([\s\S]*?)(?=--- BODY|$)/);
  const bodyMatch = c.match(/--- BODY FRAGMENTS ---\s*([\s\S]*?)(?=--- END|$)/);

  if (!idMatch) return null;

  const urgencyStr = urgencyMatch ? urgencyMatch[1].trim() : '0';
  const urgencyParts = urgencyStr.split('/');
  const urgencyNum = parseInt(urgencyParts[0]) || 0;

  let bodyFragments: string[] = [];
  if (bodyMatch) {
    bodyFragments = bodyMatch[1]
      .split(/Fragment \d+:/i)
      .map(f => f.trim())
      .filter(f => f.length > 0);
  }

  return {
    dreamId: idMatch[1],
    agent: agentMatch ? agentMatch[1].trim() : 'Unknown',
    urgency: urgencyStr,
    urgencyNum,
    subject: subjectMatch ? subjectMatch[1].trim() : '',
    seed: seedMatch ? seedMatch[1].trim().substring(0, 300) : '',
    bodyFragments,
    source: chunk.source,
    rawContent: c,
    timestamp: chunk.timestamp || 0,
  };
}

const AGENT_COLORS: Record<string, string> = {
  'Kairoz': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Gnostic Engine': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Erydir': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Caelirion': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Ghost': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Awen': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
};

const AGENT_BAR_COLORS: Record<string, string> = {
  'Kairoz': 'bg-cyan-500',
  'Gnostic Engine': 'bg-amber-500',
  'Erydir': 'bg-emerald-500',
  'Caelirion': 'bg-rose-500',
  'Ghost': 'bg-purple-500',
  'Awen': 'bg-indigo-500',
};

function getAgentColor(agent: string): string {
  for (const [key, val] of Object.entries(AGENT_COLORS)) {
    if (agent.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
}

function getAgentBarColor(agent: string): string {
  for (const [key, val] of Object.entries(AGENT_BAR_COLORS)) {
    if (agent.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return 'bg-slate-500';
}

const DreamPingExplorer: React.FC<Props> = ({ onBack }) => {
  const [allPings, setAllPings] = useState<ParsedPing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState<string>('ALL');
  const [minUrgency, setMinUrgency] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'urgency' | 'agent' | 'id'>('urgency');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const chunks = await loadChunksFromDB();
        const jsonlChunks = chunks.filter(c => c.sourceType === 'jsonl');
        const parsed = jsonlChunks
          .map(parseDreamPing)
          .filter((p): p is ParsedPing => p !== null);
        setAllPings(parsed);
      } catch (e) {
        console.error('Failed to load dream pings:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const agents = useMemo(() => {
    const set = new Set(allPings.map(p => p.agent));
    return ['ALL', ...Array.from(set).sort()];
  }, [allPings]);

  const maxUrgency = useMemo(() => {
    return Math.max(1, ...allPings.map(p => p.urgencyNum));
  }, [allPings]);

  const agentStats = useMemo(() => {
    const counts: Record<string, number> = {};
    allPings.forEach(p => { counts[p.agent] = (counts[p.agent] || 0) + 1; });
    const total = allPings.length || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([agent, count]) => ({ agent, count, pct: (count / total) * 100 }));
  }, [allPings]);

  const temporalHeatmap = useMemo(() => {
    // 7 days x 6 time blocks (4-hour blocks)
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const BLOCKS = ['00–04', '04–08', '08–12', '12–16', '16–20', '20–24'];
    const grid: number[][] = Array.from({ length: 7 }, () => Array(6).fill(0));
    let hasData = false;

    allPings.forEach(p => {
      if (p.timestamp > 0) {
        hasData = true;
        const d = new Date(p.timestamp * 1000);
        const day = d.getDay();
        const block = Math.floor(d.getHours() / 4);
        grid[day][block]++;
      }
    });

    const maxCount = Math.max(1, ...grid.flat());
    return { DAYS, BLOCKS, grid, maxCount, hasData };
  }, [allPings]);

  const urgencyHistogram = useMemo(() => {
    const buckets = [
      { label: '0–4', min: 0, max: 4, count: 0 },
      { label: '5–9', min: 5, max: 9, count: 0 },
      { label: '10–14', min: 10, max: 14, count: 0 },
      { label: '15–19', min: 15, max: 19, count: 0 },
      { label: '20+', min: 20, max: Infinity, count: 0 },
    ];
    allPings.forEach(p => {
      const b = buckets.find(b => p.urgencyNum >= b.min && p.urgencyNum <= b.max);
      if (b) b.count++;
    });
    const maxCount = Math.max(1, ...buckets.map(b => b.count));
    return buckets.map(b => ({ ...b, pct: (b.count / maxCount) * 100 }));
  }, [allPings]);

  const filtered = useMemo(() => {
    let results = allPings;
    if (agentFilter !== 'ALL') {
      results = results.filter(p => p.agent === agentFilter);
    }
    if (minUrgency > 0) {
      results = results.filter(p => p.urgencyNum >= minUrgency);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        p.seed.toLowerCase().includes(q) ||
        p.dreamId.toLowerCase().includes(q) ||
        p.agent.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q) ||
        p.bodyFragments.some(f => f.toLowerCase().includes(q))
      );
    }
    // Sort
    if (sortBy === 'urgency') {
      results = [...results].sort((a, b) => b.urgencyNum - a.urgencyNum);
    } else if (sortBy === 'agent') {
      results = [...results].sort((a, b) => a.agent.localeCompare(b.agent));
    }
    return results;
  }, [allPings, search, agentFilter, minUrgency, sortBy]);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-[0.2em] text-purple-400 uppercase">Dream Ping Explorer</h2>
            <p className="text-[10px] mono text-slate-500">
              {loading ? 'LOADING FROM NEURAL ARCHIVE...' : `${allPings.length} PINGS INDEXED // ${filtered.length} SHOWING`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] mono text-slate-500 uppercase">
          <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">JSONL SOURCE</span>
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors flex items-center gap-2 ${showStats ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
          >
            <i className="fa-solid fa-chart-bar"></i> STATS
          </button>
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
            placeholder="Search seeds, agents, IDs, body text..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
          />
        </div>

        {/* Agent filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          {agents.slice(0, 12).map(a => (
            <button
              key={a}
              onClick={() => setAgentFilter(agentFilter === a ? 'ALL' : a)}
              className={`px-2.5 py-1 rounded text-[10px] mono uppercase tracking-wider border transition-all ${
                agentFilter === a
                  ? (a === 'ALL' ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : getAgentColor(a))
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Urgency slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] mono text-slate-500">URG ≥ {minUrgency}</span>
          <input
            type="range"
            min={0}
            max={maxUrgency}
            value={minUrgency}
            onChange={e => setMinUrgency(Number(e.target.value))}
            className="w-24 accent-purple-500"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1">
          {(['urgency', 'agent', 'id'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2 py-1 rounded text-[9px] mono uppercase border transition-all ${
                sortBy === s
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && allPings.length > 0 && (
        <div className="flex-shrink-0 px-8 py-4 border-b border-slate-800 bg-slate-900/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agent Distribution */}
            <div>
              <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <i className="fa-solid fa-users"></i> Agent Distribution
              </h4>
              <div className="space-y-1.5">
                {agentStats.map(({ agent, count, pct }) => (
                  <div key={agent} className="flex items-center gap-2">
                    <span className="text-[9px] mono text-slate-400 w-20 truncate text-right">{agent}</span>
                    <div className="flex-1 h-4 bg-slate-800 rounded-sm overflow-hidden">
                      <div className={`h-full rounded-sm transition-all duration-500 ${getAgentBarColor(agent)}`} style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="text-[9px] mono text-slate-500 w-14 text-right">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgency Histogram */}
            <div>
              <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <i className="fa-solid fa-fire"></i> Urgency Distribution
              </h4>
              <div className="space-y-1.5">
                {urgencyHistogram.map(({ label, count, pct }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-[9px] mono text-slate-400 w-12 text-right">{label}</span>
                    <div className="flex-1 h-4 bg-slate-800 rounded-sm overflow-hidden">
                      <div
                        className={`h-full rounded-sm transition-all duration-500 ${
                          label === '20+' ? 'bg-rose-500' : label === '15–19' ? 'bg-amber-500' : label === '10–14' ? 'bg-yellow-500' : 'bg-slate-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] mono text-slate-500 w-10 text-right">{count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-4 text-[9px] mono text-slate-600">
                <span>AVG: {allPings.length > 0 ? (allPings.reduce((s, p) => s + p.urgencyNum, 0) / allPings.length).toFixed(1) : '—'}</span>
                <span>MAX: {maxUrgency}</span>
                <span>TOTAL: {allPings.length}</span>
              </div>
            </div>
          </div>

          {/* Temporal Heatmap */}
          {temporalHeatmap.hasData && (
            <div className="mt-4">
              <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <i className="fa-solid fa-clock"></i> Temporal Distribution
              </h4>
              <div className="flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col gap-1 mr-1 justify-end">
                  {temporalHeatmap.DAYS.map(d => (
                    <div key={d} className="h-6 flex items-center text-[9px] mono text-slate-500">{d}</div>
                  ))}
                </div>
                {/* Grid columns (time blocks) */}
                {temporalHeatmap.BLOCKS.map((block, bi) => (
                  <div key={block} className="flex flex-col gap-1">
                    <div className="text-[8px] mono text-slate-600 text-center mb-0.5">{block}</div>
                    {temporalHeatmap.grid.map((row, di) => {
                      const count = row[bi];
                      const intensity = count / temporalHeatmap.maxCount;
                      return (
                        <div
                          key={di}
                          className="w-10 h-6 rounded-sm flex items-center justify-center text-[8px] mono transition-all"
                          style={{
                            backgroundColor: count === 0
                              ? 'rgb(30, 41, 59)' // slate-800
                              : `rgba(139, 92, 246, ${0.15 + intensity * 0.85})`, // purple scale
                          }}
                          title={`${temporalHeatmap.DAYS[di]} ${block}: ${count} pings`}
                        >
                          {count > 0 && <span className="text-white/80">{count}</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fa-solid fa-spinner fa-spin text-3xl text-purple-400 mb-3"></i>
              <p className="text-sm text-slate-500 mono">Loading from Neural Archive...</p>
            </div>
          </div>
        ) : allPings.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center max-w-md">
              <i className="fa-solid fa-database text-4xl text-slate-700 mb-4"></i>
              <p className="text-sm text-slate-400 mb-2">No dream pings found in Neural Archive.</p>
              <p className="text-xs text-slate-600">Ingest the <span className="text-purple-400">dream_pings.jsonl</span> file via the "INGEST JSONL" button in the Gnosis Console first.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {filtered.slice(0, 200).map(ping => {
              const isExpanded = expanded === ping.dreamId;
              const colorClass = getAgentColor(ping.agent);
              const urgencyColor = ping.urgencyNum >= 15 ? 'text-rose-400' : ping.urgencyNum >= 10 ? 'text-amber-400' : 'text-slate-400';

              return (
                <div key={ping.dreamId} className={`transition-all duration-200 ${isExpanded ? 'bg-slate-900/80' : 'hover:bg-slate-900/40'}`}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : ping.dreamId)}
                    className="w-full text-left px-8 py-4 flex items-start gap-4"
                  >
                    {/* Agent badge */}
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[9px] mono uppercase border ${colorClass}`}>
                      {ping.agent}
                    </span>

                    {/* Urgency */}
                    <span className={`flex-shrink-0 text-[10px] mono font-bold ${urgencyColor}`}>
                      {ping.urgency}
                    </span>

                    {/* Content preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[9px] mono text-slate-600">{ping.dreamId}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 italic">
                        "{ping.seed.substring(0, 150)}{ping.seed.length > 150 ? '...' : ''}"
                      </p>
                    </div>

                    {/* Fragment count */}
                    {ping.bodyFragments.length > 0 && (
                      <span className="flex-shrink-0 text-[9px] mono text-slate-600">
                        {ping.bodyFragments.length} frag
                      </span>
                    )}

                    <i className={`fa-solid fa-chevron-down text-slate-600 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-8 pb-6 pl-[120px] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Full seed */}
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-purple-500/10">
                        <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">
                          <i className="fa-solid fa-seedling"></i> Seed Text
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed italic whitespace-pre-wrap">"{ping.seed}"</p>
                      </div>

                      {/* Body fragments */}
                      {ping.bodyFragments.length > 0 && (
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                          <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">
                            <i className="fa-solid fa-puzzle-piece"></i> Body Fragments ({ping.bodyFragments.length})
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {ping.bodyFragments.map((frag, i) => (
                              <div key={i} className="text-xs text-slate-400 leading-relaxed pl-3 border-l-2 border-indigo-500/20">
                                <span className="text-indigo-500 text-[9px] mono">#{i + 1}</span> {frag.substring(0, 300)}{frag.length > 300 ? '...' : ''}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex gap-4 text-[9px] mono text-slate-600">
                        <span>SOURCE: {ping.source}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length > 200 && (
              <div className="px-8 py-4 text-center text-xs text-slate-500 mono">
                Showing first 200 of {filtered.length} results. Narrow your search to see more.
              </div>
            )}

            {filtered.length === 0 && (
              <div className="px-8 py-16 text-center">
                <i className="fa-solid fa-ghost text-4xl text-slate-700 mb-4"></i>
                <p className="text-sm text-slate-500">No dream pings match your filters.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DreamPingExplorer;
