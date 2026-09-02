import React, { useState, useEffect } from 'react';
import { 
  Application, 
  Company, 
  HiringDecision, 
  JobOffer, 
  JobOfferTemplate, 
  OfferEmploymentType, 
  ProbationPeriod, 
  OfferStatus,
  OfferAuditLog
} from '../../types';
import { calculateNetSalary, calculateGrossFromNet } from '../../services/salaryCalculator';
import { getOfferTemplates, populateOfferTemplate } from '../../services/offerTemplateService';
import { validateOfferBeforeSending, buildOfferEmailContent, sendJobOfferEmail } from '../../services/emailService';
import { downloadJobOfferPDF } from '../../services/offerPdfService';
import { OfferDocumentView } from './OfferDocumentView';
import { ModalBottomLogo } from '../ModalBottomLogo';
import { 
  X, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ChevronRight, 
  ChevronLeft, 
  Calculator, 
  FileText, 
  UserCheck, 
  ThumbsUp, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  Edit3, 
  Eye, 
  Check, 
  Mail,
  Loader2
} from 'lucide-react';

interface InterviewModalProps {
  application: Application;
  company: Company;
  existingOffer?: JobOffer;
  onClose: () => void;
  onSaveOffer: (offer: JobOffer, auditLog: OfferAuditLog) => void;
  onUpdateAppStatus: (appId: string, status: any, recruiterNotes?: string) => void;
}

