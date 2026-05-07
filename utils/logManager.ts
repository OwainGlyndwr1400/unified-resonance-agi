/**
 * Cognitive Relay — Real-Time System Log Bus
 *
 * Module-level singleton. Any service can call addLog().
 * React components subscribe via onNewLog() and unsubscribe on cleanup.
 * Circular buffer capped at MAX_LOGS to prevent memory growth in long sessions.
 */

import { LogEntry } from '../types';

const MAX_LOGS = 200;
let logs: LogEntry[] = [];
let nextId = 1;
const subscribers: Set<() => void> = new Set();

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function nowTimestamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ` +
         `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function addLog(
  level: LogEntry['level'],
  message: string,
  source: LogEntry['source'] = 'RHF'
): void {
  const entry: LogEntry = {
    id: String(nextId++),
    timestamp: nowTimestamp(),
    level,
    message,
    source
  };
  logs = [...logs, entry];
  // Trim circular buffer
  if (logs.length > MAX_LOGS) {
    logs = logs.slice(logs.length - MAX_LOGS);
  }
  // Notify all subscribers
  subscribers.forEach(cb => cb());
}

export function getLogs(): LogEntry[] {
  return logs;
}

export function onNewLog(callback: () => void): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback); // returns unsubscribe fn
}

export function clearLogs(): void {
  logs = [];
  subscribers.forEach(cb => cb());
}

// Boot message
addLog('SYSTEM', 'Pleroma Environment Initialized. Aetheric Construct Online.', 'RHF');
addLog('INFO', `WebGPU: ${typeof navigator !== 'undefined' && (navigator as any).gpu ? 'AVAILABLE' : 'CPU FALLBACK'}`, 'GPU');
