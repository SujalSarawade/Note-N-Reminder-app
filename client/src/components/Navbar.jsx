import React from 'react';
import { Search, Plus, BellPlus, Sparkles, Menu } from 'lucide-react';

export function Navbar({ searchQuery, setSearchQuery, onNewNote, onNewReminder, onToggleMobileSidebar }) {
  return (
    <header className="top-nav">
      {/* Search Input */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '420px', display: 'flex', alignItems: 'center' }}>
        <Search
          size={18}
          style={{ position: 'absolute', left: '1rem', color: '#64748b', pointerEvents: 'none' }}
        />
        <input
          type="text"
          placeholder="Search your notes by keyword, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{
            paddingLeft: '2.75rem',
            paddingRight: '1rem',
            background: 'rgba(21, 29, 46, 0.7)',
            borderRadius: '9999px',
            fontSize: '0.9rem',
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onNewReminder}
          className="btn-secondary"
          style={{ borderRadius: '9999px', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          title="Schedule a new reminder"
        >
          <BellPlus size={16} color="#38bdf8" />
          <span>Reminder</span>
        </button>

        <button
          onClick={onNewNote}
          className="btn-primary"
          style={{ borderRadius: '9999px', padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
}
