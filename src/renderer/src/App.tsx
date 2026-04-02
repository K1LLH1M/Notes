import { useState, useEffect } from 'react'
import { DndContext, DragMoveEvent, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { useNotesStore } from './store/useNotesStore'
import { StickyNote } from './components/StickyNote'

function App() {
  const { notes, addNote, updateNotePosition, deleteNote, duplicateNote, undo, redo, saveSnapshot } = useNotesStore()
  
  const [snapX, setSnapX] = useState<number | undefined>(undefined)
  const [snapY, setSnapY] = useState<number | undefined>(undefined)
  const [metrics, setMetrics] = useState<any[]>([])
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const SNAP_THRESHOLD = 15 

  // ==========================================
  // ATALHOS DE TECLADO
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'TEXTAREA') return;

      const step = e.shiftKey ? 10 : 1;

      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) redo(); else undo();
          return;
        }
        if (e.key.toLowerCase() === 'y') {
          e.preventDefault(); redo(); return;
        }

        if (selectedNotes.length === 0) return;

        if (e.key.toLowerCase() === 'd') {
          e.preventDefault(); selectedNotes.forEach(id => duplicateNote(id)); return;
        }
        if (e.key === '[') {
          e.preventDefault();
          if (selectedNotes.length > 1) {
            saveSnapshot();
            const activeNotes = selectedNotes.map(id => notes.find(n => n.id === id)).filter(Boolean) as typeof notes;
            activeNotes.sort((a, b) => a.x - b.x);
            const anchorY = activeNotes[0].y;
            if (activeNotes.length === 2) {
              activeNotes.forEach(note => updateNotePosition(note.id, note.x, anchorY));
            } else {
              const gap = (activeNotes[activeNotes.length - 1].x - activeNotes[0].x) / (activeNotes.length - 1);
              activeNotes.forEach((note, index) => updateNotePosition(note.id, activeNotes[0].x + (gap * index), anchorY));
            }
          }
          return;
        }
        if (e.key === ']') {
          e.preventDefault();
          if (selectedNotes.length > 1) {
            saveSnapshot();
            const activeNotes = selectedNotes.map(id => notes.find(n => n.id === id)).filter(Boolean) as typeof notes;
            activeNotes.sort((a, b) => a.y - b.y);
            const anchorX = activeNotes[0].x;
            if (activeNotes.length === 2) {
              activeNotes.forEach(note => updateNotePosition(note.id, anchorX, note.y));
            } else {
              const gap = (activeNotes[activeNotes.length - 1].y - activeNotes[0].y) / (activeNotes.length - 1);
              activeNotes.forEach((note, index) => updateNotePosition(note.id, anchorX, activeNotes[0].y + (gap * index)));
            }
          }
          return;
        }
      }

      if (selectedNotes.length === 0) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedNotes.forEach(id => deleteNote(id));
        setSelectedNotes([]);
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) saveSnapshot();

      selectedNotes.forEach(id => {
        const note = notes.find(n => n.id === id);
        if (!note) return;
        switch (e.key) {
          case 'ArrowUp': updateNotePosition(id, note.x, note.y - step); break;
          case 'ArrowDown': updateNotePosition(id, note.x, note.y + step); break;
          case 'ArrowLeft': updateNotePosition(id, note.x - step, note.y); break;
          case 'ArrowRight': updateNotePosition(id, note.x + step, note.y); break;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotes, notes, updateNotePosition, deleteNote, duplicateNote, undo, redo, saveSnapshot]);

  // ==========================================
  // FUNÇÃO QUE RECUPERA A MULTI-SELEÇÃO
  // ==========================================
  const handleNoteSelect = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      setSelectedNotes(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
    } else {
      setSelectedNotes([id]);
    }
  };

  // ==========================================
  // DRAG & DROP E SNAPPING
  // ==========================================
  function handleDragStart() {
    saveSnapshot();
    const currentMetrics = notes.map(n => {
      const el = document.getElementById(`note-${n.id}`);
      const rect = el ? el.getBoundingClientRect() : { width: 280, height: 280 };
      return {
        id: n.id, x: n.x, y: n.y, width: rect.width, height: rect.height,
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
      if (Math.abs(currX - other.x) < SNAP_THRESHOLD && Math.abs(currY - other.y) < 150) targetSnapX = other.x;
      if (Math.abs(currY - other.y) < SNAP_THRESHOLD && Math.abs(currX - other.x) < 150) targetSnapY = other.y;
    }
    setSnapX(targetSnapX);
    setSnapY(targetSnapY);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    const note = notes.find((n) => n.id === active.id);
    if (note) updateNotePosition(active.id as string, snapX ?? note.x + delta.x, snapY ?? note.y + delta.y);
    setSnapX(undefined); setSnapY(undefined); setMetrics([]);
    if (selectedNotes.length <= 1) setSelectedNotes([active.id as string]);
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <main 
        style={{ width: '100vw', height: '100vh', backgroundColor: '#F5F5F7', position: 'relative', overflow: 'hidden', userSelect: 'none' }}
        onPointerDown={(e) => { if (e.target === e.currentTarget) setSelectedNotes([]); }}
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
            isSelected={selectedNotes.includes(note.id)}
            onSelect={(e: React.PointerEvent) => handleNoteSelect(e, note.id)}
          />
        ))}

        <button onClick={addNote} style={{ position: 'absolute', bottom: '40px', right: '40px', width: '64px', height: '64px', backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '50%', fontSize: '32px', fontWeight: '200', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', cursor: 'pointer', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          +
        </button>
      </main>
    </DndContext>
  )
}

export default App;