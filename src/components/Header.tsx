import React, { useState } from 'react';
import { UserRole, User, UserSubscription, Company, AppNotification } from '../types';
import { JobiaLogo } from './JobiaLogo';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationCenterOverlay } from './notifications/NotificationCenterOverlay';
import { 
  Menu, 
  Crown, 
  LogIn, 
  LogOut, 
  Plus, 
  PanelLeftClose, 
  PanelLeftOpen,
  Sparkles,
  Bell,
  User as UserIcon
} from 'lucide-react';

interface HeaderProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  candidateTab?: 'jobs' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'nearby-map' | 'google-chat';
  onCandidateTabChange?: (tab: 'jobs' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'nearby-map' | 'google-chat') => void;
  applicationsCount?: number;
  activeVacanciesCount?: number;
  pendingApprovalsCount?: number;
  savedJobsCount?: number;
  onOpenGoogleChat?: () => void;
  onPostJobClick?: () => void;
  onOpenIntroTour?: () => void;
  onToggleMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapseSidebar?: () => void;
  currentUser?: User | null;
  currentSubscription?: UserSubscription | null;
  notifications?: AppNotification[];
  onNavigateNotification?: (notification: AppNotification) => void;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: UserRole) => void;
  onOpenVerifyModal?: (user: User) => void;
  onOpenPricing?: () => void;
  onLogout?: () => void;
  selectedCompany?: string;
  onSelectCompany?: (companyName: string) => void;
  companies?: Company[];
}

