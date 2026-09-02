import { CVData, Vacancy } from '../types';

export interface ATSKeywordMatch {
  keyword: string;
  category: 'Texniki' | 'Soft skill' | 'Alət / Metodologiya' | 'Ümumi';
  importance: 'Kritik' | 'Yüksək' | 'Orta';
  countInCV: number;
  densityPercent: number;
  targetDensityRange: string;
  densityStatus: 'missing' | 'low' | 'optimal' | 'high' | 'stuffing';
  foundInSections: string[];
  recommendation: string;
}

export interface ATSFormattingCheck {
  id: string;
  title: string;
  category: 'Əlaqə' | 'Struktur' | 'Mətn Həcmi' | 'Nailiyyətlər' | 'Oxunaqlıq';
  status: 'pass' | 'warning' | 'fail';
  scoreImpact: number; // e.g. +10, -5
  message: string;
  details: string;
  howToFix: string;
}

export interface ATSOptimizationAnalysis {
  targetJobTitle: string;
  targetCompany?: string;
  totalWordCount: number;
  atsRankScore: number; // 0 - 100
  potentialScoreBoost: number;
  potentialMaxScore: number;
  rankingTier: 'Top 5% (Müsahibə Şansı 90%+)' | 'Top 15% (Rəqabətədavamlı)' | 'Orta Səviyyə (50-70%)' | 'Diqqət Tələb Edir (<50%)';
  keywordMatchRate: number; // percentage of vacancy keywords found
  matchedKeywordsCount: number;
  totalKeywordsCount: number;
  keywords: ATSKeywordMatch[];
  formattingChecks: ATSFormattingCheck[];
  passedChecksCount: number;
  totalChecksCount: number;
  highPrioritySuggestions: {
    title: string;
    description: string;
    scoreBoost: number;
    actionType: 'add_keyword' | 'fix_formatting' | 'enhance_summary' | 'add_metrics';
    suggestedContent?: string;
  }[];
  atsPlainTextView: string;
}

/**
 * Extracts target keywords and core competencies from a vacancy or standard role
 */
