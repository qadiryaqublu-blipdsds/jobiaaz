import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  Sparkles, 
  Calculator, 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Zap, 
  Send, 
  MessageCircle, 
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ModalBottomLogo } from './ModalBottomLogo';
import { useLanguage } from '../context/LanguageContext';

interface IntroTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'jobs' | 'cv-builder' | 'cv-analyzer' | 'salary-trends' | 'calculia', role?: 'candidate' | 'business') => void;
}

export const IntroTourModal: React.FC<IntroTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!isOpen) return null;

  const tourSteps = [
    {
      id: 'welcome',
      icon: Compass,
      badgeColor: 'bg-blue-500 text-white',
      glowColor: 'from-blue-600 to-indigo-600',
      title: {
        az: 'Jobia & HireMe Platformasına Xoş Gəlmisiniz!',
        en: 'Welcome to Jobia & HireMe Platform!',
        ru: 'Добро пожаловать на платформу Jobia & HireMe!'
      },
      subtitle: {
        az: 'Azərbaycanın ən innovativ karyera və vakansiya ekosistemi',
        en: 'Azerbaijan\'s most innovative career and job ecosystem',
        ru: 'Самая инновационная карьерная экосистема Азербайджана'
      },
      description: {
        az: 'Platformamız namizədlərə arzuladıqları işi ən qısa zamanda tapmağa, süni intellekt dəstəkli CV hazırlamağa və birbaşa işəgötürənlərlə təhlükəsiz əlaqə qurmağa imkan verir.',
        en: 'Our platform enables candidates to quickly find dream jobs, craft AI-optimized resumes, and connect directly with top employers.',
        ru: 'Наша платформа помогает соискателям быстро находить работу мечты, создавать резюме с помощью ИИ и напрямую связываться с работодателями.'
      },
      highlights: [
        { az: 'Real-vaxt aktiv vakansiyalar', en: 'Real-time active vacancies', ru: 'Актуальные вакансии в реальном времени' },
        { az: '1 Kliklə sürətli müraciət & WhatsApp', en: '1-Click Quick Apply & WhatsApp', ru: 'Быстрый отклик в 1 клик и WhatsApp' },
        { az: 'Süni intellekt ilə CV hazırlığı & analizi', en: 'AI Resume Builder & ATS analysis', ru: 'Создание резюме и ATS-анализ с ИИ' },
      ],
      actionTab: 'jobs' as const,
      actionRole: 'candidate' as const,
      actionLabel: {
        az: 'Platformanı Kəşf Et',
        en: 'Explore Platform',
        ru: 'Исследовать платформу'
      }
    },
    {
      id: 'jobs-search',
      icon: Search,
      badgeColor: 'bg-emerald-500 text-white',
      glowColor: 'from-emerald-600 to-teal-600',
      title: {
        az: 'Ağıllı Vakansiya Axtarışı & 1 Kliklə Müraciət',
        en: 'Smart Job Search & 1-Click Application',
        ru: 'Умный поиск вакансий и отклик в 1 клик'
      },
      subtitle: {
        az: 'Şəhər, kateqoriya, maaş və rejim üzrə dəqiq filtrlər',
        en: 'Precise filters by city, category, salary, and work format',
        ru: 'Точные фильтры по городу, категории, зарплате и графику'
      },
      description: {
        az: 'Sizə uyğun olan ən son iş elanlarını saniyələr içində tapın. Hər vakansiya kartında maaş göstəriciləri, 1 Kliklə Müraciət, WhatsApp ilə birbaşa əlaqə və telefonla zəng imkanları mövcuddur.',
        en: 'Find the latest matching jobs in seconds. Every job card includes clear salary ranges, 1-Click Apply, direct WhatsApp reach, and call options.',
        ru: 'Находите подходящие вакансии за секунды. В каждой карточке указаны зарплата, быстрый отклик, связь через WhatsApp и звонок.'
      },
      highlights: [
        { az: 'Ağıllı AI axtarış və kateqoriyalar', en: 'Smart AI search & categories', ru: 'Умный поиск с ИИ и категории' },
        { az: 'Maaş gizlətməyən şəffaf elanlar', en: 'Transparent salary badges', ru: 'Прозрачные зарплатные вилки' },
        { az: 'Sevimlilərə əlavə etmə və müraciət izləmə', en: 'Bookmarks & application tracking', ru: 'Избранное и отслеживание статуса' },
      ],
      actionTab: 'jobs' as const,
      actionRole: 'candidate' as const,
      actionLabel: {
        az: 'Vakansiyaları Göstər',
        en: 'View Vacancies',
        ru: 'Посмотреть вакансии'
      }
    },
    {
      id: 'cv-builder',
      icon: FileText,
      badgeColor: 'bg-blue-600 text-white',
      glowColor: 'from-blue-600 to-cyan-600',
      title: {
        az: 'Peşəkar CV Hazırlayıcı (CV Builder)',
        en: 'Professional Resume Builder',
        ru: 'Профессиональный конструктор резюме'
      },
      subtitle: {
        az: 'Müasir şablonlar, avtomatik doldurma və PDF ixracı',
        en: 'Modern templates, auto-formatting, and instant PDF export',
        ru: 'Современные шаблоны, автозаполнение и экспорт в PDF'
      },
      description: {
        az: 'Təcrübənizi, təhsilinizi və bacarıqlarınızı addım-addım qeyd edərək beynəlxalq standartlara uyğun, gözoxşayan CV yaradın. İstənilən vaxt PDF formatında endirin.',
        en: 'Step-by-step guidance to list your experience, education, and skills. Generate internationally formatted, recruiter-ready resumes in PDF.',
        ru: 'Пошаговый ввод опыта, образования и навыков. Создавайте профессиональные резюме по международным стандартам и скачивайте PDF.'
      },
      highlights: [
        { az: 'Geniş şablon seçimi və real-vaxt önbaxış', en: 'Multiple templates & real-time preview', ru: 'Разнообразие шаблонов и предпросмотр' },
        { az: 'Tək kliklə yüksək keyfiyyətli PDF çıxarışı', en: '1-click high-res PDF export', ru: 'Скачивание PDF в один клик' },
        { az: 'Daimi saxlanma və istənilən vaxt redaktə', en: 'Persistent storage & easy editing', ru: 'Автосохранение и легкое редактирование' },
      ],
      actionTab: 'cv-builder' as const,
      actionRole: 'candidate' as const,
      actionLabel: {
        az: 'CV Hazırlayıcıya Keç',
        en: 'Go to CV Builder',
        ru: 'Перейти в конструктор CV'
      }
    },
    {
      id: 'ai-analyzer',
      icon: Sparkles,
      badgeColor: 'bg-amber-500 text-white',
      glowColor: 'from-amber-500 to-orange-500',
      title: {
        az: 'Süni İntellekt (AI) CV Analizatoru',
        en: 'AI Resume & ATS Analyzer',
        ru: 'Анализатор резюме на базе ИИ'
      },
      subtitle: {
        az: 'ATS uyğunluğu, güclü tərəflər və fərdi tövsiyələr',
        en: 'ATS compatibility score, strengths, and targeted improvement tips',
        ru: 'Оценка ATS, сильные стороны и персональные рекомендации'
      },
      description: {
        az: 'CV-nizi yükləyin və ya hazırladığınız profili seçin. Süni intellekt mühərrikimiz CV-nizi şirkətlərin tələblərinə uyğun təhlil edərək bal verir və vakansiyalar üzrə uyğunluğu artırmaq üçün dəqiq tövsiyələr təqdim edir.',
        en: 'Upload your CV or choose your builder profile. Our AI engine evaluates ATS score, points out weaknesses, and advises how to match target job roles.',
        ru: 'Загрузите резюме или выберите созданный профиль. Наш ИИ проверит его на соответствие ATS, выделит преимущества и подскажет точки роста.'
      },
      highlights: [
        { az: '100 ballıq ATS və uyğunluq balı', en: '100-point ATS & match score', ru: 'Оценка соответствия ATS из 100' },
        { az: 'Açar sözlər və çatışmayan bacarıqlar', en: 'Keywords & missing skill detection', ru: 'Поиск ключевых слов и недостающих навыков' },
        { az: 'Müsahibəyə çağırılma şansını artırma tövsiyələri', en: 'Tactical advice to boost interview call rates', ru: 'Советы для повышения шансов на интервью' },
      ],
      actionTab: 'cv-analyzer' as const,
      actionRole: 'candidate' as const,
      actionLabel: {
        az: 'AI Analizi Yoxla',
        en: 'Try AI Analyzer',
        ru: 'Попробовать AI Анализ'
      }
    },
    {
      id: 'calculia-salaria',
      icon: Calculator,
      badgeColor: 'bg-indigo-600 text-white',
      glowColor: 'from-indigo-600 to-purple-600',
      title: {
        az: 'Salaria & Vacatia – Maliyyə və Məzuniyyət Kalkulyatoru',
        en: 'Salaria & Vacatia – Salary & Vacation Calculators',
        ru: 'Salaria & Vacatia – Калькулятор зарплат и отпускных'
      },
      subtitle: {
        az: 'Gross/Net əməkhaqqı, vergilər və dəqiq məzuniyyət ödənişi',
        en: 'Gross/Net salary, deductions, and official vacation compensation',
        ru: 'Gross/Net зарплата, налоги и точный расчет отпускных'
      },
      description: {
        az: 'Azərbaycan Əmək Məcəlləsinə tam uyğun olaraq gəlir vergisi, DSMF, işsizlik və icbari tibbi sığorta tutulmalarını Gross-dan Net-ə və ya Net-dən Gross-a hesablayın. Həmçinin iş günlərinə görə məzuniyyət pulunuzu dərhal öyrənin.',
        en: 'Calculate tax, social insurance, and medical insurance deductions for oil/non-oil sectors accurately. Calculate your exact vacation allowance in seconds.',
        ru: 'Рассчитывайте налоги, пенсионные и страховые отчисления по законодательству Азербайджана, а также точные отпускные выплаты.'
      },
      highlights: [
        { az: 'Qeyri-neft/özəl və dövlət/neft sektoru rejimləri', en: 'Non-oil private & state/oil sector rules', ru: 'Ненефтяной частный и госсектор' },
        { az: 'Gross <-> Net ikitərəfli ani hesablama', en: 'Bi-directional Gross <-> Net conversion', ru: 'Двусторонний расчет Gross <-> Net' },
        { az: 'Məzuniyyət günləri və orta aylıq əməkhaqqı', en: 'Vacation days & average compensation', ru: 'Отпускные дни и средняя зарплата' },
      ],
      actionTab: 'calculia' as const,
      actionRole: 'candidate' as const,
      actionLabel: {
        az: 'Kalkulyatoru Aç',
        en: 'Open Calculator',
        ru: 'Открыть калькулятор'
      }
    },
    {
      id: 'business-employer',
      icon: Building2,
      badgeColor: 'bg-slate-900 text-white',
      glowColor: 'from-slate-800 to-slate-950',
      title: {
        az: 'İşəgötürənlər və Şirkətlər üçün Geniş İmkanlar',
        en: 'Comprehensive Suite for Employers & HR',
        ru: 'Возможности для работодателей и HR'
      },
      subtitle: {
        az: 'Elan yerləşdirmə, müraciətlərin idarəsi və rəsmi Job Offer',
        en: 'Post jobs, manage applicants, and generate official Job Offers',
        ru: 'Публикация вакансий, управление откликами и генерация офферов'
      },
      description: {
        az: 'Şirkətiniz üçün peşəkar vakansiyalar dərc edin, namizədlərin müraciətlərini qəbul edin, birbaşa platforma daxilində müsahibələr təyin edin və rəsmi iş təklifləri (Job Offer) göndərin.',
        en: 'Publish corporate vacancies, review applicant profiles, schedule interviews, and issue digital job offers with audit trails.',
        ru: 'Публикуйте вакансии компании, просматривайте отклики, назначайте интервью и отправляйте официальные офферы.'
      },
      highlights: [
        { az: 'Sürətli vakansiya yerləşdirmə və limitsiz elanlar', en: 'Instant job posting with rich templates', ru: 'Быстрая публикация вакансий' },
        { az: 'Namizədləri statuslar üzrə idarəetmə (ATS)', en: 'Candidate pipeline & status tracking', ru: 'Управление кандидатами по статусам' },
        { az: 'Rəsmi İş Təklifi (Job Offer) generatoru', en: 'Official Job Offer document generator', ru: 'Генератор официальных Job Offer документов' },
      ],
      actionTab: 'jobs' as const,
      actionRole: 'business' as const,
      actionLabel: {
        az: 'İşəgötürən Panelinə Bax',
        en: 'View Employer Hub',
        ru: 'Панель работодателя'
      }
    }
  ];

  const current = tourSteps[currentStep];
  const totalSteps = tourSteps.length;
  const StepIcon = current.icon;

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem('jobia_intro_tour_completed', 'true');
    }
    onClose();
  };

  const handleNavigateAndClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('jobia_intro_tour_completed', 'true');
    }
    if (onNavigateToTab) {
      onNavigateToTab(current.actionTab, current.actionRole);
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative transform transition-all">
        
        {/* Top Header Banner with Gradient Accent */}
        <div className={`p-6 sm:p-8 bg-gradient-to-r ${current.glowColor} text-white relative overflow-hidden`}>
          {/* Background Decorative Circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-xl pointer-events-none" />

          {/* Close Button */}
          <button
            id="btn-close-tour"
            onClick={handleFinish}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer z-10"
            title={language === 'en' ? 'Close tour' : language === 'ru' ? 'Закрыть' : 'Bələdçini bağla'}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step Badge & Icon */}
          <div className="flex items-center justify-between mb-4 relative z-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black tracking-wide uppercase">
                {language === 'en' 
                  ? `Step ${currentStep + 1} of ${totalSteps}` 
                  : language === 'ru' 
                  ? `Шаг ${currentStep + 1} из ${totalSteps}` 
                  : `Addım ${currentStep + 1} / ${totalSteps}`}
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-black/20 text-white/90 text-[11px] font-semibold">
                Jobia Guide
              </span>
            </div>

            {/* Quick Step Indicators */}
            <div className="flex items-center gap-1.5">
              {tourSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStep 
                      ? 'w-6 bg-white' 
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Addım ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Icon & Title */}
          <div className="flex items-start gap-4 relative z-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0 shadow-lg">
              <StepIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {current.title[language] || current.title.az}
              </h2>
              <p className="text-white/80 text-xs sm:text-sm font-medium mt-1">
                {current.subtitle[language] || current.subtitle.az}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-white">
          {/* Main Description */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {current.description[language] || current.description.az}
          </p>

          {/* Key Feature Highlights */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {language === 'en' ? 'Key Highlights' : language === 'ru' ? 'Главные преимущества' : 'Əsas Üstünlüklər'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {current.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {h[language] || h.az}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Jump directly to feature button */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleNavigateAndClose}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
            >
              <span>{current.actionLabel[language] || current.actionLabel.az}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Don't show again checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                {language === 'en' 
                  ? 'Don\'t show automatically' 
                  : language === 'ru' 
                  ? 'Не показывать автоматически' 
                  : 'Bir daha avtomatik açma'}
              </span>
            </label>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-transparent'
                : 'text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 cursor-pointer shadow-xs active:scale-98'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'en' ? 'Back' : language === 'ru' ? 'Назад' : 'Geri'}</span>
          </button>

          {/* Center Progress Text */}
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            {currentStep + 1} / {totalSteps}
          </span>

          {/* Next / Finish Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFinish}
              className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              {language === 'en' ? 'Skip' : language === 'ru' ? 'Пропустить' : 'Bələdçini Keç'}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
            >
              <span>
                {currentStep === totalSteps - 1
                  ? (language === 'en' ? 'Get Started' : language === 'ru' ? 'Начать' : 'İstifadəyə Başla')
                  : (language === 'en' ? 'Next' : language === 'ru' ? 'Далее' : 'Növbəti')}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic moving Jobia Logo at bottom */}
        <ModalBottomLogo
          tagline="Jobia.az İnteraktiv Platforma Bələdçisi"
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
