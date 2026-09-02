import React, { useState } from 'react';
import { JobiaLogo } from './JobiaLogo';
import { UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Briefcase, 
  Sparkles, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Heart, 
  CheckCircle, 
  MessageSquare,
  Building2,
  Lock,
  Zap,
  ArrowUpRight,
  Calculator,
  Palmtree,
  Compass,
  FileCheck,
  Scale,
  X,
  Phone,
  Mail,
  MapPin,
  Globe,
  Map as MapIcon,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

interface FooterProps {
  currentRole: UserRole;
  onNavigateCandidateTab?: (tab: 'jobs' | 'nearby-map' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'google-chat') => void;
  onRoleChange?: (role: UserRole) => void;
  onOpenPricing?: () => void;
  onOpenIntroTour?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentRole,
  onNavigateCandidateTab,
  onRoleChange,
  onOpenPricing,
  onOpenIntroTour,
}) => {
  const { dict, brandAcronym, brandAcronymFull, language } = useLanguage();
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'cookies' | 'security' | 'compliance' | null>(null);

  return (
    <footer id="jobia-main-footer" className="w-full max-w-full overflow-hidden bg-white border-t border-slate-200 mt-12 text-slate-700">
      {/* Slogan & Hero Banner in Footer */}
      <div className="bg-gradient-to-b from-slate-50 via-blue-50/25 to-white border-b border-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Prominent Large Brand Logo */}
          <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-slate-200/90 inline-flex flex-col items-center justify-center mb-3 hover:shadow-md transition-all duration-300">
            <JobiaLogo size="2xl" withSubtitle={true} subtitle="Job Intelligence & Automation" className="scale-95 sm:scale-105" />
          </div>

          {/* Acronym Brand Explanation Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-black tracking-wide mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Azərbaycanın Ən Ağıllı Vakansiya və Karyera Platforması</span>
          </div>

          {/* Primary Slogan */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {dict.brand.heroHeadline || 'Gələcəyin İş İmkanları və Süni İntellekt Dəstəkli İşə Qəbul'}
          </h2>

          {/* Subtitle with localized explanation */}
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {dict.brand.heroSubtitle || 'Jobia.az ilə minlərlə rəsmi vakansiyanı xəritədə tapın, AI ilə CV-nizi təhlil edin və iş təkliflərini birbaşa qəbul edin.'}
          </p>

          {/* Feature Trust Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              100% Pulsuz Müraciət
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              AI CV Generator & Analiz
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              Rəsmi İş Təklifləri Portalı
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              256-Bit SSL Şifrələnmə
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Structured Columns */}
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Jobia.az (About, Legal, Credentials) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <JobiaLogo size="sm" withSubtitle={true} subtitle="Job Intelligence & Automation" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Jobia.az — Azərbaycanın rəqəmsal əmək bazarında iş axtaranlar ilə aparıcı şirkətləri birləşdirən müasir platformadır.
            </p>
            <div className="pt-1 text-xs text-slate-600 font-medium space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Gündəlik Yenilənən Rəsmi Vakansiyalar</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {brandAcronymFull}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>VÖEN: <strong>1406283921</strong> (Dövlət Qeydiyyatı)</span>
              </div>
            </div>
            <div className="pt-2">
              <LanguageSwitcher variant="buttons" />
            </div>
          </div>

          {/* Col 2: İş Axtaranlar (For Candidates) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              İş Axtaranlar
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('jobs');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Vakansiyalar</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('nearby-map');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-semibold text-blue-600"
                >
                  <MapIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Xəritə ilə Axtarış</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('cv-builder');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>CV / Profil Yarat</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('cv-analyzer');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>AI CV Analizi & ATS Skoru</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('salary-trends');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  <span>Maaş İndeksi & Trendlər</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="footer-nav-salaria"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('calculia');
                  }}
                  className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-bold text-emerald-600"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Calculia (Net/Gross & Məzuniyyət)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: İşəgötürənlər (For Employers) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              İşəgötürənlər
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>İşəgötürən Kabineti</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-semibold text-blue-600"
                >
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Vakansiya Yerləşdir</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Şirkət Profili & Verifikasiya</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Rəsmi İş Təklifi (Job Offer) Portalı</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenPricing) onOpenPricing();
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Recruiting Analytics & Qiymətlər</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('admin');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-semibold text-slate-700"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin & Moderasiya Paneli</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Hüquqi & Əlaqə */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Hüquqi & Təhlükəsizlik
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('privacy')}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Məxfilik Siyasəti (Privacy Policy)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('terms')}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>İstifadəçi Müqaviləsi (Terms of Service)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('cookies')}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kuki (Cookie) Siyasəti</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('security')}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Təhlükəsizlik & SSL Standartları</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('compliance')}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-semibold text-slate-800"
                >
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  <span>AR Əmək Məcəlləsi Uyğunluğu</span>
                </button>
              </li>
              <li className="pt-2 text-slate-500 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <a href="mailto:support@jobia.az" className="hover:text-blue-600 font-medium">support@jobia.az</a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>+994 (12) 404-18-18</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Bakı, Azure Biznes Mərkəzi</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Slogan & Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800">Jobia.az</span>
            <span>—</span>
            <span>© 2026 Bütün hüquqlar qorunur.</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
            <span>{dict.brand.slogan || 'Azərbaycanın Ən Ağıllı Vakansiya və Karyera Platforması'}</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline ml-0.5" />
          </div>
        </div>
      </div>

      {/* Legal Info Modals */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <JobiaLogo size="sm" />
                <h3 className="font-bold text-slate-900 text-base">
                  {activeLegalModal === 'privacy' && 'Məxfilik Siyasəti (Privacy Policy)'}
                  {activeLegalModal === 'terms' && 'İstifadəçi Müqaviləsi və Şərtlər (Terms of Service)'}
                  {activeLegalModal === 'cookies' && 'Kuki (Cookie) Siyasəti və Tənzimləmələri'}
                  {activeLegalModal === 'security' && 'Təhlükəsizlik və Məlumatların Qorunması'}
                  {activeLegalModal === 'compliance' && 'AR Əmək Qanunvericiliyi və Hüquqi Uyğunluq'}
                </h3>
              </div>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              {activeLegalModal === 'privacy' && (
                <>
                  <p>
                    <strong>Jobia.az</strong> olaraq istifadəçilərimizin fərdi məlumatlarının məxfiliyinə və təhlükəsizliyinə xüsusi həssaslıqla yanaşırıq. Bu Məxfilik Siyasəti Azərbaycan Respublikasının "Fərdi məlumatlar haqqında" Qanununa və beynəlxalq standartlara tam uyğun hazırlanmışdır.
                  </p>
                  <h4 className="font-bold text-slate-800 text-xs">1. Toplanan Məlumatlar</h4>
                  <p>Qeydiyyat zamanı təqdim etdiyiniz ad, soyad, e-poçt, telefon nömrəsi, CV məlumatları və iş müraciətləri yalnız platformanın təyinatı üzrə istifadə olunur.</p>
                  <h4 className="font-bold text-slate-800 text-xs">2. Məlumatların Qorunması</h4>
                  <p>Bütün məlumatlar 256-Bit SSL şifrələnmə ilə qorunur və heç bir halda üçüncü şəxslərə kommersiya məqsədilə satılmır.</p>
                </>
              )}

              {activeLegalModal === 'terms' && (
                <>
                  <p>
                    Jobia.az platformasından istifadə etməklə siz aşağıdakı qaydaları və şərtləri qəbul etmiş olursunuz:
                  </p>
                  <h4 className="font-bold text-slate-800 text-xs">1. Xidmətin Təyinatı</h4>
                  <p>Jobia.az iş axtaranlar (namizədlər) və işəgötürənlər arasında etibarlı, sürətli və şəffaf əlaqə yaradan süni intellekt dəstəkli platformadır.</p>
                  <h4 className="font-bold text-slate-800 text-xs">2. Elan Yerləşdirmə Standartları</h4>
                  <p>Dərc edilən bütün vakansiyalar AR Əmək Məcəlləsinin ayrı-seçkiliyə yol verilməməsi (yaş, cins və s. məhdudiyyətlərin qadağan olunması) tələblərinə cavab verməlidir.</p>
                </>
              )}

              {activeLegalModal === 'cookies' && (
                <>
                  <p>
                    Platformamız sayt təcrübənizi yaxşılaşdırmaq, sessiyanızı yadda saxlamaq və analitik ölçmələr aparmaq üçün təhlükəsiz kukilərdən (cookies) istifadə edir.
                  </p>
                  <p>İstədiyiniz zaman brauzerinizin parametrlərindən kukiləri silə və ya məhdudlaşdıra bilərsiniz.</p>
                </>
              )}

              {activeLegalModal === 'security' && (
                <>
                  <p>
                    Jobia.az platformasında istifadəçi hesabları və məlumat bazası ən yüksək təhlükəsizlik protokolları ilə qorunur:
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                    <div>• <strong>256-bit TLS/SSL Şifrələmə:</strong> Bütün şəbəkə sorğuları təhlükəsiz kanal üzərindən ötürülür.</div>
                    <div>• <strong>E-poçt və Hesab Doğrulaması:</strong> Saxta profillərin qarşısını almaq üçün 6-rəqəmli OTP və e-poçt təsdiqi tətbiq olunur.</div>
                    <div>• <strong>Rol Əsaslı İcazələr (RBAC):</strong> Hər bir istifadəçi yalnız öz roluna aid funksiyalara daxil ola bilər.</div>
                  </div>
                </>
              )}

              {activeLegalModal === 'compliance' && (
                <>
                  <p>
                    <strong>Jobia.az</strong> fəaliyyətini Azərbaycan Respublikasının Məşğulluq Haqqında Qanununa və AR Əmək Məcəlləsinə tam uyğun olaraq həyata keçirir.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                    <div>• <strong>Hüquqi Şəxs:</strong> Jobia.az Rəqəmsal Karyera Platforması</div>
                    <div>• <strong>VÖEN:</strong> 1406283921</div>
                    <div>• <strong>Məkan:</strong> Bakı şəhəri, Azure Biznes Mərkəzi</div>
                    <div>• <strong>Əlaqə:</strong> support@jobia.az</div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Anladım və Bağla
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