export function extractKeywordsFromVacancy(vacancy?: Vacancy | null, defaultRole?: string): {
  keyword: string;
  category: 'Texniki' | 'Soft skill' | 'Alət / Metodologiya' | 'Ümumi';
  importance: 'Kritik' | 'Yüksək' | 'Orta';
}[] {
  const list: {
    keyword: string;
    category: 'Texniki' | 'Soft skill' | 'Alət / Metodologiya' | 'Ümumi';
    importance: 'Kritik' | 'Yüksək' | 'Orta';
  }[] = [];

  const seen = new Set<string>();

  const add = (
    kw: string,
    category: 'Texniki' | 'Soft skill' | 'Alət / Metodologiya' | 'Ümumi',
    importance: 'Kritik' | 'Yüksək' | 'Orta'
  ) => {
    const clean = kw.trim();
    if (clean.length < 2) return;
    const lower = clean.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      list.push({ keyword: clean, category, importance });
    }
  };

  if (vacancy) {
    // 1. Explicit vacancy skills (highest priority)
    if (vacancy.skills && Array.isArray(vacancy.skills)) {
      vacancy.skills.forEach((s) => add(s, 'Texniki', 'Kritik'));
    }

    // 2. Title keywords
    const titleWords = vacancy.title.split(/[\s,/\\-]+/).filter((w) => w.length > 2);
    titleWords.forEach((tw) => {
      if (!['və', 'ilə', 'üzrə', 'şirkəti', 'şöbəsi', 'mərkəzi'].includes(tw.toLowerCase())) {
        add(tw, 'Ümumi', 'Kritik');
      }
    });

    // 3. Extract common high-value terms from requirements & description
    const textCorpus = `${vacancy.description} ${(vacancy.requirements || []).join(' ')} ${(vacancy.responsibilities || []).join(' ')}`;
    
    // Domain knowledge patterns
    const techPatterns = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'SQL', 'PostgreSQL', 
      'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'CI/CD', 'REST API', 'GraphQL', 
      'HTML', 'CSS', 'Tailwind', 'Next.js', 'Redux', 'Linux', 'Microservices', 'Figma', 'UI/UX',
      'Data Analysis', 'Excel', 'Power BI', 'SEO', 'Google Analytics', 'CRM', 'ERP', '1C',
      'Agile', 'Scrum', 'Kanban', 'Jira', 'Trello', 'OOP', 'Clean Code', 'API İnteqrasiyası',
      'Təhlükəsizlik', 'Performance Optimization', 'Unit Testing', 'QA', 'Manual Testing',
      'Finans Analizi', 'Maliyyə Hesabatları', 'Satış Strategiyası', 'B2B', 'Müştəri Əlaqələri',
      'Büdcə İdarəetməsi', 'Layihə İdarəetməsi', 'Project Management'
    ];

    techPatterns.forEach((p) => {
      const regex = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(textCorpus)) {
        add(p, p.includes('Agile') || p.includes('Scrum') || p.includes('Jira') ? 'Alət / Metodologiya' : 'Texniki', 'Yüksək');
      }
    });

    // Soft skills patterns
    const softPatterns = [
      'Problem həlli', 'Analitik düşüncə', 'Komanda işi', 'Ünsiyyət bacarıqları',
      'Vaxt idarəetməsi', 'Liderlik', 'Təqdimat bacarığı', 'Dəqiqlik', 'Nəticəyönümlülük',
      'Məsuliyyət', 'Kritik düşüncə', 'Çeviklik', 'Müştəriyönümlülük'
    ];

    softPatterns.forEach((sp) => {
      const regex = new RegExp(sp, 'i');
      if (regex.test(textCorpus)) {
        add(sp, 'Soft skill', 'Orta');
      }
    });

    // Extract bullet phrases if short
    vacancy.requirements?.slice(0, 4).forEach((req) => {
      if (req.length < 35 && req.length > 5) {
        add(req, 'Alət / Metodologiya', 'Yüksək');
      }
    });
  } else {
    // General role defaults
    const role = defaultRole || 'Mütəxəssis';
    add(role, 'Ümumi', 'Kritik');
    add('Layihə İdarəetməsi', 'Alət / Metodologiya', 'Yüksək');
    add('Komanda İşi', 'Soft skill', 'Yüksək');
    add('Problem Həlli', 'Soft skill', 'Yüksək');
    add('Analitik Düşüncə', 'Soft skill', 'Yüksək');
    add('Nəticəyönümlülük', 'Soft skill', 'Orta');
    add('Hesabatlılıq', 'Alət / Metodologiya', 'Orta');
    add('MS Office / Rəqəmsal Alətlər', 'Texniki', 'Orta');
    add('Vaxt İdarəetməsi', 'Soft skill', 'Orta');
    add('Peşəkar Ünsiyyət', 'Soft skill', 'Yüksək');
  }

  return list.slice(0, 18);
}

/**
 * Real-time comprehensive ATS analysis engine
 */
