import QRCode from 'qrcode'
import type { ParticipantTagDto, User } from '@/gateway/types/api'

function esc(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function toQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text || ' ', {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 400,
    color: { dark: '#10251e', light: '#ffffff' },
  })
}

function tagHtml(
  user: User,
  qrDataUrl: string,
  logoUrl: string,
  perPage: 4 | 6,
  titleBoxText?: string,
): string {
  const name = esc(`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'AMSA Member')
  const unit = esc(user.unit || 'AMSA Nigeria')
  const memberNo = esc(user.memberNo || '')
  const titleBox = esc(titleBoxText || user.unit || 'AMSA Nigeria')
  const isSmall = perPage === 6

  return `
    <div class="tag">
      <div class="tag-header">
        <div class="tag-logo-wrap">
          <img src="${logoUrl}" alt="" class="tag-logo" />
        </div>
        <div>
          <div class="tag-org">AHMADI MUSLIM STUDENTS' ASSOCIATION</div>
          <div class="tag-org-sub">NIGERIA · OFFICIAL MEMBER TAG</div>
        </div>
      </div>

      <div class="tag-title-box">
        <span class="tag-title-corner tl"></span>
        <span class="tag-title-corner tr"></span>
        <span class="tag-title-corner bl"></span>
        <span class="tag-title-corner br"></span>
        <div class="tag-title">${titleBox.toUpperCase()}</div>
      </div>

      <div class="tag-member">
        <div class="tag-member-label">REGISTERED MEMBER</div>
        <div class="tag-name">${name.toUpperCase()}</div>
        ${memberNo ? `<div class="tag-memberno">No: ${memberNo}</div>` : ''}
      </div>

      <div class="tag-badge">MEMBER</div>

      <div class="tag-qr-wrap">
        <img src="${qrDataUrl}" alt="QR" class="tag-qr" />
      </div>

      <div class="tag-footer">
        <div>SCAN TO VERIFY MEMBERSHIP</div>
        ${isSmall ? '' : '<div class="tag-footer-sub">AMSA NIGERIA TAJNEED PORTAL</div>'}
      </div>
    </div>
  `
}

function buildPrintDocument(
  usersWithQr: Array<{ user: User; qr: string; subtitle?: string }>,
  logoUrl: string,
  perPage: 4 | 6,
  title: string,
): string {
  const cols = 2
  const rows = perPage / cols
  // A4: 210mm × 297mm. 10mm margins, 5mm gap between tags.
  // Available width: 190mm. Tag width = (190 - 5) / 2 = 92.5mm
  const tagW = 92.5
  const tagH = rows === 2 ? 136 : 89
  const isSmall = perPage === 6

  const tagsHtml = usersWithQr.map(({ user, qr, subtitle }) => tagHtml(user, qr, logoUrl, perPage, subtitle)).join('')
  const safeTitle = esc(title)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #fff; }

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
      border-radius: 4mm;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: linear-gradient(145deg, #075b39 0%, #087547 48%, #073b32 100%);
      color: white;
      break-inside: avoid;
      position: relative;
    }

    .tag-header {
      display: flex;
      align-items: center;
      gap: ${isSmall ? '2mm' : '3mm'};
      padding: ${isSmall ? '2.5mm 3mm' : '3.5mm 4mm'};
      flex-shrink: 0;
    }

    .tag-logo-wrap {
      width: ${isSmall ? '8mm' : '11mm'};
      height: ${isSmall ? '8mm' : '11mm'};
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      border: 0.5mm solid rgba(255,255,255,0.7);
    }

    .tag-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .tag-org {
      color: #ecfccb;
      font-size: ${isSmall ? '5pt' : '6.5pt'};
      font-weight: bold;
      letter-spacing: 0.04em;
      line-height: 1.2;
    }

    .tag-org-sub {
      color: rgba(255,255,255,0.65);
      font-size: ${isSmall ? '4pt' : '5pt'};
      letter-spacing: 0.1em;
      margin-top: 0.5mm;
    }

    .tag-title-box {
      margin: ${isSmall ? '0 3mm 2mm' : '0 4mm 3mm'};
      border: 0.4mm solid rgba(255,255,255,0.65);
      padding: ${isSmall ? '2mm 3mm' : '2.5mm 4mm'};
      text-align: center;
      position: relative;
      flex-shrink: 0;
    }

    .tag-title-corner {
      position: absolute;
      width: ${isSmall ? '2mm' : '2.5mm'};
      height: ${isSmall ? '2mm' : '2.5mm'};
      background: white;
    }
    .tl { top: -1mm; left: -1mm; }
    .tr { top: -1mm; right: -1mm; }
    .bl { bottom: -1mm; left: -1mm; }
    .br { bottom: -1mm; right: -1mm; }

    .tag-title {
      font-size: ${isSmall ? '7pt' : '9pt'};
      font-weight: bold;
      letter-spacing: 0.05em;
      color: white;
      line-height: 1.2;
    }

    .tag-member {
      text-align: center;
      padding: ${isSmall ? '1.5mm 3mm' : '2mm 4mm'};
      flex-shrink: 0;
    }

    .tag-member-label {
      font-size: ${isSmall ? '4pt' : '5.5pt'};
      font-weight: bold;
      letter-spacing: 0.22em;
      color: rgba(236,252,203,0.8);
      margin-bottom: ${isSmall ? '1mm' : '1.5mm'};
    }

    .tag-name {
      font-size: ${isSmall ? '8pt' : '11pt'};
      font-weight: 900;
      color: white;
      line-height: 1.15;
      letter-spacing: -0.01em;
    }

    .tag-memberno {
      font-size: ${isSmall ? '5pt' : '6.5pt'};
      color: #d1fae5;
      margin-top: 1mm;
      letter-spacing: 0.05em;
    }

    .tag-badge {
      background: white;
      color: #064e3b;
      font-size: ${isSmall ? '5.5pt' : '7pt'};
      font-weight: 900;
      letter-spacing: 0.18em;
      text-align: center;
      padding: ${isSmall ? '1mm 3mm' : '1.5mm 4mm'};
      margin: ${isSmall ? '1.5mm auto 2mm' : '2mm auto 3mm'};
      width: fit-content;
      flex-shrink: 0;
    }

    .tag-qr-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: ${isSmall ? '1mm 4mm' : '1mm 5mm'};
      min-height: 0;
    }

    .tag-qr {
      width: 100%;
      max-width: ${isSmall ? '28mm' : '44mm'};
      height: auto;
      aspect-ratio: 1;
      background: white;
      padding: ${isSmall ? '1.5mm' : '2mm'};
      border-radius: 2mm;
      display: block;
      box-shadow: 0 2mm 6mm rgba(0,0,0,0.25);
    }

    .tag-footer {
      text-align: center;
      padding: ${isSmall ? '1.5mm' : '2.5mm'};
      font-size: ${isSmall ? '4pt' : '5pt'};
      font-weight: bold;
      letter-spacing: 0.1em;
      color: #dcfce7;
      flex-shrink: 0;
    }

    .tag-footer-sub {
      font-size: 4pt;
      color: rgba(255,255,255,0.55);
      font-weight: normal;
      margin-top: 0.5mm;
      letter-spacing: 0.08em;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .tags-grid { padding: 10mm; }
    }
  </style>
</head>
<body>
  <div class="tags-grid">
    ${tagsHtml}
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`
}

// For event tags that carry real server-issued QR tokens
export async function printParticipantTags(
  participants: ParticipantTagDto[],
  perPage: 4 | 6,
  title: string,
  eventTitle: string,
  eventStartDate: string,
  useQrCode: boolean,
) {
  if (participants.length === 0) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Pop-up was blocked. Please allow pop-ups for this site to print tags.')
    return
  }

  const logoUrl = `${window.location.origin}/images/amsa-logo.jpg`

  const usersWithQr = await Promise.all(
    participants.map(async (p) => {
      // Use real server token when available, fall back to memberNo
      const qrContent = useQrCode && p.token ? p.token : p.memberNo || p.userId
      return {
        user: {
          id: p.userId,
          memberNo: p.memberNo,
          firstName: p.firstName,
          lastName: p.lastName,
          unit: p.unit,
        } as User,
        qr: await toQrDataUrl(qrContent),
        subtitle: eventTitle,
        subtitleDate: eventStartDate,
      }
    }),
  )

  const html = buildPrintDocument(usersWithQr, logoUrl, perPage, title)
  printWindow.document.write(html)
  printWindow.document.close()
}

export async function printTags(users: User[], perPage: 4 | 6, title = 'Member Tags') {
  if (users.length === 0) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Pop-up was blocked. Please allow pop-ups for this site to print tags.')
    return
  }

  const logoUrl = `${window.location.origin}/images/amsa-logo.jpg`

  // Generate QR codes for all users in parallel
  const usersWithQr = await Promise.all(
    users.map(async (user) => ({
      user,
      qr: await toQrDataUrl(user.memberNo || user.id || 'AMSA'),
    })),
  )

  const html = buildPrintDocument(usersWithQr, logoUrl, perPage, title)
  printWindow.document.write(html)
  printWindow.document.close()
}
