import { create } from 'zustand';
import axios from 'axios';

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
  fetchHealthData: () => Promise<void>;
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
  setMetrics: (metrics) => set({ metrics, lastUpdated: new Date().toISOString() }),
  fetchHealthData: async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/system/health');
      if (response.data.status === 'SUCCESS') {
        const parsedMetrics = response.data.metrics.map((m: any) => ({
          id: m.id,
          name: m.id === 'cpu' ? 'NVR CPU Usage' : m.id === 'ram' ? 'Memory Usage' : m.id === 'disk' ? 'Storage Capacity' : 'Network Throughput',
          value: m.value,
          unit: m.unit,
          status: m.value > 90 ? 'critical' : m.value > 75 ? 'warning' : 'normal'
        }));
        set({ metrics: parsedMetrics, lastUpdated: new Date().toISOString() });
      }
    } catch (error) {
      console.error("Failed to fetch system health data", error);
    }
  }
}));
