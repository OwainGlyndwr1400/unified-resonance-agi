
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import { Vector3 } from 'three';
import type { Mesh as MeshType, Group as GroupType } from 'three';
import { loadChunksFromDB } from '../utils/memoryDB';
import { NeuralChunk } from '../types';

interface Props {
  onBack: () => void;
}

interface GraphNode {
  id: string;
  source: string;
  family: string;
  sourceType: string;
  tier: string;
  trust: string;
  tokenEstimate: number;
  position: [number, number, number];
}

interface FamilyCluster {
  family: string;
  center: [number, number, number];
  count: number;
  nodes: GraphNode[];
}

interface GraphRenderData {
  clusters: FamilyCluster[];
  renderedNodes: number;
  renderedFamilies: number;
  totalFamilies: number;
  hiddenNodes: number;
  hiddenFamilies: number;
  sampled: boolean;
}

const MAX_GRAPH_NODES = 840;
const MAX_GRAPH_FAMILIES = 60;
const MAX_NODES_PER_FAMILY = 14;
const MAX_LABELLED_FAMILIES = 18;

function takeEvenly<T>(items: T[], count: number): T[] {
  if (count >= items.length) return items;
  if (count <= 1) return [items[0]];

  return Array.from({ length: count }, (_, index) => {
    const itemIndex = Math.round((index * (items.length - 1)) / (count - 1));
    return items[itemIndex];
  });
}

// Deterministic hash for family name → 3D position
function hashToPosition(str: string, radius: number): [number, number, number] {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  const phi = (Math.abs(h) % 1000) / 1000 * Math.PI * 2;
  const theta = (Math.abs(h >> 10) % 1000) / 1000 * Math.PI;
  const r = radius * (0.5 + (Math.abs(h >> 20) % 500) / 1000);
  return [
    r * Math.sin(theta) * Math.cos(phi),
    r * Math.sin(theta) * Math.sin(phi),
    r * Math.cos(theta),
  ];
}

const SOURCE_COLORS: Record<string, string> = {
  json: '#6366f1',    // indigo
  jsonl: '#a855f7',   // purple
  codex: '#14b8a6',   // teal
};

const TIER_SCALE: Record<string, number> = {
  core: 0.18,
  working: 0.14,
  cold: 0.10,
  quarantine: 0.06,
};

