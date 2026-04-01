import styles from './StickyNote.module.css';
import { useDraggable } from '@dnd-kit/core';
import { useNotesStore } from '../store/useNotesStore';

  export function StickyNote({ id, content, x, y }: any) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const updateContent = useNotesStore((state) => state.updateNoteContent);

  const dynamicStyle = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    left: `${x}px`,
    top: `${y}px`,
  };

  // Formata a data como "Jan 13"
  const getFormattedDate = () => {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'short' });
    const day = now.getDate();
    return `${month} ${day}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={dynamicStyle}
      className={styles.noteCard}
    >
      {/* Área superior invisível exclusiva para drag (evita conflito com resize e texto) */}
      <div 
        className="absolute top-0 left-0 w-full h-12 cursor-grab active:cursor-grabbing"
        {...listeners}
        {...attributes}
      />

      <textarea 
        className={styles.contentArea || styles.textarea} 
        value={content}
        placeholder="Escreva algo..."
        onChange={(e) => updateContent(id, e.target.value)}
        onPointerDown={(e) => e.stopPropagation()} 
      />

      <div className={styles.footer}>
        <span className={styles.dateLabel}>{getFormattedDate()}</span>
        
        <div className={styles.markerIcon}>
          {/* Ícone de marcador (exemplo: uma estrela ou círculo) */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}