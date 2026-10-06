// src/services/googleDocsService.js
import { triggerReminderAlert } from './notificationService';

/**
 * Builds Google Docs URL targeted to the user's logged-in Gmail account.
 * Using Google's authuser parameter or /u/{email}/ path switches directly to their account.
 */
export const getGoogleDocsCreateUrl = (userEmail) => {
  if (userEmail && userEmail.includes('@')) {
    return `https://docs.google.com/document/create?authuser=${encodeURIComponent(userEmail)}`;
  }
  return 'https://docs.google.com/document/create';
};

export const getGoogleDocsHomeUrl = (userEmail) => {
  if (userEmail && userEmail.includes('@')) {
    return `https://docs.google.com/document/u/${encodeURIComponent(userEmail)}/`;
  }
  return 'https://docs.google.com/document/';
};

/**
 * Copies note content to clipboard and opens a fresh Google Doc on user's Gmail.
 */
export const exportNoteToGoogleDocs = (note, userEmail) => {
  const formattedContent = `${note.title || 'Catatan Belajar'}\n\nTanggal: ${
    note.date || new Date().toLocaleDateString('id-ID')
  }\n\n${note.content || ''}`;

  try {
    navigator.clipboard.writeText(formattedContent);
  } catch (e) {
    console.warn('Clipboard write error:', e);
  }

  const targetUrl = getGoogleDocsCreateUrl(userEmail);
  window.open(targetUrl, '_blank', 'noopener,noreferrer');

  triggerReminderAlert(
    'Membuka Google Docs',
    `Isi catatan "${note.title || 'Catatan'}" telah disalin ke clipboard. Tempel (Ctrl+V) pada Google Docs dengan akun ${
      userEmail || 'Anda'
    }.`
  );
};

/**
 * Generates and downloads a Word / Docx compatible document for offline study.
 */
export const downloadNoteAsDocx = (note) => {
  const title = note.title || 'Catatan Belajar';
  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; line-height: 1.6; color: #1E293B; margin: 40px; }
        h1 { color: #047857; border-bottom: 2px solid #10B981; padding-bottom: 8px; font-size: 24px; }
        .meta { color: #64748B; font-size: 13px; margin-bottom: 24px; }
        .content { font-size: 14.5px; white-space: pre-wrap; background: #F8FAFC; padding: 18px; border-radius: 8px; border: 1px solid #E2E8F0; }
        .footer { margin-top: 36px; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 12px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="meta">📅 Tanggal: ${note.date || new Date().toLocaleDateString('id-ID')} | CodeStack Schedule</div>
      <div class="content">${note.content || ''}</div>
      ${
        note.googleDocUrl
          ? `<p style="margin-top:20px; font-size:13px;">🔗 <strong>Tautan Google Docs Asli:</strong> <a href="${note.googleDocUrl}">${note.googleDocUrl}</a></p>`
          : ''
      }
      <div class="footer">Dibuat melalui CodeStack Schedule · Terhubung dengan Google Docs & Workspace</div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeTitle = title.replace(/[^a-zA-Z0-9_\-\u00C0-\u017F ]/g, '_').substring(0, 40);
  anchor.href = url;
  anchor.download = `${safeTitle}.doc`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);

  triggerReminderAlert('Dokumen Diunduh', `File "${safeTitle}.doc" berhasil diunduh ke komputer/HP Anda.`);
};
