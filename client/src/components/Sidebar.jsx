import React from 'react';
import { 
  FileText, 
  Pin, 
  Bell, 
  Tag, 
  LogOut, 
  Sparkles, 
  CheckCircle,
  Briefcase,
  User,
  Lightbulb,
  GraduationCap,
  ListTodo
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORY_ICONS = {
  All: FileText,
  General: Sparkles,
  Work: Briefcase,
  Personal: User,
  Ideas: Lightbulb,
  Study: GraduationCap,
  'To-Do': ListTodo,
};

export function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  selectedCategory, 
  setSelectedCategory,
  notesCount = 0,
  pinnedCount = 0,
  remindersCount = 0,
}) {
  const { user, logout } = useAuth();

  const categories = ['All', 'General', 'Work', 'Personal', 'Ideas', 'Study', 'To-Do'];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            NoteFlow
          </h1>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
            Notes & Smart Reminders
          </span>
        </div>
      </div>

      {/* Main Nav Links */}
      <div style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <button
          onClick={() => {
            setCurrentTab('notes');
            setSelectedCategory('All');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.9rem',
            borderRadius: '10px',
            border: 'none',
            background: currentTab === 'notes' && selectedCategory === 'All' ? '#1f2d45' : 'transparent',
            color: currentTab === 'notes' && selectedCategory === 'All' ? '#f8fafc' : '#94a3b8',
            fontWeight: currentTab === 'notes' && selectedCategory === 'All' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={18} color={currentTab === 'notes' && selectedCategory === 'All' ? '#6366f1' : '#64748b'} />
            All Notes
          </div>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>
            {notesCount}
          </span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('pinned');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.9rem',
            borderRadius: '10px',
            border: 'none',
            background: currentTab === 'pinned' ? '#1f2d45' : 'transparent',
            color: currentTab === 'pinned' ? '#f8fafc' : '#94a3b8',
            fontWeight: currentTab === 'pinned' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Pin size={18} color={currentTab === 'pinned' ? '#f59e0b' : '#64748b'} fill={currentTab === 'pinned' ? '#f59e0b' : 'none'} />
            Pinned Notes
          </div>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>
            {pinnedCount}
          </span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('reminders');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.9rem',
            borderRadius: '10px',
            border: 'none',
            background: currentTab === 'reminders' ? '#1f2d45' : 'transparent',
            color: currentTab === 'reminders' ? '#f8fafc' : '#94a3b8',
            fontWeight: currentTab === 'reminders' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={18} color={currentTab === 'reminders' ? '#38bdf8' : '#64748b'} />
            Reminders
          </div>
          <span style={{
            fontSize: '0.75rem',
            background: remindersCount > 0 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.06)',
            color: remindersCount > 0 ? '#38bdf8' : 'inherit',
            padding: '0.1rem 0.5rem',
            borderRadius: '12px',
            fontWeight: 700,
          }}>
            {remindersCount}
          </span>
        </button>
      </div>

      {/* Category Folders */}
      <div style={{ padding: '0.5rem 1rem', flex: 1, overflowY: 'auto' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '0.5rem 0.8rem',
        }}>
          Categories
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Tag;
            const isSelected = currentTab === 'notes' && selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setCurrentTab('notes');
                  setSelectedCategory(cat);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isSelected ? '#a5b4fc' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s ease',
                }}
              >
                <Icon size={15} color={isSelected ? '#818cf8' : '#64748b'} />
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Footer Profile */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0, 0, 0, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.95rem',
            flexShrink: 0,
          }}>
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username || 'User'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || ''}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn-icon"
          title="Sign out"
          style={{ color: '#fb7185', flexShrink: 0 }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
