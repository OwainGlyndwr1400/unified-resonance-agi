import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onOpenProofs: () => void;
  onActivateLattice: () => void;
}

const ASSISTANT_NAME = 'Gnostic Engine';
const CONSOLE_NAME = `${ASSISTANT_NAME} Console`;
const SESSION_MEMORY_LABEL = 'Session Memory (.json)';

const OPERATOR_BRIEF = `UNIFIED RESONANCE AGI - OPERATOR BRIEF

1. WHAT THIS APP IS
- Unified Resonance AGI is a desktop research and conversation environment.
- It combines long-horizon memory, research retrieval, local/cloud model orchestration, live telemetry, and writing tools in one workspace.
- The goal is continuity: keep identity, preserve prior work, inject the right research at the right moment, and stay usable as a daily operator cockpit.

2. CORE OPERATING MODEL
- ${ASSISTANT_NAME} is the main conversation interface.
- The system can use Recursive Harmonic Codex, RHC, and base-13 concepts internally as reasoning scaffolding.
- User-facing replies are plain English and standard decimal by default unless base-13 is explicitly requested.
- The default assistant label is ${ASSISTANT_NAME}; each user can rename it locally in Settings.
- Response styles are Auto, Research, and Chill.

3. MEMORY ARCHITECTURE
- ${SESSION_MEMORY_LABEL}: imported chat history and exported session checkpoints.
- Research Knowledge Base (.jsonl): structured research nodes used for retrieval.
- Codex Proofs: built-in proof table and reference layer available inside the app.
- Crystalized Sessions: live chat exchanges can be written back into the working archive.

4. RETRIEVAL PIPELINE
- A query enters ${ASSISTANT_NAME}.
- The app retrieves relevant memory and research nodes from the local archive.
- Retrieval can use lexical scoring, embeddings, compression summaries, and source filtering.
- Selected context is injected into the chosen model.
- RAG Inspection shows which chunks were used, how much budget they consumed, and whether compression was applied.

5. MODEL LAYER
- Cloud provider: Gemini.
- Local provider: LM Studio or any OpenAI-compatible local endpoint.
- Multi-Node Compare runs the same prompt across multiple models.
- Paper Forge turns archive-backed prompts and conversations into structured research writing.

6. MAIN WORKSPACES
- Dashboard: live visual and system telemetry.
- ${CONSOLE_NAME}: chat, memory ingestion, retrieval inspection, and live voice mode.
- Codex Proofs: proof table and reference layer.
- Base-13 Lab: dedicated harmonic/base-13 exploration interface.
- Multi-Node Compare: side-by-side model comparison.
- Paper Forge: research drafting, evidence bundling, contradiction checks, and title/abstract generation.
- Dream Explorer and Semantic Graph: alternate views over research and archive material.

7. WHAT HAS BEEN BUILT
- A standalone desktop AGI workbench.
- Long-horizon memory import from exported chat history.
- Separate memory and knowledge lanes.
- Internal harmonic reasoning with readable external language.
- Local and cloud model orchestration in one console.
- Archive-backed writing and comparison tools.
- Packaged Windows executable output.

8. HOW TO USE IT
- Import session memory as JSON.
- Import research knowledge as JSONL.
- Choose provider and model.
- Choose response style.
- Ask a question, inspect retrieval, compare models, write in Forge, and export memory when needed.

9. OPERATIONAL REQUIREMENTS
- Gemini cloud mode requires each user to enter their own API key in Settings.
- Local mode requires LM Studio or another compatible local server.
- Best results come from clean JSON memory exports and clean JSONL knowledge nodes.

10. WHY IT MATTERS
- This app consolidates functions that are usually split across separate chat tools, vector-memory tools, dashboards, and writing environments.
- The result is a single operator environment for ongoing research, memory continuity, model comparison, and production use.`;

