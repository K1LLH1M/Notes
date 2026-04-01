import { create } from 'zustand'

export interface Note {
  id: string
  content: string
  x: number
  y: number
  color: string
}

interface NotesState {
  notes: Note[]
  addNote: () => void
  updateNotePosition: (id: string, x: number, y: number) => void
  updateNoteContent: (id: string, content: string) => void
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [
    { id: '1', content: 'Eu preciso...', x: 100, y: 100, color: 'bg-white/60' }
  ],
  addNote: () =>
    set((state) => ({
      notes: [
        ...state.notes,
        {
          id: Date.now().toString(),
          content: '',
          x: 50 + Math.random() * 200,
          y: 50 + Math.random() * 200,
          color: 'bg-white/60'
        }
      ]
    })),
  updateNotePosition: (id, x, y) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, x, y } : n))
    })),
  updateNoteContent: (id, content) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, content } : n))
    }))
}))
