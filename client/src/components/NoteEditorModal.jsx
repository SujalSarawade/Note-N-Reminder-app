import React, { useState, useEffect } from 'react';
import { X, Save, Pin, Trash2, Tag, Palette } from 'lucide-react';

const CATEGORIES = ['General', 'Work', 'Personal', 'Ideas', 'Study', 'To-Do'];

const COLOR_OPTIONS = [
  { value: '#ffffff', label: 'Default', bg: '#182234' },
  { value: '#1e3a5f', label: 'Blue', bg: '#132742' },
  { value: '#16362e', label: 'Emerald', bg: '#112d26' },
  { value: '#3a2e16', label: 'Amber', bg: '#302613' },
  { value: '#331c4b', label: 'Purple', bg: '#2b173e' },
  { value: '#441829', label: 'Rose', bg: '#381522' },
];

export function NoteEditorModal({ note, isOpen, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [color, setColor] = useState('#ffffff');
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setCategory(note.category || 'General');
      setColor(note.color || '#ffffff');
      setIsPinned(Boolean(note.is_pinned));
    } else {
      setTitle('');
      setContent('');
      setCategory('General');
      setColor('#ffffff');
      setIsPinned(false);
    }
    setError('');
  }, [note, isOpen]);

  // Handle Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, content, category, color, isPinned]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the note.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        id: note?.id,
        title: title.trim(),
        content,
        category,
        color,
        is_pinned: isPinned ? 1 : 0,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            {note ? 'Edit Note' : 'Create New Note'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className="btn-icon"
              style={{
                color: isPinned ? '#f59e0b' : '#64748b',
                background: isPinned ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                borderRadius: '8px',
                padding: '0.4rem',
              }}
              title={isPinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin size={20} fill={isPinned ? '#f59e0b' : 'none'} />
            </button>
            <button onClick={onClose} className="btn-icon">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', padding: '1.5rem', gap: '1.25rem' }}>
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
              Note Title
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="What's on your mind?..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              style={{ fontSize: '1.1rem', fontWeight: 600 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                <Tag size={14} /> Category
              </label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                <Palette size={14} /> Card Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px' }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: c.bg,
                      border: color === c.value ? '2px solid #6366f1' : '1px solid #475569',
                      transform: color === c.value ? 'scale(1.2)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
                Content
              </label>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {wordCount} words • {charCount} chars
              </span>
            </div>
            <textarea
              className="form-textarea"
              placeholder="Write your note details here... (Supports text, links, lists)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            marginTop: 'auto',
          }}>
            <div>
              {note && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this note?')) {
                      onDelete(note.id);
                      onClose();
                    }
                  }}
                  className="btn-danger"
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
