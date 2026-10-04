import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { NoteCard } from '../components/NoteCard';
import { NoteEditorModal } from '../components/NoteEditorModal';
import { ReminderModal } from '../components/ReminderModal';
import { ReminderList } from '../components/ReminderList';
import { NotificationBanner } from '../components/NotificationBanner';
import { api } from '../api';
import { Plus, Pin, Clock, FileText, SearchX } from 'lucide-react';

export function Dashboard() {
  const [currentTab, setCurrentTab] = useState('notes'); // 'notes', 'pinned', 'reminders'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  // Fetch Notes
  const fetchNotes = useCallback(async () => {
    try {
      const data = await api.notes.getAll(searchQuery, selectedCategory);
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  }, [searchQuery, selectedCategory]);

  // Fetch Reminders
  const fetchReminders = useCallback(async () => {
    try {
      const data = await api.reminders.getAll();
      setReminders(data);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchNotes(), fetchReminders()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchNotes, fetchReminders]);

  // Note CRUD handlers
  const handleSaveNote = async (noteData) => {
    if (noteData.id) {
      await api.notes.update(noteData.id, noteData);
    } else {
      await api.notes.create(noteData);
    }
    await fetchNotes();
  };

  const handleDeleteNote = async (id) => {
    await api.notes.delete(id);
    await fetchNotes();
    await fetchReminders();
  };

  const handleTogglePin = async (id) => {
    await api.notes.togglePin(id);
    await fetchNotes();
  };

  const handleOpenNoteEditor = (note = null) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  // Reminder CRUD handlers
  const handleSaveReminder = async (reminderData) => {
    if (reminderData.id) {
      await api.reminders.update(reminderData.id, reminderData);
    } else {
      await api.reminders.create(reminderData);
    }
    await fetchReminders();
  };

  const handleToggleReminder = async (id) => {
    await api.reminders.toggle(id);
    await fetchReminders();
  };

  const handleDeleteReminder = async (id) => {
    await api.reminders.delete(id);
    await fetchReminders();
  };

  const handleOpenReminderModal = (reminder = null) => {
    setEditingReminder(reminder);
    setIsReminderModalOpen(true);
  };

  const handleAddReminderForNote = (note) => {
    setEditingReminder({
      title: `Review: ${note.title}`,
      description: note.content ? note.content.slice(0, 100) : '',
      note_id: note.id,
      priority: 'medium',
    });
    setIsReminderModalOpen(true);
  };

  // Filter notes based on currentTab
  const displayedNotes = notes.filter((n) => {
    if (currentTab === 'pinned') return Boolean(n.is_pinned);
    return true;
  });

  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const unpinnedNotes = notes.filter((n) => !n.is_pinned);
  const pendingRemindersCount = reminders.filter((r) => !r.is_completed).length;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        notesCount={notes.length}
        pinnedCount={pinnedNotes.length}
        remindersCount={pendingRemindersCount}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewNote={() => handleOpenNoteEditor(null)}
          onNewReminder={() => handleOpenReminderModal(null)}
        />

        <div style={{ padding: '2rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {/* Header Title & Subtitle */}
          <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
                {currentTab === 'reminders'
                  ? 'Reminders & Schedules'
                  : currentTab === 'pinned'
                  ? 'Pinned Notes'
                  : selectedCategory === 'All'
                  ? 'All Notes'
                  : `${selectedCategory} Notes`}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {currentTab === 'reminders'
                  ? `You have ${pendingRemindersCount} pending reminder${pendingRemindersCount === 1 ? '' : 's'}`
                  : `Showing ${displayedNotes.length} note${displayedNotes.length === 1 ? '' : 's'}`}
              </p>
            </div>

            {currentTab !== 'reminders' && (
              <button onClick={() => handleOpenNoteEditor(null)} className="btn-primary">
                <Plus size={18} /> New Note
              </button>
            )}
          </div>

          {/* View Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
              <div style={{ fontSize: '1rem', fontWeight: 500 }}>Loading your workspace...</div>
            </div>
          ) : currentTab === 'reminders' ? (
            <ReminderList
              reminders={reminders}
              onToggle={handleToggleReminder}
              onEdit={handleOpenReminderModal}
              onDelete={handleDeleteReminder}
              onNewReminder={() => handleOpenReminderModal(null)}
            />
          ) : displayedNotes.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              background: 'rgba(17, 24, 39, 0.4)',
              borderRadius: '20px',
              border: '1px dashed var(--border-color)',
            }}>
              {searchQuery ? (
                <>
                  <SearchX size={44} style={{ color: '#475569', marginBottom: '0.75rem' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>
                    No notes matched "{searchQuery}"
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.25rem' }}>
                    Try searching for different keywords or clear your query
                  </p>
                  <button onClick={() => setSearchQuery('')} className="btn-secondary">
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <FileText size={44} style={{ color: '#475569', marginBottom: '0.75rem' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>
                    {currentTab === 'pinned' ? 'No pinned notes yet' : 'Your workspace is empty'}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.25rem' }}>
                    {currentTab === 'pinned'
                      ? 'Click the pin icon on any note to keep it at the top of your board'
                      : 'Capture quick ideas, task checklists, or important thoughts!'}
                  </p>
                  <button onClick={() => handleOpenNoteEditor(null)} className="btn-primary">
                    <Plus size={18} /> Create Your First Note
                  </button>
                </>
              )}
            </div>
          ) : (
            <div>
              {/* If in All Notes view and there are pinned notes, separate them into Pinned and Others */}
              {currentTab === 'notes' && pinnedNotes.length > 0 && unpinnedNotes.length > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Pin size={16} fill="#f59e0b" /> Pinned Notes ({pinnedNotes.length})
                  </div>
                  <div className="notes-grid" style={{ paddingTop: 0, paddingBottom: '2rem' }}>
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleOpenNoteEditor}
                        onDelete={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                        onAddReminder={handleAddReminderForNote}
                      />
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <FileText size={16} /> Other Notes ({unpinnedNotes.length})
                  </div>
                  <div className="notes-grid" style={{ paddingTop: 0 }}>
                    {unpinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleOpenNoteEditor}
                        onDelete={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                        onAddReminder={handleAddReminderForNote}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="notes-grid" style={{ paddingTop: 0 }}>
                  {displayedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleOpenNoteEditor}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                      onAddReminder={handleAddReminderForNote}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor Modal */}
      <NoteEditorModal
        isOpen={isNoteModalOpen}
        note={editingNote}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />

      {/* Reminder Scheduler Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        initialData={editingReminder}
        notes={notes}
        onClose={() => setIsReminderModalOpen(false)}
        onSave={handleSaveReminder}
      />

      {/* Live Due Reminder Alerts & Audio Chime */}
      <NotificationBanner
        reminders={reminders}
        onReminderUpdated={fetchReminders}
      />
    </div>
  );
}
