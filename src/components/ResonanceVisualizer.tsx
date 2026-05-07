import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ResonanceState } from '../types';

interface ResonanceVisualizerProps {
  resonance: ResonanceState[];
}

export const ResonanceVisualizer: React.FC<ResonanceVisualizerProps> = ({ resonance }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    svg.selectAll('*').remove();

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveBasis);

    const generateWave = (freq: number, amp: number, phase: number) => {
      return Array.from({ length: 101 }, (_, i) => {
        return Math.sin((i * freq * 0.1) + phase) * amp;
      });
    };

    resonance.forEach((res, index) => {
      const data = generateWave(res.frequency, res.amplitude, res.phase);
      
      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#3b82f6')
        .attr('stroke-width', 2)
        .attr('opacity', 0.6)
        .attr('d', line);
    });

    // Add grid lines
    const grid = svg.append('g').attr('class', 'grid');
    grid.selectAll('line.horizontal')
      .data(d3.range(0, height, height / 10))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => d)
      .attr('y2', (d) => d)
      .attr('stroke', '#ffffff')
      .attr('stroke-opacity', 0.05);

  }, [resonance]);

  return (
    <div className="w-full h-64 bg-black/90 border border-white/10 rounded-xl overflow-hidden relative backdrop-blur-md">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest">Harmonic Resonance</h3>
        <div className="flex gap-2">
          {resonance.map((res, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
              {res.frequency}Hz
            </span>
          ))}
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
