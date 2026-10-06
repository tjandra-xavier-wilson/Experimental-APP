// src/components/Views/NotesView.jsx
import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Download,
  Link as LinkIcon,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';
import {
  exportNoteToGoogleDocs,
  downloadNoteAsDocx,
  getGoogleDocsCreateUrl,
  getGoogleDocsHomeUrl,
} from '../../services/googleDocsService';
import { triggerReminderAlert } from '../../services/notificationService';

export const NotesView = ({
  notes = [],
  onOpenNotesModal,
  onSaveNotes,
  user,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Quick inline note creation state
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineContent, setInlineContent] = useState('');
  const [inlineDocUrl, setInlineDocUrl] = useState('');

  // Link Doc modal/inline state
  const [linkingNote, setLinkingNote] = useState(null);
  const [docUrlInput, setDocUrlInput] = useState('');

  const userEmail = user?.email || 'Akun Gmail';

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      (n.googleDocUrl && n.googleDocUrl.toLowerCase().includes(q))
    );
  });

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateInlineNote = (e) => {
    e.preventDefault();
    if (!inlineTitle.trim() || !inlineContent.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      title: inlineTitle.trim(),
      content: inlineContent.trim(),
      googleDocUrl: inlineDocUrl.trim() || null,
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    onSaveNotes([newNote, ...notes]);
    setInlineTitle('');
    setInlineContent('');
    setInlineDocUrl('');
    setIsAddingInline(false);
    triggerReminderAlert('Catatan Disimpan', `Catatan "${newNote.title}" berhasil ditambahkan.`);
  };

  const handleSaveDocLink = (e) => {
    e.preventDefault();
    if (!linkingNote) return;

    const updated = notes.map((n) =>
      n.id === linkingNote.id ? { ...n, googleDocUrl: docUrlInput.trim() || null } : n
    );
    onSaveNotes(updated);
    setLinkingNote(null);
    setDocUrlInput('');
    triggerReminderAlert('Tautan Diperbarui', 'Tautan Google Docs berhasil disimpan ke catatan.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px 32px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 8px 24px -4px rgba(5, 150, 105, 0.25)',
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
              <FileText size={13} color="#D1FAE5" /> STUDY NOTES & GOOGLE DOCS
            </span>
            <span style={{ fontSize: '0.78rem', color: '#D1FAE5' }}>
              · {notes.length} Catatan Tersimpan
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Catatan Belajar & Rumus Penting
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#ECFDF5', maxWidth: '620px' }}>
            Simpan rangkuman materi, rumus penting, dan hubungkan catatan secara langsung ke Google Docs akun Gmail Anda.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsAddingInline(!isAddingInline)}
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
      </div>

      {/* 2. Google Docs & Gmail Integration Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #BFDBFE',
          borderRadius: '16px',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 16px rgba(37, 99, 235, 0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '5px',
            backgroundColor: '#2563EB',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              flexShrink: 0,
            }}
            title="Google Docs"
          >
            {/* Google Docs Icon styling */}
            <FileText size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1E3A8A' }}>
                Koneksi Google Docs & Workspace
              </span>
              <span
                style={{
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 10px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle2 size={12} /> Akun Gmail Terhubung
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#475569' }}>
              Akun aktif: <strong style={{ color: '#1E40AF' }}>{userEmail}</strong> · Klik &apos;Google Docs&apos; pada setiap catatan untuk langsung membuka dan menyinkronkan dokumen ke Google Drive Anda.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => window.open(getGoogleDocsCreateUrl(user?.email), '_blank', 'noopener,noreferrer')}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              transition: 'background 150ms ease',
            }}
          >
            <ExternalLink size={14} /> Buat Dokumen Google Docs Baru
          </button>

          <button
            type="button"
            onClick={() => window.open(getGoogleDocsHomeUrl(user?.email), '_blank', 'noopener,noreferrer')}
            style={{
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              border: '1px solid #BFDBFE',
              padding: '9px 14px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Buka Beranda Docs
          </button>
        </div>
      </div>

      {/* 3. Inline Quick Add Note Card (If opened) */}
      {isAddingInline && (
        <form
          onSubmit={handleCreateInlineNote}
          className="card"
          style={{
            padding: '24px',
            border: '2px solid #10B981',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#065F46' }}>
              ✍️ Tambah Catatan & Hubungkan Dokumen
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingInline(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <input
              type="text"
              placeholder="Judul catatan (contoh: Rumus Fisika Gelombang, Catatan Kalkulus II)..."
              value={inlineTitle}
              onChange={(e) => setInlineTitle(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
              required
            />

            <textarea
              rows={4}
              placeholder="Tulis ringkasan materi, rumus, konsep penting, atau kode..."
              value={inlineContent}
              onChange={(e) => setInlineContent(e.target.value)}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'monospace, sans-serif',
              }}
              required
            />

            {/* Optional Google Doc Link */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="url"
                placeholder="Tautan Google Docs (opsional: https://docs.google.com/document/d/...)"
                value={inlineDocUrl}
                onChange={(e) => setInlineDocUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: '1px solid #BFDBFE',
                  fontSize: '0.84rem',
                  outline: 'none',
                  backgroundColor: '#F8FAFC',
                }}
              />
              <button
                type="button"
                onClick={() => window.open(getGoogleDocsCreateUrl(user?.email), '_blank', 'noopener,noreferrer')}
                style={{
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #93C5FD',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ExternalLink size={13} /> Buat di Google Docs
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setIsAddingInline(false)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
              }}
            >
              <Plus size={15} /> Simpan Catatan
            </button>
          </div>
        </form>
      )}

      {/* 4. Search Filter */}
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
        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Koleksi Catatan & Dokumen ({filteredNotes.length})
        </span>

        <div style={{ minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Cari materi, rumus, atau judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.84rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* 5. Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '52px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#1E293B' }}>
            Belum Ada Catatan Belajar
          </h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B', maxWidth: '440px', lineHeight: 1.5 }}>
            Buat catatan pertama Anda sekarang dan hubungkan dengan Google Docs di akun Gmail Anda untuk belajar lebih terstruktur.
          </p>
          <button
            type="button"
            onClick={() => setIsAddingInline(true)}
            style={{
              marginTop: '6px',
              backgroundColor: '#059669',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 20px',
              borderRadius: '10px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} /> + Tambah Catatan Sekarang
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px',
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
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                position: 'relative',
              }}
            >
              <div>
                {/* Note Top Bar: Date & Linked Google Doc Pill */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                    }}
                  >
                    <Calendar size={12} /> {note.date || 'Tersimpan'}
                  </span>

                  {note.googleDocUrl ? (
                    <a
                      href={note.googleDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #BFDBFE',
                      }}
                      title={note.googleDocUrl}
                    >
                      📄 Google Doc <ExternalLink size={10} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setLinkingNote(note);
                        setDocUrlInput(note.googleDocUrl || '');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3B82F6',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <LinkIcon size={11} /> + Tautkan Docs
                    </button>
                  )}
                </div>

                {/* Note Title */}
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    margin: '0 0 10px 0',
                    color: 'var(--text-main)',
                    letterSpacing: '-0.2px',
                  }}
                >
                  {note.title || 'Catatan Tanpa Judul'}
                </h3>

                {/* Note Content */}
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#334155',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    backgroundColor: '#F8FAFC',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontFamily: 'monospace, sans-serif',
                    maxHeight: '170px',
                    overflowY: 'auto',
                  }}
                >
                  {note.content}
                </p>
              </div>

              {/* Action Toolbar Bottom */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid #F1F5F9',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Google Docs Direct Export Button */}
                  <button
                    type="button"
                    onClick={() => exportNoteToGoogleDocs(note, user?.email)}
                    style={{
                      border: '1px solid #BFDBFE',
                      backgroundColor: '#EFF6FF',
                      color: '#1D4ED8',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 150ms ease',
                    }}
                    title={`Salin isi dan buka di Google Docs (${userEmail})`}
                  >
                    <ExternalLink size={12} /> Google Docs
                  </button>

                  {/* Download Docx Button */}
                  <button
                    type="button"
                    onClick={() => downloadNoteAsDocx(note)}
                    style={{
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      borderRadius: '8px',
                      padding: '5px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Unduh dokumen .docx / Word"
                  >
                    <Download size={12} /> .docx
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(note.id, `${note.title}\n\n${note.content}`)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: copiedId === note.id ? '#10B981' : '#64748B',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '4px 6px',
                    }}
                    title="Salin isi catatan"
                  >
                    {copiedId === note.id ? <Check size={13} /> : <Copy size={13} />}
                    {copiedId === note.id ? 'Tersalin' : 'Salin'}
                  </button>
                </div>

                {/* Custom Delete Trigger (No browser popup!) */}
                <button
                  type="button"
                  onClick={() => setNoteToDelete(note)}
                  style={{
                    border: 'none',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    borderRadius: '7px',
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Hapus Catatan"
                >
                  <Trash2 size={13} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Modal Tautkan Link Google Docs */}
      {linkingNote && (
        <div
          className="modal-overlay"
          onClick={() => setLinkingNote(null)}
          style={{
            zIndex: 1050,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LinkIcon size={18} color="#2563EB" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Tautkan Google Docs</h3>
              </div>
              <button
                type="button"
                onClick={() => setLinkingNote(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 14px 0', fontSize: '0.84rem', color: '#64748B' }}>
              Tautkan dokumen Google Docs yang sudah ada untuk catatan &quot;<strong>{linkingNote.title}</strong>&quot;:
            </p>

            <form onSubmit={handleSaveDocLink}>
              <input
                type="url"
                placeholder="https://docs.google.com/document/d/..."
                value={docUrlInput}
                onChange={(e) => setDocUrlInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.86rem',
                  outline: 'none',
                  marginBottom: '14px',
                }}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setLinkingNote(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Simpan Tautan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Custom In-App Delete Confirmation Modal (No browser popup!) */}
      <ConfirmDeleteModal
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            const updated = notes.filter((n) => n.id !== noteToDelete.id);
            onSaveNotes(updated);
          }
        }}
        title="Hapus Catatan Belajar?"
        itemName={noteToDelete?.title}
        itemType="catatan"
        description="Catatan materi ini akan dihapus dari penyimpanan. Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};
export default NotesView;
