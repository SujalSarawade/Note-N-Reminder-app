import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Trash2, Edit3, AlertCircle, Bookmark, Plus } from 'lucide-react';

export function ReminderList({ reminders, onToggle, onEdit, onDelete, onNewReminder }) {
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'

  const formatDueDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = d - now;
    const diffMinutes = Math.round(diff / (1000 * 60));
    const diffHours = Math.round(diff / (1000 * 60 * 60));
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));

    let relative = '';
    let isOverdue = diff < 0;

    if (Math.abs(diffMinutes) < 60) {
      relative = isOverdue ? `${Math.abs(diffMinutes)}m overdue` : `in ${diffMinutes}m`;
    } else if (Math.abs(diffHours) < 24) {
      relative = isOverdue ? `${Math.abs(diffHours)}h overdue` : `in ${diffHours}h`;
    } else {
      relative = isOverdue ? `${Math.abs(diffDays)}d overdue` : `in ${diffDays}d`;
    }

    const formatted = d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return { formatted, relative, isOverdue };
  };

  const filtered = reminders.filter((r) => {
    if (filter === 'pending') return !r.is_completed;
    if (filter === 'completed') return r.is_completed;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: '#111827', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              background: filter === 'all' ? '#1f2d45' : 'transparent',
              color: filter === 'all' ? '#f8fafc' : '#94a3b8',
              border: 'none',
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All ({reminders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            style={{
              background: filter === 'pending' ? '#1f2d45' : 'transparent',
              color: filter === 'pending' ? '#f8fafc' : '#94a3b8',
              border: 'none',
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Pending ({reminders.filter((r) => !r.is_completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            style={{
              background: filter === 'completed' ? '#1f2d45' : 'transparent',
              color: filter === 'completed' ? '#f8fafc' : '#94a3b8',
              border: 'none',
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Completed ({reminders.filter((r) => r.is_completed).length})
          </button>
        </div>

        <button onClick={onNewReminder} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <Plus size={16} /> New Reminder
        </button>
      </div>

      {/* Reminder Cards */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3.5rem 1rem',
          background: 'rgba(17, 24, 39, 0.4)',
          borderRadius: '16px',
          border: '1px dashed var(--border-color)',
        }}>
          <Clock size={40} style={{ color: '#475569', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>
            No reminders found
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
            {filter === 'all'
              ? "You haven't scheduled any reminders yet."
              : `No ${filter} reminders at the moment.`}
          </p>
          <button onClick={onNewReminder} className="btn-secondary">
            Schedule a Reminder
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((r) => {
            const { formatted, relative, isOverdue } = formatDueDate(r.due_date);
            return (
              <div
                key={r.id}
                style={{
                  background: r.is_completed ? 'rgba(17, 24, 39, 0.5)' : '#182234',
                  border: '1px solid',
                  borderColor: r.is_completed
                    ? 'rgba(39, 53, 79, 0.4)'
                    : isOverdue
                    ? 'rgba(244, 63, 94, 0.4)'
                    : 'var(--border-color)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                  opacity: r.is_completed ? 0.65 : 1,
                }}
              >
                {/* Toggle Status Checkbox */}
                <button
                  onClick={() => onToggle(r.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: r.is_completed ? '#10b981' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={r.is_completed ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {r.is_completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: r.is_completed ? '#94a3b8' : '#f8fafc',
                        textDecoration: r.is_completed ? 'line-through' : 'none',
                      }}
                    >
                      {r.title}
                    </span>

                    {/* Priority badge */}
                    <span className={`badge badge-${r.priority || 'medium'}`} style={{ fontSize: '0.7rem' }}>
                      {r.priority}
                    </span>

                    {/* Linked Note badge */}
                    {r.note_title && (
                      <span className="badge badge-general" style={{ fontSize: '0.7rem' }} title={`Linked to note: ${r.note_title}`}>
                        <Bookmark size={10} /> {r.note_title}
                      </span>
                    )}
                  </div>

                  {r.description && (
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.15rem 0 0.4rem 0' }}>
                      {r.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} /> {formatted}
                    </span>
                    {!r.is_completed && (
                      <span
                        style={{
                          color: isOverdue ? '#f43f5e' : '#38bdf8',
                          fontWeight: 600,
                        }}
                      >
                        ({relative})
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={() => onEdit(r)}
                    className="btn-icon"
                    title="Edit reminder"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete reminder "${r.title}"?`)) {
                        onDelete(r.id);
                      }
                    }}
                    className="btn-icon"
                    style={{ color: '#fb7185' }}
                    title="Delete reminder"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
