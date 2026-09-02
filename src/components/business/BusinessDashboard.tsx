import React, { useState, useRef, useEffect } from 'react';
import { Vacancy, Application, Company, ApplicationStatus, JobOffer, JobOfferTemplate, OfferAuditLog, User, UserRole } from '../../types';
import { CVRenderer } from '../cv-templates/CVRenderer';
import { downloadCVAsPDF, generateCVFileName } from '../../utils/pdfExport';
import { fileToDataUrl, generateSeedAvatar } from '../../utils/imageUpload';
import { JobOffersTable } from '../interview-offer/JobOffersTable';
import { InterviewModal } from '../interview-offer/InterviewModal';
import { JobOfferTemplatesModal } from '../interview-offer/JobOfferTemplatesModal';
import { OfferAuditLogModal } from '../interview-offer/OfferAuditLogModal';
import { RecruitingAnalyticsDashboard } from './analytics/RecruitingAnalyticsDashboard';
import { JobiaSectionFooter } from '../JobiaSectionFooter';
import { 
  Building2, 
  Plus, 
  Briefcase, 
  Users, 
  Sparkles, 
  ChevronRight, 
  Filter, 
  FileText, 
  X, 
  CheckCircle, 
  Download, 
  Loader2, 
  MessageSquare,
  Award,
  Send,
  Sliders,
  ShieldCheck,
  History,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Clock,
  LogIn,
  UserPlus,
  Edit3,
  Globe,
  Phone,
  Mail,
  MapPin,
  Save,
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
  Eye,
  AlertTriangle,
  Lock,
  Unlock,
  Check
} from 'lucide-react';

