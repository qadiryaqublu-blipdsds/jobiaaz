import { Vacancy } from '../types';

/**
 * Phonetic and Azerbaijani character normalizer for robust search.
 * Converts: ə->e, ı->i, ö->o, ü->u, ş->s, ç->c, ğ->g, removes accents & symbols.
 */
export function normalizeAzText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Rich domain synonym and related concept dictionary for Azerbaijani job market.
 * Maps common search keywords/abbreviations to full industry terms and skills.
 */
export const DOMAIN_SYNONYMS: Record<string, string[]> = {
  // IT & Programming
  it: [
    'it', 'proqram', 'proqramlasdirma', 'developer', 'software', 'frontend', 'backend',
    'fullstack', 'react', 'javascript', 'typescript', 'python', 'java', 'node', 'sql',
    'devops', 'sysadmin', 'qa', 'tester', 'kod', 'data', 'analitik', 'c#', 'net',
    'flutter', 'mobile', 'web', 'cyber', 'tehlukesizlik', 'administrator', 'helpdesk',
    'texnik', 'komputer', 'informasiya texnologiyalari'
  ],
  proqramlasdirma: [
    'it', 'proqram', 'proqramlasdirma', 'developer', 'software', 'frontend', 'backend',
    'fullstack', 'react', 'javascript', 'typescript', 'python', 'java', 'node', 'sql',
    'devops', 'qa', 'tester', 'kod', 'data', 'c#', 'net', 'flutter', 'mobile'
  ],
  developer: [
    'it', 'proqramlasdirma', 'developer', 'software', 'frontend', 'backend', 'fullstack',
    'react', 'javascript', 'python', 'java', 'node', 'kod', 'c#', 'net', 'flutter', 'mobile'
  ],
  frontend: [
    'frontend', 'front end', 'react', 'vue', 'angular', 'javascript', 'typescript',
    'html', 'css', 'tailwind', 'ui', 'ux', 'web developer'
  ],
  backend: [
    'backend', 'back end', 'node', 'nodejs', 'python', 'java', 'c#', '.net', 'golang',
    'sql', 'postgresql', 'api', 'django', 'spring', 'microservices'
  ],
  data: [
    'data', 'data scientist', 'data analyst', 'analitik', 'sql', 'python', 'power bi',
    'tableau', 'big data', 'statistika', 'verilenler'
  ],

  // Finance, Accounting & Banking
  muhasibat: [
    'muhasib', 'muhasibat', 'muhasibatliq', '1c', 'maliyye', 'audit', 'vergi', 'hesabat',
    'kassa', 'kassir', 'faktura', 'bank', 'iqtisad', 'excel', 'smeta', 'xezinedar'
  ],
  muhasib: [
    'muhasib', 'muhasibat', 'muhasibatliq', '1c', 'maliyye', 'audit', 'vergi', 'hesabat',
    'kassa', 'kassir', 'faktura', 'bank', 'excel', 'aparıcı mühasib'
  ],
  maliyye: [
    'maliyye', 'muhasib', 'muhasibat', 'audit', 'bank', 'analitik', 'iqtisad', 'budce',
    'kredit', 'investisiya', '1c', 'xezinedar', 'finans'
  ],
  bank: [
    'bank', 'kredit', 'maliyye', 'kassir', 'filial', 'anderraytinq', 'call center',
    'teller', 'əməliyyatçı', 'plastik kartlar', 'bank isi'
  ],
  audit: [
    'audit', 'auditor', 'muhasib', 'maliyye', 'yoxlama', 'risk', 'vergi', 'daxili audit'
  ],

  // Healthcare & Medicine
  tibb: [
    'tibb', 'tibbi', 'hekim', 'terapevt', 'pediatr', 'cerrah', 'stomatoloq', 'tibb bacisi',
    'feldser', 'klinika', 'xestexana', 'laboratoriya', 'eczaci', 'farmasevt', 'aptek',
    'saglamliq', 'sehiyye'
  ],
  hekim: [
    'hekim', 'tibb', 'klinika', 'terapevt', 'pediatr', 'stomatoloq', 'cerrah', 'laborant',
    'doktor', 'uzman', 'xestexana'
  ],
  eczaci: [
    'eczaci', 'farmasevt', 'aptek', 'derman', 'provizor', 'tibb', 'aptekar', 'farmakologiya'
  ],

  // Sales, Cashier, Retail
  satis: [
    'satis', 'satici', 'kassir', 'mercendayzer', 'konsultant', 'ticaret', 'magaza',
    'supermarket', 'promouter', 'temsilci', 'b2b', 'sobe mudiri', 'sales manager', 'musteri'
  ],
  satici: [
    'satici', 'satis', 'kassir', 'konsultant', 'magaza', 'ticaret', 'mercendayzer',
    'promouter', 'reyon'
  ],
  kassir: [
    'kassir', 'kassa', 'satici', '1c', 'pul', 'market', 'supermarket', 'restoran',
    'magaza', 'terminal'
  ],

  // Driver & Logistics
  surucu: [
    'surucu', 'b kateqoriya', 'bc', 'ce', 'avto', 'masin', 'kuryer', 'catdirilma',
    'taksi', 'şəxsi sürücü', 'avtomobil', 'logistika', 'ekspeditor', 'suruculuk'
  ],
  kuryer: [
    'kuryer', 'catdirilma', 'moto', 'surucu', 'velokuryer', 'anbar', 'poct', 'delivery'
  ],
  logistika: [
    'logistika', 'gomruk', 'anbar', 'anbardar', 'ekspeditor', 'yuk', 'neqliyyat',
    'catdirilma', 'techizat', 'satinalma', 'procurement', 'supply chain'
  ],

  // Marketing & Design
  marketinq: [
    'marketinq', 'marketing', 'smm', 'reklam', 'target', 'targetoloq', 'copywriter',
    'seo', 'pr', 'brend', 'metbuat', 'digital marketing', 'ictimaiyyet'
  ],
  smm: [
    'smm', 'social media', 'marketinq', 'reklam', 'instagram', 'facebook', 'tiktok',
    'target', 'kopirayter', 'kontent', 'social media manager'
  ],
  dizayn: [
    'dizayn', 'design', 'qrafik', 'ui', 'ux', 'photoshop', 'illustrator', 'figma',
    '3d', 'interyer', 'motion', 'video montaj', 'dizayner', 'art'
  ],

  // HR & Administration
  hr: [
    'hr', 'insan resurslari', 'kadr', 'rekruter', 'ise qebul', 'talant', 'emek',
    'personal', 'human resources'
  ],
  kadr: [
    'kadr', 'hr', 'insan resurslari', 'karguzar', 'senedlesme', 'emek mecellesi',
    'ofis meneceri', 'kadrlar'
  ],
  ofis: [
    'ofis', 'katibe', 'referent', 'inzibati', 'menecer', 'asistent', 'operator',
    'resursslar', 'admin'
  ],

  // Education
  tehsil: [
    'tehsil', 'muellim', 'telim', 'tedris', 'repetitor', 'kurs', 'mekteb',
    'ingilis dili', 'riyaziyyat', 'terbiyechi', 'dekanlıq', 'muellime'
  ],
  muellim: [
    'muellim', 'pedaqoq', 'tehsil', 'repetitor', 'kurs', 'telimci', 'ingilis dili',
    'riyaziyyat', 'repetitorluq', 'muellime'
  ],

  // Legal
  huquq: [
    'huquq', 'huquqsunas', 'vekil', 'muqavile', 'notariat', 'mehkeme', 'qanun',
    'korporativ huquq', 'yurist'
  ],

  // Construction, Engineering, Blue Collar & Handyman
  muhendis: [
    'muhendis', 'muhendislik', 'insaat', 'layihe', 'autocad', 'texniki', 'tikinti',
    'elektrik', 'mexanik', 'memar'
  ],
  insaat: [
    'insaat', 'tikinti', 'memar', 'usta', 'prorab', 'smeta', 'layihe', 'muhendis'
  ],
  anbar: [
    'anbar', 'anbardar', 'paketleyici', 'sayim', 'fehle', 'anbar mudiri', 'logistika',
    'sklad'
  ],
  fehle: [
    'fehle', 'usta', 'santexnik', 'elektrik', 'temir', 'montajci', 'iscisi', 'qurasdirici',
    'anbar iscisi'
  ],
  usta: [
    'usta', 'temir', 'elektrik', 'santexnik', 'texnik', 'avtomekanik', 'mexanik',
    'qaynaqci', 'kondisioner ustasi'
  ],

  // Restaurant & Hospitality
  restoran: [
    'restoran', 'aspaz', 'ofisiant', 'barista', 'barmen', 'kafe', 'hotel', 'otel',
    'qabyuyan', 'metbex', 'servis'
  ],
  aspaz: [
    'aspaz', 'metbex', 'qabyuyan', 'restoran', 'kulinariya', 'kafe', 'sefaşpaz', 'donerci'
  ],
  ofisiant: [
    'ofisiant', 'barista', 'barmen', 'restoran', 'kafe', 'hostes', 'servis', 'ofisiantka'
  ],
  xadime: [
    'xadime', 'temizlik', 'cleaner', 'temizkar', 'xadimeci', 'ev isleri'
  ],
  muhafize: [
    'muhafize', 'muhafizeci', 'tehlukesizlik', 'kesikci', 'security', 'straz', 'qoruyucu'
  ],
};