export const Header: React.FC<HeaderProps> = ({
  currentRole = 'candidate',
  onRoleChange,
  candidateTab = 'jobs',
  onCandidateTabChange,
  onToggleMobileSidebar,
  isSidebarCollapsed = false,
  onToggleCollapseSidebar,
  currentUser,
  currentSubscription,
  notifications = [],
  onNavigateNotification,
  onOpenAuthModal,
  onOpenVerifyModal,
  onOpenPricing,
  onLogout,
  onPostJobClick,
  selectedCompany = 'Hamısı',
  onSelectCompany,
  companies = [],
}) => {
  const { dict, language } = useLanguage();
  const [isNotificationOverlayOpen, setIsNotificationOverlayOpen] = useState(false);
  const planTier = currentSubscription?.tier || 'FREE';
  const isPaidUser = planTier !== 'FREE';

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const realCompaniesWithJobs = companies.filter((c) => c.name && c.name.trim().length > 0);

  const handleCompanyClick = (name: string) => {
    if (onRoleChange && currentRole !== 'candidate') {
      onRoleChange('candidate');
    }
    if (onCandidateTabChange && candidateTab !== 'jobs') {
      onCandidateTabChange('jobs');
    }
    if (onSelectCompany) {
      onSelectCompany(name === selectedCompany ? 'Hamısı' : name);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 w-full max-w-full shadow-2xs">
      <div className="w-full max-w-full px-2 sm:px-4 md:px-5">
        <div className="flex items-center justify-between gap-2 sm:gap-3 py-1.5 min-h-[60px]">
          
          {/* LEFT: Sidebar Toggle & Mobile Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Menu Hamburger */}
            {onToggleMobileSidebar && (
              <button
                id="header-mobile-menu-btn"
                type="button"
                onClick={onToggleMobileSidebar}
                className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer transition-colors"
                title={language === 'en' ? 'Open navigation' : language === 'ru' ? 'Меню' : 'Menyu'}
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Desktop Sidebar Collapse / Expand Toggle */}
            {onToggleCollapseSidebar && (
              <button
                id="header-desktop-sidebar-toggle-btn"
                type="button"
                onClick={onToggleCollapseSidebar}
                className="hidden lg:flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-all border border-transparent hover:border-slate-200"
                title={isSidebarCollapsed ? (language === 'en' ? 'Expand Sidebar' : 'Sol Paneli Genişləndir') : (language === 'en' ? 'Collapse Sidebar' : 'Sol Paneli Yığcamlaşdır')}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-blue-600" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-slate-600" />
                )}
              </button>
            )}

            {/* Mobile Logo Brand */}
            <div 
              onClick={() => handleCompanyClick('Hamısı')}
              className="cursor-pointer select-none flex items-center lg:hidden"
              title="jobia.az"
            >
              <JobiaLogo size="md" className="scale-85 origin-left" />
            </div>
          </div>

          {/* MIDDLE: TOP REAL COMPANY LOGOS OR CLEAN PORTAL BADGE */}
          <div className="flex-1 flex items-center min-w-0 px-1 py-0.5 overflow-hidden">
            {realCompaniesWithJobs.length > 0 ? (
              <div className="flex-1 overflow-hidden relative select-none">
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent z-10 hidden sm:block" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-white to-transparent z-10" />

                <div className="animate-continuous-marquee flex items-center gap-2 sm:gap-2.5">
                  {realCompaniesWithJobs.map((company, idx) => {
                    const isSelected = selectedCompany.toLowerCase() === company.name.toLowerCase() ||
                      (selectedCompany !== 'Hamısı' && company.name.toLowerCase().includes(selectedCompany.toLowerCase()));
                    return (
                      <button
                        key={`track1-${company.name}-${idx}`}
                        id={`company-chip-${company.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-1`}
                        type="button"
                        onClick={() => handleCompanyClick(company.name)}
                        className={`group shrink-0 flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all cursor-pointer select-none ${
                          isSelected ? 'scale-105' : 'hover:scale-105'
                        }`}
                        title={`${company.name} vakansiyaları`}
                      >
                        <div
                          className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-0.5 bg-white flex items-center justify-center transition-all ${
                            isSelected
                              ? 'ring-2 ring-blue-600 ring-offset-2 shadow-xs'
                              : company.verified
                              ? 'ring-2 ring-emerald-500/80 shadow-2xs'
                              : 'border border-slate-200 shadow-2xs hover:border-blue-400'
                          }`}
                        >
                          <img
                            src={company.logo}
                            alt={company.name}
                            loading="lazy"
                            className="w-full h-full object-cover rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className={`text-[9px] font-bold max-w-[70px] truncate text-center ${
                          isSelected ? 'text-blue-600 font-extrabold' : 'text-slate-700 group-hover:text-blue-600'
                        }`}>
                          {company.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium select-none">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Azərbaycanın Rəsmi Vakansiyalar və İşə Qəbul Portalı</span>
              </div>
            )}
          </div>

          {/* RIGHT ACTION BAR: NOTIFICATIONS + SUBSCRIPTION (VIP) + LANGUAGE SWITCHER + AUTH */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-1 border-l border-slate-200">
            
            {/* 1. REAL-TIME NOTIFICATION CENTER BELL & FLYOUT OVERLAY */}
            <div className="relative shrink-0">
              <button
                id="header-notification-center-btn"
                type="button"
                onClick={() => setIsNotificationOverlayOpen(!isNotificationOverlayOpen)}
                className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  isNotificationOverlayOpen
                    ? 'bg-blue-600 text-white shadow-xs'
                    : unreadCount > 0
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/90 hover:bg-blue-100 hover:text-blue-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                }`}
                title="Real-vaxt Bildirişlər Mərkəzi"
                aria-label="Real-vaxt Bildirişlər Mərkəzi"
              >
                <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-wiggle' : ''}`} />
                
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white shadow-xs ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Center Flyout Overlay */}
              <NotificationCenterOverlay
                currentUser={currentUser || null}
                notifications={notifications}
                isOpen={isNotificationOverlayOpen}
                onClose={() => setIsNotificationOverlayOpen(false)}
                onNavigateNotification={onNavigateNotification}
              />
            </div>

            {/* 2. VIP / Subscription Plan Button (Visible on Desktop / Tablet md+) */}
            {onOpenPricing && (
              <button
                id="header-vip-pricing-btn"
                type="button"
                onClick={onOpenPricing}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-300/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-95 shrink-0"
                title={dict.nav.pricing}
              >
                <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="tracking-tight">VIP Planlar</span>
                {isPaidUser ? (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-200/70 text-amber-950 text-[9px] font-extrabold uppercase">
                    {planTier}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-200/60 text-amber-900 text-[8px] font-black uppercase tracking-wider">
                    PRO
                  </span>
                )}
              </button>
            )}

            {/* 3. Language Switcher (Prominently Placed at the Top Header) */}
            <div className="shrink-0">
              <LanguageSwitcher />
            </div>

            {/* 4. Eye-Pleasing Interactive Auth Button / User Profile (Visible on Desktop / Tablet md+) */}
            {currentUser ? (
              <div className="hidden md:flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-200/80 p-1 pl-1.5 rounded-xl border border-slate-200/90 transition-all">
                <div className="relative">
                  <img
                    src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.fullName}`}
                    alt={currentUser.fullName}
                    className="w-6 h-6 rounded-lg object-cover border border-slate-300"
                  />
                  {currentUser.emailVerified ? (
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" title="E-poçt Təsdiqlənib" />
                  ) : (
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" title="E-poçt Təsdiqlənməyib" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 max-w-[90px] truncate leading-none">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  {!currentUser.emailVerified && onOpenVerifyModal && (
                    <button
                      type="button"
                      onClick={() => onOpenVerifyModal(currentUser)}
                      className="text-[9px] font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer leading-tight mt-0.5"
                    >
                      Təsdiqlə ⚡
                    </button>
                  )}
                </div>
                {onLogout && (
                  <button
                    id="header-logout-btn"
                    type="button"
                    onClick={onLogout}
                    className="p-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title={dict.nav.logout}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  id="header-auth-trigger-btn"
                  type="button"
                  onClick={() => onOpenAuthModal('login', currentRole)}
                  className="hidden md:flex animate-auth-trigger items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs hover:shadow-md active:scale-95 transition-all"
                  title="Daxil ol və ya Pulsuz Qeydiyyatdan Keç"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                  <span className="tracking-tight whitespace-nowrap font-bold">
                    {dict.nav.login} <span className="hidden sm:inline">/ Qeydiyyat</span>
                  </span>
                </button>
              )
            )}

          </div>

        </div>
      </div>
    </header>
  );
};


