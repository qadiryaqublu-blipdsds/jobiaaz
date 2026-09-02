import React, { useState } from 'react';
import { 
  SubscriptionPlan, 
  BillingCycle, 
  UserRole, 
  User, 
  UserSubscription 
} from '../../types';
import { SUBSCRIPTION_PLANS } from '../../services/subscriptionService';
import { 
  Check, 
  Sparkles, 
  Zap, 
  Building2, 
  User as UserIcon, 
  ShieldCheck, 
  HelpCircle,
  ArrowLeft,
  Lock,
  ChevronRight,
  Flame
} from 'lucide-react';

interface PricingPageProps {
  currentUser: User | null;
  currentRole: UserRole;
  currentSubscription: UserSubscription | null;
  onSelectPlan: (plan: SubscriptionPlan, cycle: BillingCycle) => void;
  onBack: () => void;
  onRequireAuth: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  currentUser,
  currentRole,
  currentSubscription,
  onSelectPlan,
  onBack,
  onRequireAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'business' | 'candidate'>(
    currentRole === 'business' ? 'business' : 'candidate'
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');

  const employerPlans = SUBSCRIPTION_PLANS.filter((p) => p.role === 'business');
  const candidatePlans = SUBSCRIPTION_PLANS.filter((p) => p.role === 'candidate');

  const plansToShow = activeTab === 'business' ? employerPlans : candidatePlans;

  const handlePlanClick = (plan: SubscriptionPlan) => {
    if (plan.tier === 'FREE') {
      return; // Already free
    }
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    onSelectPlan(plan, billingCycle);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in">
      {/* Top Header Section */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="w-full max-w-full mx-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Əvvəlki səhifəyə qayıt</span>
          </button>

          <div className="text-center max-w-4xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Şəffaf və Sərfəli Qiymətlər</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              İşə Qəbulu və Karyeranızı Sürətləndirin
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              İşəgötürənlər üçün güclü AI rekrutinq alətləri, namizədlər üçün isə arzulanan işi tapmaq üçün karyera həlləri.
            </p>

            {/* Role Switcher: Employer vs Candidate */}
            <div className="flex justify-center pt-2">
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('business')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'business'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-slate-800" />
                  <span>İşəgötürənlər üçün</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('candidate')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'candidate'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <span>Namizədlər üçün</span>
                </button>
              </div>
            </div>

            {/* Monthly vs Yearly Billing Toggle */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
                Aylıq Ödəniş
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-12 h-6 bg-blue-600 rounded-full p-1 transition-colors relative cursor-pointer"
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}>
                <span>İllik Ödəniş</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                  -20% Qənaət
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 mt-10">
        <div className={`grid gap-6 ${plansToShow.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-4xl mx-auto'}`}>
          {plansToShow.map((plan) => {
            const isCurrent = currentSubscription?.tier === plan.tier && (
              (activeTab === 'business' && currentRole === 'business') ||
              (activeTab === 'candidate' && currentRole === 'candidate')
            );
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl transition-all relative flex flex-col justify-between ${
                  plan.isPopular
                    ? 'bg-white border-2 border-blue-600 shadow-xl ring-4 ring-blue-600/10'
                    : 'bg-white border border-slate-200 shadow-xs hover:shadow-md'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div className="p-6">
                  {/* Title & Tagline */}
                  <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mt-4 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900">
                        {price} AZN
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ay</span>
                    </div>
                    {billingCycle === 'yearly' && plan.priceMonthly > 0 && (
                      <span className="text-[11px] text-emerald-600 font-bold block mt-1">
                        İllik {plan.priceYearly * 12} AZN (Aylıq hesablandıqda {plan.priceMonthly} AZN yerinə)
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="mt-6 space-y-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Paketə Daxildir:
                    </span>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-0">
                  {isCurrent ? (
                    <div className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl text-center border border-slate-200 flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Cari Aktiv Planınız</span>
                    </div>
                  ) : plan.tier === 'FREE' ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl text-center border border-slate-200 cursor-not-allowed"
                    >
                      Baza Paketi
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePlanClick(plan)}
                      className={`w-full py-3 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        plan.isPopular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>{plan.tier}-a Yüksəlt</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise & Custom Inquiries Banner */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Xüsusi Korporativ və ya Holdinq Tələbləriniz Var?</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              100-dən çox vakansiya, API inteqrasiyası və fərdi ATS sinxronizasiyası üçün korporativ satış komandamız ilə əlaqə saxlayın.
            </p>
          </div>
          <a
            href="mailto:support@jobia.az"
            className="px-6 py-2.5 bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs rounded-xl shrink-0 transition-colors"
          >
            Korporativ Təklif Al
          </a>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-slate-900 text-center">Tez-Tez Verilən Suallar</h2>
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 mb-1">Ödənişi hansı üsullarla edə bilərəm?</h4>
              <p className="text-xs text-slate-600">
                Bütün yerli və xarici bank kartları (Birbank Visa, Mastercard, Leobank, ABB və s.) vasitəsilə 256-bit SSL təhlükəsizliyi ilə dərhal ödəniş edə bilərsiniz.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 mb-1">Abunəliyimi istədiyim vaxt dayandıra bilərəmmi?</h4>
              <p className="text-xs text-slate-600">
                Bəli, istənilən vaxt profilinizdən və ya dəstək xidmətindən abunəliyi ləğv edə bilərsiniz. Ödənilmiş müddət bitənə qədər bütün imkanlar aktiv qalacaq.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 mb-1">Namizədlər üçün ödəniş etmək məcburidirmi?</h4>
              <p className="text-xs text-slate-600">
                Xeyr! Namizədlər üçün CV yaratmaq, vakansiyaları axtarmaq və müraciət etmək tamamilə pulsuzdur. Yalnız AI ATS analizi və qabaqcıl hazırlıq alətləri Premium paketinə daxildir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
