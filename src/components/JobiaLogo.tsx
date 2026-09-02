import React from 'react';

export interface JobiaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onClick?: () => void;
  clickable?: boolean;
  withSubtitle?: boolean;
  subtitle?: string;
  showDotPing?: boolean;
}

export const JobiaLogo: React.FC<JobiaLogoProps> = ({ 
  className = '', 
  size = 'md',
  onClick,
  clickable = true,
  withSubtitle = false,
  subtitle = 'Job Intelligence & Automation',
  showDotPing = false,
}) => {
  const sizeMap = {
    xs: { fontSize: '18px', height: '24px', subSize: 'text-[9px]' },
    sm: { fontSize: '22px', height: '30px', subSize: 'text-[10px]' },
    md: { fontSize: '28px', height: '38px', subSize: 'text-[11px]' },
    lg: { fontSize: '38px', height: '50px', subSize: 'text-xs' },
    xl: { fontSize: '50px', height: '64px', subSize: 'text-sm' },
    '2xl': { fontSize: '66px', height: '84px', subSize: 'text-base' },
  };

  const current = sizeMap[size as keyof typeof sizeMap] || sizeMap.md;

  const handleClick = (e: React.MouseEvent) => {
    if (!clickable) return;
    
    if (onClick) {
      onClick();
      return;
    }

    // Default SPA navigation to root if not provided
    if (window.location.pathname !== '/' || window.location.search !== '') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick(e as any);
    }
  };

  return (
    <div
      role={clickable ? 'button' : 'img'}
      tabIndex={clickable ? 0 : undefined}
      aria-label="jobia.az - Ana səhifə"
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      className={`group inline-flex flex-col items-center select-none font-black tracking-[-0.04em] transition-transform active:scale-95 ${
        clickable ? 'cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-0.5' : ''
      } ${className}`}
    >
      {/* Animated Letters Container */}
      <div 
        className="inline-flex items-center logo-floating-badge"
        style={{ 
          fontFamily: "'Outfit', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: current.fontSize,
          lineHeight: 1,
        }}
      >
        {/* Animated Letters: Letters topple, wave & rise back up, 'o' spins 360°/720° */}
        <span className="logo-anim-j text-[#00a859] inline-block">j</span>
        <span className="logo-anim-o text-[#00a859] inline-block px-[0.5px]">o</span>
        <span className="logo-anim-b text-[#00a859] inline-block">b</span>
        <span className="logo-anim-i text-[#0b1b2b] inline-block">i</span>
        <span className="logo-anim-a1 text-[#0b1b2b] inline-block">a</span>
        <span className="logo-anim-dot text-[#0b1b2b] inline-block">.</span>
        <span className="logo-anim-a2 text-[#00a859] inline-block">a</span>
        <span className="logo-anim-z text-[#00a859] inline-block">z</span>
        {showDotPing && (
          <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
        )}
      </div>

      {/* Subtitle if requested: Job Intelligence & Automation */}
      {withSubtitle && (
        <span className={`mt-1 font-extrabold uppercase tracking-widest text-slate-500 group-hover:text-slate-800 transition-colors ${current.subSize}`}>
          {subtitle}
        </span>
      )}

      {/* Hidden text for screen readers and SEO */}
      <span className="sr-only">jobia.az - Job Intelligence &amp; Automation</span>
    </div>
  );
};

// Also export as HireMeLogo for full backwards compatibility
export const HireMeLogo = JobiaLogo;

export default JobiaLogo;
