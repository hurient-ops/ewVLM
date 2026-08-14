import { create } from 'zustand';

export interface GisMarker {
  id: string;
  type: 'camera' | 'sensor' | 'incident';
  lat: number;
  lng: number;
  name: string;
  status: 'normal' | 'warning' | 'critical' | 'offline';
}

interface GisState {
  markers: GisMarker[];
  center: { lat: number, lng: number };
  zoomLevel: number;
  selectedMarkerId: string | null;
  
  setMarkers: (markers: GisMarker[]) => void;
  updateMarkerStatus: (id: string, status: GisMarker['status']) => void;
  setCenter: (lat: number, lng: number) => void;
  setZoomLevel: (zoom: number) => void;
  selectMarker: (id: string | null) => void;
}

export const useGisStore = create<GisState>((set) => ({
  markers: [],
  center: { lat: 37.5665, lng: 126.9780 }, // Default Seoul City Hall
  zoomLevel: 13,
  selectedMarkerId: null,
  
  setMarkers: (markers) => set({ markers }),
  updateMarkerStatus: (id, status) => set((state) => ({
    markers: state.markers.map(m => m.id === id ? { ...m, status } : m)
  })),
  setCenter: (lat, lng) => set({ center: { lat, lng } }),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  selectMarker: (id) => set({ selectedMarkerId: id })
}));
