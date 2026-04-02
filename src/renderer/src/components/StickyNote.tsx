import styles from './StickyNote.module.css';
import { useDraggable } from '@dnd-kit/core';
import { useNotesStore } from '../store/useNotesStore';

export function StickyNote({ id, content, x, y, snapX, snapY, isSelected, onSelect }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const updateContent = useNotesStore((state) => state.updateNoteContent);

  const getSnapTransform = () => {
    if (!transform) return undefined;
    
    let tx = transform.x;
    let ty = transform.y;

    if (isDragging) {
      if (snapX !== undefined) tx = snapX - x;
      if (snapY !== undefined) ty = snapY - y;
    }

    return `translate3d(${tx}px, ${ty}px, 0)`;
  };

  const dynamicStyle = {
    transform: getSnapTransform(),
    left: `${x}px`,
    top: `${y}px`,
    zIndex: isDragging || isSelected ? 1000 : 1,
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    
    // REMOVIDO: A borda azul sumiu. 
    // Mantemos uma sombra levemente mais forte apenas para indicar foco internamente
    boxShadow: isSelected 
      ? '0 20px 50px rgba(0,0,0,0.12)' 
      : '0 15px 35px rgba(0,0,0,0.05)'
  };

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleString('en-US', { month: 'short' }) + " " + now.getDate();
  };

  return (
    <div
      id={`note-${id}`}
      ref={setNodeRef}
      style={dynamicStyle}
      className={styles.noteCard}
      // NOVO: Clicar na nota seleciona ela
      onPointerDown={onSelect} 
    >
      <div 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '40px', cursor: 'grab', zIndex: 10 }}
        {...listeners}
        {...attributes}
      />

      <textarea 
        className={styles.textarea} 
        value={content}
        placeholder="Escreva algo..."
        onChange={(e) => updateContent(id, e.target.value)}
        // NOVO: Ao focar no texto, seleciona a nota. O stopPropagation impede que arraste.
        onPointerDown={(e) => { e.stopPropagation(); onSelect(); }} 
      />

      <div className={styles.footer}>
        <span className={styles.dateLabel}>{getFormattedDate()}</span>
        <div className={styles.markerIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}