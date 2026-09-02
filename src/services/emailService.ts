import { JobOffer } from '../types';

export interface SendOfferEmailPayload {
  offerId: string;
  candidateEmail: string;
  candidateName: string;
  position: string;
  companyName: string;
  companyEmail?: string;
  hrContactPerson?: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  secureOfferLink: string;
  pdfAttachmentBase64?: string;
  pdfFileName?: string;
}

export interface SendOfferEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveredTo?: string;
  sentAt?: string;
  isSimulated?: boolean;
}

export function validateOfferBeforeSending(offer: Partial<JobOffer>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!offer.candidateName?.trim()) {
    errors.push('Namizədin tam adı (Candidate Name) daxil edilməlidir.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!offer.candidateEmail?.trim() || !emailRegex.test(offer.candidateEmail.trim())) {
    errors.push('Namizədin e-poçt ünvanı düzgün deyil və ya boşdur.');
  }

  if (!offer.position?.trim()) {
    errors.push('Təklif olunan vəzifə (Position) qeyd olunmalıdır.');
  }

  if (!offer.companyName?.trim()) {
    errors.push('Şirkət adı (Company Name) daxil edilməlidir.');
  }

  if (!offer.startDate?.trim()) {
    errors.push('İşə başlama tarixi (Start Date) seçilməlidir.');
  }

  if (offer.grossSalary === undefined || offer.grossSalary === null || isNaN(offer.grossSalary) || offer.grossSalary <= 0) {
    errors.push('Məcmu əməkhaqqı (Gross Salary) müsbət rəqəm olmalıdır.');
  }

  if (!offer.employmentType) {
    errors.push('Məşğulluq növü (Employment Type) seçilməlidir.');
  }

  if (!offer.hrContactPerson?.trim()) {
    errors.push('HR əlaqədar şəxsin adı qeyd olunmalıdır.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function buildOfferEmailContent(offer: JobOffer, secureLink: string) {
  const isAz = offer.language !== 'en';

  const subject = isAz
    ? `Rəsmi İş Təklifi: ${offer.position} — ${offer.companyName}`
    : `Official Employment Offer: ${offer.position} — ${offer.companyName}`;

  const textBody = isAz
    ? `Hörmətli ${offer.candidateName},

${offer.companyName} şirkəti adından Sizi təbrik edirik! Uğurlu müsahibə mərhələlərindən sonra Sizə "${offer.position}" vəzifəsi üzrə rəsmi iş təklifimizi təqdim etməkdən məmnunluq duyuruq.

Əsas Şərtlər:
- Vəzifə: ${offer.position} (${offer.department})
- Əməkhaqqı: ${offer.grossSalary.toLocaleString('az-AZ')} AZN Gross (${offer.netSalary.toLocaleString('az-AZ')} AZN Net)
- Başlama tarixi: ${offer.startDate}
- Məşğulluq növü: ${offer.employmentType}

İş təklifinin tam detallarına baxmaq, rəsmi PDF sənədini yükləmək və təklifi onlayn təsdiqləmək və ya cavablandırmaq üçün aşağıdakı təhlükəsiz keçiddən istifadə edin:
${secureLink}

Hörmətlə,
${offer.hrContactPerson}
${offer.hrContactPosition || 'İnsan Resursları Departamenti'}
${offer.companyName}`
    : `Dear ${offer.candidateName},

Congratulations from all of us at ${offer.companyName}! Following your successful interviews, we are delighted to formally extend our employment offer for the position of "${offer.position}".

Summary of Terms:
- Position: ${offer.position} (${offer.department})
- Compensation: ${offer.grossSalary.toLocaleString('az-AZ')} AZN Gross (${offer.netSalary.toLocaleString('az-AZ')} AZN Net)
- Start Date: ${offer.startDate}
- Employment Type: ${offer.employmentType}

Please visit your secure candidate offer portal to review the complete employment agreement, download your official signed PDF, and accept or respond to this offer:
${secureLink}

Sincerely,
${offer.hrContactPerson}
${offer.hrContactPosition || 'Human Resources Department'}
${offer.companyName}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 28px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .content { padding: 32px 28px; }
    .highlight-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .terms-grid { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .terms-grid td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .terms-grid td.label { color: #64748b; font-weight: 600; width: 40%; }
    .terms-grid td.val { color: #0f172a; font-weight: 700; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 14px 28px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; text-align: center; margin: 20px 0; box-shadow: 0 2px 4px rgba(37,99,235,0.2); }
    .footer { background: #f8fafc; padding: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${offer.companyName}</h1>
      <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">${isAz ? 'Rəsmi İş Təklifi Məktubu' : 'Official Employment Offer'}</p>
    </div>
    <div class="content">
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">${isAz ? `Hörmətli ${offer.candidateName},` : `Dear ${offer.candidateName},`}</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        ${isAz 
          ? `Sizi ${offer.companyName} komandası adından təbrik edirik! Uğurlu müsahibə mərhələlərindən sonra Sizə <strong>${offer.position}</strong> vəzifəsi üzrə rəsmi iş təklifimizi təqdim etməkdən böyük şərəf duyuruq.` 
          : `We are delighted to formally extend our employment offer for the position of <strong>${offer.position}</strong> at ${offer.companyName}. We were greatly impressed by your skills and look forward to having you on our team.`}
      </p>

      <div class="highlight-card">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #166534; font-weight: 700;">${isAz ? 'Əsas Əməkdaşlıq Şərtləri' : 'Key Employment Highlights'}</h3>
        <table class="terms-grid">
          <tr>
            <td class="label">${isAz ? 'Vəzifə:' : 'Position:'}</td>
            <td class="val">${offer.position}</td>
          </tr>
          <tr>
            <td class="label">${isAz ? 'Departament:' : 'Department:'}</td>
            <td class="val">${offer.department}</td>
          </tr>
          <tr>
            <td class="label">${isAz ? 'Əməkhaqqı (Gross):' : 'Gross Salary:'}</td>
            <td class="val">${offer.grossSalary.toLocaleString('az-AZ')} AZN / ay</td>
          </tr>
          <tr>
            <td class="label">${isAz ? 'Xalis Əməkhaqqı (Net):' : 'Net Salary:'}</td>
            <td class="val">${offer.netSalary.toLocaleString('az-AZ')} AZN / ay</td>
          </tr>
          <tr>
            <td class="label">${isAz ? 'İşə Başlama Tarixi:' : 'Start Date:'}</td>
            <td class="val">${offer.startDate}</td>
          </tr>
          <tr>
            <td class="label">${isAz ? 'Məşğulluq Növü:' : 'Employment Type:'}</td>
            <td class="val">${offer.employmentType}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center;">
        <a href="${secureLink}" class="btn" target="_blank">
          ${isAz ? 'İş Təklifinə Bax və Cavablandır →' : 'Review & Respond to Offer →'}
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 24px; line-height: 1.5;">
        ${isAz 
          ? 'Qeyd: Rəsmi təklif sənədini onlayn portalımızdan PDF formatında yükləyə və 1 kliklə qərarınızı göndərə bilərsiniz.' 
          : 'Note: You can download the official PDF document and confirm your decision directly inside your portal.'}
      </p>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

      <p style="font-size: 13px; color: #334155; margin: 0;">
        <strong>${offer.hrContactPerson}</strong><br>
        ${offer.hrContactPosition || (isAz ? 'İnsan Resursları Departamenti' : 'HR Department')}<br>
        ${offer.companyName}
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ${offer.companyName} • jobia.az portalı vasitəsilə təhlükəsiz göndərilib.
    </div>
  </div>
</body>
</html>`;

  return { subject, textBody, htmlBody };
}

/**
 * Dispatches the job offer email via the backend service with full error reporting and retry support.
 */
export async function sendJobOfferEmail(payload: SendOfferEmailPayload): Promise<SendOfferEmailResult> {
  try {
    const response = await fetch('/api/email/send-job-offer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'E-poçt serverindən cavab alınmadı.' }));
      throw new Error(errData.error || `Server xətası: HTTP ${response.status}`);
    }

    const data: SendOfferEmailResult = await response.json();
    return data;
  } catch (error: any) {
    console.error('Email delivery error:', error);
    return {
      success: false,
      error: error?.message || 'E-poçt göndərilərkən xəta baş verdi.',
    };
  }
}
