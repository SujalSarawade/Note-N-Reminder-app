import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, Bookmark, CheckSquare } from 'lucide-react';

export function ReminderModal({ isOpen, onClose, onSave, notes = [], initialData = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [noteId, setNoteId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to format ISO to datetime-local string (YYYY-MM-DDTHH:mm)
  const toDateTimeLocal = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'medium');
      setNoteId(initialData.note_id || '');
      
      if (initialData.due_date) {
        const d = new Date(initialData.due_date);
        setDueDate(toDateTimeLocal(d));
      } else {
        // Default 1 hour from now
        const defaultTime = new Date(Date.now() + 60 * 60 * 1000);
        setDueDate(toDateTimeLocal(defaultTime));
      }
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setNoteId('');
      // Default 1 hour from now
      const defaultTime = new Date(Date.now() + 60 * 60 * 1000);
      setDueDate(toDateTimeLocal(defaultTime));
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const setQuickTime = (minutes) => {
    const d = new Date(Date.now() + minutes * 60 * 1000);
    setDueDate(toDateTimeLocal(d));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the reminder.');
      return;
    }
    if (!dueDate) {
      setError('Please pick a scheduled date and time.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        id: initialData?.id,
        title: title.trim(),
        description: description.trim(),
        due_date: new Date(dueDate).toISOString(),
        priority,
        note_id: noteId ? Number(noteId) : null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar size={22} style={{ color: '#38bdf8' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {initialData?.id ? 'Edit Reminder' : 'Set New Reminder'}
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
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
              Reminder Title *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Call dentist, Review notes, Submit assignment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
              <Clock size={15} /> Scheduled Date & Time *
            </label>
            <input
              type="datetime-local"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            
            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setQuickTime(10)}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                +10 mins
              </button>
              <button
                type="button"
                onClick={() => setQuickTime(60)}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                +1 hour
              </button>
              <button
                type="button"
                onClick={() => setQuickTime(24 * 60)}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                Tomorrow
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                <AlertCircle size={15} /> Priority
              </label>
              <select
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority (Urgent)</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                <Bookmark size={15} /> Link to Note (Optional)
              </label>
              <select
                className="form-input"
                value={noteId}
                onChange={(e) => setNoteId(e.target.value)}
              >
                <option value="">None (Standalone)</option>
                {notes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
              Additional Details (Optional)
            </label>
            <textarea
              className="form-textarea"
              placeholder="Add extra context or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ minHeight: '80px' }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-color)',
          }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              <CheckSquare size={16} /> {isSubmitting ? 'Saving...' : 'Set Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
