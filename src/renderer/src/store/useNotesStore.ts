import { create } from 'zustand'

export interface Note {
  id: string
  content: string
  x: number
  y: number
  width?: number
  height?: number
}

export interface NotesState {
  notes: Note[]
  past: Note[][]
  future: Note[][]
  addNote: () => void
  updateNotePosition: (id: string, x: number, y: number) => void
  updateNoteContent: (id: string, content: string) => void
  updateNoteSize: (id: string, width: number, height: number) => void
  deleteNote: (id: string) => void
  duplicateNote: (id: string) => void
  undo: () => void
  redo: () => void
  saveSnapshot: () => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [
    { id: '1', content: '"Com organização e tempo, acha-se o segredo de fazer tudo e bem feito" — Pitágoras.', x: 100, y: 100 }
  ],
  past: [],
  future: [],

  // ==========================================
  // MOTOR DA MÁQUINA DO TEMPO (UNDO/REDO)
  // ==========================================
  saveSnapshot: () => set((state) => ({
    past: [...state.past.slice(-49), state.notes], // Guarda as últimas 50 ações
    future: [] // Apaga o futuro se uma nova linha do tempo for criada
  })),

  undo: () => set((state) => {
    if (state.past.length === 0) return state; // Não há mais passado
    const previousNotes = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);
    return {
      past: newPast,
      future: [state.notes, ...state.future], // Manda o presente para o futuro
      notes: previousNotes // O passado vira o presente
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state; // Não há futuro
    const nextNotes = state.future[0];
    const newFuture = state.future.slice(1);
    return {
      past: [...state.past, state.notes], // O presente volta pro passado
      future: newFuture,
      notes: nextNotes // O futuro vira o presente
    };
  }),

  // ==========================================
  // AÇÕES (Com gatilhos de histórico embutidos)
  // ==========================================
  addNote: () => {
    get().saveSnapshot();
    set((state) => ({
      notes: [...state.notes, { 
        id: Date.now().toString(), 
        content: '', 
        x: 100 + Math.random() * 200, 
        y: 100 + Math.random() * 200,
      }]
    }));
  },

  deleteNote: (id) => {
    get().saveSnapshot();
    set((state) => ({
      notes: state.notes.filter(n => n.id !== id)
    }));
  },
  
  duplicateNote: (id) => {
    get().saveSnapshot();
    set((state) => {
      const noteToCopy = state.notes.find(n => n.id === id);
      if (!noteToCopy) return state;
      const newNote = {
        ...noteToCopy,
        id: Date.now().toString() + Math.random().toString().slice(2, 6), 
        x: noteToCopy.x + 40,
        y: noteToCopy.y + 40,
      };
      return { notes: [...state.notes, newNote] };
    });
  },

  // Atualizações contínuas NÃO disparam snapshot automático aqui (será controlado pela UI)
  updateNotePosition: (id, x, y) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, x, y } : n)
  })),

  updateNoteSize: (id, width, height) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, width, height } : n)
  })),

  updateNoteContent: (id, content) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, content } : n)
  })),
}))