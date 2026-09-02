import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldCheck } from 'lucide-react';
import { JobiaLogo } from './JobiaLogo';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[Jobia ErrorBoundary] Caught error in ${this.props.sectionName || 'App'}:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCacheAndRecover = () => {
    try {
      const keysToClear = [
        'jobia_recruitment_events',
        'jobia_verif_ratelimit_',
      ];
      for (const key of Object.keys(localStorage)) {
        if (keysToClear.some((k) => key.startsWith(k))) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-50 text-slate-800">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <JobiaLogo size="md" />
            </div>

            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                {this.props.fallbackTitle || 'Gözlənilməz Xəta Baş Verdi'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {this.props.fallbackMessage ||
                  'Sistemdə müvəqqəti texniki uyğunsuzluq qeydə alındı. Məlumatlarınız təhlükəsiz saxlanılır.'}
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left">
                <p className="text-[11px] font-mono text-red-600 font-semibold break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Səhifəni Yenilə</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCacheAndRecover}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Əsas Səhifəyə Qayıt</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Jobia.az Təhlükəsizlik və Sabitlik Mexanizmi</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

