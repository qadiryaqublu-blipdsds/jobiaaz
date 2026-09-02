import React from 'react';
import { UserRole, User, UserSubscription } from '../types';
import { JobiaLogo } from './JobiaLogo';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Search, 
  TrendingUp, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Calculator, 
  MessageSquare, 
  Building2, 
  ShieldCheck, 
  User as UserIcon, 
  Plus, 
  Compass, 
  CreditCard, 
  LogIn, 
  LogOut, 
  ChevronRight, 
  X,
  Flame,
  Briefcase,
  Crown,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  candidateTab: 'jobs' | 'nearby-map' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'google-chat';
  onCandidateTabChange: (tab: 'jobs' | 'nearby-map' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'google-chat') => void;
  applicationsCount?: number;
  activeVacanciesCount?: number;
  pendingApprovalsCount?: number;
  savedJobsCount?: number;
  onOpenGoogleChat?: () => void;
  onPostJobClick?: () => void;
  onOpenIntroTour?: () => void;
  onOpenPricing?: () => void;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: UserRole) => void;
  onLogout?: () => void;
  currentUser: User | null;
  currentSubscription: UserSubscription | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  onRoleChange,
  candidateTab,
  onCandidateTabChange,
  applicationsCount = 0,
  activeVacanciesCount = 0,
  pendingApprovalsCount = 0,
  savedJobsCount = 0,
  onOpenGoogleChat,
  onPostJobClick,
  onOpenIntroTour,
  onOpenPricing,
  onOpenAuthModal,
  onLogout,
  currentUser,
  currentSubscription,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { dict, brandAcronym, language } = useLanguage();
  const planTier = currentSubscription?.tier || 'FREE';
  const isPaidPlan = planTier !== 'FREE';

  const handleTabClick = (tab: 'jobs' | 'nearby-map' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'google-chat') => {
    onCandidateTabChange(tab);
    onCloseMobile();
  };

  const handleRoleSelect = (role: UserRole) => {
    onRoleChange(role);
    onCloseMobile();
  };

  const navItems = [
    {
      id: 'jobs' as const,
      label: dict.nav.jobs,
      icon: Search,
      badge: null,
      color: 'blue',
    },
    {
      id: 'nearby-map' as const,
      label: dict.nav.nearbyJobs || 'Xəritədə İşlər (Evimə Yaxın)',
      icon: Compass,
      badge: 'YENİ',
      badgeClass: 'bg-emerald-500 text-white font-bold',
      color: 'emerald',
    },
    {
      id: 'salary-trends' as const,
      label: dict.nav.salaryTrends,
      icon: TrendingUp,
      badge: '2026',
      color: 'indigo',
    },
    {
      id: 'cv-builder' as const,
      label: dict.nav.cvBuilder,
      icon: FileText,
      badge: null,
      color: 'blue',
    },
    {
      id: 'cv-analyzer' as const,
      label: dict.nav.cvAnalyzer,
      icon: Sparkles,
      badge: 'AI',
      badgeClass: 'bg-amber-500 text-white',
      color: 'amber',
    },
    {
      id: 'my-applications' as const,
      label: dict.nav.myApplications,
      icon: CheckCircle2,
      badge: applicationsCount > 0 ? applicationsCount : null,
      badgeClass: 'bg-blue-100 text-blue-700',
      color: 'blue',
    },
    {
      id: 'calculia' as const,
      label: 'Salaria & Vacatia',
      icon: Calculator,
      badge: 'Maaş',
      badgeClass: 'bg-indigo-100 text-indigo-700 text-[9px]',
      color: 'indigo',
    },
    {
      id: 'google-chat' as const,
      label: dict.nav.googleChat,
      icon: MessageSquare,
      badge: 'Canlı',
      badgeClass: 'bg-emerald-100 text-emerald-700 animate-pulse',
      color: 'emerald',
      onClick: () => {
        if (onOpenGoogleChat) onOpenGoogleChat();
        else handleTabClick('google-chat');
      }
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Left Vertical Sidebar with dynamic width */}
      <aside
        id="app-left-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-lg lg:shadow-none lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${
          isOpenMobile ? 'translate-x-0 !w-72' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* TOP SECTION: LOGO & COLLAPSE / CLOSE BUTTON */}
        <div className={`p-3.5 border-b border-slate-100 flex items-center shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div 
            onClick={() => {
              onRoleChange('candidate');
              onCandidateTabChange('jobs');
              onCloseMobile();
            }}
            className="flex items-center gap-2 cursor-pointer select-none group"
            title="jobia.az - Ana səhifə"
          >
            <JobiaLogo size={isCollapsed ? "xs" : "md"} className="group-hover:opacity-90 transition-opacity" />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-wider text-emerald-700 uppercase leading-none">
                  {brandAcronym}
                </span>
                <span className="text-[9px] text-slate-500 font-semibold leading-tight mt-0.5">
                  Ağıllı İş Platforması
                </span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          {onToggleCollapse && !isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              title="Paneli yığcamlaşdır"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE VERTICAL BUTTONS CONTAINER */}
        <div className={`flex-1 overflow-y-auto min-h-0 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 ${
          isCollapsed ? 'px-2 py-3' : 'px-3.5 py-3.5'
        }`}>
          
          {/* 1. ROLE SWITCHER VERTICAL PILLS (With RBAC Role Isolation) */}
          <div>
            {!isCollapsed && (
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1.5 block">
                {currentUser?.role === 'candidate' 
                  ? 'Namizəd Rejimi' 
                  : currentUser?.role === 'business' 
                  ? 'İşəgötürən Rejimi' 
                  : (language === 'en' ? 'Select Role' : language === 'ru' ? 'Роль' : 'İstifadəçi Rejimi')}
              </label>
            )}
            
            {/* If user is logged in as Candidate */}
            {currentUser?.role === 'candidate' ? (
              isCollapsed ? (
                <div className="flex flex-col items-center">
                  <div 
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs"
                    title="Namizəd Portalı"
                  >
                    <UserIcon className="w-5 h-5" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-2 bg-blue-50/90 border border-blue-200/80 rounded-xl shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black text-blue-950 truncate">Namizəd Portalı</span>
                    <span className="text-[9px] text-blue-700 font-semibold truncate">{currentUser.fullName || currentUser.email}</span>
                  </div>
                </div>
              )
            ) : currentUser?.role === 'business' ? (
              /* If user is logged in as Employer (Business) */
              isCollapsed ? (
                <div className="flex flex-col items-center">
                  <div 
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs"
                    title="İşəgötürən Paneli"
                  >
                    <Building2 className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-2 bg-slate-900 border border-slate-800 rounded-xl text-white shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-white/15 text-blue-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black text-white truncate">İşəgötürən Paneli</span>
                    <span className="text-[9px] text-slate-300 font-semibold truncate">{currentUser.companyName || currentUser.fullName}</span>
                  </div>
                </div>
              )
            ) : currentUser?.role === 'admin' ? (
              /* If user is logged in as Admin: allow switching to test/moderate all views */
              isCollapsed ? (
                <div className="flex flex-col gap-1.5 items-center">
                  <button
                    id="sidebar-role-candidate"
                    onClick={() => handleRoleSelect('candidate')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      currentRole === 'candidate'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={dict.nav.candidate}
                  >
                    <UserIcon className="w-5 h-5" />
                  </button>
                  <button
                    id="sidebar-role-business"
                    onClick={() => handleRoleSelect('business')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      currentRole === 'business'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={dict.nav.employer}
                  >
                    <Building2 className="w-5 h-5" />
                  </button>
                  <button
                    id="sidebar-role-admin"
                    onClick={() => handleRoleSelect('admin')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative cursor-pointer ${
                      currentRole === 'admin'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={dict.nav.admin}
                  >
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    {pendingApprovalsCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
                  <button
                    id="sidebar-role-candidate"
                    onClick={() => handleRoleSelect('candidate')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      currentRole === 'candidate'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 mb-0.5" />
                    <span className="truncate">{dict.nav.candidate}</span>
                  </button>

                  <button
                    id="sidebar-role-business"
                    onClick={() => handleRoleSelect('business')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      currentRole === 'business'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mb-0.5" />
                    <span className="truncate">{dict.nav.employer}</span>
                  </button>

                  <button
                    id="sidebar-role-admin"
                    onClick={() => handleRoleSelect('admin')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-bold transition-all relative cursor-pointer ${
                      currentRole === 'admin'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mb-0.5 text-blue-400" />
                    <span className="truncate">{dict.nav.admin}</span>
                    {pendingApprovalsCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
                    )}
                  </button>
                </div>
              )
            ) : (
              /* Guest / Visitor (Not logged in): Allow previewing Candidate vs Employer */
              isCollapsed ? (
                <div className="flex flex-col gap-1.5 items-center">
                  <button
                    id="sidebar-role-candidate"
                    onClick={() => handleRoleSelect('candidate')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      currentRole === 'candidate'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={dict.nav.candidate}
                  >
                    <UserIcon className="w-5 h-5" />
                  </button>
                  <button
                    id="sidebar-role-business"
                    onClick={() => handleRoleSelect('business')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      currentRole === 'business'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={dict.nav.employer}
                  >
                    <Building2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
                  <button
                    id="sidebar-role-candidate"
                    onClick={() => handleRoleSelect('candidate')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      currentRole === 'candidate'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 mb-0.5" />
                    <span className="truncate">{dict.nav.candidate}</span>
                  </button>

                  <button
                    id="sidebar-role-business"
                    onClick={() => handleRoleSelect('business')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      currentRole === 'business'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mb-0.5" />
                    <span className="truncate">{dict.nav.employer}</span>
                  </button>
                </div>
              )
            )}
          </div>

          {/* 2. PRIMARY ACTION BUTTON: POST JOB (Only shown to Employers/Admin or Guests) */}
          {currentUser?.role !== 'candidate' && (
            <div>
              {isCollapsed ? (
                <button
                  id="sidebar-post-job-btn-collapsed"
                  onClick={() => {
                    if (onPostJobClick) onPostJobClick();
                    else handleRoleSelect('business');
                    onCloseMobile();
                  }}
                  className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
                  title={language === 'en' ? 'Post a Job' : 'Elan Yerləşdir (+ Pulsuz)'}
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              ) : (
                <button
                  id="sidebar-post-job-btn"
                  onClick={() => {
                    if (onPostJobClick) onPostJobClick();
                    else handleRoleSelect('business');
                    onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span>{language === 'en' ? 'Post a Job' : language === 'ru' ? 'Разместить вакансию' : 'Elan Yerləşdir'}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
                    + Pulsuz
                  </span>
                </button>
              )}
            </div>
          )}

          {/* 3. PROMINENT VIP SUBSCRIPTION SPOTLIGHT (REQUEST #3) */}
          {onOpenPricing && (
            <div>
              {isCollapsed ? (
                <button
                  id="sidebar-vip-spotlight-collapsed"
                  onClick={() => {
                    onOpenPricing();
                    onCloseMobile();
                  }}
                  className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                  title="👑 VIP Planlar və Tariflər"
                >
                  <Crown className="w-5 h-5 text-amber-600" />
                </button>
              ) : (
                <div 
                  onClick={() => {
                    onOpenPricing();
                    onCloseMobile();
                  }}
                  className="relative overflow-hidden p-3 rounded-2xl bg-amber-50/80 hover:bg-amber-50 border border-amber-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                        <Crown className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-amber-950 tracking-tight">
                        VIP & PRO Planlar
                      </span>
                    </div>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 shadow-2xs">
                      {isPaidPlan ? planTier : 'Hamıya Açıq'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 leading-snug font-medium mb-2">
                    Limitsiz AI CV analizi, ön sıralar və birbaşa HR əlaqəsi.
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 group-hover:text-amber-950">
                    <span>{dict.nav.pricing} bax</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-700 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. VERTICAL NAVIGATION BUTTONS */}
          {currentRole === 'candidate' && (
            <div className="space-y-1">
              {!isCollapsed && (
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1 block">
                  {language === 'en' ? 'Navigation' : language === 'ru' ? 'Навигация' : 'Əsas Bölmələr'}
                </label>
              )}

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = candidateTab === item.id;

                if (isCollapsed) {
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-tab-collapsed-${item.id}`}
                      onClick={() => {
                        if (item.onClick) item.onClick();
                        else handleTabClick(item.id);
                      }}
                      className={`w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all cursor-pointer relative ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title={`${item.label} ${item.badge ? `(${item.badge})` : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white" />
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else {
                        handleTabClick(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-black'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-100 text-slate-600 group-hover:text-slate-900'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeClass || 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* BUSINESS / EMPLOYER ROLE BUTTONS */}
          {currentRole === 'business' && (
            <div className="space-y-1">
              {!isCollapsed && (
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1 block">
                  {language === 'en' ? 'Employer Hub' : language === 'ru' ? 'Панель работодателя' : 'İşəgötürən Paneli'}
                </label>
              )}

              {isCollapsed ? (
                <div className="flex flex-col gap-1.5 items-center">
                  <button
                    onClick={() => {
                      onRoleChange('business');
                      onCloseMobile();
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs cursor-pointer"
                    title={language === 'en' ? 'Company Vacancies' : 'Şirkət Vakansiyaları'}
                  >
                    <Briefcase className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (onPostJobClick) onPostJobClick();
                      onCloseMobile();
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                    title={language === 'en' ? 'Publish New Job' : 'Yeni Elan Dərc Et'}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onRoleChange('business');
                      onCloseMobile();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-slate-900 text-white shadow-xs cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-white/20 text-white">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <span>{language === 'en' ? 'Company Vacancies' : language === 'ru' ? 'Вакансии компании' : 'Şirkət Vakansiyaları'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onPostJobClick) onPostJobClick();
                      onCloseMobile();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span>{language === 'en' ? 'Publish New Job' : language === 'ru' ? 'Опубликовать вакансию' : 'Yeni Elan Dərc Et'}</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* ADMIN ROLE BUTTONS */}
          {currentRole === 'admin' && (
            <div className="space-y-1">
              {!isCollapsed && (
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1 block">
                  {language === 'en' ? 'Administration' : language === 'ru' ? 'Администрирование' : 'İdarəetmə'}
                </label>
              )}

              {isCollapsed ? (
                <button
                  onClick={() => {
                    onRoleChange('admin');
                    onCloseMobile();
                  }}
                  className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-slate-900 text-blue-400 shadow-xs cursor-pointer"
                  title={language === 'en' ? 'Admin Dashboard' : 'Admin İdarəetmə'}
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onRoleChange('admin');
                    onCloseMobile();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-slate-900 text-white shadow-xs cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-white/20 text-blue-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>{language === 'en' ? 'Admin Dashboard' : language === 'ru' ? 'Панель управления' : 'Admin İdarəetmə'}</span>
                </button>
              )}
            </div>
          )}

          {/* 5. QUICK GUIDE / TOUR */}
          {onOpenIntroTour && (
            <div className="pt-2 border-t border-slate-100">
              {isCollapsed ? (
                <button
                  id="sidebar-intro-tour-btn-collapsed"
                  onClick={() => {
                    onOpenIntroTour();
                    onCloseMobile();
                  }}
                  className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  title={language === 'en' ? 'Platform Tour & Guide' : 'Addımlı Bələdçi'}
                >
                  <Compass className="w-5 h-5 animate-pulse" />
                </button>
              ) : (
                <button
                  id="sidebar-intro-tour-btn"
                  onClick={() => {
                    onOpenIntroTour();
                    onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span>{language === 'en' ? 'Platform Tour & Guide' : language === 'ru' ? 'Гид по платформе' : 'Addımlı Bələdçi'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: USER PROFILE & COLLAPSE TRIGGER */}
        <div className={`border-t border-slate-100 bg-slate-50/70 ${isCollapsed ? 'p-2 space-y-2' : 'p-3.5 space-y-2.5'}`}>
          
          {/* User Account Bar or Eye-Catching Sign-in (Request #7) */}
          {currentUser ? (
            <div className={`flex items-center bg-white rounded-xl border border-slate-200 shadow-2xs ${
              isCollapsed ? 'justify-center p-1.5' : 'justify-between gap-2 p-2'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.fullName}`}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                {!isCollapsed && (
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                )}
              </div>

              {onLogout && !isCollapsed && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                  title={dict.nav.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            onOpenAuthModal && (
              isCollapsed ? (
                <button
                  onClick={() => {
                    onOpenAuthModal('login', currentRole);
                    onCloseMobile();
                  }}
                  className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs cursor-pointer hover:bg-blue-700 transition-colors"
                  title="Daxil ol / Qeydiyyat"
                >
                  <LogIn className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuthModal('login', currentRole);
                    onCloseMobile();
                  }}
                  className="animate-auth-trigger w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>{dict.nav.login} / {language === 'en' ? 'Sign Up' : language === 'ru' ? 'Регистрация' : 'Qeydiyyat'}</span>
                </button>
              )
            )
          )}

          {/* Desktop Collapse / Expand Button in Sidebar Bottom */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`hidden lg:flex items-center justify-center w-full py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer ${
                isCollapsed ? 'px-1' : 'px-3 gap-2 border border-slate-200'
              }`}
              title={isCollapsed ? 'Paneli genişləndir' : 'Paneli yığcamlaşdır'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-blue-600" />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 text-slate-500" />
                  <span>Paneli Yığcamlaşdır</span>
                </>
              )}
            </button>
          )}

        </div>
      </aside>
    </>
  );
};

