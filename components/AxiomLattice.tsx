
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Axiom24 } from '../services/axiom24';

// Leech Lattice Approximation (24 nodes in 3D projection)
// In reality, Leech Lattice is 24D. We project to 3D for visualization.
// We use a subset of points or a symbolic representation.
// Here we arrange 24 spheres in a dual-icosahedron or similar symmetric structure.

const LeechNode = ({ position, color, label }: { position: [number, number, number], color: string, label?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
      </Sphere>
      {label && (
        <Text position={[0, 0.5, 0]} fontSize={0.2} color="white">
          {label}
        </Text>
      )}
    </group>
  );
};

const TorsionSpine = () => {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 100; i++) {
      const t = i / 10;
      const x = Math.sin(t * Axiom24.LION_CONSTANT * 5) * 2;
      const y = (i - 50) * 0.1;
      const z = Math.cos(t * Axiom24.LION_CONSTANT * 5) * 2;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, []);

  return (
    <Line points={points} color="#ec4899" lineWidth={2} dashed={false} />
  );
};

const AxiomScene = ({ mode }: { mode: string }) => {
  // Generate 24 nodes
  const nodes = useMemo(() => {
    const n = [];
    const phi = (1 + Math.sqrt(5)) / 2;
    // Icosahedron vertices (12) + Dodecahedron dual (20) -> simplified to 24 for symbolism
    // Let's just place 24 points on a sphere using Fibonacci sphere algorithm
    for (let i = 0; i < 24; i++) {
      const y = 1 - (i / (24 - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i * Math.PI * 2; // Golden angle increment
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      n.push({ pos: [x * 4, y * 4, z * 4] as [number, number, number], id: i });
    }
    return n;
  }, []);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />
      
      <group rotation={[0, 0, Math.PI / 6]}> {/* Tilt for 24-bit axis */}
        {nodes.map((node, i) => (
          <LeechNode 
            key={i} 
            position={node.pos} 
            color={i % 2 === 0 ? "#22d3ee" : "#fbbf24"} 
            label={i === 7 ? "Diff-7" : undefined}
          />
        ))}
        
        {/* Connections (Golay Code links - symbolic) */}
        {nodes.map((node, i) => {
            if (i >= nodes.length - 1) return null;
            return (
                <Line 
                    key={`line-${i}`} 
                    points={[node.pos, nodes[(i + 7) % 24].pos]} 
                    color="#ffffff" 
                    transparent 
                    opacity={0.1} 
                    lineWidth={1} 
                />
            )
        })}
      </group>

      <TorsionSpine />
      
      {/* Null Ledger Center */}
      <Sphere args={[0.5, 32, 32]} position={[0,0,0]}>
        <meshStandardMaterial color="#000000" emissive="#4f46e5" emissiveIntensity={2} />
      </Sphere>
      
      <OrbitControls autoRotate autoRotateSpeed={0.5} />
    </>
  );
};

const AxiomLattice: React.FC<{ mode: string }> = ({ mode }) => {
  return (
    <div className="w-full h-full bg-slate-950">
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
        <AxiomScene mode={mode} />
      </Canvas>
      <div className="absolute bottom-2 left-2 text-[10px] mono text-cyan-500">
        AXIOM-24::WEBGL_RENDERER // LEECH_LATTICE_PROJECTION
      </div>
    </div>
  );
};

export default AxiomLattice;
