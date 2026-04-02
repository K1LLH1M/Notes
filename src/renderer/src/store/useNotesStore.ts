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
  addNote: () => void
  updateNotePosition: (id: string, x: number, y: number) => void
  updateNoteContent: (id: string, content: string) => void
  deleteNote: (id: string) => void
  duplicateNote: (id: string) => void
  updateNoteSize: (id: string, width: number, height: number) => void
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [
    { id: '1', content: '"Com organização e tempo, acha-se o segredo de fazer tudo e bem feito" — Pitágoras.', x: 100, y: 100 }
  ],
  addNote: () => set((state) => ({
    notes: [...state.notes, { 
      id: Date.now().toString(), 
      content: '', 
      x: 100 + Math.random() * 200, 
      y: 100 + Math.random() * 200,
    }]
  })),
  updateNotePosition: (id, x, y) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, x, y } : n)
  })),
  updateNoteContent: (id, content) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, content } : n)
  })),
  
  // Note a VÍRGULA aqui embaixo separando as funções
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter(n => n.id !== id)
  })), 
  
  duplicateNote: (id) => set((state) => {
    const noteToCopy = state.notes.find(n => n.id === id);
    if (!noteToCopy) return state;

    const newNote = {
      ...noteToCopy,
      id: Date.now().toString() + Math.random().toString().slice(2, 6), 
      x: noteToCopy.x + 40,
      y: noteToCopy.y + 40,
    };

    return { notes: [...state.notes, newNote] };
  }),
  updateNoteSize: (id, width, height) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, width, height } : n)
  })),
})) // <-- AQUI é onde a Store realmente deve ser fechada