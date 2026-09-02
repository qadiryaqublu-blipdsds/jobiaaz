import React from 'react';
import { Sparkles, X, CheckCircle2, ShieldCheck, Zap, ArrowRight, Lock } from 'lucide-react';
import { PlanTier, UserRole } from '../../types';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: PlanTier | string;
  featureTitle: string;
  featureDescription?: string;
  userRole: UserRole;
  onUpgradeClick: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  requiredTier,
  featureTitle,
  featureDescription,
  userRole,
  onUpgradeClick,
}) => {
  if (!isOpen) return null;

  const isEmployer = userRole === 'business';

  const proFeatures = isEmployer
    ? [
        '5 Aktiv Vakansiya Elanı və Limitsiz Namizəd Qəbulu',
        'AI Namizəd Uyğunluq Skoru və Açar Söz Analizi',
        'AI Müsahibə Xülasəsi və Dəyərləndirmə Hesabatı',
        'Rəsmi AI Job Offer (İş Təklifi) və Namizəd Portalı',
        'A4 formatda Rəsmi PDF İxracı və E-İmza İzləmə',
      ]
    : [
        '4 Müasir Premium CV Şablonu (Zümrüd, Korporativ, Minimalist, Tech)',
        'AI ATS CV Analizi, Uyğunluq Skoru və Təkmilləşdirmə Məsləhətləri',
        'AI Müsahibə Simulyatoru və Vakansiyaya Özəl Sual-Cavablar',
        'İşəgötürən müraciət siyahısında "Premium Namizəd" Nişanı',
        'Maaş Trendləri və Şirkət İnsights Analitikası',
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with decorative badge */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-500/30 text-blue-300 border border-blue-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>{requiredTier} Plan İmkanı</span>
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            {featureTitle}
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            {featureDescription ||
              `Bu funksiya ${requiredTier} planına daxildir. Zəhmət olmasa planınızı yüksəldərək tam girişi aktivləşdirin.`}
          </p>
        </div>

        {/* Feature List */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            {requiredTier} Planına Daxil Olan Üstünlüklər:
          </h3>

          <ul className="space-y-2.5">
            {proFeatures.map((f, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">{f}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block">Aylıq cəmi:</span>
              <span className="text-lg font-black text-slate-900">
                {isEmployer ? '39 AZN' : '6.90 AZN'}{' '}
                <span className="text-xs font-normal text-slate-500">/aydan</span>
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onUpgradeClick();
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{requiredTier}-a Keç</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic moving Jobia Logo at bottom */}
        <ModalBottomLogo
          tagline="Jobia.az VIP Plan və Xüsusiyyətlər"
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
