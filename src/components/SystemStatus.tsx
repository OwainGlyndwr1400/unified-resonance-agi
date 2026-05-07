import React from 'react';
import { SystemMetric } from '../types';
import { AlertTriangle, CheckCircle, Activity, Cpu } from 'lucide-react';

interface SystemStatusProps {
  metrics: SystemMetric[];
}

function valueClass(status: SystemMetric['status']): string {
  if (status === 'warning')  return 'text-amber-500';
  if (status === 'critical') return 'text-red-500';
  if (status === 'fallback') return 'text-blue-400';
  return 'text-emerald-400';
}

function StatusIcon({ status }: { status: SystemMetric['status'] }) {
  if (status === 'warning' || status === 'critical')
    return <AlertTriangle className={`w-4 h-4 shrink-0 ${status === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />;
  if (status === 'fallback')
    return <Cpu className="w-4 h-4 shrink-0 text-blue-400" />;
  return <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ metrics }) => {
  return (
    <div className="w-full">
      <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-slate-400 flex items-center gap-2">
        <Activity className="w-4 h-4" /> System Status
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-slate-950/60 rounded-lg border border-slate-800 p-2 flex flex-col gap-1">
            <span className="text-[9px] uppercase text-slate-500 mono tracking-wider">{metric.label}</span>
            <div className="flex items-center gap-1.5">
              <StatusIcon status={metric.status} />
              <span className={`mono text-xs font-medium ${valueClass(metric.status)}`}>
                {metric.value}
                {metric.unit && <span className="text-[10px] ml-1 text-slate-600">{metric.unit}</span>}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
