import { create } from 'zustand';
import { API } from '../api/client';
import axios from 'axios';

export interface PtzPreset {
  id: string;
  name: string;
  pan: number;
  tilt: number;
  zoom: number;
}

export interface PtzSchedule {
  id?: number;
  name: string;
  camera_id: string;
  schedule_data: any;
  is_active?: number;
}

interface PtzState {
  activeCameraId: string | null;
  presets: PtzPreset[];
  schedules: PtzSchedule[];
  isPatrolling: boolean;
  
  setActiveCamera: (cameraId: string) => void;
  setPresets: (presets: PtzPreset[]) => void;
  addPreset: (preset: PtzPreset) => void;
  togglePatrol: () => void;
  
  fetchSchedules: () => Promise<void>;
  addSchedule: (schedule: PtzSchedule) => Promise<void>;
  deleteSchedule: (id: number) => Promise<void>;
}

export const usePtzStore = create<PtzState>((set) => ({
  activeCameraId: null,
  presets: [],
  schedules: [],
  isPatrolling: false,
  
  setActiveCamera: (cameraId) => set({ activeCameraId: cameraId }),
  setPresets: (presets) => set({ presets }),
  addPreset: (preset) => set((state) => ({ presets: [...state.presets, preset] })),
  togglePatrol: () => set((state) => ({ isPatrolling: !state.isPatrolling })),
  
  fetchSchedules: async () => {
    try {
      const data = await API.getPtzSchedules();
      set({ schedules: data });
    } catch (err) {
      console.error("Failed to fetch PTZ schedules:", err);
    }
  },
  
  addSchedule: async (schedule) => {
    try {
      await API.createPtzSchedule(schedule);
      await usePtzStore.getState().fetchSchedules();
    } catch (err) {
      console.error("Failed to add PTZ schedule:", err);
    }
  },
  
  deleteSchedule: async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/ptz-schedules/${id}`);
      await usePtzStore.getState().fetchSchedules();
    } catch (err) {
      console.error("Failed to delete PTZ schedule:", err);
    }
  }
}));

