import { create } from 'zustand';
import axios from 'axios';

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
  rtspUrl?: string; // Optional since it might be null initially
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
  fetchCameras: () => Promise<void>;
  addGroup: (group: CameraGroup) => void;
  deleteGroup: (groupId: string) => Promise<void>;
  addCamera: (camera: any) => Promise<void>;
  updateCamera: (id: string, data: Partial<CameraDevice>) => Promise<void>;
  deleteCamera: (id: string) => Promise<void>;
  changeCameraGroup: (cameraId: string, groupId: string | null) => Promise<void>;
}

const generateInitialSlots = (): CameraSlot[] => {
  const slots: CameraSlot[] = [];
  for (let i = 1; i <= 36; i++) {
    slots.push({ slotId: i, cameraId: null, cameraName: null, status: 'empty', fps: 0, detections: [], rtspUrl: null });
  }
  return slots;
};

// We will fetch groups from the backend API.
const initialGroups: CameraGroup[] = [];

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
  cameras: [],
  fetchCameras: async () => {
    try {
      // Fetch both groups and cameras
      const [groupsResponse, camerasResponse] = await Promise.all([
        axios.get('http://localhost:8000/api/v1/groups'),
        axios.get('http://localhost:8000/api/v1/cameras')
      ]);

      set({ groups: groupsResponse.data });

      const data = camerasResponse.data.map((c: any) => ({
        id: c.camera_id,
        name: c.name,
        ipAddress: c.ip_address,
        macAddress: '00:00:00:00:00:00', // Mock
        status: c.is_active ? 'online' : 'offline',
        vlmEnabled: !!c.vlm_enabled, // Cast to boolean
        groupId: c.group_id,
        rtspUrl: c.rtsp_url, // Added rtspUrl so it can be edited
        resolution: 'FHD',
        fps: 30
      }));
      set({ cameras: data });
    } catch (e) {
      console.error("Failed to fetch cameras:", e);
    }
  },
  addGroup: async (group) => {
    try {
      await axios.post('http://localhost:8000/api/v1/groups', {
        id: group.id,
        name: group.name,
        description: group.description
      });
      set((state) => ({ groups: [...state.groups, group] }));
    } catch (e) {
      console.error("Failed to add group:", e);
    }
  },
  deleteGroup: async (groupId) => {
    // 1. Find cameras that need to be updated
    const state = useCameraStore.getState();
    const camerasToUpdate = state.cameras.filter(cam => cam.groupId === groupId);

    // 2. Optimistic UI update
    set((s) => {
      const updatedCameras = s.cameras.map(cam => 
        cam.groupId === groupId ? { ...cam, groupId: null } : cam
      );
      return { 
        groups: s.groups.filter(g => g.id !== groupId),
        cameras: updatedCameras 
      };
    });

    // 3. Persist to API
    try {
      // Delete the group
      await axios.delete(`http://localhost:8000/api/v1/groups/${groupId}`);
      // Nullify camera groups
      await Promise.all(
        camerasToUpdate.map(cam => 
          axios.put(`http://localhost:8000/api/v1/cameras/${cam.id}`, { group_id: null })
        )
      );
    } catch (e) {
      console.error("Failed to update cameras on group delete:", e);
      // Rollback on failure
      await useCameraStore.getState().fetchCameras();
    }
  },
  addCamera: async (cameraData) => {
    try {
      await axios.post('http://localhost:8000/api/v1/cameras', {
        camera_id: cameraData.id,
        name: cameraData.name,
        ip_address: cameraData.ipAddress,
        rtsp_url: cameraData.rtspUrl,
        group_id: cameraData.groupId,
        vlm_enabled: cameraData.vlmEnabled
      });
      // Fetch again to update state
      await useCameraStore.getState().fetchCameras();
    } catch (e) {
      console.error("Failed to add camera:", e);
      throw e;
    }
  },
  updateCamera: async (id, data) => {
    try {
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.ipAddress !== undefined) payload.ip_address = data.ipAddress;
      if (data.rtspUrl !== undefined) payload.rtsp_url = data.rtspUrl;
      if (data.groupId !== undefined) payload.group_id = data.groupId;
      if (data.vlmEnabled !== undefined) payload.vlm_enabled = data.vlmEnabled;
      
      await axios.put(`http://localhost:8000/api/v1/cameras/${id}`, payload);
      await useCameraStore.getState().fetchCameras();
    } catch (e) {
      console.error("Failed to update camera:", e);
    }
  },
  deleteCamera: async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/cameras/${id}`);
      await useCameraStore.getState().fetchCameras();
    } catch (e) {
      console.error("Failed to delete camera:", e);
    }
  },
  changeCameraGroup: async (cameraId, newGroupId) => {
    // 1. Optimistic update
    set((state) => ({
      cameras: state.cameras.map((cam) => cam.id === cameraId ? { ...cam, groupId: newGroupId } : cam)
    }));
    // 2. Persist to API
    try {
      // Pass null explicitly if unassigned
      const payload = { group_id: newGroupId === 'none' ? null : newGroupId };
      await axios.put(`http://localhost:8000/api/v1/cameras/${cameraId}`, payload);
    } catch (e) {
      console.error("Failed to change camera group:", e);
      // Rollback on failure
      await useCameraStore.getState().fetchCameras();
    }
  },
}));
