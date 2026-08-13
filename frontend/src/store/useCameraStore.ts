import { create } from 'zustand';

export interface CameraSlot {
  slotId: number;
  cameraId: string | null;
  cameraName: string | null;
  status: 'empty' | 'linking' | 'active' | 'alert';
  fps: number;
  detections: string[];
  rtspUrl: string | null;
}

interface CameraState {
  slots: CameraSlot[];
  activeLayout: number; // 1, 2, 4, 8, 16, 32
  selectedCameraId: string | null;
  setSlots: (slots: CameraSlot[]) => void;
  setLayout: (layout: number) => void;
  selectCamera: (cameraId: string | null) => void;
  updateSlotStatus: (slotId: number, status: CameraSlot['status'], updates: Partial<CameraSlot>) => void;
  resetSlot: (slotId: number) => void;
}

const generateInitialSlots = (): CameraSlot[] => {
  const slots: CameraSlot[] = [];
  for (let i = 1; i <= 36; i++) {
    slots.push({ slotId: i, cameraId: null, cameraName: null, status: 'empty', fps: 0, detections: [], rtspUrl: null });
  }
  slots[0] = { ...slots[0], cameraId: 'CAM-01', cameraName: '외곽 1구역 펜스 북부', status: 'active', fps: 30.0, rtspUrl: 'rtsp://192.168.1.101/live' };
  slots[1] = { ...slots[1], cameraId: 'CAM-02', cameraName: '자재 창고 출입구', status: 'active', fps: 29.8, rtspUrl: 'rtsp://192.168.1.102/live' };
  return slots;
};

export const useCameraStore = create<CameraState>((set) => ({
  slots: generateInitialSlots(),
  activeLayout: 4,
  selectedCameraId: null,
  setSlots: (slots) => set({ slots }),
  setLayout: (activeLayout) => set({ activeLayout }),
  selectCamera: (selectedCameraId) => set({ selectedCameraId }),
  updateSlotStatus: (slotId, status, updates) => set((state) => ({
    slots: state.slots.map((slot) => 
      slot.slotId === slotId ? { ...slot, status, ...updates } : slot
    )
  })),
  resetSlot: (slotId) => set((state) => ({
    slots: state.slots.map((slot) => 
      slot.slotId === slotId ? { ...slot, cameraId: null, cameraName: null, status: 'empty', fps: 0, detections: [], rtspUrl: null } : slot
    )
  }))
}));
