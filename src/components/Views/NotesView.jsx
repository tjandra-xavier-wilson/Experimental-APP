// src/components/Views/NotesView.jsx
import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
  BookOpen,
  Calendar,
} from 'lucide-react';

export const NotesView = ({
  notes = [],
  onOpenNotesModal,
  onSaveNotes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q))
    );
  });

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id) => {
    if (confirm('Hapus catatan ini?')) {
      const updated = notes.filter((n) => n.id !== id);
      onSaveNotes(updated);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #047857 0%, #10B981 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px 32px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <FileText size={13} color="#D1FAE5" /> STUDY NOTES & FORMULA
            </span>
            <span style={{ fontSize: '0.78rem', color: '#D1FAE5' }}>
              · {notes.length} Catatan Tersimpan
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Catatan Belajar & Rumus Penting
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#ECFDF5', maxWidth: '580px' }}>
            Simpan rangkuman materi, rumus penting, dan intisari pelajaran untuk review cepat menjelang ujian.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNotesModal}
          style={{
            backgroundColor: '#FFFFFF',
            color: '#065F46',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Plus size={16} color="#059669" /> + Catatan Baru
        </button>
      </div>

      {/* 2. Search Filter */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Koleksi Catatan ({filteredNotes.length})
        </span>

        <div style={{ minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Cari kata kunci, rumus, atau judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* 3. Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#F1F5F9',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            Belum Ada Catatan
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px' }}>
            Tulis rumus penting atau catatan materi pertama Anda untuk mempermudah belajar.
          </p>
          <button
            type="button"
            onClick={onOpenNotesModal}
            className="btn-primary"
            style={{ marginTop: '8px', fontSize: '0.84rem', padding: '8px 18px' }}
          >
            <Plus size={15} /> + Tambah Catatan Sekarang
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '18px',
          }}
        >
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="card"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                borderTop: '4px solid #10B981',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {note.date || 'Tersimpan'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(note.id, `${note.title}\n\n${note.content}`)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: copiedId === note.id ? '#10B981' : '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                    }}
                    title="Salin isi catatan"
                  >
                    {copiedId === note.id ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId === note.id ? 'Tersalin!' : 'Salin'}
                  </button>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
                  {note.title || 'Catatan Tanpa Judul'}
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#334155',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    backgroundColor: '#F8FAFC',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontFamily: 'monospace, sans-serif',
                    maxHeight: '160px',
                    overflowY: 'auto',
                  }}
                >
                  {note.content}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  style={{
                    border: 'none',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={13} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
