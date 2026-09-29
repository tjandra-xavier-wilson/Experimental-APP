// src/components/NotesModal.jsx
import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, Copy, Check } from 'lucide-react';
import { triggerReminderAlert } from '../services/notificationService';

export const NotesModal = ({ isOpen, onClose, notes = [], onSaveNotes }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const note = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    onSaveNotes([note, ...notes]);
    setNewTitle('');
    setNewContent('');
    triggerReminderAlert('Catatan Disimpan', `Catatan "${note.title}" berhasil ditambahkan.`);
  };

  const handleDelete = (id) => {
    onSaveNotes(notes.filter((n) => n.id !== id));
  };

  const handleCopy = (note) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-content"
        style={{ maxWidth: '520px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--pastel-lavender-text)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Catatan & Rumus Belajar</h3>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Judul catatan / mata kuliah..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
            <textarea
              placeholder="Tulis ringkasan, rumus penting, atau catatan penting..."
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'vertical',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ alignSelf: 'flex-end', padding: '7px 16px', fontSize: '0.82rem' }}
            >
              <Plus size={14} /> Tambah Catatan
            </button>
          </div>
        </form>

        {/* Note List */}
        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '24px 0' }}>
              Belum ada catatan tersimpan. Buat catatan pertamamu di atas!
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{note.title}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>• {note.date}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {note.content}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleCopy(note)}
                    className="btn-ghost"
                    style={{ padding: '4px', color: copiedId === note.id ? 'var(--pastel-mint-text)' : 'var(--text-muted)' }}
                    title="Salin teks"
                  >
                    {copiedId === note.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="btn-ghost"
                    style={{ padding: '4px', color: 'var(--pastel-peach-text)' }}
                    title="Hapus catatan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
