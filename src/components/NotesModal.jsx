// src/components/NotesModal.jsx
import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, Copy, Check, ExternalLink } from 'lucide-react';
import { triggerReminderAlert } from '../services/notificationService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { exportNoteToGoogleDocs, getGoogleDocsCreateUrl } from '../services/googleDocsService';

export const NotesModal = ({ isOpen, onClose, notes = [], onSaveNotes, onDeleteNote, user }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);

  if (!isOpen) return null;

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const formattedDocUrl = newDocUrl.trim()
      ? (newDocUrl.trim().startsWith('http') ? newDocUrl.trim() : `https://${newDocUrl.trim()}`)
      : null;

    const note = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      googleDocUrl: formattedDocUrl,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    onSaveNotes([note, ...notes]);
    setNewTitle('');
    setNewContent('');
    setNewDocUrl('');
    triggerReminderAlert('Catatan Disimpan', `Catatan "${note.title}" berhasil ditambahkan.`);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      if (onDeleteNote) {
        onDeleteNote(noteToDelete.id);
      } else {
        onSaveNotes(notes.filter((n) => n.id !== noteToDelete.id));
      }
      setNoteToDelete(null);
    }
  };

  const handleCopy = (note) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenDoc = (note) => {
    if (note.googleDocUrl) {
      const url = note.googleDocUrl.startsWith('http') ? note.googleDocUrl : `https://${note.googleDocUrl}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      exportNoteToGoogleDocs(note, user?.email);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-content"
        style={{ maxWidth: '560px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--pastel-lavender-text)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Catatan & Dokumen Belajar</h3>
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
              placeholder="Tulis ringkasan, rumus penting, atau catatan materi..."
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Tautan Google Docs (opsional: https://docs.google.com/...)"
                value={newDocUrl}
                onChange={(e) => setNewDocUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  backgroundColor: '#F8FAFC',
                }}
              />
              <button
                type="button"
                onClick={() => window.open(getGoogleDocsCreateUrl(user?.email), '_blank', 'noopener,noreferrer')}
                style={{
                  border: '1px solid #BFDBFE',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                <ExternalLink size={12} /> Buka Docs Baru
              </button>
            </div>

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{note.title}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>• {note.date}</span>
                    {note.googleDocUrl && (
                      <button
                        type="button"
                        onClick={() => handleOpenDoc(note)}
                        style={{
                          fontSize: '0.68rem',
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid #BFDBFE',
                          cursor: 'pointer',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        📄 Doc <ExternalLink size={10} />
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {note.content}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenDoc(note)}
                    className="btn-ghost"
                    style={{ padding: '4px', color: '#2563EB' }}
                    title={note.googleDocUrl ? 'Buka dokumen Google Docs yang tercantum' : 'Ekspor ke Google Docs baru'}
                  >
                    <ExternalLink size={14} />
                  </button>
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
                    onClick={() => setNoteToDelete(note)}
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

      {/* Custom Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Catatan Belajar?"
        itemName={noteToDelete?.title}
        itemType="catatan"
      />
    </div>
  );
};
