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

export interface CameraGroup {
  id: string;
  name: string;
  description?: string;
}

export interface CameraDevice {
  id: string;
  name: string;
  ipAddress: string;
  macAddress: string;
  status: 'online' | 'offline' | 'warning';
  vlmEnabled: boolean;
  groupId: string | null;
  resolution: string;
  fps: number;
}

interface CameraStoreState {
  // Original Monitor A properties
  slots: CameraSlot[];
  activeLayout: number; // 1, 2, 4, 8, 16, 32
  selectedCameraId: string | null;
  setSlots: (slots: CameraSlot[]) => void;
  setLayout: (layout: number) => void;
  selectCamera: (cameraId: string | null) => void;
  updateSlotStatus: (slotId: number, status: CameraSlot['status'], updates: Partial<CameraSlot>) => void;
  resetSlot: (slotId: number) => void;

  // New Camera List properties
  groups: CameraGroup[];
  cameras: CameraDevice[];
  addGroup: (group: CameraGroup) => void;
  updateCamera: (id: string, data: Partial<CameraDevice>) => void;
  deleteCamera: (id: string) => void;
  changeCameraGroup: (cameraId: string, newGroupId: string | null) => void;
}

const generateInitialSlots = (): CameraSlot[] => {
  const slots: CameraSlot[] = [];
  for (let i = 1; i <= 36; i++) {
    slots.push({ slotId: i, cameraId: null, cameraName: null, status: 'empty', fps: 0, detections: [], rtspUrl: null });
  }
  return slots;
};

// 초기 Mock 데이터
const initialGroups: CameraGroup[] = [
  { id: 'g-1', name: '섹터 1 (본동 로비)' },
  { id: 'g-2', name: '섹터 2 (지하 주차장)' },
  { id: 'g-3', name: '섹터 3 (자재 창고)' },
  { id: 'g-4', name: '섹터 4 (외곽 펜스)' }
];

const initialCameras: CameraDevice[] = [
  { id: 'CAM-01', name: '로비 메인 게이트', ipAddress: '192.168.10.101', macAddress: '00:1A:2B:3C:01', status: 'online', vlmEnabled: true, groupId: 'g-1', resolution: '4K', fps: 30 },
  { id: 'CAM-02', name: '로비 인포데스크', ipAddress: '192.168.10.102', macAddress: '00:1A:2B:3C:02', status: 'online', vlmEnabled: true, groupId: 'g-1', resolution: 'FHD', fps: 30 },
  { id: 'CAM-03', name: '주차장 B1 A구역', ipAddress: '192.168.10.103', macAddress: '00:1A:2B:3C:03', status: 'offline', vlmEnabled: false, groupId: 'g-2', resolution: 'FHD', fps: 15 },
  { id: 'CAM-04', name: '자재 창고 입구', ipAddress: '192.168.10.104', macAddress: '00:1A:2B:3C:04', status: 'warning', vlmEnabled: true, groupId: 'g-3', resolution: '4K', fps: 30 },
  { id: 'CAM-05', name: '서문 펜스', ipAddress: '192.168.10.105', macAddress: '00:1A:2B:3C:05', status: 'online', vlmEnabled: true, groupId: 'g-4', resolution: '4K', fps: 15 },
  { id: 'CAM-06', name: '신규 설치 (미배정)', ipAddress: '192.168.10.106', macAddress: '00:1A:2B:3C:06', status: 'online', vlmEnabled: false, groupId: null, resolution: 'FHD', fps: 30 },
];

export const useCameraStore = create<CameraStoreState>((set) => ({
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
  })),

  groups: initialGroups,
  cameras: initialCameras,
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  updateCamera: (id, data) => set((state) => ({
    cameras: state.cameras.map((cam) => cam.id === id ? { ...cam, ...data } : cam)
  })),
  deleteCamera: (id) => set((state) => ({
    cameras: state.cameras.filter((cam) => cam.id !== id)
  })),
  changeCameraGroup: (cameraId, newGroupId) => set((state) => ({
    cameras: state.cameras.map((cam) => cam.id === cameraId ? { ...cam, groupId: newGroupId } : cam)
  })),
}));
