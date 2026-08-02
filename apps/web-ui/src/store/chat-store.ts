import { create } from 'zustand';
interface ChatStoreState {
  activeSessionId: string | null;
  activeProjectId: string | null;
  pendingNewChatProjectId: string | null;
  pendingNewChatPlacement: 'normal' | 'project' | null;
  sessionListRefreshVersion: number;
  setActiveSession: (sessionId: string | null) => void;
  setActiveProject: (projectId: string | null) => void;
  setPendingNewChatProject: (projectId: string | null) => void;
  setPendingNewChatPlacement: (placement: 'normal' | 'project' | null) => void;
  refreshSessionList: () => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
  activeSessionId: null,
  activeProjectId: null,
  pendingNewChatProjectId: null,
  pendingNewChatPlacement: null,
  sessionListRefreshVersion: 0,
  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
  setActiveProject: (projectId) => set({ activeProjectId: projectId }),
  setPendingNewChatProject: (projectId) => set({ pendingNewChatProjectId: projectId }),
  setPendingNewChatPlacement: (placement) => set({ pendingNewChatPlacement: placement }),
  refreshSessionList: () =>
    set((state) => ({
      sessionListRefreshVersion: state.sessionListRefreshVersion + 1,
    })),
}));
