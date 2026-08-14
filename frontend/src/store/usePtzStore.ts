import { create } from 'zustand';

export interface PtzPreset {
  id: string;
  name: string;
  pan: number;
  tilt: number;
  zoom: number;
}

interface PtzState {
  activeCameraId: string | null;
  presets: PtzPreset[];
  isPatrolling: boolean;
  
  setActiveCamera: (cameraId: string) => void;
  setPresets: (presets: PtzPreset[]) => void;
  addPreset: (preset: PtzPreset) => void;
  togglePatrol: () => void;
}

export const usePtzStore = create<PtzState>((set) => ({
  activeCameraId: null,
  presets: [],
  isPatrolling: false,
  
  setActiveCamera: (cameraId) => set({ activeCameraId: cameraId }),
  setPresets: (presets) => set({ presets }),
  addPreset: (preset) => set((state) => ({ presets: [...state.presets, preset] })),
  togglePatrol: () => set((state) => ({ isPatrolling: !state.isPatrolling }))
}));