export const InterviewModal: React.FC<InterviewModalProps> = ({
  application,
  company,
  existingOffer,
  onClose,
  onSaveOffer,
  onUpdateAppStatus,
}) => {
  // Step navigation: 1: Evaluation, 2: Decision, 3: Offer Terms, 4: AI Draft & Edit, 5: Review & Send
  const [currentStep, setCurrentStep] = useState<number>(existingOffer ? 4 : 1);

  // 1. Interview Evaluation state
  const [interviewerName, setInterviewerName] = useState(company.hrContactName || 'HR Meneceri');
  const [ratings, setRatings] = useState({
    technicalSkills: 4,
    relevantExperience: 4,
    communication: 5,
    problemSolving: 4,
    teamwork: 4,
    leadership: 3,
    culturalFit: 5,
    motivation: 5,
  });
  const [strengths, setStrengths] = useState('Geniş təcrübə, güclü analitik düşüncə və komanda yönümlü yanaşma.');
  const [weaknesses, setWeaknesses] = useState('Daxili spesifik sistemlərə uyğunlaşma üçün ilkin adaptasiya təlimi faydalı olacaq.');
  const [interviewNotes, setInterviewNotes] = useState('Namizəd portfoliosundakı layihələri ətraflı izah etdi, suallara peşəkar və dürüst cavab verdi.');
  const [redFlags, setRedFlags] = useState('');
  const [recommendation, setRecommendation] = useState('Namizəd komandaya yüksək dəyər qatacaq, iş təklifi verilməsi tövsiyə edilir.');
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // 2. Hiring Decision
  const [decision, setDecision] = useState<HiringDecision>('Hire');

  // 3. Offer Details Form
  const [position, setPosition] = useState(application.vacancyTitle || 'Mütəxəssis');
  const [department, setDepartment] = useState('İnformasiya Texnologiyaları');
  const [employmentType, setEmploymentType] = useState<OfferEmploymentType>('Full-time');
  const [workLocation, setWorkLocation] = useState(company.location || 'Bakı, Azərbaycan');
  
  // Default start date: 2 weeks from now
  const defaultStartDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };
  const [startDate, setStartDate] = useState(defaultStartDate());
  
  const [grossSalary, setGrossSalary] = useState<number>(2500);
  const [netSalary, setNetSalary] = useState<number>(calculateNetSalary(2500).net);
  const [probationPeriod, setProbationPeriod] = useState<ProbationPeriod>('3 months');
  const [workingSchedule, setWorkingSchedule] = useState('Bazar ertəsi - Cümə, 09:00 - 18:00');
  const [annualLeave, setAnnualLeave] = useState('21 təqvim günü');
  const [bonus, setBonus] = useState('KPI və fərdi nəticələrə əsaslanan rüblük/illik performans bonusu');
  const [benefits, setBenefits] = useState<string[]>([
    'Könüllü Tibbi Sığorta (Ailə üzvü daxil)',
    'Nahar kompensasiyası (Meal allowance)',
    'Peşəkar sertifikasiya və təlim büdcəsi',
    'Korporativ mobil nömrə və limitsiz internet',
  ]);
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [additionalTerms, setAdditionalTerms] = useState(
    'Əmək münasibətləri Azərbaycan Respublikasının Əmək Məcəlləsinə tam uyğun olaraq rəsmiləşdirilir.'
  );

  // 4. Template & AI Generation state
  const [templates, setTemplates] = useState<JobOfferTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('template-az-standard');
  const [offerLanguage, setOfferLanguage] = useState<'az' | 'en'>('az');
  const [generatedOfferBody, setGeneratedOfferBody] = useState<string>('');
  const [isGeneratingOffer, setIsGeneratingOffer] = useState(false);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');

  // 5. Send & Confirmation state
  const [isSending, setIsSending] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [sendErrorMessage, setSendErrorMessage] = useState<string | null>(null);
  const [showSendConfirmModal, setShowSendConfirmModal] = useState(false);
  const [currentOfferObject, setCurrentOfferObject] = useState<JobOffer | null>(existingOffer || null);

  // Load templates on mount
  useEffect(() => {
    const loadedTemplates = getOfferTemplates();
    setTemplates(loadedTemplates);
    if (loadedTemplates.length > 0 && !existingOffer) {
      setSelectedTemplateId(loadedTemplates[0].id);
    }
  }, [existingOffer]);

  // Recalculate net salary when gross changes
  const handleGrossChange = (val: number) => {
    setGrossSalary(val);
    const calculated = calculateNetSalary(val);
    setNetSalary(calculated.net);
  };

  const handleNetChange = (val: number) => {
    setNetSalary(val);
    const gross = calculateGrossFromNet(val);
    setGrossSalary(gross);
  };

  // Average score
  const calculateAverageScore = () => {
    const vals: number[] = Object.values(ratings) as number[];
    const sum = vals.reduce((a: number, b: number) => a + b, 0);
    return Math.round((sum / (vals.length || 1)) * 10) / 10;
  };

  // Generate AI Interview Summary
  const handleGenerateAISummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await fetch('/api/ai/interview-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: application.candidateName,
          position,
          department,
          ratings,
          strengths,
          weaknesses,
          notes: interviewNotes,
          recommendation,
        }),
      });

      if (!response.ok) throw new Error('AI xidmətindən cavab alına bilmədi.');
      const data = await response.json();
      setAiSummary(data.summary);
    } catch (err: any) {
      console.warn('Fallback summary generated locally');
      setAiSummary(
        `Namizəd ${application.candidateName} ilə keçirilmiş müsahibədə yüksək peşəkarlıq və həvəs nümayiş etdirildi. Orta bal: ${calculateAverageScore()}/5. ${strengths} Qərar: Təklif verilməsi tövsiyə edilir.`
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Generate AI Job Offer
  const handleGenerateAIOffer = async () => {
    setIsGeneratingOffer(true);
    try {
      const partialOfferData = buildCurrentOfferData();
      const response = await fetch('/api/ai/generate-job-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer: partialOfferData,
          language: offerLanguage,
        }),
      });

      if (!response.ok) throw new Error('AI təklif generatorundan xəta baş verdi.');
      const data = await response.json();
      setGeneratedOfferBody(data.content);
    } catch (err) {
      // Local fallback with template
      const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
      if (currentTemplate) {
        const text = populateOfferTemplate(currentTemplate.content, buildCurrentOfferData());
        setGeneratedOfferBody(text);
      }
    } finally {
      setIsGeneratingOffer(false);
    }
  };

  // Benefit tags
  const handleAddBenefit = () => {
    if (!newBenefitInput.trim()) return;
    if (!benefits.includes(newBenefitInput.trim())) {
      setBenefits([...benefits, newBenefitInput.trim()]);
    }
    setNewBenefitInput('');
  };

  const handleRemoveBenefit = (b: string) => {
    setBenefits(benefits.filter((item) => item !== b));
  };

  // Helper to compile offer object
  const buildCurrentOfferData = (): JobOffer => {
    const offerId = existingOffer?.id || `offer-${Date.now()}`;
    const token = existingOffer?.secureToken || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    return {
      id: offerId,
      applicationId: application.id,
      candidateId: application.candidateEmail,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      candidatePhone: application.candidatePhone,
      companyId: company.id,
      companyName: company.name,
      companyLogo: company.logo,
      companyAddress: company.location,
      companyEmail: company.email,
      companyPhone: company.phone || '+994 (12) 000-00-00',
      hrContactPerson: interviewerName,
      hrContactPosition: company.hrContactPosition || 'İnsan Resursları Departamenti',
      
      position,
      department,
      employmentType,
      workLocation,
      startDate,
      grossSalary,
      netSalary,
      probationPeriod,
      workingSchedule,
      annualLeave,
      bonus,
      benefits,
      additionalTerms,
      
      templateId: selectedTemplateId,
      language: offerLanguage,
      generatedContent: generatedOfferBody,
      
      status: company.requireOfferApproval ? 'PENDING_APPROVAL' : 'DRAFT',
      secureToken: token,
      
      createdBy: interviewerName,
      createdAt: existingOffer?.createdAt || now,
      updatedAt: now,
    };
  };

  // Save Draft
  const handleSaveDraft = () => {
    const offer = buildCurrentOfferData();
    offer.status = 'DRAFT';
    setCurrentOfferObject(offer);

    const log: OfferAuditLog = {
      id: `log-${Date.now()}`,
      offerId: offer.id,
      candidateName: offer.candidateName,
      action: 'OFFER_CREATED',
      user: interviewerName,
      timestamp: new Date().toISOString(),
      details: 'İş təklifi layihəsi (Draft) yadda saxlanıldı.',
    };

    onSaveOffer(offer, log);
    onUpdateAppStatus(application.id, 'Təklif verildi', 'İş təklifi layihəsi hazırlandı.');
    setSendSuccessMessage('İş təklifi qaralama (Draft) olaraq uğurla yadda saxlanıldı!');
  };

  // Manager Approve Offer (if company requires approval)
  const handleApproveOffer = () => {
    const offer = buildCurrentOfferData();
    offer.status = 'APPROVED';
    offer.approvedBy = interviewerName;
    setCurrentOfferObject(offer);

    const log: OfferAuditLog = {
      id: `log-${Date.now()}`,
      offerId: offer.id,
      candidateName: offer.candidateName,
      action: 'OFFER_APPROVED',
      user: interviewerName,
      timestamp: new Date().toISOString(),
      details: 'İş təklifi rəhbərlik tərəfindən rəsmən təsdiqləndi (Approved).',
    };

    onSaveOffer(offer, log);
    setSendSuccessMessage('İş təklifi təsdiqləndi! İndi 1 kliklə namizədə göndərə bilərsiniz.');
  };

  // 1-Click Send Offer
  const handleExecuteSendOffer = async () => {
    const offer = buildCurrentOfferData();
    const validation = validateOfferBeforeSending(offer);

    if (!validation.valid) {
      setSendErrorMessage(validation.errors.join(' '));
      return;
    }

    setIsSending(true);
    setSendErrorMessage(null);
    setShowSendConfirmModal(false);

    try {
      const appUrl = window.location.origin;
      const securePortalLink = `${appUrl}/?offerToken=${offer.secureToken}`;
      const emailContent = buildOfferEmailContent(offer, securePortalLink);

      const emailResult = await sendJobOfferEmail({
        offerId: offer.id,
        candidateEmail: offer.candidateEmail,
        candidateName: offer.candidateName,
        position: offer.position,
        companyName: offer.companyName,
        companyEmail: offer.companyEmail,
        hrContactPerson: offer.hrContactPerson,
        subject: emailContent.subject,
        htmlBody: emailContent.htmlBody,
        textBody: emailContent.textBody,
        secureOfferLink: securePortalLink,
      });

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'E-poçt çatdırılması baş tutmadı.');
      }

      // Update offer status
      offer.status = 'SENT';
      offer.sentAt = new Date().toISOString();
      setCurrentOfferObject(offer);

      const log: OfferAuditLog = {
        id: `log-${Date.now()}`,
        offerId: offer.id,
        candidateName: offer.candidateName,
        action: 'OFFER_SENT',
        user: interviewerName,
        timestamp: offer.sentAt,
        details: `Rəsmi iş təklifi e-poçt vasitəsilə ${offer.candidateEmail} ünvanına uğurla göndərildi.`,
      };

      onSaveOffer(offer, log);
      onUpdateAppStatus(application.id, 'Təklif verildi', `Rəsmi iş təklifi ${offer.candidateEmail} ünvanına göndərildi.`);

      setSendSuccessMessage(
        `Təbriklər! Rəsmi İş Təklifi və PDF sənədi uğurla ${offer.candidateEmail} ünvanına göndərildi!`
      );
      setCurrentStep(5);
    } catch (err: any) {
      console.error('Send error:', err);
      setSendErrorMessage(err?.message || 'Təklif göndərilərkən xəta baş verdi. Zəhmət olmasa təkrar cəhd edin.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPDFClick = async () => {
    setIsDownloadingPDF(true);
    try {
      const offer = buildCurrentOfferData();
      await downloadJobOfferPDF('workflow-job-offer-document', offer);
    } catch (e) {
      console.error('PDF error', e);
      window.print();
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header & Progress Stepper */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                <Sparkles className="w-5 h-5 text-blue-100" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>AI Müsahibə → İş Təklifi → 1 Klik Göndəriş</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Tam HR Workflow
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Namizəd: <span className="font-semibold text-slate-800">{application.candidateName}</span> • Vakansiya: <span className="font-semibold text-blue-700">{application.vacancyTitle}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Navigation */}
          <div className="grid grid-cols-5 gap-2 text-xs font-semibold">
            <button
              onClick={() => setCurrentStep(1)}
              className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                currentStep === 1
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : currentStep > 1
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">1</span>
              <span className="hidden sm:inline">1. Müsahibə</span>
            </button>

            <button
              onClick={() => setCurrentStep(2)}
              className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                currentStep === 2
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : currentStep > 2
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">2</span>
              <span className="hidden sm:inline">2. Qərar</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                currentStep === 3
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : currentStep > 3
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">3</span>
              <span className="hidden sm:inline">3. Təklif Şərtləri</span>
            </button>

            <button
              onClick={() => {
                if (!generatedOfferBody) handleGenerateAIOffer();
                setCurrentStep(4);
              }}
              className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                currentStep === 4
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : currentStep > 4
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">4</span>
              <span className="hidden sm:inline">4. AI Sənəd</span>
            </button>

            <button
              onClick={() => setCurrentStep(5)}
              className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                currentStep === 5
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">5</span>
              <span className="hidden sm:inline">5. Göndəriş & PDF</span>
            </button>
          </div>
        </div>

        {/* Modal Body with dynamic step content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-6">
          {/* Notifications */}
          {sendSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 font-semibold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{sendSuccessMessage}</span>
            </div>
          )}

          {sendErrorMessage && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-900 font-semibold flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{sendErrorMessage}</span>
              </div>
              <button
                onClick={() => setSendErrorMessage(null)}
                className="text-xs text-red-700 underline font-bold"
              >
                Bağla
              </button>
            </div>
          )}

          {/* STEP 1: INTERVIEW EVALUATION FORM */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Interview Metadata */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Müsahibəçi (Interviewer)</label>
                  <input
                    type="text"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vəzifə</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Şöbə / Departament</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                  />
                </div>
              </div>

              {/* 8 Evaluation Criteria (1-5 scale) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Müsahibə Dəyərləndirmə Meyarları (1 - 5 Bal)</span>
                  </h3>
                  <div className="bg-blue-50 text-blue-800 font-extrabold px-3 py-1 rounded-full border border-blue-200 text-xs">
                    Orta Nəticə: {calculateAverageScore()} / 5.0
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {[
                    { key: 'technicalSkills', label: '1. Texniki Bacarıqlar (Technical Skills)' },
                    { key: 'relevantExperience', label: '2. Müvafiq İş Təcrübəsi (Experience)' },
                    { key: 'communication', label: '3. Ünsiyyət və İfadə (Communication)' },
                    { key: 'problemSolving', label: '4. Problem Həlletmə (Problem Solving)' },
                    { key: 'teamwork', label: '5. Komanda ilə İş (Teamwork)' },
                    { key: 'leadership', label: '6. Liderlik / Təşəbbüskarlıq (Leadership)' },
                    { key: 'culturalFit', label: '7. Şirkət Mədəniyyəti Uyğunluğu (Cultural Fit)' },
                    { key: 'motivation', label: '8. Motivasiya və Öyrənmə Həvəsi (Motivation)' },
                  ].map(({ key, label }) => (
                    <div key={key} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-700">{label}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setRatings({ ...ratings, [key]: val })}
                            className={`w-7 h-7 rounded-md font-bold text-xs transition-all ${
                              (ratings as any)[key] === val
                                ? 'bg-blue-600 text-white shadow-xs scale-105'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths, Weaknesses, Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Namizədin Əsas Güclü Tərəfləri</label>
                  <textarea
                    rows={2}
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg resize-none outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">İnkişaf Sahələri / Çatışmazlıqlar</label>
                  <textarea
                    rows={2}
                    value={weaknesses}
                    onChange={(e) => setWeaknesses(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg resize-none outline-none focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Müsahibə Qeydləri və Təəssüratlar</label>
                  <textarea
                    rows={2}
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg resize-none outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* AI Interview Summary Generator */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-blue-900">AI Müsahibə Xülasəsi və Dəyərləndirmə Rəyi</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAISummary}
                    disabled={isGeneratingSummary}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    {isGeneratingSummary ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isGeneratingSummary ? 'Hazırlanır...' : 'AI ilə Rəy Tərtib Et'}</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={aiSummary}
                  onChange={(e) => setAiSummary(e.target.value)}
                  placeholder="AI rəyini formalaşdırmaq üçün yuxarıdakı düyməyə klikləyin və ya birbaşa daxil edin..."
                  className="w-full p-3 bg-white border border-blue-200 rounded-lg text-slate-800 leading-relaxed outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <span>Növbəti: Qərar Mərhələsi</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: HIRING DECISION */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900">Müsahibə Nəticəsi üzrə Rəsmi Qərar</h3>
                <p className="text-xs text-slate-500">
                  Dəyərləndirməyə əsasən namizəd üzrə yekun HR statusunu seçin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    type: 'Hire' as HiringDecision,
                    title: 'İş Təklifi Verilsin (Hire)',
                    desc: 'Namizəd tam uyğundur. İş təklifi (Job Offer) workflow-su başlasın.',
                    icon: ThumbsUp,
                    color: 'border-emerald-500 bg-emerald-50 text-emerald-900',
                  },
                  {
                    type: 'Second Interview' as HiringDecision,
                    title: 'İkinci Müsahibəyə Dəvət',
                    desc: 'Rəhbərlik və ya növbəti texniki komanda ilə əlavə görüş təyin edilsin.',
                    icon: RefreshCw,
                    color: 'border-blue-500 bg-blue-50 text-blue-900',
                  },
                  {
                    type: 'Hold' as HiringDecision,
                    title: 'Gözləmədə Saxlanılsın (Hold)',
                    desc: 'Digər namizədlər dinlənilənədək ehtiyatda saxlanılsın.',
                    icon: Clock,
                    color: 'border-amber-500 bg-amber-50 text-amber-900',
                  },
                  {
                    type: 'Reject' as HiringDecision,
                    title: 'İmtina Edilsin (Reject)',
                    desc: 'Namizədin bacarıqları cari tələblərə cavab vermir.',
                    icon: AlertCircle,
                    color: 'border-red-500 bg-red-50 text-red-900',
                  },
                ].map(({ type, title, desc, icon: Icon, color }) => (
                  <div
                    key={type}
                    onClick={() => setDecision(type)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      decision === type
                        ? `${color} shadow-sm ring-2 ring-blue-500/20`
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/80 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{title}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Geri: Dəyərləndirmə</span>
                </button>

                {decision === 'Hire' ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm"
                  >
                    <span>İş Təklifi Şərtlərinə Keç →</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateAppStatus(
                        application.id,
                        decision === 'Reject' ? 'İmtina edildi' : 'Baxıldı',
                        `Müsahibə qərarı: ${decision}. ${interviewNotes}`
                      );
                      onClose();
                    }}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm"
                  >
                    Qərarı Yadda Saxla və Bağla
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: JOB OFFER DETAILS & REMUNERATION (WITH AZ SALARY CALCULATOR) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Position & Work Setup */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vəzifə Adı (Position Title)</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Departament / Şöbə</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Məşğulluq Növü</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as OfferEmploymentType)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="Full-time">Tam ştat (Full-time)</option>
                    <option value="Part-time">Yarım ştat (Part-time)</option>
                    <option value="Contract">Müqavilə əsaslı (Contract)</option>
                    <option value="Internship">Təcrübə proqramı (Internship)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">İş Yeri / Ünvan</label>
                  <input
                    type="text"
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">İşə Başlama Tarixi</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-bold text-blue-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sınaq Müddəti (Probation)</label>
                  <select
                    value={probationPeriod}
                    onChange={(e) => setProbationPeriod(e.target.value as ProbationPeriod)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="None">Sınaq müddətsiz</option>
                    <option value="1 month">1 ay</option>
                    <option value="2 months">2 ay</option>
                    <option value="3 months">3 ay (Standart)</option>
                  </select>
                </div>
              </div>

              {/* Integrated Azerbaijan Tax & Net Calculator Box */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-blue-900">
                      Əməkhaqqı və AR Vergi Kalkulyatoru (Gross ↔ Net)
                    </h4>
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold bg-white px-2 py-0.5 rounded border border-blue-200">
                    Qeyri-dövlət sektoru
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <label className="block font-bold text-slate-700 mb-1">
                      Məcmu Əməkhaqqı (Gross Salary) - AZN
                    </label>
                    <input
                      type="number"
                      value={grossSalary}
                      onChange={(e) => handleGrossChange(Number(e.target.value))}
                      className="w-full p-2 text-lg font-extrabold text-slate-900 bg-slate-50 border border-slate-300 rounded-md"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Müqavilədə göstərilən rəsmi ümumi məbləğ
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <label className="block font-bold text-emerald-800 mb-1">
                      Xalis Əməkhaqqı (Net Salary - Ələ Çatan) - AZN
                    </label>
                    <input
                      type="number"
                      value={netSalary}
                      onChange={(e) => handleNetChange(Number(e.target.value))}
                      className="w-full p-2 text-lg font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-md"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Vergi və sığorta tutulmalarından sonra xalis məbləğ
                    </p>
                  </div>
                </div>

                {/* Tax Breakdown Details */}
                {grossSalary > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-3 rounded-lg border border-blue-100">
                    <div>
                      <span className="text-slate-500 block">Gəlir Vergisi:</span>
                      <span className="font-bold text-slate-800">
                        {calculateNetSalary(grossSalary).incomeTax} AZN
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">DSMF (Sosial):</span>
                      <span className="font-bold text-slate-800">
                        {calculateNetSalary(grossSalary).dsmf} AZN
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">İcbari Tibbi Sığorta:</span>
                      <span className="font-bold text-slate-800">
                        {calculateNetSalary(grossSalary).healthInsurance} AZN
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">İşsizlik Sığortası:</span>
                      <span className="font-bold text-slate-800">
                        {calculateNetSalary(grossSalary).unemployment} AZN
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule, Leave, Bonus & Additional Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">İş Qrafiki (Working Schedule)</label>
                  <input
                    type="text"
                    value={workingSchedule}
                    onChange={(e) => setWorkingSchedule(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Əmək Məzuniyyəti (Annual Leave)</label>
                  <input
                    type="text"
                    value={annualLeave}
                    onChange={(e) => setAnnualLeave(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bonus və Mükafatlandırma Planı</label>
                  <input
                    type="text"
                    value={bonus}
                    onChange={(e) => setBonus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>
              </div>

              {/* Benefits Checklist */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Təminatlar və İmtiyazlar (Benefits Package)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {benefits.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{b}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(b)}
                        className="hover:text-red-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Yeni imtiyaz əlavə et (məs: İdman zalı abunəliyi)..."
                    value={newBenefitInput}
                    onChange={(e) => setNewBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBenefit();
                      }
                    }}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900"
                  >
                    Əlavə et
                  </button>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Geri: Qərar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleGenerateAIOffer();
                    setCurrentStep(4);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <span>AI ilə Təklif Sənədini Tərtib Et</span>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AI OFFER GENERATION & INTERACTIVE EDITOR */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Controls bar: Language, Template, Re-generate, View mode */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Language switch */}
                  <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-bold px-1.5 uppercase">Dil:</span>
                    <button
                      type="button"
                      onClick={() => setOfferLanguage('az')}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        offerLanguage === 'az' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Azərbaycan
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferLanguage('en')}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        offerLanguage === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      English
                    </button>
                  </div>

                  {/* Template Picker */}
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => {
                      setSelectedTemplateId(e.target.value);
                      const t = templates.find((item) => item.id === e.target.value);
                      if (t) {
                        setOfferLanguage(t.language);
                        setGeneratedOfferBody(populateOfferTemplate(t.content, buildCurrentOfferData()));
                      }
                    }}
                    className="p-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleGenerateAIOffer}
                    disabled={isGeneratingOffer}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-60"
                  >
                    {isGeneratingOffer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>{isGeneratingOffer ? 'Tərtib olunur...' : 'AI ilə Yenidən Yaz'}</span>
                  </button>
                </div>

                {/* Editor / Preview switcher */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setEditorMode('edit')}
                    className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${
                      editorMode === 'edit' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Mətni Redaktə Et</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${
                      editorMode === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>A4 Rəsmi Baxış</span>
                  </button>
                </div>
              </div>

              {/* Editor mode: Rich text area / Preview mode: Official A4 document */}
              {editorMode === 'edit' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold">İş Təklifi Məktubunun Rəsmi Mətni (Redaktə edilə bilər):</span>
                    <span className="text-[11px] text-slate-400">Şablon dəyişənləri və AI tərtibatı daxildir</span>
                  </div>
                  <textarea
                    rows={16}
                    value={generatedOfferBody}
                    onChange={(e) => setGeneratedOfferBody(e.target.value)}
                    placeholder="İş təklifi sənədi mətni..."
                    className="w-full p-4 font-mono text-xs sm:text-sm bg-white border border-slate-300 rounded-xl leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl bg-slate-100 p-4 sm:p-6 overflow-x-auto">
                  <OfferDocumentView
                    id="workflow-job-offer-document"
                    offer={buildCurrentOfferData()}
                    customContent={generatedOfferBody}
                  />
                </div>
              )}

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Geri: Şərtlər</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl"
                  >
                    Qaralama Kimi Saxla (Save Draft)
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm"
                  >
                    <span>Yekun Baxış & Göndəriş</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW, APPROVAL & ONE-CLICK SEND */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Approval status banner if company requires it */}
              {company.requireOfferApproval && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-amber-900">Rəhbərlik Təsdiqi Tələb Olunur</h4>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Şirkətinizin tənzimləmələrinə əsasən, iş təklifi namizədə göndərilməzdən əvvəl təsdiqlənməlidir.
                      </p>
                    </div>
                  </div>

                  {currentOfferObject?.status === 'APPROVED' ? (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-300">
                      ✅ Təsdiqləndi
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApproveOffer}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs"
                    >
                      İş Təklifini Təsdiqlə (Approve)
                    </button>
                  )}
                </div>
              )}

              {/* Email Delivery Summary Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>E-Poçt Çatdırılma Detalları</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Alıcı Namizəd:</span>
                    <span className="font-bold text-slate-900">{application.candidateName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">E-Poçt Ünvanı:</span>
                    <span className="font-bold text-blue-700">{application.candidateEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status:</span>
                    <span className="font-bold text-slate-800">
                      {currentOfferObject?.status || 'GÖNDƏRİLMƏYƏ HAZIR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* A4 Document Visual Component */}
              <div className="border border-slate-200 rounded-xl bg-slate-100 p-4 sm:p-6 overflow-x-auto">
                <OfferDocumentView
                  id="workflow-job-offer-document"
                  offer={buildCurrentOfferData()}
                  customContent={generatedOfferBody}
                />
              </div>

              {/* Bottom Actions: PDF Download + 1-Click Send */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Geri: Redaktə</span>
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadPDFClick}
                    disabled={isDownloadingPDF}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    {isDownloadingPDF ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{isDownloadingPDF ? 'PDF Hazırlanır...' : 'Rəsmi PDF Yüklə'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSendConfirmModal(true)}
                    disabled={isSending || (company.requireOfferApproval && currentOfferObject?.status !== 'APPROVED')}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>1 Kliklə Namizədə Göndər</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic moving Jobia Logo at bottom */}
        <ModalBottomLogo
          tagline="Jobia.az Müsahibə Dəyərləndirməsi və Rəsmi İş Təklifi Mərkəzi"
          variant="slate"
          size="xs"
        />
      </div>

      {/* Confirmation Modal Before Sending */}
      {showSendConfirmModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">İş Təklifini Göndərməyə Əminsiniz?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rəsmi iş təklifi və təhlükəsiz aksept keçidi <span className="font-bold text-slate-900">{application.candidateEmail}</span> ünvanına göndəriləcək. Namizəd təklifi dərhal nəzərdən keçirib cavablandıra biləcək.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Vəzifə:</span>
                <span className="font-bold text-slate-900">{position}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gross Əməkhaqqı:</span>
                <span className="font-bold text-blue-700">{grossSalary.toLocaleString('az-AZ')} AZN</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>İşə Başlama:</span>
                <span className="font-bold text-slate-900">{startDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSendConfirmModal(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100"
              >
                Ləğv et
              </button>
              <button
                type="button"
                onClick={handleExecuteSendOffer}
                disabled={isSending}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Bəli, Göndər</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
