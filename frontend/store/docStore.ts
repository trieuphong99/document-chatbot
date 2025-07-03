import { create } from "zustand";

type DocData = any;

type StoredDoc = { name: string; data: DocData };

interface DocsState {
  files: StoredDoc[];
  addFile: (doc: StoredDoc) => void;
  lastOpened: StoredDoc | null;
  setLastOpened: (doc: StoredDoc) => void;
}

export const useDocsStore = create<DocsState>((set: any) => ({
  files: [],
  addFile: (doc: any) =>
    set((state: any) => ({ files: [...state.files, doc] })),
  lastOpened: null,
  setLastOpened: (doc: any) => set({ lastOpened: doc }),
}));
