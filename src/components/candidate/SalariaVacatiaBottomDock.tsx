import React, { useState } from 'react';
import { 
  Calculator, 
  Palmtree, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  X, 
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

interface SalariaVacatiaBottomDockProps {
  onOpenSalaria: (activeSubTab?: 'salaria' | 'vacatia') => void;
  currentActiveTab?: string;
}

export const SalariaVacatiaBottomDock: React.FC<SalariaVacatiaBottomDockProps> = ({
  onOpenSalaria,
  currentActiveTab,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <aside 
      id="salaria-vacatia-bottom-dock"
      aria-label="Salaria və Vacatia Sürətli Keçid Paneli"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl transition-all duration-300 pointer-events-auto select-none"
    >
      {/* Outer Obsidian Luxury Glowing Container */}
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-blue-500/40 via-indigo-400/30 to-amber-400/40 shadow-xl">
        
        {/* Deep Slate Glass Interior */}
        <div className="bg-slate-950 rounded-2xl p-2 sm:p-2.5 text-white">
          
          {/* 1. Minimized Mode */}
          {isMinimized ? (
            <div className="flex items-center justify-between px-3 py-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-black">
                  <Calculator className="w-3.5 h-3.5 text-blue-400" />
                  <span>Salaria</span>
                </div>
                <span className="text-slate-500 text-xs font-black">&</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-black">
                  <Palmtree className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vacatia</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSalaria('salaria')}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                >
                  Maaş
                </button>
                <button
                  type="button"
                  onClick={() => onOpenSalaria('vacatia')}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                >
                  Məzuniyyət
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimized(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Genişləndir"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* 2. Expanded Mode: Two Distinct, Clean & Beautiful Standalone Buttons */
            <div className="flex items-center justify-between gap-2.5">
              
              {/* Left Brand Badge */}
              <div className="hidden sm:flex items-center gap-2.5 pl-2 pr-1 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-amber-500 p-0.5 flex items-center justify-center shadow-md">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                    <span>Hesablama</span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[8.5px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      2026
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Rəsmi Qanunvericilik
                  </p>
                </div>
              </div>

              {/* Center / Right: Two Separate Standalone Luxury Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
                
                {/* 1. SALARIA STANDALONE LUXURY BUTTON */}
                <button
                  id="btn-dock-salaria"
                  type="button"
                  onClick={() => onOpenSalaria('salaria')}
                  className={`group relative flex-1 flex items-center justify-between gap-1.5 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.98] min-w-0 ${
                    currentActiveTab === 'calculia' || currentActiveTab === 'salaria'
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/50'
                      : 'bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950/80 hover:from-blue-950 hover:to-indigo-950 text-white border border-blue-500/30 hover:border-blue-400/60 shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-500/25 border border-blue-400/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs sm:text-sm font-black tracking-wide text-white truncate">Salaria</span>
                        <span className="text-[8.5px] sm:text-[9px] bg-blue-400/20 text-blue-200 border border-blue-400/30 px-1 sm:px-1.5 py-0.2 rounded font-black uppercase shrink-0">
                          Maaş
                        </span>
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-blue-200/80 font-semibold -mt-0.5 truncate hidden xs:block">
                        Net ⇄ Gross
                      </div>
                    </div>
                  </div>

                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/10 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:bg-white/20 transition-all shrink-0">
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                </button>

                {/* 2. VACATIA STANDALONE LUXURY BUTTON */}
                <button
                  id="btn-dock-vacatia"
                  type="button"
                  onClick={() => onOpenSalaria('vacatia')}
                  className="group relative flex-1 flex items-center justify-between gap-1.5 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-yellow-950/90 hover:from-amber-900 hover:to-orange-900 text-white border border-amber-400/40 hover:border-amber-300/80 shadow-md shadow-amber-950/40 transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.98] min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/25 border border-amber-400/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Palmtree className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs sm:text-sm font-black tracking-wide text-amber-200 truncate">Vacatia</span>
                        <span className="text-[8.5px] sm:text-[9px] bg-amber-400/25 text-amber-200 border border-amber-400/40 px-1 sm:px-1.5 py-0.2 rounded font-black uppercase shrink-0">
                          Tezliklə
                        </span>
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-amber-300/80 font-semibold -mt-0.5 truncate hidden xs:block">
                        Məzuniyyət
                      </div>
                    </div>
                  </div>

                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/10 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:bg-white/20 transition-all shrink-0">
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                  </div>
                </button>

                {/* Right controls: Minimize / Dismiss */}
                <div className="flex items-center gap-0.5 pl-1 border-l border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Yığcam et"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDismissed(true)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Bağla"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </aside>
  );
};

// Also export as CalculiaVacatiaBottomDock for backwards compatibility
export const CalculiaVacatiaBottomDock = SalariaVacatiaBottomDock;