/**
 * Evaluates match score between vacancy and user search query / domain words.
 */
export function evaluateJobDomainMatch(job: Vacancy, rawQuery: string): {
  isMatch: boolean;
  score: number;
  matchReasons: string[];
} {
  if (!rawQuery || !rawQuery.trim()) {
    return { isMatch: true, score: 50, matchReasons: [] };
  }

  const normQ = normalizeAzText(rawQuery);
  const queryTokens = normQ.split(' ').filter((w) => w.length > 0);

  if (queryTokens.length === 0) {
    return { isMatch: true, score: 50, matchReasons: [] };
  }

  // Build searchable normalized text corpus for the job
  const titleNorm = normalizeAzText(job.title);
  const compNorm = normalizeAzText(job.companyName);
  const catNorm = normalizeAzText(job.category);
  const descNorm = normalizeAzText(job.description || '');
  const skillsNorm = (job.skills || []).map((s) => normalizeAzText(s));
  const reqsNorm = (job.requirements || []).map((r) => normalizeAzText(r)).join(' ');
  const respsNorm = (job.responsibilities || []).map((r) => normalizeAzText(r)).join(' ');
  const cityNorm = normalizeAzText(job.city || '');

  const fullCorpus = `${titleNorm} ${compNorm} ${catNorm} ${descNorm} ${skillsNorm.join(' ')} ${reqsNorm} ${respsNorm} ${cityNorm}`;

  // Expand domain synonyms for all tokens
  const expandedConcepts = new Set<string>();
  queryTokens.forEach((tok) => {
    expandedConcepts.add(tok);
    // Check if tok matches any synonym key
    for (const [key, synonyms] of Object.entries(DOMAIN_SYNONYMS)) {
      const normKey = normalizeAzText(key);
      if (normKey === tok || tok.includes(normKey) || normKey.includes(tok)) {
        synonyms.forEach((syn) => expandedConcepts.add(normalizeAzText(syn)));
      }
    }
  });

  let matchScore = 0;
  let directMatches = 0;
  const reasons: string[] = [];

  // 1. Direct query tokens match in title / skills / corpus
  for (const token of queryTokens) {
    if (titleNorm.includes(token)) {
      matchScore += 35;
      directMatches++;
      reasons.push(`Vəzifə başlığında "${token}" uyğunluğu`);
    } else if (skillsNorm.some((s) => s.includes(token) || token.includes(s))) {
      matchScore += 25;
      directMatches++;
      reasons.push(`Tələb olunan bacarıqlarda "${token}" tapıldı`);
    } else if (catNorm.includes(token)) {
      matchScore += 25;
      directMatches++;
      reasons.push(`Kateqoriya uyğunluğu: ${job.category}`);
    } else if (compNorm.includes(token)) {
      matchScore += 25;
      directMatches++;
      reasons.push(`Şirkət adı uyğunluğu: ${job.companyName}`);
    } else if (fullCorpus.includes(token)) {
      matchScore += 15;
      directMatches++;
    }
  }

  // 2. Semantic domain synonyms match
  let synonymHits = 0;
  for (const syn of expandedConcepts) {
    if (syn.length <= 2) continue;
    if (titleNorm.includes(syn)) {
      synonymHits += 2;
      matchScore += 18;
    } else if (skillsNorm.some((s) => s.includes(syn))) {
      synonymHits++;
      matchScore += 12;
    } else if (catNorm.includes(syn)) {
      synonymHits++;
      matchScore += 12;
    } else if (fullCorpus.includes(syn)) {
      synonymHits++;
      matchScore += 6;
    }
  }

  if (synonymHits > 0 && directMatches === 0) {
    reasons.push(`Sahə və terminlər üzrə əlaqəli vakansiya (${job.category})`);
  }

  const isMatch = directMatches > 0 || synonymHits > 0;
  const finalScore = Math.min(99, Math.max(isMatch ? 55 : 30, matchScore));

  return {
    isMatch,
    score: finalScore,
    matchReasons: reasons.length > 0 ? reasons : [`${job.category} sahəsinə uyğundur`],
  };
}
