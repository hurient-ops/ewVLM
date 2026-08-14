import { create } from 'zustand';

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

interface SystemHealthState {
  metrics: SystemMetric[];
  lastUpdated: string | null;
  
  updateMetric: (id: string, value: number, status: SystemMetric['status']) => void;
  setMetrics: (metrics: SystemMetric[]) => void;
}

export const useSystemHealthStore = create<SystemHealthState>((set) => ({
  metrics: [
    { id: 'cpu', name: 'NVR CPU Usage', value: 35, unit: '%', status: 'normal' },
    { id: 'ram', name: 'Memory Usage', value: 62, unit: '%', status: 'normal' },
    { id: 'disk', name: 'Storage Capacity', value: 85, unit: '%', status: 'warning' },
    { id: 'net', name: 'Network Throughput', value: 1.2, unit: 'Gbps', status: 'normal' },
  ],
  lastUpdated: null,
  
  updateMetric: (id, value, status) => set((state) => ({
    metrics: state.metrics.map(m => m.id === id ? { ...m, value, status } : m),
    lastUpdated: new Date().toISOString()
  })),
  setMetrics: (metrics) => set({ metrics, lastUpdated: new Date().toISOString() })
}));
