import { create } from 'zustand';

interface AuthState {
  currentView: 'login' | 'signup' | 'dashboard' | 'eventReview';
  setCurrentView: (view: 'login' | 'signup' | 'dashboard' | 'eventReview') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view })
}));
