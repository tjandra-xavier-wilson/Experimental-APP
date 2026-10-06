// src/components/ConfirmDeleteModal.jsx
import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus',
  itemName = '',
  itemType = 'item', // 'tugas' | 'catatan' | 'jadwal'
  isCompleted = false,
  description = null,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultDescription = isCompleted
    ? `Tugas ini telah selesai dikerjakan. Apakah kamu yakin ingin menghapusnya secara permanen dari daftar tugas dan cloud database?`
    : `Apakah kamu yakin ingin menghapus ${itemType} ini? Data yang dihapus tidak dapat dipulihkan kembali.`;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 1100,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 180ms ease-out',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '28px 24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          animation: 'scaleUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Close Button top-right */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 150ms ease',
          }}
          title="Batal / Tutup"
        >
          <X size={18} />
        </button>

        {/* Warning Icon Badge */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
            boxShadow: '0 0 0 8px #FEF2F2',
          }}
        >
          <Trash2 size={28} strokeWidth={2.2} />
        </div>

        {/* Modal Title */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#1E293B',
            margin: '0 0 8px 0',
            letterSpacing: '-0.3px',
          }}
        >
          {title}
        </h3>

        {/* Completed status pill if applicable */}
        {isCompleted && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            <CheckCircle2 size={13} /> Tugas Sudah Selesai
          </div>
        )}

        {/* Item Name Preview Card */}
        {itemName && (
          <div
            style={{
              width: '100%',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '10px 14px',
              margin: '8px 0 14px 0',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#334155',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={itemName}
            >
              {itemName}
            </span>
          </div>
        )}

        {/* Description Body */}
        <p
          style={{
            fontSize: '0.86rem',
            color: '#64748B',
            lineHeight: 1.55,
            margin: '0 0 24px 0',
          }}
        >
          {description || defaultDescription}
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            width: '100%',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
              transition: 'all 150ms ease',
            }}
          >
            <Trash2 size={16} /> Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmDeleteModal;
