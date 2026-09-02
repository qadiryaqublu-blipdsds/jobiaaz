import { JobOfferTemplate, JobOffer } from '../types';

export const DEFAULT_OFFER_TEMPLATES: JobOfferTemplate[] = [
  {
    id: 'template-az-standard',
    name: 'Azərbaycan Dili - Rəsmi Korporativ İş Təklifi',
    description: 'Azərbaycan qanunvericiliyinə və korporativ standartlara uyğun dolğun iş təklifi sənədi.',
    language: 'az',
    isDefault: true,
    content: `Hörmətli {{candidate_name}},

{{company_name}} adından Sizi uğurlu müsahibə mərhələlərindən sonra komandamızda görməkdən böyük məmnunluq duyuruq. Şirkətimiz Sizə **{{position}}** vəzifəsini təklif edir.

Sizin peşəkar bacarıqlarınız, təcrübəniz və komandaya qatacağınız dəyər şirkətimizin strateji hədəflərinə çatmaqda mühüm rol oynayacaqdır.

### Əməkdaşlığın Əsas Şərtləri:

1. **Vəzifə və Struktur Bölmə:** {{position}}, {{department}}
2. **İşə Başlama Tarixi:** {{start_date}}
3. **Məşğulluq Növü:** {{employment_type}}
4. **İş Yeri / Ünvan:** {{work_location}}
5. **İş Qrafiki:** {{working_schedule}}
6. **Əməkhaqqı:**
   - Aylıq Məcmu Əməkhaqqı (Gross): **{{gross_salary}} AZN**
   - Təxmini Xalis Əməkhaqqı (Net): **{{net_salary}} AZN**
7. **Sınaq Müddəti:** {{probation_period}}
8. **Əsas və Əlavə Məzuniyyət:** İllik {{annual_leave}}
9. **Bonus və Mükafatlandırma:** {{bonus}}

### Şirkət Tərəfindən Təmin Edilən Təminatlar və İmtiyazlar (Benefits):
{{benefits}}

### Əlavə Qaydalar və Qeydlər:
{{additional_terms}}

Bu təklif ilə razısınızsa, aşağıdakı təsdiq linki və ya sənəd vasitəsilə rəsmi cavabınızı təqdim etməyinizi xahiş edirik. Sizi aramızda salamlamağı səbirsizliklə gözləyirik!

Hörmətlə,
**{{hr_name}}**
{{hr_position}}
{{company_name}}`,
  },
  {
    id: 'template-en-standard',
    name: 'English - Official Corporate Employment Offer',
    description: 'Comprehensive, formal international employment offer letter in business English.',
    language: 'en',
    isDefault: false,
    content: `Dear {{candidate_name}},

On behalf of **{{company_name}}**, we are delighted to formally extend an offer of employment for the position of **{{position}}** within the {{department}} department.

Following our interview discussions, we were very impressed by your background, professional expertise, and cultural alignment with our team values.

### Summary of Employment Terms:

- **Position Title:** {{position}}
- **Department:** {{department}}
- **Anticipated Start Date:** {{start_date}}
- **Employment Type:** {{employment_type}}
- **Primary Work Location:** {{work_location}}
- **Working Hours & Schedule:** {{working_schedule}}
- **Compensation:**
  - Monthly Gross Base Salary: **{{gross_salary}} AZN**
  - Estimated Monthly Net Salary: **{{net_salary}} AZN**
- **Probationary Period:** {{probation_period}}
- **Paid Annual Leave:** {{annual_leave}}
- **Performance Bonus:** {{bonus}}

### Company Benefits & Perks:
{{benefits}}

### Additional Terms & Conditions:
{{additional_terms}}

Please review this formal offer. To accept, kindly use the secure digital confirmation link or sign and return this document.

We look forward to welcoming you to the {{company_name}} team!

Sincerely,
**{{hr_name}}**  
{{hr_position}}  
{{company_name}}`,
  },
];

const TEMPLATES_STORAGE_KEY = 'jobia_job_offer_templates';

export function getOfferTemplates(): JobOfferTemplate[] {
  try {
    const saved = localStorage.getItem(TEMPLATES_STORAGE_KEY) || localStorage.getItem('hireme_job_offer_templates');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load offer templates from storage', e);
  }
  return DEFAULT_OFFER_TEMPLATES;
}

export function saveOfferTemplates(templates: JobOfferTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates to storage', e);
  }
}

/**
 * Replaces all placeholders in a template with actual offer values.
 */
export function populateOfferTemplate(templateContent: string, offer: Partial<JobOffer>): string {
  const benefitsList = Array.isArray(offer.benefits) && offer.benefits.length > 0
    ? offer.benefits.map((b) => `• ${b}`).join('\n')
    : (offer.language === 'en' ? 'Standard company benefits as per policy' : 'Müvafiq korporativ təminatlar paketi');

  const replacements: Record<string, string> = {
    '{{candidate_name}}': offer.candidateName || 'Namizəd',
    '{{position}}': offer.position || 'Mütəxəssis',
    '{{department}}': offer.department || 'Əsas Şöbə',
    '{{company_name}}': offer.companyName || 'Şirkət',
    '{{start_date}}': offer.startDate || new Date().toISOString().split('T')[0],
    '{{employment_type}}': offer.employmentType || 'Tam ştat',
    '{{gross_salary}}': offer.grossSalary !== undefined ? `${offer.grossSalary.toLocaleString('az-AZ')}` : '0',
    '{{net_salary}}': offer.netSalary !== undefined ? `${offer.netSalary.toLocaleString('az-AZ')}` : '0',
    '{{probation_period}}': offer.probationPeriod || '3 ay',
    '{{work_location}}': offer.workLocation || offer.companyAddress || 'Bakı, Azərbaycan',
    '{{working_schedule}}': offer.workingSchedule || 'Bazar ertəsi - Cümə, 09:00 - 18:00',
    '{{annual_leave}}': offer.annualLeave || '21 təqvim günü',
    '{{bonus}}': offer.bonus || (offer.language === 'en' ? 'Performance-based quarterly/annual KPI bonus' : 'KPI və fərdi nəticələrə əsaslanan rüblük/illik bonus'),
    '{{benefits}}': benefitsList,
    '{{additional_terms}}': offer.additionalTerms?.trim() || (offer.language === 'en' ? 'Standard employment agreement terms apply.' : 'Əmək müqaviləsi Azərbaycan Respublikasının Əmək Məcəlləsinə uyğun rəsmiləşdirilir.'),
    '{{hr_name}}': offer.hrContactPerson || 'HR Meneceri',
    '{{hr_position}}': offer.hrContactPosition || 'İnsan Resursları Departamenti',
    '{{today_date}}': new Date().toLocaleDateString('az-AZ'),
  };

  let result = templateContent;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.split(placeholder).join(value);
  }
  return result;
}
