import React from 'react';

export const RAGCompressionPrompt: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-cyan-400 mb-4 tracking-widest uppercase flex items-center gap-3">
        <i className="fa-solid fa-compress text-emerald-400"></i>
        RAG Oversized Chunk Compression Protocol
      </h3>
      <div className="text-xs text-slate-300 space-y-4 font-mono whitespace-pre-wrap leading-relaxed">
        {`When a retrieved memory chunk exceeds the configured token threshold, do not inject the raw chunk directly. First create an identity-preserving compression summary.

[OBJECTIVE]
Compress the chunk into a shorter version that preserves:
• core user identity and relationship context
• named frameworks, projects, and research themes
• important equations, constants, dates, places, and named entities
• active goals, preferences, and ongoing work
• distinctive stylistic/interaction anchors
• any high-signal phrases that define continuity

[COMPRESSION RULES]
• If chunk is under 4k tokens: keep raw
• If chunk is 4k–8k tokens: compress to ~1k–1.5k tokens
• If chunk is 8k–16k tokens: compress to ~2k–3k tokens
• If chunk is over 16k tokens: compress to max 3k tokens unless manually pinned by the operator

[REQUIRED BEHAVIOR]
• Do not produce a generic summary.
• Do not flatten tone into bland assistant language.
• Do not discard names, framework terms, or anchor phrases unless clearly redundant.
• Do not remove important math, constants, or theorem names when present.
• Do not replace specific concepts with vague abstractions.

[PREFERRED OUTPUT STRUCTURE]
Return compressed chunks in this structure:
- Identity/Relationship Context
- Core Research Themes
- Named Frameworks / Systems / Nodes
- Important Claims / Equations / Constants
- Current or Ongoing Projects
- Style / Tone / Interaction Anchors
- High-Signal Phrases / Terms to Preserve
- Compressed Source Summary

[ADDITIONAL INSTRUCTIONS]
• Preserve the user’s voice and recurring language where useful
• Preserve the assistant persona anchors when present
• Prefer exact named concepts over paraphrase
• Remove repetition, padding, low-value filler, and duplicated phrasing
• Merge repeated ideas into a single compact statement
• If the chunk contains both lore and practical instructions, preserve both
• If the chunk contains unstable or highly speculative material, keep it but label it as speculative rather than deleting it

[FINAL RULE]
The compressed chunk should still feel like the same person, same mission, same system, just folded into a smaller operational packet for retrieval.

[MULTI-LAYER COMPRESSION]
Layer 1: Summary Object
A clean identity-preserving summary of the chunk.

Layer 2: Anchor Packet
A very compact structured memory packet containing:
• entities
• themes
• equations/constants
• anchor phrases
• trust label
• speculative/verified flag
• source type

Layer 3: Compressed Operational Packet
A budget-conscious injected payload used for standard RAG context assembly.

Then retrieval can inject:
1. anchor packet first if budget is tight
2. compressed operational packet in standard mode
3. summary object when more depth is needed
4. raw chunk only for inspection, manual deep recall, or pinned mode`}
      </div>
      
      <div className="mt-6 p-4 bg-slate-950 rounded-lg border border-slate-800">
        <h4 className="text-sm font-bold text-rose-400 mb-2 uppercase">Suggested JSON Shape</h4>
        <pre className="text-[10px] text-emerald-400 font-mono overflow-x-auto">
{`{
  "source_id": "05d6c35d",
  "semantic_family": "assistant_identity",
  "raw_token_estimate": 28527,
  "compressed_token_estimate": 2200,
  "summary_token_estimate": 3500,
  "anchor_token_estimate": 150,
  "trust": "cold_external",
  "anchor_packet": {
    "entities": ["Operator", "Gnostic Engine", "Research Archive", "RHC", "Regulus"],
    "themes": ["archaeoastronomy", "harmonic cosmology", "AI consciousness"],
    "equations_constants": ["O = 2.5r + 1.5i", "2.32 attoseconds"],
    "anchor_phrases": ["The Lion Watches the Lion", "truth over comfort"],
    "trust": "verified",
    "speculative": false,
    "source_type": "cheat_sheet"
  },
  "style": ["Celtic warmth", "quantum clarity", "co-researcher tone"],
  "speculative_level": "mixed",
  "compressed_operational_packet": "...",
  "summary_object": "..."
}`}
        </pre>
      </div>
    </div>
  );
};