interface BusinessDashboardProps {
  currentUser?: User | null;
  companies: Company[];
  activeCompany: Company;
  setActiveCompany: (c: Company) => void;
  vacancies: Vacancy[];
  applications: Application[];
  offers: JobOffer[];
  auditLogs: OfferAuditLog[];
  templates: JobOfferTemplate[];
  onOpenPostJobModal: () => void;
  onOpenEditJobModal?: (job: Vacancy) => void;
  onUpdateApplicationStatus: (appId: string, status: ApplicationStatus, notes?: string) => void;
  onDeleteJob: (jobId: string) => void;
  onSaveOffer: (offer: JobOffer, log: OfferAuditLog) => void;
  onUpdateOfferStatus: (offerId: string, status: any, reason?: any, log?: OfferAuditLog) => void;
  onUpdateTemplates: (templates: JobOfferTemplate[]) => void;
  onUpdateCompany: (company: Company) => void;
  onOpenCandidatePortal: (offer: JobOffer) => void;
  onShareToGoogleChat?: (applicant: Application) => void;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: UserRole) => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  currentUser,
  companies,
  activeCompany,
  setActiveCompany,
  vacancies,
  applications,
  offers,
  auditLogs,
  templates,
  onOpenPostJobModal,
  onOpenEditJobModal,
  onUpdateApplicationStatus,
  onDeleteJob,
  onSaveOffer,
  onUpdateOfferStatus,
  onUpdateTemplates,
  onUpdateCompany,
  onOpenCandidatePortal,
  onShareToGoogleChat,
  onOpenAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<'vacancies' | 'applicants' | 'offers' | 'analytics' | 'templates' | 'company-profile'>('vacancies');
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Vacancy | null>(null);
  const [filterVacancyId, setFilterVacancyId] = useState<string>('all');
  const [recruiterNotesInput, setRecruiterNotesInput] = useState('');
  const [selectedNewStatus, setSelectedNewStatus] = useState<ApplicationStatus>('Baxıldı');
  const [isDownloadingApplicantPDF, setIsDownloadingApplicantPDF] = useState(false);

  // Workflow Modals
  const [activeInterviewApp, setActiveInterviewApp] = useState<Application | null>(null);
  const [editingOffer, setEditingOffer] = useState<JobOffer | undefined>(undefined);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [selectedAuditLogOffer, setSelectedAuditLogOffer] = useState<{ id: string; name: string } | null>(null);

  // Editable company form state
  const [editedCompany, setEditedCompany] = useState<Company>(activeCompany);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companySaveSuccess, setCompanySaveSuccess] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Keep editedCompany in sync when activeCompany changes
  useEffect(() => {
    setEditedCompany(activeCompany);
  }, [activeCompany]);

  // Handle local company logo file upload
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const dataUrl = await fileToDataUrl(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.9,
        maxFileSizeMB: 5,
      });
      setEditedCompany((prev) => ({ ...prev, logo: dataUrl }));
    } catch (err: any) {
      alert(err.message || 'Loqo yüklənərkən xəta baş verdi.');
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  // Generate seed logo
  const handleGenerateCompanyLogo = () => {
    const seed = editedCompany.name.trim() || 'Company';
    const logoUrl = generateSeedAvatar(seed, 'initials');
    setEditedCompany((prev) => ({ ...prev, logo: logoUrl }));
  };

  // Remove company logo
  const handleRemoveCompanyLogo = () => {
    setEditedCompany((prev) => ({ ...prev, logo: '' }));
  };

  // Company specific data (Strictly includes all vacancies created by this user/company regardless of moderation status)
  const companyJobs = vacancies.filter((v) => 
    v.companyId === activeCompany.id || 
    (currentUser && v.createdBy === currentUser.id) ||
    (currentUser?.email && v.createdBy === currentUser.email) ||
    (currentUser?.companyId && v.companyId === currentUser.companyId) ||
    (v.companyName && activeCompany.name && v.companyName.toLowerCase().trim() === activeCompany.name.toLowerCase().trim()) ||
    (v.companyName && currentUser?.companyName && v.companyName.toLowerCase().trim() === currentUser.companyName.toLowerCase().trim())
  );

  const companyApplications = applications.filter((a) => 
    a.companyId === activeCompany.id || 
    (a.companyName && activeCompany.name && a.companyName.toLowerCase().trim() === activeCompany.name.toLowerCase().trim()) ||
    companyJobs.some((j) => j.id === a.vacancyId || j.id === a.jobId || (j.title === a.vacancyTitle && j.companyName === a.companyName))
  );

  const companyOffers = offers.filter((o) => 
    o.companyId === activeCompany.id || 
    (o.companyName && activeCompany.name && o.companyName.toLowerCase().trim() === activeCompany.name.toLowerCase().trim())
  );
  const companyLogs = auditLogs.filter((l) => companyOffers.some((o) => o.id === l.offerId));

  // Filtered applicants
  const filteredApplicants = companyApplications.filter((a) => {
    if (filterVacancyId !== 'all' && a.vacancyId !== filterVacancyId) return false;
    return true;
  });

  const handleOpenApplicantModal = (app: Application) => {
    setSelectedApplicant(app);
    setSelectedNewStatus(app.status);
    setRecruiterNotesInput(app.recruiterNotes || '');
  };

  const handleSaveApplicantStatus = () => {
    if (selectedApplicant) {
      onUpdateApplicationStatus(selectedApplicant.id, selectedNewStatus, recruiterNotesInput);
      setSelectedApplicant((prev) =>
        prev ? { ...prev, status: selectedNewStatus, recruiterNotes: recruiterNotesInput } : null
      );
    }
  };

  const handleStartInterviewWorkflow = (app: Application, existingOffer?: JobOffer) => {
    setActiveInterviewApp(app);
    setEditingOffer(existingOffer);
  };

  const handleToggleApprovalSetting = (enabled: boolean) => {
    const updated = { ...activeCompany, requireOfferApproval: enabled };
    setActiveCompany(updated);
    onUpdateCompany(updated);
  };

  const handleSaveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    try {
      setActiveCompany(editedCompany);
      onUpdateCompany(editedCompany);
      setCompanySaveSuccess(true);
      setTimeout(() => setCompanySaveSuccess(false), 3000);
    } finally {
      setIsSavingCompany(false);
    }
  };

  /* ========================================================================= */
  /* 1. GATE VIEW: WHEN NOT LOGGED IN AS EMPLOYER (ZERO MOCK COMPANIES)       */
  /* ========================================================================= */
  if (!currentUser || currentUser.role !== 'business') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6 sm:py-10 animate-fade-in">
        {/* Hero Gate Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-blue-100">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              İşəgötürən Şəxsi Kabineti
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Müəssisəniz adına rəsmi vakansiyalar yerləşdirmək, daxil olan müraciətləri izləmək və rəsmi elektron iş təklifləri (Job Offer) təqdim etmək üçün daxil olun və ya müəssisənizi qeydiyyatdan keçirin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="business-gate-login-btn"
              onClick={() => onOpenAuthModal?.('login', 'business')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>İşəgötürən Kimi Daxil Ol</span>
            </button>

            <button
              id="business-gate-register-btn"
              onClick={() => onOpenAuthModal?.('register', 'business')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-300" />
              <span>Yeni Müəssisə Qeydiyyatı</span>
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Vakansiyaların İdarə Edilməsi</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Müəssisənizin adına vakansiyalar yaradın, əməkhaqqı aralığını təyin edin və dərhal dərc edərək namizədlər üçün əlçatan edin.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Namizəd Müraciətləri & CV-lər</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vakansiyalarınıza müraciət edən namizədlərin tam formatlı CV sənədlərini incələyin, PDF olaraq yükləyin və statuslarını yeniləyin.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Rəsmi Elektron İş Təklifləri (Job Offer)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Namizədlərə elektron təsdiqlənən rəsmi iş təklifləri göndərin, şablonlar yaradın və qəbul/imtina cavablarını canlı izləyin.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Real-Vaxt İR Analitikası</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Müraciət sayı, müsahibə konversiyası, baxış statistikası və büdcə analizlərini vahid analitika panelində izləyin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 2. AUTHENTICATED EMPLOYER DASHBOARD (REAL USER COMPANY & REAL VACANCIES)   */
  /* ========================================================================= */
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Company Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <img
            src={activeCompany.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeCompany.name)}`}
            alt={activeCompany.name}
            className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-white shrink-0 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{activeCompany.name}</h1>
              {activeCompany.verified ? (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Təsdiqlənmiş Müəssisə</span>
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Moderasiyada
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {activeCompany.industry || 'Müəssisə'} • {activeCompany.location || 'Bakı, Azərbaycan'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
              {activeCompany.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {activeCompany.email}
                </span>
              )}
              {activeCompany.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {activeCompany.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('company-profile')}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Müəssisə Məlumatları</span>
          </button>

          <button
            onClick={onOpenPostJobModal}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Vakansiya Elan Et</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Aktiv Elanlar</span>
            <h3 className="text-xl font-bold text-slate-900">{companyJobs.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Gələn Müraciətlər</span>
            <h3 className="text-xl font-bold text-slate-900">{companyApplications.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Müsahibə Mərhələsi</span>
            <h3 className="text-xl font-bold text-slate-900">
              {companyApplications.filter((a) => a.status === 'Müsahibəyə dəvət' || a.status === 'Baxıldı').length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Verilən İş Təklifləri</span>
            <h3 className="text-xl font-bold text-emerald-700">{companyOffers.length}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs font-medium w-full sm:w-auto overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('vacancies')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'vacancies' ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Vakansiyalarım ({companyJobs.length})
        </button>

        <button
          onClick={() => setActiveTab('applicants')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'applicants' ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Gələn Müraciətlər ({companyApplications.length})
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'offers' ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900 font-semibold'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Müsahibə & Təkliflər ({companyOffers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 font-bold'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Recruiting Analytics</span>
        </button>

        <button
          onClick={() => setIsTemplatesModalOpen(true)}
          className="px-3 py-1.5 rounded-md whitespace-nowrap transition-colors text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Offer Şablonları</span>
        </button>

        <button
          onClick={() => setActiveTab('company-profile')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'company-profile' ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Müəssisə Profili
        </button>
      </div>

      {/* TAB 1: Company Vacancies */}
      {activeTab === 'vacancies' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Vakansiyalarınızın İdarə Edilməsi ({companyJobs.length})</h3>
              <p className="text-xs text-slate-500">
                Paylaşdığınız bütün aktiv, gözləmədə və tamamlanmış vakansiyaların statusu və 1 dəfəlik redaktə hüququ.
              </p>
            </div>
            <button
              onClick={onOpenPostJobModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Vakansiya Yerləşdir</span>
            </button>
          </div>

          {companyJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Müəssisənizin aktiv vakansiyası yoxdur</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                İlk vakansiyanızı yerləşdirərək ixtisaslı namizədlərdən müraciətlər qəbul etməyə başlayın.
              </p>
              <button
                onClick={onOpenPostJobModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                İlk Vakansiyanı Yerləşdir
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyJobs.map((job) => {
                const jobApplicants = applications.filter((a) => a.vacancyId === job.id || a.jobId === job.id);
                const isApproved = job.isApproved !== false && job.status === 'published';
                const isPending = job.isApproved === false || job.status === 'pending_review';
                const isRejected = job.status === 'rejected';
                const editCount = job.editCount || 0;
                const canEdit = editCount < (job.maxEditsAllowed || 1);

                return (
                  <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {job.category}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {job.city}
                          </span>
                        </div>

                        {/* Moderation Status Badge */}
                        {isApproved && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Təsdiqlənib (Yayımdadır)</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>Admin Təsdiqi Gözləyir</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 shrink-0">
                            <X className="w-3 h-3 text-red-600" />
                            <span>İmtina Edilib</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-blue-700 font-black">
                            {job.hideSalary
                              ? 'Maaş gizli (Razılaşma ilə)'
                              : `${job.minSalary || 0} - ${job.maxSalary || 0} ${job.currency || 'AZN'}`}
                          </p>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 font-medium">{job.employmentType}</span>
                        </div>
                      </div>

                      {/* 1-Time Edit Permission & Status Box */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {canEdit ? (
                            <span className="text-blue-700 font-bold flex items-center gap-1">
                              <Unlock className="w-3.5 h-3.5 text-blue-600" />
                              <span>1 Dəfəlik Redaktə Hüququ Var ({editCount}/1)</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 font-semibold flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Redaktə Limiti Dolub (1/1 istifadə olunub)</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {job.postedDate ? `Paylaşılıb: ${job.postedDate}` : ''}
                        </span>
                      </div>

                      {/* Moderation Info Notice for Pending Jobs */}
                      {isPending && (
                        <div className="p-2 bg-amber-50/80 rounded-lg border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>Bu vakansiya admin təsdiqindən sonra ümumi vakansiyalar bölməsində yayımlanacaq.</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Son müraciət: <strong className="text-slate-700">{job.deadline}</strong></span>
                        <span className="font-bold text-blue-700">{jobApplicants.length} Namizəd müraciəti</span>
                      </div>

                      {/* Action buttons toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedJobForDetail(job)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Vakansiyanın tam məlumatlarını görüntülə"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>Tam Baxış</span>
                          </button>

                          <button
                            onClick={() => {
                              if (canEdit && onOpenEditJobModal) {
                                onOpenEditJobModal(job);
                              } else {
                                alert('Bu vakansiya üzrə 1 dəfəlik redaktə hüququnuzdan artıq istifadə etmisiniz (1/1 limit dolub). Əlavə dəyişiklik üçün platforma admini ilə əlaqə saxlayın.');
                              }
                            }}
                            disabled={!canEdit}
                            className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                              canEdit
                                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                            }`}
                            title={canEdit ? 'Vakansiyanı redaktə et (1 dəfəlik hüquq)' : 'Redaktə hüququ istifadə edilib (1/1)'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{canEdit ? 'Redaktə Et' : 'Redaktə Edilib (1/1)'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setFilterVacancyId(job.id);
                              setActiveTab('applicants');
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Müraciətlər ({jobApplicants.length})</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`"${job.title}" vakansiyasını həmişəlik silmək istədiyinizdən əminsiniz?`)) {
                                onDeleteJob(job.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Vakansiyanı Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Applicants list & screening */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* Filter by job */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700">Vakansiya üzrə filtrlə:</span>
              <select
                value={filterVacancyId}
                onChange={(e) => setFilterVacancyId(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-md outline-none font-medium"
              >
                <option value="all">Bütün Vakansiyalar ({companyApplications.length})</option>
                {companyJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-500 font-medium">
              Cəmi: <span className="font-bold text-slate-900">{filteredApplicants.length}</span> namizəd
            </span>
          </div>

          {filteredApplicants.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs shadow-sm">
              Seçilmiş vakansiya üzrə müraciət tapılmadı.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplicants.map((app) => {
                const existingAppOffer = companyOffers.find((o) => o.applicationId === app.id || o.candidateEmail === app.candidateEmail);

                return (
                  <div
                    key={app.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div
                      onClick={() => handleOpenApplicantModal(app)}
                      className="space-y-1 cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{app.candidateName}</h3>
                        {app.matchScore && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            <span>{app.matchScore}% Uyğunluq</span>
                          </span>
                        )}
                        {existingAppOffer && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Offer: {existingAppOffer.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-blue-700 font-semibold">{app.vacancyTitle}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>{app.candidateEmail}</span>
                        <span>•</span>
                        <span>{app.candidatePhone}</span>
                        <span>•</span>
                        <span>Müraciət: {app.appliedDate}</span>
                      </div>

                      {app.coverNote && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md mt-2 line-clamp-1 italic">
                          "{app.coverNote}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* One-Click Interview & Offer trigger */}
                      <button
                        onClick={() => handleStartInterviewWorkflow(app, existingAppOffer)}
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                        <span>Müsahibə & Offer</span>
                      </button>

                      <button
                        onClick={() => handleOpenApplicantModal(app)}
                        className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>İncələ</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Job Offers & Acceptance Process */}
      {activeTab === 'offers' && (
        <JobOffersTable
          offers={companyOffers}
          auditLogs={companyLogs}
          onOpenAuditLog={(offerId, candidateName) => setSelectedAuditLogOffer({ id: offerId, name: candidateName })}
          onResendOffer={(offer) => {
            const app: Application = {
              id: offer.applicationId || `app-${offer.id}`,
              vacancyId: '',
              vacancyTitle: offer.position,
              companyId: offer.companyId,
              companyName: offer.companyName,
              companyLogo: offer.companyLogo,
              candidateName: offer.candidateName,
              candidateEmail: offer.candidateEmail,
              candidatePhone: offer.candidatePhone,
              appliedDate: offer.createdAt.split('T')[0],
              status: 'Təklif verildi',
              cvData: {} as any,
            };
            handleStartInterviewWorkflow(app, offer);
          }}
          onOpenOfferWorkflow={(offer) => {
            const app: Application = {
              id: offer.applicationId || `app-${offer.id}`,
              vacancyId: '',
              vacancyTitle: offer.position,
              companyId: offer.companyId,
              companyName: offer.companyName,
              companyLogo: offer.companyLogo,
              candidateName: offer.candidateName,
              candidateEmail: offer.candidateEmail,
              candidatePhone: offer.candidatePhone,
              appliedDate: offer.createdAt.split('T')[0],
              status: 'Təklif verildi',
              cvData: {} as any,
            };
            handleStartInterviewWorkflow(app, offer);
          }}
          onOpenCandidatePortal={onOpenCandidatePortal}
        />
      )}

      {/* TAB 4: Company Profile & Settings */}
      {activeTab === 'company-profile' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Müəssisə Profili və HR Tənzimləmələri</h3>
              <p className="text-slate-500 mt-0.5 text-xs">
                Müəssisənizin rəsmi məlumatlarını, HR əlaqələrini və iş təklifi qaydalarını tənzimləyin.
              </p>
            </div>
            {companySaveSuccess && (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Yadda saxlanıldı</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCompanyProfile} className="space-y-5">
            {/* Offer Approval toggle */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-slate-900 text-xs">
                    İş Təklifləri Göndərilməzdən Əvvəl Rəhbərlik Təsdiqi Tələb Olunsun
                  </h4>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Aktiv olduqda, HR əməkdaşının hazırladığı iş təklifi (Job Offer) birbaşa namizədə göndərilmir, əvvəlcə rəhbər tərəfindən təsdiq (Approval) gözləyir.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={editedCompany.requireOfferApproval || false}
                  onChange={(e) => setEditedCompany({ ...editedCompany, requireOfferApproval: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Company Logo Upload & Preview Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Şirkət Loqosu / Profil Şəkli</span>
                </label>
                {editedCompany.logo && (
                  <button
                    type="button"
                    onClick={handleRemoveCompanyLogo}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Loqonu Sil</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Logo Preview */}
                <div className="relative shrink-0">
                  {editedCompany.logo ? (
                    <img
                      src={editedCompany.logo}
                      alt={editedCompany.name || 'Şirkət Loqosu'}
                      className="w-18 h-18 rounded-2xl object-cover border-2 border-slate-300 shadow-2xs bg-white p-1"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-18 h-18 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6 stroke-1" />
                      <span className="text-[9px] font-semibold mt-0.5">Loqo yoxdur</span>
                    </div>
                  )}
                </div>

                {/* Upload Actions */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                      id="company-logo-file-input"
                    />
                    <button
                      type="button"
                      disabled={isUploadingLogo}
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {isUploadingLogo ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isUploadingLogo ? 'Yüklənir...' : 'Kompüterdən Loqo Yüklə'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateCompanyLogo}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Avtomatik Loqo Yarat</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">və ya URL:</span>
                    <input
                      type="url"
                      value={editedCompany.logo || ''}
                      onChange={(e) => setEditedCompany({ ...editedCompany, logo: e.target.value })}
                      placeholder="https://example.com/company-logo.png"
                      className="flex-1 p-1.5 text-[11px] rounded-md border border-slate-200 bg-white focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Müəssisə Adı *</label>
                <input
                  type="text"
                  required
                  value={editedCompany.name}
                  onChange={(e) => setEditedCompany({ ...editedCompany, name: e.target.value })}
                  placeholder="Məs: Paşa Holdinq"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fəaliyyət Sahəsi *</label>
                <input
                  type="text"
                  required
                  value={editedCompany.industry}
                  onChange={(e) => setEditedCompany({ ...editedCompany, industry: e.target.value })}
                  placeholder="Məs: İT və Telekommunikasiya"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ünvan / Şəhər *</label>
                <input
                  type="text"
                  required
                  value={editedCompany.location}
                  onChange={(e) => setEditedCompany({ ...editedCompany, location: e.target.value })}
                  placeholder="Məs: Bakı, Nizami küç. 45"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">İşçi Sayı</label>
                <input
                  type="text"
                  value={editedCompany.employeeCount || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, employeeCount: e.target.value })}
                  placeholder="Məs: 50-250 nəfər"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rəsmi E-poçt</label>
                <input
                  type="email"
                  value={editedCompany.email || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, email: e.target.value })}
                  placeholder="hr@company.az"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Əlaqə Telefonu</label>
                <input
                  type="tel"
                  value={editedCompany.phone || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, phone: e.target.value })}
                  placeholder="+994 50 123 45 67"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">HR Əlaqədar Şəxs</label>
                <input
                  type="text"
                  value={editedCompany.hrContactName || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, hrContactName: e.target.value })}
                  placeholder="Ad və Soyad"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">HR Vəzifəsi</label>
                <input
                  type="text"
                  value={editedCompany.hrContactPosition || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, hrContactPosition: e.target.value })}
                  placeholder="Məs: Baş İR Meneceri"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Müəssisə Haqqında Təsvir</label>
              <textarea
                rows={3}
                value={editedCompany.description || ''}
                onChange={(e) => setEditedCompany({ ...editedCompany, description: e.target.value })}
                placeholder="Müəssisənizin fəaliyyət istiqaməti və missiyası haqqında qısa məlumat..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg resize-none text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingCompany}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSavingCompany ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSavingCompany ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Yadda Saxla'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: RECRUITING ANALYTICS */}
      {activeTab === 'analytics' && (
        <RecruitingAnalyticsDashboard
          company={activeCompany}
          vacancies={companyJobs}
          applications={companyApplications}
          offers={companyOffers}
        />
      )}

      {/* Dynamic Animated Section Footer with Job Intelligence & Automation */}
      <JobiaSectionFooter 
        extraTagline="İşəgötürənlər üçün rəqəmsal namizəd idarəetməsi, 7-pilləli AI müsahibə və iş təklifi ekosistemi"
        showBackToTop={true}
      />

      {/* Candidate CV & Review Drawer/Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Müraciət İncələməsi: {selectedApplicant.vacancyTitle}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedApplicant.candidateName}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{selectedApplicant.candidateEmail}</span>
                  <span>•</span>
                  <span>{selectedApplicant.candidatePhone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Fast Track to AI Interview & Offer Modal */}
                <button
                  onClick={() => {
                    const existingAppOffer = companyOffers.find((o) => o.applicationId === selectedApplicant.id || o.candidateEmail === selectedApplicant.candidateEmail);
                    handleStartInterviewWorkflow(selectedApplicant, existingAppOffer);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Müsahibə & Təklif Workflow</span>
                </button>

                {onShareToGoogleChat && (
                  <button
                    id="btn-business-share-applicant-chat"
                    onClick={() => onShareToGoogleChat(selectedApplicant)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    title="Bu namizədi Google Chat komanda otağında paylaşın"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Google Chat</span>
                  </button>
                )}

                <button
                  id="btn-business-download-applicant-pdf"
                  onClick={async () => {
                    if (isDownloadingApplicantPDF) return;
                    setIsDownloadingApplicantPDF(true);
                    try {
                      const fileName = generateCVFileName(selectedApplicant.cvData);
                      await downloadCVAsPDF('applicant-cv-export', { fileName });
                    } catch (err) {
                      console.error('PDF export error:', err);
                      window.print();
                    } finally {
                      setIsDownloadingApplicantPDF(false);
                    }
                  }}
                  disabled={isDownloadingApplicantPDF}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                  title="Namizədin CV-sini PDF olaraq kompüterə yükləyin"
                >
                  {isDownloadingApplicantPDF ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloadingApplicantPDF ? 'Yüklənir...' : 'CV PDF'}</span>
                </button>

                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content: Recruiter Action Bar + CV Renderer */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Recruiter Status Updater Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Namizədin Statusu:</span>
                    <select
                      value={selectedNewStatus}
                      onChange={(e) => setSelectedNewStatus(e.target.value as ApplicationStatus)}
                      className="p-2 rounded-lg bg-white border border-slate-300 font-semibold text-slate-900 outline-none"
                    >
                      <option value="Müraciət edildi">Müraciət edildi</option>
                      <option value="Baxıldı">Baxıldı</option>
                      <option value="Müsahibəyə dəvət">Müsahibəyə dəvət</option>
                      <option value="Təklif verildi">Təklif verildi</option>
                      <option value="Qəbul edildi">Qəbul edildi</option>
                      <option value="İmtina edildi">İmtina edildi</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveApplicantStatus}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm cursor-pointer transition-colors"
                  >
                    Statusu və Qeydi Yadda Saxla
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    İşəgötürən Qeydi / Namizədə Feedback (Namizəd də görəcək)
                  </label>
                  <textarea
                    rows={2}
                    value={recruiterNotesInput}
                    onChange={(e) => setRecruiterNotesInput(e.target.value)}
                    placeholder="Məsələn: 28 Avqust saat 15:00-da texniki müsahibəyə dəvət olunursunuz..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none resize-none"
                  />
                </div>
              </div>

              {/* Cover Note if provided */}
              {selectedApplicant.coverNote && (
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Namizədin Müşayiət Məktubu:</span>
                  <p className="text-slate-700 italic leading-relaxed">"{selectedApplicant.coverNote}"</p>
                </div>
              )}

              {/* Uploaded CV file if applicant attached a file (PDF/Word/DOCX) */}
              {selectedApplicant.cvFileData && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-lg shrink-0 shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        {selectedApplicant.isGuestApplication ? 'Qeydiyyatsız Namizədin Yüklədiyi CV Faylı' : 'Qoşulmuş Orijinal CV Sənədi'}
                      </span>
                      <h4 className="font-bold text-emerald-950 text-xs sm:text-sm mt-1">
                        {selectedApplicant.cvFileName || 'Namizəd_CV.pdf'}
                      </h4>
                    </div>
                  </div>

                  <a
                    href={selectedApplicant.cvFileData}
                    download={selectedApplicant.cvFileName || `${selectedApplicant.candidateName}_CV.pdf`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Faylı Yüklə / Aç</span>
                  </a>
                </div>
              )}

              {/* Rendered CV */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Namizədin Rəsmi CV Sənədi</span>
                </div>
                <CVRenderer id="applicant-cv-export" data={selectedApplicant.cvData} template="modern-emerald" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7-Step AI Interview & Job Offer Workflow Modal */}
      {activeInterviewApp && (
        <InterviewModal
          application={activeInterviewApp}
          company={activeCompany}
          existingOffer={editingOffer}
          onClose={() => {
            setActiveInterviewApp(null);
            setEditingOffer(undefined);
          }}
          onSaveOffer={(savedOffer, log) => {
            onSaveOffer(savedOffer, log);
          }}
          onUpdateAppStatus={(appId, status, notes) => {
            onUpdateApplicationStatus(appId, status, notes);
          }}
        />
      )}

      {/* Templates Management Modal */}
      {isTemplatesModalOpen && (
        <JobOfferTemplatesModal
          templates={templates}
          onUpdateTemplates={onUpdateTemplates}
          onClose={() => setIsTemplatesModalOpen(false)}
        />
      )}

      {/* Full Vacancy Details Modal for Employer */}
      {selectedJobForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {selectedJobForDetail.category}
                  </span>
                  {selectedJobForDetail.isApproved !== false && selectedJobForDetail.status === 'published' ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Təsdiqlənib & Yayımdadır</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span>Admin Təsdiqi Gözləyir</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">{selectedJobForDetail.title}</h2>
                <p className="text-xs text-slate-500 font-medium">{activeCompany.name} • {selectedJobForDetail.city}</p>
              </div>

              <button
                onClick={() => setSelectedJobForDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 divide-y divide-slate-100">
              {/* Moderation & Edit Limit Status Banner */}
              <div className="space-y-2 pt-0">
                {selectedJobForDetail.isApproved === false || selectedJobForDetail.status === 'pending_review' ? (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-amber-950">Moderasiya Məlumatı:</strong>
                      <span className="text-[11px] leading-relaxed">
                        Bu vakansiya hal-hazırda admin təsdiqindədir. Admin təsdiq edən kimi platformanın ümumi "Vakansiyalar" bölməsində bütün namizədlərə görünəcək.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-emerald-950">Vakansiya Aktivdir:</strong>
                      <span className="text-[11px] leading-relaxed">
                        Vakansiya admin tərəfindən təsdiqlənib və namizədlər müraciət edə bilir.
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(selectedJobForDetail.editCount || 0) < (selectedJobForDetail.maxEditsAllowed || 1) ? (
                      <>
                        <Unlock className="w-4 h-4 text-blue-600" />
                        <div>
                          <strong className="block text-xs font-bold text-slate-900">1 Dəfəlik Redaktə Hüququ: Mövcuddur</strong>
                          <span className="text-[11px] text-slate-500">Siz bu vakansiyanı hələ redaktə etməmisiniz (0/1 istifadə edilib).</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-500" />
                        <div>
                          <strong className="block text-xs font-bold text-slate-900">1 Dəfəlik Redaktə Hüququ: İstifadə Olunub</strong>
                          <span className="text-[11px] text-slate-500">Maksimum 1 redaktə limiti dolmuşdur (1/1 istifadə edilib).</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Overview Grid */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Maaş Təklifi</span>
                  <span className="text-sm font-black text-blue-700 mt-0.5 block">
                    {selectedJobForDetail.hideSalary
                      ? 'Razılaşma ilə'
                      : `${selectedJobForDetail.minSalary || 0} - ${selectedJobForDetail.maxSalary || 0} ${selectedJobForDetail.currency || 'AZN'}`}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">İş Qrafiki</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">{selectedJobForDetail.employmentType || 'Tam ştat'}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Təcrübə Səviyyəsi</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">{selectedJobForDetail.experienceLevel || 'Orta'}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Şəhər / Ünvan</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block line-clamp-1">{selectedJobForDetail.city}</span>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="pt-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">İşin Təsviri</h4>
                <p className="whitespace-pre-line text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                  {selectedJobForDetail.description || 'Xüsusi təsvir qeyd edilməyib.'}
                </p>
              </div>

              {/* Responsibilities */}
              {selectedJobForDetail.responsibilities && selectedJobForDetail.responsibilities.length > 0 && (
                <div className="pt-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Vəzifə Öhdəlikləri</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {selectedJobForDetail.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {selectedJobForDetail.requirements && selectedJobForDetail.requirements.length > 0 && (
                <div className="pt-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Namizədə Tələblər</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {selectedJobForDetail.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {selectedJobForDetail.benefits && selectedJobForDetail.benefits.length > 0 && (
                <div className="pt-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">İş Şəraiti və Təminatlar</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {selectedJobForDetail.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Tags */}
              {selectedJobForDetail.skills && selectedJobForDetail.skills.length > 0 && (
                <div className="pt-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Tələb Olunan Bacarıqlar</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJobForDetail.skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Əlaqə Telefonu</span>
                    <span className="text-xs font-bold text-slate-900">{selectedJobForDetail.contactPhone || activeCompany.phone || 'Qeyd edilməyib'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">WhatsApp / Ünvan</span>
                    <span className="text-xs font-bold text-slate-900">{selectedJobForDetail.contactWhatsapp || selectedJobForDetail.address || 'Qeyd edilməyib'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (window.confirm(`"${selectedJobForDetail.title}" vakansiyasını həmişəlik silmək istəyirsiniz?`)) {
                    onDeleteJob(selectedJobForDetail.id);
                    setSelectedJobForDetail(null);
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs border border-red-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vakansiyanı Sil</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const canEdit = (selectedJobForDetail.editCount || 0) < (selectedJobForDetail.maxEditsAllowed || 1);
                    if (canEdit && onOpenEditJobModal) {
                      const jobToEdit = selectedJobForDetail;
                      setSelectedJobForDetail(null);
                      onOpenEditJobModal(jobToEdit);
                    } else {
                      alert('Bu vakansiya üzrə 1 dəfəlik redaktə hüququnuzdan artıq istifadə etmisiniz.');
                    }
                  }}
                  disabled={(selectedJobForDetail.editCount || 0) >= (selectedJobForDetail.maxEditsAllowed || 1)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                    (selectedJobForDetail.editCount || 0) < (selectedJobForDetail.maxEditsAllowed || 1)
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>
                    {(selectedJobForDetail.editCount || 0) < (selectedJobForDetail.maxEditsAllowed || 1)
                      ? 'Redaktə Et (1 Dəfəlik)'
                      : 'Redaktə Limiti Dolub'}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedJobForDetail(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  Bağla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {selectedAuditLogOffer && (
        <OfferAuditLogModal
          logs={auditLogs}
          offerId={selectedAuditLogOffer.id}
          candidateName={selectedAuditLogOffer.name}
          onClose={() => setSelectedAuditLogOffer(null)}
        />
      )}
    </div>
  );
};
