import React from 'react';
import { JobiaLogo } from './JobiaLogo';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface ModalBottomLogoProps {
  className?: string;
  variant?: 'light' | 'slate' | 'transparent';
  tagline?: string;
  showShield?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

export const ModalBottomLogo: React.FC<ModalBottomLogoProps> = ({
  className = '',
  variant = 'slate',
  tagline = 'Azərbaycanın Ən Ağıllı Vakansiya və Karyera Platforması',
  showShield = true,
  size = 'xs'
}) => {
  const bgStyles = {
    slate: 'bg-slate-50 border-t border-slate-100 text-slate-500',
    light: 'bg-white border-t border-slate-100 text-slate-500',
    transparent: 'bg-transparent text-slate-500'
  }[variant];

  return (
    <div
      className={`px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] select-none ${bgStyles} ${className}`}
    >
      <div className="flex items-center gap-2">
        {showShield && (
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">256-Bit SSL & AR Qanunvericilik</span>
          </span>
        )}
        {showShield && <span className="text-slate-300 hidden sm:inline">•</span>}
        <span className="text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-500 shrink-0 inline" />
          {tagline}
        </span>
      </div>

      {/* Moving / Animated Jobia.az Brand Logo with Job Intelligence & Automation */}
      <div className="flex items-center gap-1.5 ml-auto">
        <div className="relative group flex items-center bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <JobiaLogo size={size} withSubtitle={true} subtitle="Job Intelligence & Automation" showDotPing={true} />
        </div>
      </div>
    </div>
  );
};

export default ModalBottomLogo;
