import type { User } from '@/gateway/types/api'

function esc(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const TAG_COLORS = {
  headerBg: '#15803d',
  headerText: '#ffffff',
  subText: '#bbf7d0',
  footerBg: '#f0fdf4',
  footerBorder: '#bbf7d0',
  footerText: '#15803d',
}

function tagHtml(user: User, logoUrl: string): string {
  const role = esc(user.roles?.length > 0 ? user.roles[0] : 'Member')
  return `
    <div class="tag">
      <div class="tag-header">
        <img src="${logoUrl}" alt="AMSA" class="tag-logo" />
        <div>
          <div class="tag-org">AMSA NIGERIA</div>
          <div class="tag-portal">Tajneed Portal</div>
        </div>
      </div>
      <div class="tag-body">
        <div class="tag-name">${esc(user.firstName)} ${esc(user.lastName)}</div>
        <div class="tag-detail">No: <strong>${esc(user.memberNo)}</strong></div>
        <div class="tag-detail">Unit: <strong>${esc(user.unit) || '—'}</strong></div>
        ${user.state ? `<div class="tag-detail">State: <strong>${esc(user.state)}</strong></div>` : ''}
      </div>
      <div class="tag-footer">${role}</div>
    </div>
  `
}

function buildPrintDocument(users: User[], perPage: 4 | 6, title: string): string {
  const cols = 2
  const rows = perPage / cols
  const logoUrl = `${window.location.origin}/images/amsa-logo.png`

  // A4: 210mm × 297mm. With 10mm margins on all sides.
  // Available: 190mm wide, 277mm tall
  // Gap between tags: 5mm
  // Tag width: (190 - 5) / 2 = 92.5mm
  // Tag height: (277 - (rows-1)*5) / rows
  const tagW = 92.5
  const tagH = rows === 2 ? 136 : 89

  const tagsHtml = users.map((u) => tagHtml(u, logoUrl)).join('')
  const safeTitle = esc(title)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #fff; }

    .page-title {
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      padding: 8px;
      color: #333;
    }

    .tags-grid {
      display: grid;
      grid-template-columns: repeat(${cols}, ${tagW}mm);
      gap: 5mm;
      padding: 10mm;
      width: 210mm;
    }

    .tag {
      width: ${tagW}mm;
      height: ${tagH}mm;
      border: 1px solid #d1d5db;
      border-radius: 4mm;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: #fff;
      break-inside: avoid;
    }

    .tag-header {
      background: ${TAG_COLORS.headerBg};
      padding: 3mm 4mm;
      display: flex;
      align-items: center;
      gap: 2mm;
      flex-shrink: 0;
    }

    .tag-logo {
      width: 10mm;
      height: 10mm;
      border-radius: 50%;
      background: white;
      object-fit: contain;
      padding: 0.5mm;
    }

    .tag-org {
      color: ${TAG_COLORS.headerText};
      font-size: ${perPage === 4 ? '9pt' : '7.5pt'};
      font-weight: bold;
    }

    .tag-portal {
      color: ${TAG_COLORS.subText};
      font-size: ${perPage === 4 ? '7pt' : '6pt'};
    }

    .tag-body {
      flex: 1;
      padding: 3mm 4mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1.5mm;
    }

    .tag-name {
      font-size: ${perPage === 4 ? '11pt' : '9pt'};
      font-weight: bold;
      color: #111827;
      line-height: 1.2;
    }

    .tag-detail {
      font-size: ${perPage === 4 ? '8pt' : '7pt'};
      color: #6b7280;
    }

    .tag-detail strong {
      color: #374151;
    }

    .tag-footer {
      background: ${TAG_COLORS.footerBg};
      border-top: 0.5mm solid ${TAG_COLORS.footerBorder};
      padding: 2mm 4mm;
      font-size: ${perPage === 4 ? '7pt' : '6pt'};
      color: ${TAG_COLORS.footerText};
      text-align: center;
      font-weight: 600;
      flex-shrink: 0;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-title { display: none; }
      .tags-grid { padding: 10mm; }
    }
  </style>
</head>
<body>
  <div class="page-title">${safeTitle} — ${users.length} tag${users.length !== 1 ? 's' : ''} (${perPage} per page)</div>
  <div class="tags-grid">
    ${tagsHtml}
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`
}

export function printTags(users: User[], perPage: 4 | 6, title = 'Member Tags') {
  if (users.length === 0) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Pop-up was blocked. Please allow pop-ups for this site to print tags.')
    return
  }

  const html = buildPrintDocument(users, perPage, title)
  printWindow.document.write(html)
  printWindow.document.close()
}
