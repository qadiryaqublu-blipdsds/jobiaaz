import React, { useState } from 'react';
import { SubscriptionPlan, BillingCycle, User, UserRole, UserSubscription } from '../../types';
import { processCardPayment, formatCardNumber } from '../../services/paymentService';
import { applySubscriptionUpgrade } from '../../services/subscriptionService';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ArrowRight,
  Zap,
  Building2,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  currentUser: User | null;
  currentRole: UserRole;
  onSuccess: (newSubscription: UserSubscription) => void;
  onRequireAuth?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  billingCycle,
  currentUser,
  currentRole,
  onSuccess,
  onRequireAuth,
}) => {
  const [cycle, setCycle] = useState<BillingCycle>(billingCycle);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser?.fullName || '');
  const [expiryMonth, setExpiryMonth] = useState('12');
  const [expiryYear, setExpiryYear] = useState('28');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txReceipt, setTxReceipt] = useState<{ id: string; amount: number; planName: string } | null>(null);

  if (!isOpen) return null;

  const unitPrice = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const totalAmount = cycle === 'yearly' ? plan.priceYearly * 12 : plan.priceMonthly;
  const savings = cycle === 'yearly' ? (plan.priceMonthly - plan.priceYearly) * 12 : 0;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleFillTestCard = () => {
    setCardNumber('4128 5543 8921 4242');
    setCardHolder(currentUser?.fullName || 'Nərgiz Məmmədova');
    setExpiryMonth('08');
    setExpiryYear('29');
    setCvv('789');
    setErrorMsg(null);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMsg('Kart nömrəsi tam 16 rəqəm olmalıdır.');
      return;
    }

    if (!cardHolder.trim()) {
      setErrorMsg('Kart sahibinin adını qeyd edin.');
      return;
    }

    if (cvv.length < 3) {
      setErrorMsg('CVV kodu 3 rəqəm olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      // 1. Process payment with secure mock gateway
      const paymentResult = await processCardPayment(
        {
          cardNumber,
          cardHolder,
          expiryMonth,
          expiryYear,
          cvv,
          saveCard,
        },
        totalAmount,
        'AZN'
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.message);
      }

      // 2. Apply subscription upgrade in service
      const { subscription, transaction } = applySubscriptionUpgrade({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.fullName,
        role: currentUser.role,
        planId: plan.id,
        billingCycle: cycle,
        cardLast4: paymentResult.cardLast4,
        paymentMethod: paymentResult.paymentMethod,
      });

      setTxReceipt({
        id: transaction.id,
        amount: totalAmount,
        planName: plan.name,
      });

      setPaymentSuccess(true);

      setTimeout(() => {
        onSuccess(subscription);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ödəniş həyata keçirilərkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Təhlükəsiz Ödəniş Portalı
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Abunəlik Ödənişi</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {paymentSuccess ? (
            /* Success State Screen */
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Ödəniş Uğurla Tamamlandı!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  <strong>{txReceipt?.planName}</strong> abunəliyiniz dərhal aktivləşdirildi.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tranzaksiya ID:</span>
                  <span className="font-mono font-bold text-slate-800">{txReceipt?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ödənilən Məbləğ:</span>
                  <span className="font-bold text-emerald-700">{txReceipt?.amount} AZN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Uğurlu (Aktiv)
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400">Dashboard-a yönləndirilirsiniz...</p>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitPayment} className="space-y-5">
              {/* Plan Summary Card */}
              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">{plan.name}</h3>
                    {plan.badge && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{plan.tagline}</p>
                </div>

                {/* Billing toggle */}
                <div className="text-right sm:border-l sm:border-blue-200 sm:pl-4">
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-blue-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setCycle('monthly')}
                      className={`px-2 py-1 rounded-md font-bold text-[11px] transition-all ${
                        cycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Aylıq
                    </button>
                    <button
                      type="button"
                      onClick={() => setCycle('yearly')}
                      className={`px-2 py-1 rounded-md font-bold text-[11px] transition-all ${
                        cycle === 'yearly' ? 'bg-blue-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      İllik (-20%)
                    </button>
                  </div>
                  <div className="mt-1 text-right">
                    <span className="text-base font-black text-blue-700">{totalAmount} AZN</span>
                    <span className="text-[11px] text-slate-500 block">
                      {cycle === 'yearly' ? '12 aylıq cəmi ödəniş' : 'aylıq ödəniş'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Card Inputs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bank Kartı Məlumatları</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                  >
                    + Test Kartını Doldur
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="4128 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 tracking-wider focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Kart Sahibi</label>
                    <input
                      type="text"
                      required
                      placeholder="AD SOYAD"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Bitmə Tarixi</label>
                    <div className="flex items-center gap-1">
                      <select
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-600"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <span className="text-slate-400">/</span>
                      <select
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-600"
                      >
                        {['26', '27', '28', '29', '30', '31'].map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">CVV/CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 text-center focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Security badges */}
              <div className="flex items-center justify-between py-2 border-t border-b border-slate-100 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-bit SSL Təhlükəsizlik</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Visa Secure</span>
                  <span>•</span>
                  <span className="font-bold text-slate-700">Mastercard ID Check</span>
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Ödəniş həyata keçirilir...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{totalAmount} AZN Ödə və Planı Aktivləşdir</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Animated Moving Brand Logo at Modal Bottom */}
        <ModalBottomLogo
          tagline="Jobia.az Təhlükəsiz Abunəlik və Ödəniş Sistemi"
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
