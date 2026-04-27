import { create } from 'zustand';
interface ChatStoreState {
  activeSessionId: string | null;
  setActiveSession: (sessionId: string | null) => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
  activeSessionId: null,
  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
}));
