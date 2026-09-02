import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, AuthSession } from '../../types';
import { 
  registerCandidateWithFirebase, 
  registerEmployerWithFirebase, 
  loginWithFirebase, 
  resetUserPasswordDirect,
  verifyCredentialsOnly,
  checkEmailRegistered,
} from '../../services/firebaseAuth';
import { 
  X, 
  User as UserIcon, 
  Building2, 
  Lock, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  ArrowRight,
  Loader2,
  RefreshCw,
  KeyRound,
  Check,
  Zap,
  Shield,
  ArrowLeft,
  UserPlus,
  HelpCircle,
  Copy,
  ClipboardCheck,
  Timer,
  Send
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
  onAuthSuccess: (user: User, session: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'candidate',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'otp-verify'>(
    initialMode === 'register' ? 'register' : 'login'
  );
  const [registerRole, setRegisterRole] = useState<'candidate' | 'business'>(
    initialRole === 'business' ? 'business' : 'candidate'
  );

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Candidate register form state
  const [candFirstName, setCandFirstName] = useState('');
  const [candLastName, setCandLastName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('+994 ');
  const [candPassword, setCandPassword] = useState('');
  const [candConfirmPassword, setCandConfirmPassword] = useState('');
  const [showCandPassword, setShowCandPassword] = useState(false);

  // Employer register form state
  const [empCompanyName, setEmpCompanyName] = useState('');
  const [empContactName, setEmpContactName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('+994 ');
  const [empDescription, setEmpDescription] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empConfirmPassword, setEmpConfirmPassword] = useState('');
  const [showEmpPassword, setShowEmpPassword] = useState(false);

  // Forgot / Reset password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP Verification state
  const [activeOtpTarget, setActiveOtpTarget] = useState<string>('');
  const [maskedOtpTarget, setMaskedOtpTarget] = useState<string>('');
  const [isEmailRealDispatched, setIsEmailRealDispatched] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<'login' | 'register' | 'password_reset'>('login');
  const [pendingActionType, setPendingActionType] = useState<'login' | 'candidate_register' | 'employer_register' | 'forgot'>('login');
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  // OTP 6 Digits State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode === 'register' ? 'register' : 'login');
      setRegisterRole(initialRole === 'business' ? 'business' : 'candidate');
      setErrorMsg(null);
      setSuccessMsg(null);
      setOtpDigits(['', '', '', '', '', '']);
    }
  }, [isOpen, initialMode, initialRole]);

  // OTP Countdown timer
  useEffect(() => {
    if (mode !== 'otp-verify' || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, secondsRemaining]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Phone auto formatter helper
  const handlePhoneFormat = (raw: string, setter: (v: string) => void) => {
    let cleaned = raw.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+994')) {
      cleaned = '+994 ' + cleaned.replace(/^\+?994?/, '');
    }
    setter(cleaned);
  };

  // Password strength calculation
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  // Quick Demo Account Auto-Fill
  const handleSelectDemoAccount = (role: 'admin' | 'business' | 'candidate') => {
    setMode('login');
    setErrorMsg(null);
    setSuccessMsg(null);

    if (role === 'admin') {
      setLoginEmail('admin@jobia.az');
      setLoginPassword('Admin@2026!');
    } else if (role === 'business') {
      setLoginEmail('hr@kapitalbank.az');
      setLoginPassword('Kapital@2026!');
    } else {
      setLoginEmail('samir.aliyev@mail.az');
      setLoginPassword('Samir@2026!');
    }
  };

  // -------------------------------------------------------------
  // Internal Helper: Send OTP & Transition to Verification Step
  // -------------------------------------------------------------
  const triggerOtpStep = async (
    targetEmail: string,
    purpose: 'login' | 'register' | 'password_reset',
    actionType: 'login' | 'candidate_register' | 'employer_register' | 'forgot',
    payload: any
  ) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = targetEmail.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          purpose,
          channel: 'email',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Təsdiq kodu göndərilərkən xəta baş verdi.');
      }

      setActiveOtpTarget(cleanEmail);
      setMaskedOtpTarget(data.maskedTarget || cleanEmail);
      setIsEmailRealDispatched(Boolean(data.emailSentReal));
      setOtpPurpose(purpose);
      setPendingActionType(actionType);
      setPendingPayload(payload);
      setOtpDigits(['', '', '', '', '', '']);
      setSecondsRemaining(data.expiresInSeconds || 300);
      setResendCooldown(30);

      setMode('otp-verify');
      setSuccessMsg(
        data.emailSentReal
          ? `6 rəqəmli OTP kodu ${data.maskedTarget || cleanEmail} ünvanına göndərildi. Gələnlər qutusunu yoxlayın.`
          : `6 rəqəmli təhlükəsizlik kodu e-poçtunuza göndərildi.`
      );

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP təsdiq kodu göndərilə bilmədi.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 1. Direct Login Submission (Triggers OTP)
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Zəhmət olmasa e-poçt və şifrənizi daxil edin.');
      return;
    }

    setLoading(true);
    try {
      // Pre-check credentials to prevent sending OTP for incorrect passwords
      const check = await verifyCredentialsOnly(loginEmail, loginPassword);
      if (!check.valid) {
        throw new Error(check.error || 'E-poçt və ya şifrə yanlışdır.');
      }

      // Credentials are valid -> Send OTP code to email!
      await triggerOtpStep(
        loginEmail,
        'login',
        'login',
        { email: loginEmail.trim().toLowerCase(), password: loginPassword, rememberMe }
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Daxil olarkən xəta baş verdi.');
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 2. Direct Candidate Registration (Triggers OTP)
  // -------------------------------------------------------------
  const handleCandidateRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!candFirstName.trim() || !candLastName.trim() || !candEmail.trim() || !candPassword.trim()) {
      setErrorMsg('Zəhmət olmasa tələb olunan bütün sahələri doldurun.');
      return;
    }

    if (candPassword.length < 6) {
      setErrorMsg('Şifrə ən azı 6 simvoldan ibarət olmalıdır.');
      return;
    }

    if (candPassword !== candConfirmPassword) {
      setErrorMsg('Daxil etdiyiniz şifrələr uyğun gəlmir.');
      return;
    }

    setLoading(true);
    try {
      const isTaken = await checkEmailRegistered(candEmail);
      if (isTaken) {
        throw new Error('Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib. Zəhmət olmasa daxil olun.');
      }

      // Send OTP code to email
      await triggerOtpStep(
        candEmail,
        'register',
        'candidate_register',
        {
          firstName: candFirstName.trim(),
          lastName: candLastName.trim(),
          email: candEmail.trim().toLowerCase(),
          phone: candPhone.trim(),
          password: candPassword,
        }
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Qeydiyyat zamanı xəta baş verdi.');
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 3. Direct Employer Registration (Triggers OTP)
  // -------------------------------------------------------------
  const handleEmployerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!empCompanyName.trim() || !empContactName.trim() || !empEmail.trim() || !empPassword.trim()) {
      setErrorMsg('Zəhmət olmasa tələb olunan bütün sahələri doldurun.');
      return;
    }

    if (empPassword.length < 6) {
      setErrorMsg('Şifrə ən azı 6 simvoldan ibarət olmalıdır.');
      return;
    }

    if (empPassword !== empConfirmPassword) {
      setErrorMsg('Daxil etdiyiniz şifrələr uyğun gəlmir.');
      return;
    }

    setLoading(true);
    try {
      const isTaken = await checkEmailRegistered(empEmail);
      if (isTaken) {
        throw new Error('Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib. Zəhmət olmasa daxil olun.');
      }

      // Send OTP code to email
      await triggerOtpStep(
        empEmail,
        'register',
        'employer_register',
        {
          companyName: empCompanyName.trim(),
          contactName: empContactName.trim(),
          email: empEmail.trim().toLowerCase(),
          phone: empPhone.trim(),
          password: empPassword,
          description: empDescription.trim(),
        }
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Qeydiyyat zamanı xəta baş verdi.');
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 4. Direct Password Reset ("Şifrəni unutmusunuz?") (Triggers OTP)
  // -------------------------------------------------------------
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotEmail.trim()) {
      setErrorMsg('Qeydiyyatdan keçdiyiniz e-poçt ünvanını daxil edin.');
      return;
    }

    if (!forgotNewPassword.trim()) {
      setErrorMsg('Zəhmət olmasa yeni şifrənizi təyin edin.');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setErrorMsg('Yeni şifrə ən azı 6 simvoldan ibarət olmalıdır.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg('Daxil etdiyiniz yeni şifrələr uyğun gəlmir.');
      return;
    }

    setLoading(true);
    try {
      // Send OTP code to email for password reset
      await triggerOtpStep(
        forgotEmail,
        'password_reset',
        'forgot',
        {
          email: forgotEmail.trim().toLowerCase(),
          newPassword: forgotNewPassword,
        }
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Şifrə yeniləmə kodu göndərilərkən xəta baş verdi.');
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 5. OTP Digit Inputs & Final Verification
  // -------------------------------------------------------------
  const handleOtpDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Pasted full code or chunk
      const clean = val.replace(/\D/g, '').slice(0, 6);
      if (clean.length > 0) {
        const nextDigits = ['', '', '', '', '', ''];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = clean[i] || '';
        }
        setOtpDigits(nextDigits);
        const focusIdx = Math.min(clean.length, 5);
        otpInputRefs.current[focusIdx]?.focus();

        if (clean.length === 6) {
          executeFinalOtpVerification(clean);
        }
        return;
      }
    }

    const cleanDigit = val.replace(/\D/g, '');
    const nextDigits = [...otpDigits];
    nextDigits[index] = cleanDigit;
    setOtpDigits(nextDigits);

    if (cleanDigit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit on last digit filled
    if (cleanDigit && index === 5) {
      const code = nextDigits.join('');
      if (code.length === 6) {
        executeFinalOtpVerification(code);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const clean = text.replace(/\D/g, '').slice(0, 6);
      if (clean.length > 0) {
        const nextDigits = ['', '', '', '', '', ''];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = clean[i] || '';
        }
        setOtpDigits(nextDigits);
        if (clean.length === 6) {
          executeFinalOtpVerification(clean);
        } else {
          otpInputRefs.current[clean.length]?.focus();
        }
      }
    } catch {}
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading || !activeOtpTarget) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activeOtpTarget,
          purpose: otpPurpose,
          channel: 'email',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Kod göndərilərkən xəta baş verdi.');
      }
      setSecondsRemaining(data.expiresInSeconds || 300);
      setResendCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);
      setIsEmailRealDispatched(Boolean(data.emailSentReal));
      setSuccessMsg(`Yeni 6 rəqəmli təsdiq kodu ${data.maskedTarget || activeOtpTarget} ünvanına göndərildi.`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMsg(err.message || 'Yeni kod göndərilərkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  const executeFinalOtpVerification = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpDigits.join('')).trim();
    if (code.length !== 6) {
      setErrorMsg('Zəhmət olmasa 6 rəqəmli təhlükəsizlik kodunu tam daxil edin.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Verify OTP with Server
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activeOtpTarget,
          code,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.verified) {
        throw new Error(
          data.error || 'Daxil etdiyiniz təhlükəsizlik kodu yanlışdır. E-poçtdakı düzgün kodu yazmasanız daxil olmaq və ya qeydiyyat mümkün deyil.'
        );
      }

      setSuccessMsg('✅ Təhlükəsizlik kodu uğurla təsdiqləndi! Xoş gəldiniz...');

      // 2. Finalize Pending Authentication / Registration
      if (pendingActionType === 'login') {
        const { user, session } = await loginWithFirebase(pendingPayload.email, pendingPayload.password);
        setTimeout(() => {
          onAuthSuccess(user, session);
          onClose();
        }, 500);
      } else if (pendingActionType === 'candidate_register') {
        const { user, session } = await registerCandidateWithFirebase(pendingPayload);
        setTimeout(() => {
          onAuthSuccess(user, session);
          onClose();
        }, 500);
      } else if (pendingActionType === 'employer_register') {
        const { user, session } = await registerEmployerWithFirebase(pendingPayload);
        setTimeout(() => {
          onAuthSuccess(user, session);
          onClose();
        }, 500);
      } else if (pendingActionType === 'forgot') {
        await resetUserPasswordDirect(pendingPayload.email, pendingPayload.newPassword);
        setSuccessMsg('Şifrəniz uğurla yeniləndi! İndi daxil ola bilərsiniz.');
        setLoginEmail(pendingPayload.email);
        setLoginPassword(pendingPayload.newPassword);
        setTimeout(() => {
          setMode('login');
          setErrorMsg(null);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Təsdiq kodu yanlışdır və ya müddəti bitib.');
    } finally {
      setLoading(false);
    }
  };

  const candStrength = calculatePasswordStrength(candPassword);
  const empStrength = calculatePasswordStrength(empPassword);

  const otpMinutes = Math.floor(secondsRemaining / 60);
  const otpSeconds = secondsRemaining % 60;
  const formattedOtpTime = `${otpMinutes.toString().padStart(2, '0')}:${otpSeconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] rounded-2xl shadow-2xl border border-slate-200 flex flex-col relative my-auto overflow-hidden">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Bağla"
          aria-label="Pəncərəni bağla"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center justify-between mb-1.5 pr-8">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
                {mode === 'login' && 'Təhlükəsiz Giriş Portalı'}
                {mode === 'register' && 'Yeni Hesab Qeydiyyatı'}
                {mode === 'forgot' && 'Şifrənin Yenilənməsi'}
                {mode === 'otp-verify' && 'Məcburi E-poçt OTP Təsdiqi'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>2FA Qorunması</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(mode === 'forgot' || mode === 'otp-verify') && (
              <button
                type="button"
                onClick={() => {
                  if (mode === 'otp-verify') {
                    if (pendingActionType === 'login') setMode('login');
                    else if (pendingActionType === 'forgot') setMode('forgot');
                    else setMode('register');
                  } else {
                    setMode('login');
                  }
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="p-1 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Geri qayıt"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri</span>
              </button>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 pr-6 truncate">
              {mode === 'login' && 'Hesabınıza Daxil Olun'}
              {mode === 'register' && 'Yeni Hesab Yaradın'}
              {mode === 'forgot' && 'Yeni Şifrə Təyin Edin'}
              {mode === 'otp-verify' && 'E-poçt Təsdiq Kodunu Daxil Edin'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {mode === 'login' && 'E-poçt və şifrənizi daxil edin. Təsdiq kodu e-poçtunuza göndəriləcək.'}
            {mode === 'register' && 'Məlumatlarınızı daxil edin. Qeydiyyatı təsdiqləmək üçün e-poçtunuza kod göndəriləcək.'}
            {mode === 'forgot' && 'Qeydiyyatlı e-poçt ünvanınızı və yeni şifrənizi daxil edərək dərhal yeniləyin.'}
            {mode === 'otp-verify' && (
              <span>
                <strong className="text-slate-800 font-semibold">{maskedOtpTarget || activeOtpTarget}</strong> e-poçtuna göndərilən 6 rəqəmli OTP kodunu yazın.
              </span>
            )}
          </p>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && mode !== 'otp-verify' && (
            <div className="flex items-center p-1 bg-slate-200/80 rounded-xl mt-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-all text-center cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daxil Ol
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-all text-center cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Qeydiyyatdan Keç
              </button>
            </div>
          )}
        </div>

        {/* Quick Demo Credentials Bar for Fast 1-Click Testing */}
        {mode === 'login' && (
          <div className="px-4 sm:px-6 py-2 bg-emerald-50/70 border-b border-emerald-100 flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sürətli Test Girişi (1 Kliklə):</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectDemoAccount('admin')}
                className="text-[11px] bg-white hover:bg-emerald-100/70 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
              >
                👑 <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemoAccount('business')}
                className="text-[11px] bg-white hover:bg-emerald-100/70 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
              >
                🏢 <span>İşəgötürən</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemoAccount('candidate')}
                className="text-[11px] bg-white hover:bg-emerald-100/70 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
              >
                👤 <span>Namizəd</span>
              </button>
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fade-in shrink-0">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
            {mode === 'login' && (errorMsg.includes('şifrə') || errorMsg.includes('Şifrənizi')) && (
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(loginEmail);
                  setMode('forgot');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold shrink-0 cursor-pointer shadow-2xs transition-colors text-center flex items-center justify-center gap-1"
              >
                <span>Şifrəni Yenilə</span>
                <span>🔑</span>
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Modal Body with internal smooth scrolling */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          
          {/* ============================================================== */}
          {/* 1. LOGIN FORM */}
          {/* ============================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  E-poçt ünvanı *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ad@shirket.az və ya mail@domen.az"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a859]/20 focus:border-[#00a859] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Şifrə *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline cursor-pointer"
                  >
                    Şifrəni unutmusunuz?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a859]/20 focus:border-[#00a859] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-600 font-medium">Məni xatırla (30 gün)</span>
                </label>

                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>OTP E-poçt Təsdiqli</span>
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#00a859] hover:bg-[#00964f] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{loading ? 'Yoxlanılır və OTP göndərilir...' : 'Daxil Ol və OTP Kodu Al'}</span>
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Hesabınız yoxdur?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Qeydiyyatdan Keçin
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* 2. REGISTRATION FORM */}
          {/* ============================================================== */}
          {mode === 'register' && (
            <div className="space-y-4">
              {/* Role Selection Buttons */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRegisterRole('candidate')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
                    registerRole === 'candidate'
                      ? 'bg-[#00a859] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Namizəd Kimi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('business')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
                    registerRole === 'business'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">İşəgötürən Kimi</span>
                </button>
              </div>

              {/* CANDIDATE REGISTRATION */}
              {registerRole === 'candidate' && (
                <form onSubmit={handleCandidateRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ad *</label>
                      <input
                        type="text"
                        required
                        value={candFirstName}
                        onChange={(e) => setCandFirstName(e.target.value)}
                        placeholder="Samir"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a859]/20 focus:border-[#00a859]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Soyad *</label>
                      <input
                        type="text"
                        required
                        value={candLastName}
                        onChange={(e) => setCandLastName(e.target.value)}
                        placeholder="Əliyev"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a859]/20 focus:border-[#00a859]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">E-poçt ünvanı * (OTP bu ünvana göndəriləcək)</label>
                    <input
                      type="email"
                      required
                      value={candEmail}
                      onChange={(e) => setCandEmail(e.target.value)}
                      placeholder="ad.soyad@mail.az"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a859]/20 focus:border-[#00a859]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Əlaqə Nömrəsi *</label>
                    <input
                      type="tel"
                      required
                      value={candPhone}
                      onChange={(e) => handlePhoneFormat(e.target.value, setCandPhone)}
                      placeholder="+994 50 123 45 67"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a859]/20 focus:border-[#00a859]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Şifrə *</label>
                      <div className="relative">
                        <input
                          type={showCandPassword ? 'text' : 'password'}
                          required
                          value={candPassword}
                          onChange={(e) => setCandPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a859]/20 focus:border-[#00a859]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCandPassword(!showCandPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          {showCandPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Təkrar Şifrə *</label>
                      <input
                        type="password"
                        required
                        value={candConfirmPassword}
                        onChange={(e) => setCandConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a859]/20 focus:border-[#00a859]"
                      />
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {candPassword.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Şifrə təhlükəsizliyi:</span>
                        <span className={`font-bold ${
                          candStrength <= 1 ? 'text-red-600' : candStrength === 2 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {candStrength <= 1 ? 'Zəif' : candStrength === 2 ? 'Orta' : candStrength === 3 ? 'Yaxşı' : 'Güclü'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                        <div className={`h-full flex-1 rounded-full transition-all ${candStrength >= 1 ? (candStrength === 1 ? 'bg-red-500' : candStrength === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all ${candStrength >= 2 ? (candStrength === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all ${candStrength >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all ${candStrength >= 4 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 bg-[#00a859] hover:bg-[#00964f] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{loading ? 'OTP Kodu Göndərilir...' : 'Qeydiyyatdan Keç və OTP Al'}</span>
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                      Artıq hesabınız var?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        Daxil Olun
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* EMPLOYER REGISTRATION */}
              {registerRole === 'business' && (
                <form onSubmit={handleEmployerRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Şirkətin Rəsmi Adı *</label>
                    <input
                      type="text"
                      required
                      value={empCompanyName}
                      onChange={(e) => setEmpCompanyName(e.target.value)}
                      placeholder="Məs: Pasha Holding MMC"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Əlaqədar Şəxs (HR) *</label>
                      <input
                        type="text"
                        required
                        value={empContactName}
                        onChange={(e) => setEmpContactName(e.target.value)}
                        placeholder="Nigar Əhmədova"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Əlaqə Nömrəsi *</label>
                      <input
                        type="tel"
                        required
                        value={empPhone}
                        onChange={(e) => handlePhoneFormat(e.target.value, setEmpPhone)}
                        placeholder="+994 12 500 00 00"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Şirkət E-poçtu * (OTP bu ünvana göndəriləcək)</label>
                    <input
                      type="email"
                      required
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      placeholder="hr@shirket.az"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Şifrə *</label>
                      <div className="relative">
                        <input
                          type={showEmpPassword ? 'text' : 'password'}
                          required
                          value={empPassword}
                          onChange={(e) => setEmpPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEmpPassword(!showEmpPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          {showEmpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Təkrar Şifrə *</label>
                      <input
                        type="password"
                        required
                        value={empConfirmPassword}
                        onChange={(e) => setEmpConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
                      />
                    </div>
                  </div>

                  {empPassword.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Şifrə təhlükəsizliyi:</span>
                        <span className={`font-bold ${
                          empStrength <= 1 ? 'text-red-600' : empStrength === 2 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {empStrength <= 1 ? 'Zəif' : empStrength === 2 ? 'Orta' : empStrength === 3 ? 'Yaxşı' : 'Güclü'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                        <div className={`h-full flex-1 rounded-full transition-all ${empStrength >= 1 ? (empStrength === 1 ? 'bg-red-500' : empStrength === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all ${empStrength >= 2 ? (empStrength === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all ${empStrength >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all ${empStrength >= 4 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{loading ? 'OTP Kodu Göndərilir...' : 'Şirkəti Qeydiyyatdan Keçir və OTP Al'}</span>
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                      Artıq hesabınız var?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        Daxil Olun
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. DIRECT PASSWORD RESET ("Şifrəni unutmusunuz?") */}
          {/* ============================================================== */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Qeydiyyatlı E-poçt ünvanınız *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ad@shirket.az və ya mail@domen.az"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a859]/20 focus:border-[#00a859]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Yeni Şifrə * (Ən azı 6 simvol)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Yeni güclü şifrə daxil edin"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a859]/20 focus:border-[#00a859]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Yeni Şifrənin Təkrarı *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Yeni şifrəni təkrar yazın"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a859]/20 focus:border-[#00a859]"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 text-xs text-slate-600">
                <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  Şifrənizi yeniləmək üçün e-poçtunuza 6 rəqəmli OTP təsdiq kodu göndəriləcək.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#00a859] hover:bg-[#00964f] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{loading ? 'OTP Kodu Göndərilir...' : 'Şifrəni Yenilə və OTP Kodu Al'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-full text-center text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer py-1"
              >
                ← Giriş pəncərəsinə qayıt
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* 4. MANDATORY OTP VERIFICATION STEP */}
          {/* ============================================================== */}
          {mode === 'otp-verify' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-center">
                <div className="w-11 h-11 mx-auto rounded-xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {pendingActionType === 'login' && 'Girişi Tamamlamaq Üçün Təsdiq Kodu'}
                  {pendingActionType === 'candidate_register' && 'Namizəd Qeydiyyatı Üçün Təsdiq Kodu'}
                  {pendingActionType === 'employer_register' && 'Şirkət Qeydiyyatı Üçün Təsdiq Kodu'}
                  {pendingActionType === 'forgot' && 'Şifrə Sıfırlamaq Üçün Təsdiq Kodu'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  <strong className="text-emerald-950 font-bold">{maskedOtpTarget || activeOtpTarget}</strong> e-poçtuna göndərilən 6 rəqəmli OTP kodunu aşağıdakı xanalara daxil edin.
                </p>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                  <span className="font-bold text-slate-700">6 Rəqəmli Kod *</span>
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kodu Yapışdır</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasteData = e.clipboardData.getData('text');
                        handleOtpDigitChange(idx, pasteData);
                      }}
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:outline-hidden transition-all shadow-2xs font-mono"
                      aria-label={`Rəqəm ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Timer & Resend */}
              <div className="flex items-center justify-between text-xs py-1 px-1 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                  <Timer className="w-4 h-4 text-emerald-600" />
                  <span>Vaxt:</span>
                  <span className={`font-mono font-bold ${secondsRemaining < 60 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
                    {formattedOtpTime}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-emerald-600 hover:text-emerald-800 font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `Yenidən göndər (${resendCooldown}s)` : 'Kodu Yenidən Göndər'}
                  </span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => executeFinalOtpVerification()}
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="w-full py-2.5 bg-[#00a859] hover:bg-[#00964f] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>
                    {loading
                      ? 'Yoxlanılır...'
                      : pendingActionType === 'login'
                      ? 'Kodu Təsdiq Et və Daxil Ol'
                      : pendingActionType === 'forgot'
                      ? 'Kodu Təsdiq Et və Şifrəni Yenilə'
                      : 'Kodu Təsdiq Et və Qeydiyyatı Tamamla'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (pendingActionType === 'login') setMode('login');
                    else if (pendingActionType === 'forgot') setMode('forgot');
                    else setMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer py-1"
                >
                  ← E-poçtu və ya şifrəni dəyişmək üçün geri qayıt
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Footer Note with Animated Moving Logo */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/50">
          <ModalBottomLogo
            tagline="Jobia.az Təhlükəsiz Giriş və Şifrələnmiş Məlumat Bazası"
            variant="slate"
            size="xs"
          />
        </div>
      </div>
    </div>
  );
};

