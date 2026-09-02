import React from 'react';
import { User, UserRole, UserSubscription } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Crown, Sparkles, LogIn, LogOut, User as UserIcon } from 'lucide-react';

interface MobileFrozenBottomBarProps {
  currentUser?: User | null;
  currentSubscription?: UserSubscription | null;
  currentRole?: UserRole;
  onOpenPricing?: () => void;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: UserRole) => void;
  onLogout?: () => void;
}

export const MobileFrozenBottomBar: React.FC<MobileFrozenBottomBarProps> = ({
  currentUser,
  currentSubscription,
  currentRole = 'candidate',
  onOpenPricing,
  onOpenAuthModal,
  onLogout,
}) => {
  const { dict, language } = useLanguage();
  const planTier = currentSubscription?.tier || 'FREE';
  const isPaidUser = planTier !== 'FREE';

  return (
    <div
      id="mobile-frozen-action-bar"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/85 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-3 py-2 sm:px-4 sm:py-2.5 transition-all select-none"
      style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0.625rem))' }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
        
        {/* 1. VIP Planlar / PRO Button */}
        {onOpenPricing && (
          <button
            id="mobile-freeze-vip-btn"
            type="button"
            onClick={onOpenPricing}
            className="flex-1 min-h-[42px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 active:bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs transition-transform active:scale-98 cursor-pointer shrink-0"
            title={dict.nav.pricing}
          >
            <Crown className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="tracking-tight font-bold whitespace-nowrap">VIP Planlar</span>
            {isPaidUser ? (
              <span className="px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 text-[9px] font-extrabold uppercase tracking-wider">
                {planTier}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-950 text-[9px] font-black uppercase tracking-wider shadow-2xs">
                PRO
              </span>
            )}
          </button>
        )}

        {/* 2. Daxil ol / Qeydiyyat or User Profile */}
        {currentUser ? (
          <div className="flex-1 min-h-[42px] flex items-center justify-between gap-2 bg-slate-100/90 border border-slate-200/90 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.fullName}`}
                alt={currentUser.fullName}
                className="w-7 h-7 rounded-lg object-cover border border-slate-300 shrink-0"
              />
              <div className="min-w-0 text-left">
                <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {currentUser.fullName.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-500 font-medium capitalize truncate">
                  {currentUser.role === 'business' ? 'İşəgötürən' : currentUser.role === 'admin' ? 'Admin' : 'Namizəd'}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                id="mobile-freeze-logout-btn"
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all cursor-pointer shrink-0"
                title={dict.nav.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          onOpenAuthModal && (
            <button
              id="mobile-freeze-auth-btn"
              type="button"
              onClick={() => onOpenAuthModal('login', currentRole)}
              className="flex-1 min-h-[42px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 active:bg-blue-700 text-white shadow-xs transition-transform active:scale-98 cursor-pointer shrink-0"
              title="Daxil ol və ya Pulsuz Qeydiyyatdan Keç"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200 shrink-0" />
              <span className="tracking-tight whitespace-nowrap font-bold">
                {dict.nav.login} / Qeydiyyat
              </span>
            </button>
          )
        )}

      </div>
    </div>
  );
};
