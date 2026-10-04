import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, X, AlertTriangle } from 'lucide-react';
import { api } from '../api';

// Gentle audio chime using Web Audio API
function playAlertChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.debug('Audio chime unable to play:', e);
  }
}

export function NotificationBanner({ reminders, onReminderUpdated }) {
  const [activeAlert, setActiveAlert] = useState(null);
  const notifiedIdsRef = useRef(new Set());

  // Request browser notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Poll for due reminders every 10 seconds
  useEffect(() => {
    if (!reminders || reminders.length === 0) return;

    const checkDue = () => {
      const now = new Date();
      const due = reminders.find(r => {
        if (r.is_completed) return false;
        if (notifiedIdsRef.current.has(r.id)) return false;
        const dueTime = new Date(r.due_date);
        return dueTime <= now;
      });

      if (due) {
        notifiedIdsRef.current.add(due.id);
        setActiveAlert(due);
        playAlertChime();

        // Browser native notification
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`⏰ Reminder: ${due.title}`, {
              body: due.description || `It's time for your scheduled reminder!`,
              icon: '/favicon.svg',
            });
          } catch (e) {
            console.debug('Native notification error:', e);
          }
        }
      }
    };

    checkDue();
    const interval = setInterval(checkDue, 10000);
    return () => clearInterval(interval);
  }, [reminders]);

  if (!activeAlert) return null;

  const handleMarkDone = async () => {
    try {
      await api.reminders.toggle(activeAlert.id);
      if (onReminderUpdated) onReminderUpdated();
      setActiveAlert(null);
    } catch (err) {
      console.error('Failed to mark reminder done:', err);
    }
  };

  return (
    <div className="toast-banner">
      <div style={{
        background: 'rgba(245, 158, 11, 0.2)',
        color: '#fbbf24',
        padding: '0.6rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Bell size={24} style={{ animation: 'bounce 1s infinite' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
            Reminder Due Now
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {new Date(activeAlert.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
          {activeAlert.title}
        </h4>
        {activeAlert.description && (
          <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
            {activeAlert.description}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          onClick={handleMarkDone}
          className="btn-primary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}
          title="Mark as completed"
        >
          <Check size={14} /> Done
        </button>
        <button
          onClick={() => setActiveAlert(null)}
          className="btn-icon"
          title="Dismiss"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
