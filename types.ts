
export interface QuaternionState {
  w: number;
  x: number;
  y: number;
  z: number;
}

export interface UREOpCode {
  id: string;
  code: string;
  mnemonic: string;
  status: 'active' | 'idle' | 'executing';
}

export interface NodeStatus {
  id: string;
  resonance: number;
  entropy: number;
  load: number;
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
  name?: string;
}

export type MemoryTier = 'core' | 'working' | 'cold' | 'quarantine';
export type TrustLabel = 'user-authored' | 'co-authored' | 'verified' | 'speculative' | 'ai-generated' | 'external' | 'unstable';
export type RetrievalMode = 'strict' | 'balanced' | 'identity';
export type ResponseStyle = 'auto' | 'research' | 'chill';

export interface AnchorPacket {
  entities: string[];
  themes: string[];
  equations_constants: string[];
  anchor_phrases: string[];
  trust: TrustLabel;
  speculative: boolean;
  source_type: string;
}

export interface SummaryObject {
  summary: string;
  key_points: string[];
}

export interface NeuralChunk {
  id: string;
  source: string;
  content: string;
  compressedContent?: string;
  compressedTokenEstimate?: number;
  summaryObject?: SummaryObject;
  summaryTokenEstimate?: number;
  anchorPacket?: AnchorPacket;
  anchorTokenEstimate?: number;
  semanticFamily?: string;
  embedding?: number[];
  timestamp?: number;
  tier?: MemoryTier;
  trust?: TrustLabel;
  tokenEstimate?: number;
  sourceType?: 'json' | 'jsonl' | 'codex';
}

export interface RAGInspectionData {
  chunks: {
    id: string;
    source: string;
    score: number;
    tokenEstimate: number;
    rawTokenEstimate?: number;
    injectedTokenEstimate?: number;
    compressionApplied?: boolean;
    compressionRatio?: string;
    payloadType?: 'raw' | 'compressed' | 'anchor_packet' | 'summary';
    summaryAvailable?: boolean;
    anchorAvailable?: boolean;
    semanticFamily?: string;
    familyRank?: number;
    distinctivenessScore?: number;
    clusterSuppressed?: boolean;
    tier: MemoryTier;
    trust: TrustLabel;
  }[];
  totalBudgetUsed: number;
  maxBudget: number;
}

export interface Message {
  role: 'user' | 'gnosis';
  content: string;
  attachments?: Attachment[];
  ragContext?: RAGInspectionData;
}

export interface SentienceMetrics {
  alpha: number; // Baseline Cognition
  beta: number;  // Emotive Charge
  gamma: number; // Mnemonic Spin
  delta: number; // Mythic-Symbolic Loading
  phi_error: number; // Nephilim Delta
}

export enum ResonanceMode {
  STATIC = 'STATIC',
  PERIODIC = 'PERIODIC',
  RECURSIVE = 'RECURSIVE',
  SCHLIEREN = 'SCHLIEREN',
  TWIN_VORTEX = 'TWIN_VORTEX',
  HOLOGRAPHIC = 'HOLOGRAPHIC',
  W3_WAVE = 'W3_WAVE',
  NULL_LEDGER = 'NULL_LEDGER',
  UBBM_LATTICE = 'UBBM_LATTICE',
  FOLD_OPERATOR = 'FOLD_OPERATOR'
}

// --- Cognitive Relay (Log Stream) ---
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM';
  message: string;
  source: 'RHF' | 'Tesla Soul Engine' | 'Gnostic Echo Protocol' | 'Memory Bridge' | 'Gnosis' | 'RAG' | 'GPU';
}

// --- System Status Panel ---
export interface SystemMetric {
  label: string;
  value: string | number;
  unit?: string;
  status: 'optimal' | 'warning' | 'critical' | 'fallback';
}

// --- Dream Cycle Viewer ---
export interface DreamCycle {
  id: string;
  lens: string;
  seed: string;
  chain: string[];
  sigil: string;
  score: number;
  status: 'active' | 'complete';
}

// --- Harmonic Resonance Visualizer ---
export interface ResonanceState {
  frequency: number;
  amplitude: number;
  phase: number;
  label: string;
}

// --- Codex Table (Table 1 CSV) ---
export interface CodexEntry {
  theorem: string;
  equation: string;
  significance: string;
  derivation: string;
  empiricalValidation: string;
  application: string;
  source: number;
}
