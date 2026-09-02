import React from 'react';
import { JobiaLogo } from './JobiaLogo';
import { Sparkles, Zap, ShieldCheck, ArrowUp } from 'lucide-react';

interface JobiaSectionFooterProps {
  className?: string;
  variant?: 'card' | 'minimal' | 'banner' | 'clean';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showBackToTop?: boolean;
  extraTagline?: string;
}

export const JobiaSectionFooter: React.FC<JobiaSectionFooterProps> = ({
  className = '',
  variant = 'card',
  size = 'md',
  showBackToTop = false,
  extraTagline,
}) => {
  const handleScrollTop = () => {
    const mainContainer = document.getElementById('main-content-scroll');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (variant === 'clean' || variant === 'minimal') {
    return (
      <div className={`w-full py-6 flex flex-col items-center justify-center text-center select-none ${className}`}>
        {/* Animated Moving Brand Logo */}
        <div className="relative group inline-flex flex-col items-center">
          <div className="p-2 rounded-2xl transition-all duration-300 hover:scale-105">
            <JobiaLogo size={size} />
          </div>
          
          {/* Subtitle: Job Intelligence & Automation */}
          <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-wide text-slate-500 hover:text-slate-800 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="bg-gradient-to-r from-slate-700 via-slate-900 to-slate-700 bg-clip-text text-transparent font-black tracking-wider uppercase text-[11px] sm:text-xs">
              Job Intelligence &amp; Automation
            </span>
          </div>

          {extraTagline && (
            <p className="mt-1 text-[11px] text-slate-400 font-medium max-w-md">
              {extraTagline}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full my-8 select-none ${className}`}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white via-slate-50/70 to-slate-100/50 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-300 p-6 sm:p-8 text-center">
        {/* Background Subtle Gradient Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-r from-emerald-400/10 via-blue-500/10 to-emerald-400/10 blur-2xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto">
          {/* Animated Moving Logo Wrapper with Gentle Float Animation */}
          <div className="logo-floating-badge inline-flex flex-col items-center justify-center p-3 sm:p-4 bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300">
            <JobiaLogo size={size} />
          </div>

          {/* Subtitle: Job Intelligence & Automation */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100/90 text-slate-700 border border-slate-200/80 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
            <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-800">
              Job Intelligence &amp; Automation
            </span>
            <Zap className="w-3 h-3 text-blue-600 shrink-0" />
          </div>

          {/* Tagline / Context */}
          <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-md">
            {extraTagline || 'Azərbaycanın müasir vakansiya, ağıllı CV və süni intellekt dəstəkli işə qəbul platforması'}
          </p>

          {/* Feature Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-slate-600">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              100% Rəsmi Vakansiyalar
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
              <Sparkles className="w-3 h-3 text-blue-600" />
              AI Analitika &amp; CV Uyğunluğu
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-3 h-3 text-slate-600" />
              Təhlükəsiz İş Platforması
            </span>
          </div>

          {/* Back to top button if enabled */}
          {showBackToTop && (
            <div className="mt-5 pt-3 border-t border-slate-200/60 w-full flex justify-center">
              <button
                type="button"
                onClick={handleScrollTop}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Yuxarı Qayıt</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobiaSectionFooter;
