import React, { useState, useEffect, useRef } from 'react';
import { User, AuthSession } from '../../types';
import { 
  verifyUserEmailCode, 
  generateAndSaveVerificationCode,
  resendVerificationEmail,
  checkAndSyncVerificationStatus,
  checkVerificationRateLimit
} from '../../services/firebaseAuth';
import { 
  X, 
  ShieldCheck, 
  Mail, 
  RefreshCw, 
  Timer, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ArrowRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface VerifyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onVerificationSuccess: (user: User, session?: AuthSession) => void;
}

export const VerifyAccountModal: React.FC<VerifyAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onVerificationSuccess,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600); // 10 minutes (600s)
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Check rate limit state
    const limitCheck = checkVerificationRateLimit(user.email);
    if (!limitCheck.allowed && limitCheck.cooldownRemaining > 0) {
      setResendCooldown(limitCheck.cooldownRemaining);
    }

    // Calculate remaining seconds if expiration date exists
    if (user.verificationCodeExpiresAt) {
      const diffSecs = Math.max(0, Math.floor((new Date(user.verificationCodeExpiresAt).getTime() - Date.now()) / 1000));
      setSecondsRemaining(diffSecs > 0 ? diffSecs : 600);
    } else {
      setSecondsRemaining(600);
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setDigits(['', '', '', '', '', '']);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
  }, [isOpen, user]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, secondsRemaining]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Pasted code
      const clean = val.replace(/\D/g, '').slice(0, 6);
      if (clean.length > 0) {
        const nextDigits = [...digits];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = clean[i] || '';
        }
        setDigits(nextDigits);
        const focusIdx = Math.min(clean.length, 5);
        inputRefs.current[focusIdx]?.focus();

        if (clean.length === 6) {
          handleVerifySubmit(nextDigits.join(''));
        }
        return;
      }
    }

    const cleanDigit = val.replace(/\D/g, '');
    const nextDigits = [...digits];
    nextDigits[index] = cleanDigit;
    setDigits(nextDigits);

    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit on last digit
    if (cleanDigit && index === 5) {
      const code = nextDigits.join('');
      if (code.length === 6) {
        handleVerifySubmit(code);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifySubmit = async (codeOverride?: string) => {
    const code = codeOverride || digits.join('');
    if (code.length !== 6) {
      setErrorMsg('Zəhmət olmasa 6 rəqəmli təsdiq kodunu tam daxil edin.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const { user: verifiedUser, session } = await verifyUserEmailCode(user.id, user.email, code);
      setSuccessMsg('Hesabınız uğurla təsdiqləndi! Xoş gəldiniz.');
      setTimeout(() => {
        onVerificationSuccess(verifiedUser, session);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Təsdiq kodu yanlışdır və ya vaxtı bitib.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await resendVerificationEmail(user.id, user.email);
      setSecondsRemaining(600); // 10 minutes reset
      setResendCooldown(res.cooldownRemaining || 60);
      setDigits(['', '', '', '', '', '']);
      setSuccessMsg(res.message || `Yeni təsdiq kodu ${user.email} ünvanına göndərildi.`);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMsg(err.message || 'Yeni kod göndərilərkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  // Check email verification link status (if user clicked link in email)
  const handleCheckEmailLinkStatus = async () => {
    setCheckingStatus(true);
    setErrorMsg(null);
    try {
      const res = await checkAndSyncVerificationStatus(user.id);
      if (res.verified && res.user) {
        setSuccessMsg('E-poçt təsdiqlənməsi aşkar edildi! Hesabınız aktivləşdirildi.');
        setTimeout(() => {
          onVerificationSuccess(res.user!);
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Status yoxlanılarkən xəta baş verdi.');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Mask email for privacy
  const parts = user.email.split('@');
  const maskedEmail = parts[0].length > 2 
    ? `${parts[0][0]}***${parts[0][parts[0].length - 1]}@${parts[1]}` 
    : `${parts[0]}*@${parts[1]}`;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] rounded-2xl shadow-2xl border border-slate-200 flex flex-col relative my-auto overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 transition-colors cursor-pointer"
          title="Bağla"
          aria-label="Pəncərəni bağla"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 bg-slate-50/90 text-center shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2 sm:mb-3 shadow-2xs">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-[#0b1b2b]">
            Hesabınızı Təsdiqləyin
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Təhlükəsizlik məqsədilə <strong className="text-slate-800 font-semibold">{maskedEmail}</strong> ünvanına 6 rəqəmli kod göndərildi.
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fade-in shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Modal Body with internal scrolling */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          {/* 6 Digit Input Group */}
          <div>
            <label className="block text-center text-xs font-bold text-slate-700 mb-2">
              6 Rəqəmli Təsdiq Kodunu Daxil Edin
            </label>
            <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-2.5 max-w-full overflow-x-auto py-1">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={idx === 0 ? 6 : 1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-9 h-11 xs:w-10 xs:h-12 sm:w-12 sm:h-14 text-center text-base sm:text-xl font-mono font-bold rounded-xl border transition-all ${
                    digit
                      ? 'border-[#00a859] bg-emerald-50/30 text-emerald-950 shadow-xs'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Expiration Timer & Resend Button */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <Timer className={`w-4 h-4 ${secondsRemaining < 60 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
              <span>
                Etibarlılıq: <strong className={`font-mono font-bold ${secondsRemaining < 60 ? 'text-red-600' : 'text-slate-800'}`}>{formattedTime}</strong>
              </span>
            </div>

            <button
              type="button"
              disabled={resendCooldown > 0 || loading}
              onClick={handleResendCode}
              className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0 ? `Yenidən (${resendCooldown}s)` : 'Kodu Yenidən Göndər'}
              </span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => handleVerifySubmit()}
            disabled={loading || digits.join('').length !== 6 || secondsRemaining <= 0}
            className="w-full py-2.5 sm:py-3 bg-[#00a859] hover:bg-[#00964f] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{loading ? 'Təsdiqlənir...' : 'Hesabı Təsdiqlə və Daxil Ol'}</span>
          </button>

          {/* Alternative Email Link Check */}
          <div className="pt-2 border-t border-slate-100 flex flex-col items-center">
            <button
              type="button"
              onClick={handleCheckEmailLinkStatus}
              disabled={checkingStatus}
              className="text-xs font-semibold text-slate-600 hover:text-emerald-600 flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin text-emerald-600' : 'text-slate-400'}`} />
              <span>E-poçtdakı linkə klikləmişəm (Statusu Yoxla)</span>
            </button>
          </div>
        </div>

        {/* Security Footer Note with Animated Moving Logo */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/50">
          <ModalBottomLogo
            tagline="Jobia.az Firebase Təhlükəsiz Hesab Təsdiqi"
            variant="slate"
            size="xs"
          />
        </div>
      </div>
    </div>
  );
};