export function analyzeCVForATS(
  cvData: CVData,
  vacancy?: Vacancy | null,
  customText?: string
): ATSOptimizationAnalysis {
  const targetJobTitle = vacancy?.title || cvData.personalInfo.jobTitle || 'Mütəxəssis';
  const targetCompany = vacancy?.companyName;

  // 1. Build sectional texts
  const summaryText = (customText || cvData.personalInfo.summary || '').trim();
  const experiencesText = (cvData.experiences || [])
    .map((e) => `${e.position} ${e.company} ${e.description}`)
    .join(' ');
  const skillsText = (cvData.skills || []).map((s) => s.name).join(' ');
  const educationText = (cvData.education || [])
    .map((ed) => `${ed.degree} ${ed.fieldOfStudy} ${ed.institution}`)
    .join(' ');
  const projectsText = (cvData.projects || [])
    .map((p) => `${p.title} ${p.description} ${(p.technologies || []).join(' ')}`)
    .join(' ');
  const certificatesText = (cvData.certificates || [])
    .map((c) => `${c.name} ${c.issuer}`)
    .join(' ');

  const fullCorpus = `${cvData.personalInfo.fullName} ${cvData.personalInfo.jobTitle} ${cvData.personalInfo.email} ${cvData.personalInfo.phone} ${cvData.personalInfo.address} ${summaryText} ${experiencesText} ${skillsText} ${educationText} ${projectsText} ${certificatesText}`;

  // Word count
  const allWords = fullCorpus
    .split(/\s+/)
    .filter((w) => w.trim().length > 0);
  const totalWordCount = allWords.length;

  // 2. Keyword density extraction
  const extractedKeywords = extractKeywordsFromVacancy(vacancy, cvData.personalInfo.jobTitle);
  let matchedKeywordsCount = 0;

  const keywords: ATSKeywordMatch[] = extractedKeywords.map((item) => {
    const kw = item.keyword;
    const kwWordCount = kw.split(/\s+/).length;
    // Regex search
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');

    const totalMatches = (fullCorpus.match(regex) || []).length;
    const foundInSections: string[] = [];

    if (summaryText && new RegExp(`\\b${escaped}\\b`, 'i').test(summaryText)) foundInSections.push('Haqqımda');
    if (experiencesText && new RegExp(`\\b${escaped}\\b`, 'i').test(experiencesText)) foundInSections.push('İş Təcrübəsi');
    if (skillsText && new RegExp(`\\b${escaped}\\b`, 'i').test(skillsText)) foundInSections.push('Bacarıqlar');
    if (projectsText && new RegExp(`\\b${escaped}\\b`, 'i').test(projectsText)) foundInSections.push('Layihələr');
    if (educationText && new RegExp(`\\b${escaped}\\b`, 'i').test(educationText)) foundInSections.push('Təhsil');

    const densityPercent = totalWordCount > 0 ? Number(((totalMatches * kwWordCount / totalWordCount) * 100).toFixed(2)) : 0;

    let densityStatus: 'missing' | 'low' | 'optimal' | 'high' | 'stuffing';
    let recommendation = '';

    if (totalMatches === 0) {
      densityStatus = 'missing';
      recommendation = `Bu açar söz CV-də aşkar edilmədi. Xülasə (Summary) və ya təcrübə bəndlərinə ən azı 1-2 dəfə əlavə edin.`;
    } else if (densityPercent < 0.5 && totalMatches === 1) {
      densityStatus = 'low';
      matchedKeywordsCount++;
      recommendation = `Tapıldı (1 dəfə). ATS reytinqini gücləndirmək üçün bacarıqlar və layihələr bölməsində də təkrarlana bilər.`;
    } else if (densityPercent <= 3.5) {
      densityStatus = 'optimal';
      matchedKeywordsCount++;
      recommendation = `İdeal sıxlıq (${densityPercent}%). ATS robotları və rekruterlər üçün tam balanslaşdırılıb.`;
    } else if (densityPercent <= 5.0) {
      densityStatus = 'high';
      matchedKeywordsCount++;
      recommendation = `Yüksək təkrarlanma (${densityPercent}%). Təbii oxunaqlığı qorumaq üçün sinonimlərdən istifadə edin.`;
    } else {
      densityStatus = 'stuffing';
      matchedKeywordsCount++;
      recommendation = `Açar söz yüklənməsi (Keyword Stuffing xəbərdarlığı: ${densityPercent}%). Sayı azaldın.`;
    }

    return {
      keyword: kw,
      category: item.category,
      importance: item.importance,
      countInCV: totalMatches,
      densityPercent,
      targetDensityRange: '1.0% - 3.0%',
      densityStatus,
      foundInSections,
      recommendation,
    };
  });

  const totalKeywordsCount = extractedKeywords.length;
  const keywordMatchRate = totalKeywordsCount > 0 ? Math.round((matchedKeywordsCount / totalKeywordsCount) * 100) : 100;

  // 3. Formatting & Structural Checks (ATS compliance suite)
  const formattingChecks: ATSFormattingCheck[] = [];

  // Check 1: Contact Information Completeness
  const hasEmail = Boolean(cvData.personalInfo.email && cvData.personalInfo.email.includes('@'));
  const hasPhone = Boolean(cvData.personalInfo.phone && cvData.personalInfo.phone.length > 5);
  const hasAddress = Boolean(cvData.personalInfo.address && cvData.personalInfo.address.length > 2);
  const contactPassed = hasEmail && hasPhone;

  formattingChecks.push({
    id: 'contact_info',
    title: 'Əlaqə Məlumatlarının Tamlığı',
    category: 'Əlaqə',
    status: contactPassed ? 'pass' : (hasEmail || hasPhone ? 'warning' : 'fail'),
    scoreImpact: contactPassed ? 10 : -10,
    message: contactPassed 
      ? 'Email və telefon nömrəsi ATS parseri tərəfindən problemsiz oxunur.'
      : 'Vacib əlaqə məlumatı çatışmır (Email və ya Telefon).',
    details: `Email: ${hasEmail ? 'Mövcuddur' : 'Yoxdur'}, Telefon: ${hasPhone ? 'Mövcuddur' : 'Yoxdur'}, Ünvan: ${hasAddress ? 'Mövcuddur' : 'Yoxdur'}`,
    howToFix: 'Şəxsi məlumatlar bölməsində aktiv email və telefon nömrənizi dəqiq qeyd edin.',
  });

  // Check 2: Professional Summary / Haqqımda
  const summaryWords = summaryText.split(/\s+/).filter((w) => w.length > 0).length;
  const summaryPassed = summaryWords >= 25 && summaryWords <= 120;
  const summaryWarning = summaryWords > 0 && (summaryWords < 25 || summaryWords > 120);

  formattingChecks.push({
    id: 'summary_section',
    title: 'Peşəkar Xülasə (Summary) Balansı',
    category: 'Struktur',
    status: summaryPassed ? 'pass' : (summaryWarning ? 'warning' : 'fail'),
    scoreImpact: summaryPassed ? 10 : (summaryWarning ? 5 : -5),
    message: summaryPassed
      ? `Xülasə həcmi idealdır (${summaryWords} söz). Rekruterin ilk 6 saniyəlik diqqətini cəlb edir.`
      : summaryWords === 0
      ? 'CV-də peşəkar xülasə (Haqqımda) yoxdur. ATS profil reytinqi aşağı düşür.'
      : `Xülasə ${summaryWords < 25 ? 'çox qısadır' : 'həddindən artıq uzundur'} (${summaryWords} söz, optimal: 30-90 söz).`,
    details: `Cari söz sayı: ${summaryWords}.`,
    howToFix: 'Haqqımda bölməsinə təcrübə illərinizi, əsas ixtisas sahənizi və hədəflərinizi cəmləşdirən 3-4 cümləlik mətn yazın.',
  });

  // Check 3: Standard Section Headers & Structure
  const hasExp = (cvData.experiences || []).length > 0;
  const hasEdu = (cvData.education || []).length > 0;
  const hasSkills = (cvData.skills || []).length >= 4;

  const structurePassed = hasExp && hasEdu && hasSkills;
  formattingChecks.push({
    id: 'standard_headers',
    title: 'Standart Bölmə Başlıqları və Strukturu',
    category: 'Struktur',
    status: structurePassed ? 'pass' : 'warning',
    scoreImpact: structurePassed ? 12 : -8,
    message: structurePassed
      ? 'Bütün əsas ATS bölmələri (Təcrübə, Təhsil, Bacarıqlar) standart başlıqlarla mövcuddur.'
      : 'Bəzi əsas bölmələr (Təcrübə, Təhsil və ya Bacarıqlar) boşdur və ya zəif doldurulub.',
    details: `Təcrübə: ${hasExp ? 'Var' : 'Boş'}, Təhsil: ${hasEdu ? 'Var' : 'Boş'}, Bacarıqlar: ${hasSkills ? 'Tam' : 'Azdır'}`,
    howToFix: 'Təcrübə və Təhsil qeydlərini dəqiq tarixlər və vəzifə adları ilə tamamlayın.',
  });

  // Check 4: Measurable Metrics & Action Verbs in Experience
  let totalMetricsFound = 0;
  let totalActionVerbsFound = 0;

  const metricRegex = /\b(\d+%\b|\d+\s*faiz|\d+\+|\d+\s*min|\$\d+|\d+\s*AZN|\d+\s*nəfər|\d+\s*layihə|\d+\s*il)/gi;
  const actionVerbRegex = /\b(təşkil|yaratdım|həyata|idarə|artırdım|optimizasiya|tətbiq|rəhbərlik|təmin|qurdum|nail|hazırladım|inteqrasiya|inkişaf)\w*/gi;

  (cvData.experiences || []).forEach((exp) => {
    const desc = exp.description || '';
    const metricMatches = desc.match(metricRegex);
    if (metricMatches) totalMetricsFound += metricMatches.length;
    const actionMatches = desc.match(actionVerbRegex);
    if (actionMatches) totalActionVerbsFound += actionMatches.length;
  });

  const metricsPassed = totalMetricsFound >= 2;
  formattingChecks.push({
    id: 'measurable_metrics',
    title: 'Ölçülə Bilən Nailiyyətlər və Metrikalar (% / Rəqəmlər)',
    category: 'Nailiyyətlər',
    status: metricsPassed ? 'pass' : (totalMetricsFound === 1 ? 'warning' : 'fail'),
    scoreImpact: metricsPassed ? 12 : (totalMetricsFound === 1 ? 4 : -6),
    message: metricsPassed
      ? `İş təcrübənizdə ${totalMetricsFound} ədəd ölçülə bilən göstərici və rəqəm aşkar edildi.`
      : 'İş təcrübəsi sırf vəzifə siyahısı kimidir; rəqəmsal nəticələr (% artım, layihə sayı) çatışmır.',
    details: `Aşkar edilən metrikalar: ${totalMetricsFound}, Təsirli fellər: ${totalActionVerbsFound}`,
    howToFix: 'Öhdəlikləri "Prosesləri 25% sürətləndirdim" və ya "15+ layihəni vaxtında təhvil verdim" kimi rəqəmlərlə zənginləşdirin.',
  });

  // Check 5: Total Word Count & Page Length Optimization
  const wordCountPassed = totalWordCount >= 300 && totalWordCount <= 900;
  const wordCountWarning = (totalWordCount >= 200 && totalWordCount < 300) || (totalWordCount > 900 && totalWordCount <= 1300);

  formattingChecks.push({
    id: 'word_count',
    title: 'Ümumi CV Həcmi və Söz Sayı',
    category: 'Mətn Həcmi',
    status: wordCountPassed ? 'pass' : (wordCountWarning ? 'warning' : 'fail'),
    scoreImpact: wordCountPassed ? 10 : 0,
    message: wordCountPassed
      ? `Söz sayı idealdır (${totalWordCount} söz) — 1-2 səhifəlik ATS standartına tam uyğundur.`
      : totalWordCount < 200
      ? `CV həddən artıq qısadır (${totalWordCount} söz). ATS filtrində zəif məzmun kimi işarələnə bilər.`
      : `CV çox uzundur (${totalWordCount} söz). Məlumatları daha yığcam və bənd-bənd ifadə edin.`,
    details: `Cari söz sayı: ${totalWordCount} (Tövsiyə: 350 - 750 söz)`,
    howToFix: 'Əlavə təcrübə təfərrüatları və ya bacarıqlar əlavə edərək mətni 400+ söz həcminə çatdırın.',
  });

  // Check 6: Skills Categorization & Depth
  const skillsCount = (cvData.skills || []).length;
  const skillsPassed = skillsCount >= 6;
  const skillsWarning = skillsCount >= 3 && skillsCount < 6;

  formattingChecks.push({
    id: 'skills_depth',
    title: 'Bacarıqlar Siyahısının Dərinliyi',
    category: 'Struktur',
    status: skillsPassed ? 'pass' : (skillsWarning ? 'warning' : 'fail'),
    scoreImpact: skillsPassed ? 10 : -5,
    message: skillsPassed
      ? `${skillsCount} fərqli bacarıq qeyd olunub. Axtarış filtrlərində görünmə şansı yüksəkdir.`
      : `Bacarıqlar sayı azdır (${skillsCount} ədəd). Ən azı 6-8 texniki və fərdi bacarıq tövsiyə edilir.`,
    details: `Qeydə alınmış bacarıqlar: ${skillsCount}`,
    howToFix: 'Vakansiyada tələb olunan alət, proqram və metodologiyaları birbaşa bacarıqlar bölməsinə daxil edin.',
  });

  // Check 7: ATS Parser Compatibility & Special Characters
  const complexSpecialChars = fullCorpus.match(/[^\w\s\d.,!?;:()@+/%'"#\-_–—əıöğçşüƏIÖĞÇŞÜ]/g);
  const isCleanText = !complexSpecialChars || complexSpecialChars.length < 5;

  formattingChecks.push({
    id: 'parser_safety',
    title: 'ATS Parser Təhlükəsizliyi və Şrift Uyğunluğu',
    category: 'Oxunaqlıq',
    status: isCleanText ? 'pass' : 'warning',
    scoreImpact: isCleanText ? 8 : -4,
    message: isCleanText
      ? 'Mətn strukturu təmizdir, xüsusi oxunmaz simvollar yoxdur.'
      : 'CV-də qeyri-standart simvollar və ya emojilər var, ATS skanerini çaşdıra bilər.',
    details: `Xüsusi simvollar: ${complexSpecialChars?.length || 0} ədəd`,
    howToFix: 'Mürəkkəb cədvəllər və ya xüsusi qrafik qliflər yerinə sadə maddə işarələrindən (•) istifadə edin.',
  });

  // Check 8: Bullet Points Formatting
  const expWithBullets = (cvData.experiences || []).filter((e) => (e.description || '').includes('•') || (e.description || '').includes('\n'));
  const bulletsPassed = (cvData.experiences || []).length === 0 || expWithBullets.length >= (cvData.experiences || []).length * 0.7;

  formattingChecks.push({
    id: 'bullet_points',
    title: 'Maddəli Bəndlər (Bullet Points) Formatlaşdırması',
    category: 'Oxunaqlıq',
    status: bulletsPassed ? 'pass' : 'warning',
    scoreImpact: bulletsPassed ? 8 : -3,
    message: bulletsPassed
      ? 'Təcrübə bəndləri səliqəli paraqraflar və maddələrlə ayrılıb.'
      : 'Təcrübə təsviri vahid uzun blok mətn şəklindədir. Maddə-maddə bölüşdürmək oxunaqlığı 40% artırır.',
    details: `Maddəli təcrübələr: ${expWithBullets.length} / ${(cvData.experiences || []).length}`,
    howToFix: 'Hər bir iş öhdəliyini və nailiyyətini yeni sətirdən "•" simvolu ilə başlayaraq qeyd edin.',
  });

  const passedChecksCount = formattingChecks.filter((c) => c.status === 'pass').length;
  const totalChecksCount = formattingChecks.length;

  // 4. Calculate Final ATS Rank Score
  // Weighted: 50% Keyword Match Rate + 40% Formatting Suite + 10% Experience Depth
  const formattingScore = Math.round((passedChecksCount / totalChecksCount) * 100);
  const expBonus = Math.min((cvData.experiences?.length || 0) * 4, 15);
  
  let rawScore = Math.round((keywordMatchRate * 0.50) + (formattingScore * 0.40) + expBonus);
  rawScore = Math.min(Math.max(rawScore, 35), 98);

  const atsRankScore = rawScore;
  const potentialMaxScore = Math.min(rawScore + Math.round((100 - rawScore) * 0.75), 99);
  const potentialScoreBoost = potentialMaxScore - atsRankScore;

  let rankingTier: ATSOptimizationAnalysis['rankingTier'];
  if (atsRankScore >= 85) rankingTier = 'Top 5% (Müsahibə Şansı 90%+)';
  else if (atsRankScore >= 70) rankingTier = 'Top 15% (Rəqabətədavamlı)';
  else if (atsRankScore >= 50) rankingTier = 'Orta Səviyyə (50-70%)';
  else rankingTier = 'Diqqət Tələb Edir (<50%)';

  // 5. Generate high priority suggestions
  const highPrioritySuggestions: ATSOptimizationAnalysis['highPrioritySuggestions'] = [];

  // Missing keywords suggestion
  const missingKws = keywords.filter((k) => k.densityStatus === 'missing').slice(0, 5);
  if (missingKws.length > 0) {
    const kwNames = missingKws.map((k) => k.keyword).join(', ');
    highPrioritySuggestions.push({
      title: 'Çatışmayan Açar Sözləri Əlavə Edin',
      description: `"${vacancy ? vacancy.title : targetJobTitle}" vəzifəsi üçün kritik olan [${kwNames}] açar sözlərini CV-nizin Xülasə və ya Bacarıqlar bölməsinə daxil edin.`,
      scoreBoost: Math.min(missingKws.length * 4, 16),
      actionType: 'add_keyword',
      suggestedContent: kwNames,
    });
  }

  // Summary improvement suggestion
  if (!summaryPassed) {
    highPrioritySuggestions.push({
      title: 'Hədəfli Peşəkar Xülasə Yazın',
      description: `Xülasənizi "${targetJobTitle}" vəzifəsi üzrə əsas təcrübə və nəticələrinizi əks etdirəcək şəkildə 3-4 cümləlik güclü girişlə zənginləşdirin.`,
      scoreBoost: 10,
      actionType: 'enhance_summary',
      suggestedContent: `${targetJobTitle} sahəsində təcrübəyə malik nəticəyönümlü mütəxəssis. Müasir layihələrin icrası və proseslərin optimallaşdırılması üzrə ixtisaslaşmışam.`,
    });
  }

  // Metrics suggestion
  if (!metricsPassed) {
    highPrioritySuggestions.push({
      title: 'İş Təcrübəsinə Rəqəmlər və Faizlər (% Artım) Qatın',
      description: 'Vəzifə öhdəliklərini sırf proses kimi yox, ölçülə bilən nəticələr kimi qeyd edin (məs: "əməliyyatları 20% sürətləndirdim").',
      scoreBoost: 8,
      actionType: 'add_metrics',
      suggestedContent: '• Əsas layihələrin icrası nəticəsində komanda məhsuldarlığının 25% artırılması\n• 10+ mürəkkəb tapşırığın vaxtından əvvəl keyfiyyətlə tamamlanması',
    });
  }

  // 6. Generate Plain Text View (ATS Parser Representation)
  const atsPlainTextView = `
==================== ATS PARSED TEXT STREAM ====================
NAMİZƏD: ${(cvData.personalInfo.fullName || '').toUpperCase()}
HƏDƏF VƏZİFƏ: ${(cvData.personalInfo.jobTitle || targetJobTitle).toUpperCase()}
ƏLAQƏ: ${cvData.personalInfo.email || 'N/A'} | ${cvData.personalInfo.phone || 'N/A'} | ${cvData.personalInfo.address || 'N/A'}
LINKEDIN: ${cvData.personalInfo.linkedin || 'N/A'}

[SUMMARY / HAQQIMDA]
${summaryText || '(Boşdur)'}

[WORK EXPERIENCE / İŞ TƏCRÜBƏSİ]
${(cvData.experiences || []).map((e) => `• ${e.position} | ${e.company} | ${e.startDate} - ${e.current ? 'Hazırda' : e.endDate}\n  ${e.description}`).join('\n\n') || '(Təcrübə qeyd edilməyib)'}

[CORE SKILLS / ƏSAS BACARIQLAR]
${(cvData.skills || []).map((s) => `• ${s.name} (${s.level || 'Orta'})`).join('\n') || '(Bacarıq qeyd edilməyib)'}

[EDUCATION / TƏHSİL]
${(cvData.education || []).map((ed) => `• ${ed.degree} in ${ed.fieldOfStudy}, ${ed.institution} (${ed.startDate} - ${ed.endDate})`).join('\n') || '(Təhsil qeyd edilməyib)'}

[PROJECTS & ACHIEVEMENTS / LAYİHƏLƏR]
${(cvData.projects || []).map((p) => `• ${p.title}: ${p.description} [${(p.technologies || []).join(', ')}]`).join('\n') || '(Layihə yoxdur)'}

[CERTIFICATES / SERTİFİKATLAR]
${(cvData.certificates || []).map((c) => `• ${c.name} - ${c.issuer} (${c.issueDate})`).join('\n') || '(Sertifikat yoxdur)'}
================================================================
`.trim();

  return {
    targetJobTitle,
    targetCompany,
    totalWordCount,
    atsRankScore,
    potentialScoreBoost,
    potentialMaxScore,
    rankingTier,
    keywordMatchRate,
    matchedKeywordsCount,
    totalKeywordsCount,
    keywords,
    formattingChecks,
    passedChecksCount,
    totalChecksCount,
    highPrioritySuggestions,
    atsPlainTextView,
  };
}
