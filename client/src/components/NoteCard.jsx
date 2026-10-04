import React from 'react';
import { Pin, Trash2, Edit3, Calendar, Tag } from 'lucide-react';

const COLOR_CLASSES = {
  '#ffffff': 'note-color-default',
  '#1e3a5f': 'note-color-blue',
  '#16362e': 'note-color-emerald',
  '#3a2e16': 'note-color-amber',
  '#331c4b': 'note-color-purple',
  '#441829': 'note-color-rose',
};

export function NoteCard({ note, onEdit, onDelete, onTogglePin, onAddReminder }) {
  const colorClass = COLOR_CLASSES[note.color] || 'note-color-default';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className={`note-card ${colorClass} ${note.is_pinned ? 'pinned' : ''}`}
      onClick={() => onEdit(note)}
    >
      <div>
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {note.title}
          </h3>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            className="btn-icon"
            style={{
              color: note.is_pinned ? '#f59e0b' : '#64748b',
              transform: note.is_pinned ? 'scale(1.1)' : 'none',
              transition: 'all 0.2s ease',
            }}
            title={note.is_pinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin size={18} fill={note.is_pinned ? '#f59e0b' : 'none'} />
          </button>
        </div>

        {/* Content snippet */}
        <p style={{
          color: '#94a3b8',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          marginBottom: '1rem',
        }}>
          {note.content || <span style={{ fontStyle: 'italic', color: '#475569' }}>Empty note...</span>}
        </p>
      </div>

      {/* Card Footer */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className={`badge badge-${(note.category || 'general').toLowerCase()}`}>
              <Tag size={10} />
              {note.category || 'General'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddReminder(note);
              }}
              className="btn-icon"
              title="Add reminder for this note"
              style={{ color: '#38bdf8' }}
            >
              <Calendar size={15} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="btn-icon"
              title="Edit note"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete note "${note.title}"?`)) {
                  onDelete(note.id);
                }
              }}
              className="btn-icon"
              style={{ color: '#fb7185' }}
              title="Delete note"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem', textAlign: 'right' }}>
          {formatDate(note.updated_at || note.created_at)}
        </div>
      </div>
    </div>
  );
}
