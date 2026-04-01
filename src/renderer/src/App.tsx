import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { useNotesStore } from './store/useNotesStore'
import { StickyNote } from './components/StickyNote'

function App() {
  const { notes, addNote, updateNotePosition } = useNotesStore()

  // Sensores ajudam a distinguir entre clique e arrasto
  const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: { distance: 5 },}))

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event
    const note = notes.find((n) => n.id === active.id)
    if (note) {
      // Somamos a posição atual com o quanto ela foi movida (delta)
      updateNotePosition(active.id as string, note.x + delta.x, note.y + delta.y)
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <main className="h-screen w-screen bg-[#F5F5F7] relative overflow-hidden select-none">
        {/* Camada de Fundo/Título */}
        <div className="absolute top-10 left-12 pointer-events-none">
          <h1 className="text-3xl font-bold text-black/10 tracking-tighter italic">Notes</h1>
        </div>

        {/* Notas */}
        {notes.map((note) => (
          <StickyNote key={note.id} {...note} />
        ))}

        {/* Botão Flutuante */}
        <button
          onClick={addNote}
          className="absolute bottom-10 right-10 w-16 h-16 
                    bg-white/80 backdrop-blur-md
                    border border-white/50 text-gray-800
                    rounded-full text-4xl font-light
                    shadow-[0_10px_30px_rgba(0,0,0,0.1)]
                    hover:scale-110 active:scale-95 
                    transition-all flex items-center justify-center z-50
                    hover:bg-white"
        >
          +
        </button>
      </main>
    </DndContext>
  )
}

export default App