function ChunkNode({ node, isHovered, onHover, onUnhover }: {
  node: GraphNode;
  isHovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const meshRef = useRef<MeshType>(null);
  const color = SOURCE_COLORS[node.sourceType] || '#64748b';
  const scale = TIER_SCALE[node.tier] || 0.10;
  const targetScaleRef = useRef(new Vector3(scale, scale, scale));

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      const targetScale = isHovered ? scale * 2 : scale;
      targetScaleRef.current.set(targetScale, targetScale, targetScale);
      meshRef.current.scale.lerp(targetScaleRef.current, 0.1);
    }
  });

  return (
    <group position={node.position}>
      <Sphere ref={meshRef} args={[1, 6, 6]} scale={scale}
        onPointerOver={(e) => { e.stopPropagation(); onHover(); }}
        onPointerOut={(e) => { e.stopPropagation(); onUnhover(); }}
      >
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isHovered ? 0.8 : 0.3} transparent opacity={isHovered ? 1 : 0.7} />
      </Sphere>
      {isHovered && (
        <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div className="bg-slate-900/95 border border-slate-700 rounded-lg px-3 py-2 text-[10px] mono text-slate-200 whitespace-nowrap shadow-xl backdrop-blur-sm" style={{ transform: 'translateX(-50%)' }}>
            <div className="font-bold text-cyan-400">{node.source.substring(0, 60)}</div>
            <div className="text-slate-400 mt-1">{node.family} | {node.sourceType} | {node.tier} | {node.trust}</div>
            <div className="text-slate-500">{node.tokenEstimate} tokens</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function FamilyLabel({ cluster }: { cluster: FamilyCluster }) {
  return (
    <Html
      position={[cluster.center[0], cluster.center[1] + 1.8, cluster.center[2]]}
      center
      style={{ pointerEvents: 'none' }}
    >
      <div className="text-[10px] mono text-slate-400 whitespace-nowrap bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
        {cluster.family} ({cluster.count})
      </div>
    </Html>
  );
}

function RotatingScene({ clusters, hoveredId, setHoveredId }: {
  clusters: FamilyCluster[];
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
}) {
  const groupRef = useRef<GroupType>(null);

  useFrame((_, delta) => {
    if (groupRef.current && !hoveredId) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {clusters.map((cluster, index) => (
        <group key={cluster.family}>
          {index < MAX_LABELLED_FAMILIES && <FamilyLabel cluster={cluster} />}
          {cluster.nodes.map(node => (
            <ChunkNode
              key={node.id}
              node={node}
              isHovered={hoveredId === node.id}
              onHover={() => setHoveredId(node.id)}
              onUnhover={() => setHoveredId(null)}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

const SemanticGraph: React.FC<Props> = ({ onBack }) => {
  const [chunks, setChunks] = useState<NeuralChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    loadChunksFromDB().then(c => {
      setChunks(c || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const graphData = useMemo<GraphRenderData>(() => {
    if (chunks.length === 0) {
      return {
        clusters: [],
        renderedNodes: 0,
        renderedFamilies: 0,
        totalFamilies: 0,
        hiddenNodes: 0,
        hiddenFamilies: 0,
        sampled: false,
      };
    }

    const families: Record<string, NeuralChunk[]> = {};
    chunks.forEach(c => {
      const fam = c.semanticFamily || c.source.split(/[\s_\-/]+/)[0] || 'unknown';
      if (!families[fam]) families[fam] = [];
      families[fam].push(c);
    });

    const sortedFamilies = Object.entries(families).sort((a, b) => b[1].length - a[1].length);
    const visibleFamilies = sortedFamilies.slice(0, MAX_GRAPH_FAMILIES);
    const CLUSTER_RADIUS = 8;
    const SCATTER_RADIUS = 1.5;
    const familyBudget = Math.max(1, Math.floor(MAX_GRAPH_NODES / Math.max(1, visibleFamilies.length)));

    const clusters = visibleFamilies.map(([family, members]): FamilyCluster => {
      const center = hashToPosition(family, CLUSTER_RADIUS);
      const renderedMembers = takeEvenly(
        members,
        Math.min(members.length, MAX_NODES_PER_FAMILY, familyBudget)
      );

      const nodes: GraphNode[] = renderedMembers.map((chunk, i) => {
        const angle1 = (i / Math.max(1, renderedMembers.length)) * Math.PI * 2;
        const angle2 = (i * 137.5 * Math.PI / 180); // golden angle
        const r = SCATTER_RADIUS * Math.sqrt(i / Math.max(1, renderedMembers.length));

        return {
          id: chunk.id,
          source: chunk.source,
          family,
          sourceType: chunk.sourceType || 'json',
          tier: chunk.tier || 'cold',
          trust: chunk.trust || 'external',
          tokenEstimate: chunk.tokenEstimate || 0,
          position: [
            center[0] + r * Math.cos(angle1) * Math.sin(angle2),
            center[1] + r * Math.sin(angle1) * 0.6,
            center[2] + r * Math.cos(angle2),
          ],
        };
      });

      return { family, center, count: members.length, nodes };
    });
    const renderedNodes = clusters.reduce((sum, cluster) => sum + cluster.nodes.length, 0);
    const renderedFamilies = clusters.length;
    const totalFamilies = sortedFamilies.length;

    return {
      clusters,
      renderedNodes,
      renderedFamilies,
      totalFamilies,
      hiddenNodes: Math.max(0, chunks.length - renderedNodes),
      hiddenFamilies: Math.max(0, totalFamilies - renderedFamilies),
      sampled: renderedNodes < chunks.length || renderedFamilies < totalFamilies,
    };
  }, [chunks]);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-[0.2em] text-indigo-400 uppercase">Semantic Family Graph</h2>
            <p className="text-[10px] mono text-slate-500">
              {loading ? 'LOADING NEURAL ARCHIVE...' : `${graphData.renderedNodes} NODES RENDERED // ${graphData.renderedFamilies} FAMILIES`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] mono text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> JSON</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span> JSONL</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span> CODEX</span>
          <span className="ml-2 text-slate-600">HOVER FOR DETAILS // DRAG TO ORBIT</span>
        </div>
      </header>

      {!loading && graphData.sampled && (
        <div className="flex-shrink-0 border-b border-amber-500/15 bg-amber-500/5 px-8 py-2 text-[10px] mono text-amber-200/90">
          SAMPLE MODE FOR STABILITY: showing {graphData.renderedNodes.toLocaleString()} of {chunks.length.toLocaleString()} chunks
          {graphData.hiddenFamilies > 0 ? ` // ${graphData.hiddenFamilies.toLocaleString()} families collapsed` : ''}
        </div>
      )}

      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-indigo-400"></i>
          </div>
        ) : chunks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fa-solid fa-atom text-4xl text-slate-700 mb-4"></i>
              <p className="text-sm text-slate-400">No chunks in Neural Archive. Ingest data first.</p>
            </div>
          </div>
        ) : (
          <Canvas camera={{ position: [0, 5, 15], fov: 55 }} dpr={[1, 1.25]} gl={{ antialias: false, powerPreference: 'high-performance' }}>
            <color attach="background" args={['#020617']} />
            <fog attach="fog" args={['#020617', 15, 40]} />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -5, -10]} intensity={0.3} color="#6366f1" />

            <RotatingScene clusters={graphData.clusters} hoveredId={hoveredId} setHoveredId={setHoveredId} />

            <OrbitControls enableDamping dampingFactor={0.05} minDistance={3} maxDistance={30} />
          </Canvas>
        )}
      </div>
    </div>
  );
};

export default SemanticGraph;
