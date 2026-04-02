import styles from './StickyNote.module.css';
import { useDraggable } from '@dnd-kit/core';
import { useNotesStore } from '../store/useNotesStore';

export function StickyNote({ id, content, x, y, width, height, snapX, snapY, isSelected, onSelect }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const updateContent = useNotesStore((state) => state.updateNoteContent);
  const updateNoteSize = useNotesStore((state) => state.updateNoteSize);

  // Tamanhos iniciais caso a nota não tenha ainda no banco
  const currentWidth = width || 280;
  const currentHeight = height || 280;

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
    width: `${currentWidth}px`,   // NOVO: Lê o tamanho do estado
    height: `${currentHeight}px`, // NOVO: Lê o tamanho do estado
    zIndex: isDragging || isSelected ? 1000 : 1,
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    boxShadow: isSelected 
      ? '0 20px 50px rgba(0,0,0,0.12)' 
      : '0 15px 35px rgba(0,0,0,0.05)'
  };

  // ==========================================
  // O MOTOR DE RESIZE COM SNAPPING
  // ==========================================
  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation(); // Impede que o Dnd-kit ache que estamos movendo a nota toda
    onSelect(e); // Seleciona a nota

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = currentWidth;
    const startHeight = currentHeight;
    const SNAP_THRESHOLD = 15;

    // Busca as notas fresquinhas da store para não usar estado velho
    const allNotes = useNotesStore.getState().notes;

    const onPointerMove = (moveEvent: PointerEvent) => {
      let newWidth = startWidth + (moveEvent.clientX - startX);
      let newHeight = startHeight + (moveEvent.clientY - startY);

      // Procura por travas (Snaps) com outras notas
      allNotes.forEach(other => {
        if (other.id === id) return;
        
        const otherWidth = other.width || 280;
        const otherHeight = other.height || 280;

        // 1. LARGURA: Trava se a largura for igual OU se a borda direita alinhar com a direita de outra nota
        if (Math.abs(newWidth - otherWidth) < SNAP_THRESHOLD) {
          newWidth = otherWidth; // Mesma largura
        } else if (Math.abs((x + newWidth) - (other.x + otherWidth)) < SNAP_THRESHOLD) {
          newWidth = (other.x + otherWidth) - x; // Borda direita com borda direita
        }

        // 2. ALTURA: Trava se a altura for igual OU se a borda inferior alinhar com a inferior de outra nota
        if (Math.abs(newHeight - otherHeight) < SNAP_THRESHOLD) {
          newHeight = otherHeight; // Mesma altura
        } else if (Math.abs((y + newHeight) - (other.y + otherHeight)) < SNAP_THRESHOLD) {
          newHeight = (other.y + otherHeight) - y; // Borda inferior com borda inferior
        }
      });

      // Limites mínimos e máximos para a nota não quebrar o design
      newWidth = Math.max(250, Math.min(newWidth, 600));
      newHeight = Math.max(200, Math.min(newHeight, 600));

      updateNoteSize(id, newWidth, newHeight);
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
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
      onPointerDown={(e) => onSelect(e)} 
    >
      {/* Área de Drag */}
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
        onPointerDown={(e) => { e.stopPropagation(); onSelect(e); }} 
      />

      <div className={styles.footer}>
        <span className={styles.dateLabel}>{getFormattedDate()}</span>
        <div className={styles.markerIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        </div>
      </div>

      {/* NOVO: Puxador de Redimensionamento Inteligente */}
      <div 
        className={styles.resizer} 
        onPointerDown={handleResizeStart}
      />
    </div>
  );
}