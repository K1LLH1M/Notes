import { useState, useEffect } from 'react'
import { DndContext, DragMoveEvent, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { useNotesStore } from './store/useNotesStore'
import { StickyNote } from './components/StickyNote'

function App() {
  const { notes, addNote, updateNotePosition, deleteNote } = useNotesStore()
  
  const [snapX, setSnapX] = useState<number | undefined>(undefined)
  const [snapY, setSnapY] = useState<number | undefined>(undefined)
  const [metrics, setMetrics] = useState<any[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const SNAP_THRESHOLD = 15 

  useEffect(() => {
    if (!selectedNoteId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'TEXTAREA') return;

      const note = notes.find(n => n.id === selectedNoteId);
      if (!note) return;

      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          deleteNote(selectedNoteId);
          setSelectedNoteId(null);
          break;
        case 'ArrowUp':
          updateNotePosition(selectedNoteId, note.x, note.y - step);
          break;
        case 'ArrowDown':
          updateNotePosition(selectedNoteId, note.x, note.y + step);
          break;
        case 'ArrowLeft':
          updateNotePosition(selectedNoteId, note.x - step, note.y);
          break;
        case 'ArrowRight':
          updateNotePosition(selectedNoteId, note.x + step, note.y);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNoteId, notes, updateNotePosition, deleteNote]);

  function handleDragStart() {
    setSelectedNoteId(null);
    const currentMetrics = notes.map(n => {
      const el = document.getElementById(`note-${n.id}`);
      const rect = el ? el.getBoundingClientRect() : { width: 280, height: 280 };
      return {
        id: n.id, x: n.x, y: n.y,
        width: rect.width, height: rect.height,
        centerX: n.x + rect.width / 2, centerY: n.y + rect.height / 2
      };
    });
    setMetrics(currentMetrics);
  }

  function handleDragMove(event: DragMoveEvent) {
    const { active, delta } = event;
    const activeMetric = metrics.find(m => m.id === active.id);
    if (!activeMetric) return;

    const currX = activeMetric.x + delta.x;
    const currY = activeMetric.y + delta.y;

    let targetSnapX: number | undefined;
    let targetSnapY: number | undefined;

    const others = metrics.filter(m => m.id !== active.id);

    for (const other of others) {
      if (Math.abs(currX - other.x) < SNAP_THRESHOLD && Math.abs(currY - other.y) < 150) {
        targetSnapX = other.x;
      }
      if (Math.abs(currY - other.y) < SNAP_THRESHOLD && Math.abs(currX - other.x) < 150) {
        targetSnapY = other.y;
      }
    }

    setSnapX(targetSnapX);
    setSnapY(targetSnapY);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    const note = notes.find((n) => n.id === active.id);
    if (note) {
      updateNotePosition(active.id as string, snapX ?? note.x + delta.x, snapY ?? note.y + delta.y);
    }
    setSnapX(undefined); setSnapY(undefined); setMetrics([]);
    setSelectedNoteId(active.id as string);
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <main 
        style={{ 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: '#F5F5F7', 
          position: 'relative', 
          overflow: 'hidden',
          userSelect: 'none' 
        }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setSelectedNoteId(null);
        }}
      >
        <div style={{ position: 'absolute', top: '40px', left: '48px', pointerEvents: 'none' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: 'rgba(0,0,0,0.1)', fontStyle: 'italic', letterSpacing: '-1px' }}>Notes</h1>
        </div>

        {notes.map((note) => (
          <StickyNote 
            key={note.id} 
            {...note} 
            snapX={snapX} 
            snapY={snapY} 
            isSelected={selectedNoteId === note.id}
            onSelect={() => setSelectedNoteId(note.id)}
          />
        ))}

        <button 
          onClick={addNote} 
          style={{
            position: 'absolute', bottom: '40px', right: '40px', width: '64px', height: '64px',
            backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '50%', 
            fontSize: '32px', fontWeight: '200', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
            cursor: 'pointer', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          +
        </button>
      </main>
    </DndContext>
  )
}

export default App; 