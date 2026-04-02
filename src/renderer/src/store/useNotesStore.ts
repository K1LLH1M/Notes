import { create } from 'zustand'

export interface Note {
  id: string
  content: string
  x: number
  y: number
}

interface NotesState {
  notes: Note[]
  addNote: () => void
  updateNotePosition: (id: string, x: number, y: number) => void
  updateNoteContent: (id: string, content: string) => void
  deleteNote: (id: string) => void
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [
    { id: '1', content: 'Bem-vindo ao AETHER Flow! ', x: 100, y: 100 }
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
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter(n => n.id !== id)
  }))
}))