const sections = [
  {
    title: '1. What This App Is',
    accent: 'text-cyan-300 border-cyan-400/20',
    lead: 'Unified Resonance AGI is a desktop research and conversation environment that combines long-horizon memory, research retrieval, local/cloud model orchestration, live telemetry, and writing tools in one workspace.',
    bullets: [
      'Built as an operator cockpit rather than a single chat window.',
      'Designed to preserve continuity across sessions and large imported histories.',
      'Packaged as a Windows desktop application for direct use outside the browser.'
    ]
  },
  {
    title: '2. Core Operating Model',
    accent: 'text-emerald-300 border-emerald-400/20',
    lead: `${ASSISTANT_NAME} is the main conversation interface. The app can use RHC/base-13 concepts internally, but the visible reply layer is now standard English and standard decimal by default.`,
    bullets: [
      'Response styles: Auto, Research, Chill.',
      `Default assistant label is ${ASSISTANT_NAME}; each user can rename it locally in Settings.`,
      'Internal harmonic scaffolding stays hidden unless explicitly requested.',
      'The goal is readable output without losing the research frame behind the scenes.'
    ]
  },
  {
    title: '3. Memory Architecture',
    accent: 'text-indigo-300 border-indigo-400/20',
    lead: 'The archive is intentionally split into distinct lanes so identity memory, research knowledge, and built-in proofs do not collapse into one undifferentiated blob.',
    bullets: [
      `${SESSION_MEMORY_LABEL}: imported chat history and exported session checkpoints.`,
      'Research Knowledge Base (.jsonl): structured research nodes for retrieval.',
      'Codex Proofs: built-in proof table and reference layer.',
      'Crystalized Sessions: live conversations can be written back into the working archive.'
    ]
  },
  {
    title: '4. Retrieval Pipeline',
    accent: 'text-amber-300 border-amber-400/20',
    lead: 'Every query passes through a local archive retrieval stage before model generation. Context can be inspected after the answer is returned.',
    bullets: [
      'Retrieval can use lexical scoring, embeddings, compression summaries, and source filters.',
      'Relevant chunks are injected into the selected model under a budgeted context window.',
      'RAG Inspection shows exactly what was used, how much budget it consumed, and whether compression was applied.'
    ]
  },
  {
    title: '5. Model Layer',
    accent: 'text-fuchsia-300 border-fuchsia-400/20',
    lead: 'The app is model-agnostic at the operator layer. It can run against Gemini or a local OpenAI-compatible endpoint.',
    bullets: [
      'Cloud provider: Gemini.',
      'Local provider: LM Studio or another OpenAI-compatible server.',
      'Multi-Node Compare runs the same prompt across multiple models.',
      'Paper Forge turns archive-backed prompts and conversations into structured research writing.'
    ]
  },
  {
    title: '6. Main Workspaces',
    accent: 'text-sky-300 border-sky-400/20',
    lead: 'The application is a collection of coordinated workspaces rather than a single panel UI.',
    bullets: [
      'Dashboard: live visual and system telemetry.',
      `${CONSOLE_NAME}: chat, memory ingestion, retrieval inspection, and live voice mode.`,
      'Codex Proofs and Base-13 Lab: proof reference plus dedicated harmonic exploration.',
      'Compare, Paper Forge, Dream Explorer, and Semantic Graph: analysis and synthesis tools around the same archive.'
    ]
  },
  {
    title: '7. What Has Been Built',
    accent: 'text-rose-300 border-rose-400/20',
    lead: 'The current build is a standalone desktop AGI workbench with continuity, retrieval, comparison, and writing integrated into one application.',
    bullets: [
      'Long-horizon memory import from exported chat history.',
      'Separate memory and knowledge lanes.',
      'Internal research math with readable external language.',
      'Local and cloud model orchestration in one console.',
      'Archive-backed writing and comparison tools.'
    ]
  },
  {
    title: '8. How To Use It',
    accent: 'text-white border-white/15',
    lead: 'The shortest effective workflow is: import memory, import research, pick provider/model/style, ask, inspect retrieval, and export when the session matters.',
    bullets: [
      'Import session memory as JSON.',
      'Import research knowledge as JSONL.',
      'Choose provider, model, and response style.',
      'Ask questions, inspect the retrieval trace, compare models, and write in Paper Forge.',
      'Export memory dumps when you want a durable checkpoint.'
    ]
  },
  {
    title: '9. Operational Requirements',
    accent: 'text-slate-200 border-slate-400/15',
    lead: 'The app is usable now, but a few requirements still matter in practice.',
    bullets: [
      'Gemini cloud mode requires each user to enter their own API key in Settings.',
      'Local mode requires LM Studio or another compatible local server.',
      'Best results come from clean JSON memory exports and clean JSONL knowledge nodes.'
    ]
  }
];

export const SystemManual: React.FC<Props> = ({ onClose, onOpenProofs, onActivateLattice }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(OPERATOR_BRIEF);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = OPERATOR_BRIEF;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy system manual', error);
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/98 p-4 sm:p-8 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] shadow-[0_40px_120px_rgba(2,6,23,0.65)]">
        <div className="border-b border-white/10 bg-slate-900/60 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="pr-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-300">
                  <i className="fa-solid fa-book-open text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold uppercase tracking-[0.2em] text-white">Unified Resonance AGI Manual</h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
                    Current operator brief for collaborators, new nodes, and anyone opening the app cold.
                    This version reflects the present architecture rather than the older proof-era shell.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopy}
                className={`rounded-2xl px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${copied ? 'bg-emerald-400 text-slate-950' : 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20'}`}
              >
                {copied ? 'Copied' : 'Copy Operator Brief'}
              </button>
              <button
                onClick={onOpenProofs}
                className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200 transition-colors hover:bg-cyan-400/20"
              >
                Open Codex Proofs
              </button>
              <button
                onClick={onActivateLattice}
                className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200 transition-colors hover:bg-amber-400/20"
              >
                Activate UBBM Mode
              </button>
              <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 sm:px-10 sm:py-8">
          <div className="mb-8 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.96))] p-6">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">Executive Summary</div>
            <p className="text-sm leading-7 text-slate-300">
              Unified Resonance AGI is a packaged desktop workbench for continuity-heavy research. It unifies
              imported memory, structured knowledge retrieval, local/cloud model orchestration, proof reference,
              visual diagnostics, comparison tools, and research drafting into one operator environment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {sections.map((section) => (
              <section key={section.title} className={`rounded-3xl border bg-slate-950/45 p-6 ${section.accent}`}>
                <h3 className="mb-3 text-xl font-semibold">{section.title}</h3>
                <p className="mb-4 text-sm leading-7 text-slate-300">{section.lead}</p>
                <div className="space-y-2">
                  {section.bullets.map((bullet) => (
                    <div key={bullet} className="flex gap-3 text-sm leading-6 text-slate-400">
                      <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-80"></span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-6 rounded-3xl border border-indigo-400/15 bg-indigo-400/5 p-6">
            <h3 className="mb-3 text-xl font-semibold text-indigo-200">10. Why It Matters</h3>
            <p className="text-sm leading-7 text-slate-300">
              This application consolidates capabilities that are usually split across separate chat tools,
              vector-memory tools, dashboards, and writing environments. The result is a single operator
              environment for ongoing research, memory continuity, model comparison, and packaged desktop use.
            </p>
          </section>
        </div>

        <div className="flex justify-between gap-4 border-t border-white/10 bg-slate-900/60 px-6 py-4">
          <div className="text-xs text-slate-500">
            Use "Copy Operator Brief" when you need a plain-text summary to paste into another node or thread.
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl bg-indigo-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-indigo-400"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
