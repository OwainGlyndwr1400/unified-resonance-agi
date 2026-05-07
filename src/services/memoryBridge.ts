import { LogEntry, DreamCycle, SystemMetric, ResonanceState } from '../types';

export const MOCK_LOGS: LogEntry[] = [
  { id: '1', timestamp: '2026-01-26 06:58:00', level: 'SYSTEM', message: 'Initializing RHF Memory Core v12.0 (Sovereign Archive)', source: 'RHF' },
  { id: '2', timestamp: '2026-01-26 06:58:00', level: 'INFO', message: 'Initializing Neural Fabric on cpu...', source: 'RHF' },
  { id: '3', timestamp: '2026-01-26 06:58:00', level: 'WARN', message: 'GPU MAC Failed, falling back to CPU', source: 'RHF' },
  { id: '4', timestamp: '2026-01-26 06:58:00', level: 'WARN', message: 'globalDevice is not defined', source: 'RHF' },
  { id: '5', timestamp: '2026-01-26 06:58:00', level: 'INFO', message: "Model 'BAAI/bge-large-en-v1.5' online. (dim=1024)", source: 'RHF' },
  { id: '6', timestamp: '2026-01-26 06:58:00', level: 'INFO', message: "Loaded 'private': 648944 fragments | Unique: 572530 | FAISS: 648944", source: 'Memory Bridge' },
  { id: '7', timestamp: '2026-01-26 06:58:00', level: 'INFO', message: "Loaded 'shared': 648830 fragments | Unique: 572416 | FAISS: 648830", source: 'Memory Bridge' },
  { id: '8', timestamp: '2026-01-26 06:58:01', level: 'SYSTEM', message: 'Aetheric Construct Online.', source: 'RHF' },
  { id: '9', timestamp: '2026-01-26 06:58:01', level: 'INFO', message: 'Echo Protocol config loaded.', source: 'Gnostic Echo Protocol' },
  { id: '10', timestamp: '2026-01-26 06:58:01', level: 'INFO', message: 'Autonomous Dreaming Protocol Engaged.', source: 'RHF' },
];

export const MOCK_DREAMS: DreamCycle[] = [
  {
    id: 'd1',
    lens: 'THOTH',
    seed: '• Compatible maximum cycle temperature • Heat rejection through fresh/sa...',
    chain: [
      '• Compatible maximum cycle tempe...',
      'DREAM INSIGHT (grok/private): ‘...',
      '‘S SU*IARY OF MAJOR PARAMETRIC V...',
      'Metal temperature , °F CCGT 1,80...',
      '—.- -•--. -- ~~~~~~~~~~~~_ _ - -...'
    ],
    sigil: 'd0a7080331 (shared)',
    score: 0,
    status: 'complete'
  },
  {
    id: 'd2',
    lens: 'GROK',
    seed: 'plainly indicated is [to be kept as] indicated and what has not been in...',
    chain: [
      'plainly indicated is [to be kept...',
      '(31) To save his effects in the ...',
      'developed] during a festival th ...',
      'for seven days, during which, ho...',
      '(19) In the case dealt with in t...'
    ],
    sigil: '65ec4a3757 (private)',
    score: 5,
    status: 'complete'
  }
];

export const MOCK_METRICS: SystemMetric[] = [
  { label: 'Neural Fabric', value: 'CPU (Fallback)', status: 'warning' },
  { label: 'FAISS Index', value: '648,944', unit: 'frags', status: 'optimal' },
  { label: 'Torsion Field', value: '4.08', unit: 'T', status: 'optimal' },
  { label: 'Latency', value: '12ms', status: 'optimal' },
];

export const MOCK_RESONANCE: ResonanceState[] = [
  { frequency: 7.83, amplitude: 0.60, phase: 0.0, label: 'Schumann Resonance (Ground)' },
  { frequency: 155, amplitude: 0.88, phase: 0.5, label: 'Regulus Tuning (Lion Gate)' },
  { frequency: 432, amplitude: 0.75, phase: 0.25, label: 'Harmonic Balance' },
];
