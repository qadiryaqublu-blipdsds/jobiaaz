import { Company, Vacancy, CVData, Application } from '../types';

export const JOB_CATEGORIES = [
  'İT və Proqramlaşdırma',
  'Maliyyə və Mühasibat',
  'Bankçılıq və Sığorta',
  'Marketinq, Reklam və PR',
  'Satış və Müştəri Xidmətləri',
  'Dizayn və Yaradıcılıq',
  'İnsan Resursları (HR)',
  'Mühəndislik və Tikinti',
  'Tibb, Əczaçılıq və Səhiyyə',
  'Təhsil, Elm və Təlim',
  'Logistika, Nəqliyyat və Anbar',
  'Hüquq və Komplayens',
  'Restoran, Otel və Turizm (HoReCa)',
  'İnzibati, Ofis və Katiblik',
  'İstehsalat, Sənaye və Texnologiya',
  'Energetika, Neft-Qaz və Mədən',
  'Media, Jurnalistika və Nəşriyyat',
  'Təhlükəsizlik və Mühafizə',
  'Kənd Təsərrüfatı və Aqrar',
  'Tələbələr və Təcrübəçilər',
];

export const CITIES = [
  'Bakı',
  'Sumqayıt',
  'Gəncə',
  'Xırdalan',
  'Mingəçevir',
  'Naxçıvan',
  'Şəki',
  'Lənkəran',
  'Quba',
  'Qusar',
  'Xaçmaz',
  'Şamaxı',
  'İsmayıllı',
  'Qəbələ',
  'Şuşa',
  'Xankəndi',
  'Ağdam',
  'Zəngilan',
  'Laçın',
  'Füzuli',
  'Cəbrayıl',
  'Kəlbəcər',
  'Qubadlı',
  'Tovuz',
  'Qazax',
  'Şəmkir',
  'Yevlax',
  'Bərdə',
  'Ağcabədi',
  'Göyçay',
  'Masallı',
  'Cəlilabad',
  'Salyan',
  'Şirvan',
  'Zaqatala',
  'Balakən',
  'Uzaqdan / Remote',
];

// Production Clean Data: No fake / test / sample data.
export const SAMPLE_COMPANIES: Company[] = [];
export const SAMPLE_VACANCIES: Vacancy[] = [];
export const INITIAL_VACANCIES: Vacancy[] = [];
export const SAMPLE_APPLICATIONS: Application[] = [];

export const FEATURED_COMPANIES: any[] = [];

export const INITIAL_EMPTY_CV: CVData = {
  id: 'cv-default',
  title: 'Mənim CV-m',
  lastUpdated: new Date().toISOString().split('T')[0],
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    address: 'Bakı, Azərbaycan',
    summary: '',
    photoUrl: '',
  },
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  certificates: [],
  projects: [],
};

export const SAMPLE_CANDIDATE_CV: CVData = INITIAL_EMPTY_CV;

export const SALARY_INSIGHTS = [];
