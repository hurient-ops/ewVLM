import { create } from 'zustand';

export interface SopAction {
  clause: string;
  description: string;
  isCompleted: boolean;
}

interface SopState {
  currentEventId: string | null;
  ruleTitle: string | null;
  actions: SopAction[];
  isSopActive: boolean;
  triggerSop: (eventId: string, title: string, initialActions: SopAction[]) => void;
  toggleAction: (index: number) => void;
  dismissSop: () => void;
}

export const useSopStore = create<SopState>((set) => ({
  currentEventId: null,
  ruleTitle: null,
  actions: [],
  isSopActive: false,
  triggerSop: (eventId, title, initialActions) => set({
    currentEventId: eventId,
    ruleTitle: title,
    actions: initialActions,
    isSopActive: true
  }),
  toggleAction: (index) => set((state) => ({
    actions: state.actions.map((act, i) => i === index ? { ...act, isCompleted: !act.isCompleted } : act)
  })),
  dismissSop: () => set({ currentEventId: null, ruleTitle: null, actions: [], isSopActive: false })
}));
