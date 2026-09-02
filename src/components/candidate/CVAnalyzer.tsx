import React, { useState, useRef } from 'react';
import { CVData, Vacancy, CVAnalysisResult } from '../../types';
import { ATSOptimizationSidebar } from './ATSOptimizationSidebar';
import { JobiaSectionFooter } from '../JobiaSectionFooter';
import { processUploadedCVFile, UploadedFileInfo } from '../../utils/fileExtractor';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  RefreshCw, 
  AlertCircle,
  Zap,
  Target,
  PanelRight,
  ShieldCheck,
  UploadCloud,
  FileCheck,
  X,
  Eye,
  Download,
  Briefcase,
  GraduationCap,
  Award,
  User,
  Check,
  Printer,
  Copy,
  Code,
  Globe
} from 'lucide-react';

interface CVAnalyzerProps {
  cvData: CVData;
  vacancies: Vacancy[];
  initialTargetVacancy?: Vacancy | null;
  onNavigateToBuilder: () => void;
  onImportCVData?: (newCV: CVData) => void;
}

type AnalysisSource = 'upload' | 'platform' | 'custom_text';

export const CVAnalyzer: React.FC<CVAnalyzerProps> = ({
  cvData,
  vacancies,
  initialTargetVacancy,
  onNavigateToBuilder,
  onImportCVData,
}) => {
  const [sourceMode, setSourceMode] = useState<AnalysisSource>('upload');
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>(
    initialTargetVacancy ? initialTargetVacancy.id : 'general'
  );
  const [customText, setCustomText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [extractedProfile, setExtractedProfile] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const selectedVacancy = vacancies.find((v) => v.id === selectedVacancyId);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Fayl ölçüsü çox böyükdür (maksimum 10 MB icazə verilir).');
      return;
    }

    try {
      setIsReadingFile(true);
      const processed = await processUploadedCVFile(file);
      setUploadedFile(processed);
      setSuccessMsg(`"${file.name}" uğurla seçildi. İndi analizi başlada bilərsiniz.`);
    } catch {
      setErrorMsg('Fayl oxunarkən xəta baş verdi. Zəhmət olmasa başqa formatda cəhd edin.');
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Run AI Analysis
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (sourceMode === 'upload') {
        if (!uploadedFile) {
          throw new Error('Zəhmət olmasa analiz üçün bir CV faylı (PDF, Word və ya Şəkil) yükləyin.');
        }

        setAnalysisStep('📄 Sənəd təhlil olunur və mətn oxunur...');
        await new Promise((r) => setTimeout(r, 400));

        setAnalysisStep('🤖 AI və ATS qaydaları ilə yoxlanılır...');

        const payload = {
          fileBase64: uploadedFile.base64Data,
          mimeType: uploadedFile.fileType,
          fileName: uploadedFile.fileName,
          rawText: uploadedFile.extractedText,
          targetJobTitle: selectedVacancy ? selectedVacancy.title : undefined,
          vacancyDescription: selectedVacancy
            ? `${selectedVacancy.title} - ${selectedVacancy.description || ''}\nTələblər: ${(selectedVacancy.requirements || []).join(', ')}`
            : undefined,
        };

        const response = await fetch('/api/ai/analyze-uploaded-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Server analizi tamamlaya bilmədi.');
        }

        const data = await response.json();
        setAnalysisStep('📊 Nəticələr və təkmilləşdirmə planı hesablanır...');
        await new Promise((r) => setTimeout(r, 300));

        if (data.analysisResult) {
          setAnalysisResult(data.analysisResult);
        }
        if (data.extractedCV) {
          setExtractedProfile(data.extractedCV);
        }
        setSuccessMsg(`"${uploadedFile.fileName}" sənədi üzrə dərin AI analizi uğurla tamamlandı!`);
      } else {
        // Platform or Custom Text
        setAnalysisStep('🤖 AI CV məlumatlarını analiz edir...');

        const effectiveCVData = sourceMode === 'custom_text'
          ? {
              ...cvData,
              personalInfo: {
                ...cvData.personalInfo,
                summary: customText || cvData.personalInfo.summary,
              },
            }
          : cvData;

        const payload = {
          cvData: effectiveCVData,
          targetJobTitle: selectedVacancy ? selectedVacancy.title : cvData.personalInfo.jobTitle,
          vacancyDescription: selectedVacancy
            ? `${selectedVacancy.title} - ${selectedVacancy.description || ''}\nTələblər: ${(selectedVacancy.requirements || []).join(', ')}`
            : undefined,
        };

        const response = await fetch('/api/ai/analyze-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Analiz zamanı xəta baş verdi');
        }

        const result: CVAnalysisResult = await response.json();
        setAnalysisResult(result);
        setExtractedProfile(null);
        setSuccessMsg('CV analizi və ATS hesabatı uğurla hazırlandı!');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Analiz zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Import extracted uploaded CV into candidate builder
  const handleImportExtractedCV = () => {
    if (!extractedProfile || !onImportCVData) {
      onNavigateToBuilder();
      return;
    }

    const newCV: CVData = {
      id: cvData.id || 'cv_' + Date.now(),
      title: `${extractedProfile.personalInfo?.jobTitle || 'Yüklənmiş'} CV`,
      lastUpdated: new Date().toISOString().split('T')[0],
      personalInfo: {
        fullName: extractedProfile.personalInfo?.fullName || cvData.personalInfo.fullName,
        jobTitle: extractedProfile.personalInfo?.jobTitle || cvData.personalInfo.jobTitle,
        email: extractedProfile.personalInfo?.email || cvData.personalInfo.email,
        phone: extractedProfile.personalInfo?.phone || cvData.personalInfo.phone,
        address: extractedProfile.personalInfo?.address || cvData.personalInfo.address,
        linkedin: extractedProfile.personalInfo?.linkedin || cvData.personalInfo.linkedin,
        github: extractedProfile.personalInfo?.github || cvData.personalInfo.github,
        summary: extractedProfile.personalInfo?.summary || cvData.personalInfo.summary,
      },
      skills: (extractedProfile.skills || []).map((s: any, idx: number) => ({
        id: `skill_${idx}_${Date.now()}`,
        name: typeof s === 'string' ? s : s.name,
        level: s.level || 'Yaxşı',
        category: s.category || 'Texniki',
      })),
      experiences: (extractedProfile.experiences || []).map((e: any, idx: number) => ({
        id: `exp_${idx}_${Date.now()}`,
        company: e.company || 'Şirkət',
        position: e.position || 'Vəzifə',
        location: e.location || 'Bakı',
        startDate: e.startDate || '2022',
        endDate: e.endDate || 'Hazırda',
        current: !!e.current,
        description: e.description || '',
      })),
      education: (extractedProfile.education || []).map((ed: any, idx: number) => ({
        id: `edu_${idx}_${Date.now()}`,
        institution: ed.institution || 'Təhsil Müəssisəsi',
        degree: ed.degree || 'Bakalavr',
        fieldOfStudy: ed.fieldOfStudy || 'İxtisas',
        startDate: ed.startDate || '2018',
        endDate: ed.endDate || '2022',
        current: !!ed.current,
      })),
      languages: cvData.languages || [
        { id: 'lang_1', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
      ],
      projects: cvData.projects || [],
      certificates: cvData.certificates || [],
    };

    onImportCVData(newCV);
  };

  const copyKeyword = (kw: string) => {
    navigator.clipboard?.writeText(kw);
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Compute effective CV data for the ATS sidebar
  const effectiveSidebarCVData: CVData = extractedProfile
    ? {
        ...cvData,
        personalInfo: {
          ...cvData.personalInfo,
          ...extractedProfile.personalInfo,
        },
        skills: (extractedProfile.skills || []).map((s: any, idx: number) => ({
          id: `sk_${idx}`,
          name: typeof s === 'string' ? s : s.name,
          level: s.level || 'Yaxşı',
          category: s.category || 'Texniki',
        })),
      }
    : cvData;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI CV Auditor & Fayl Analizatoru</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">CV Analizi və ATS Optimizasiyası</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Öz PDF və ya Word CV faylınızı birbaşa yükləyin və ya platformadakı CV-nizi hədəf vakansiyaya qarşı analiz edin. Süni intellekt açar sözləri, formatı və işə qəbul şansınızı saniyələr içində hesablayacaq.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-ats-sidebar"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isSidebarOpen
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <PanelRight className="w-4 h-4 text-blue-400" />
              <span>{isSidebarOpen ? 'ATS Paneli Gizlət' : 'ATS Paneli Göstər'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid with ATS Sidebar */}
      <div className={`grid grid-cols-1 ${isSidebarOpen ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6 items-start`}>
        {/* Main Column */}
        <div className={`space-y-6 ${isSidebarOpen ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-12'}`}>
          
          {/* Source Selection & Upload Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" />
                <span>1. Analiz Ediləcək CV Mənbəyini Seçin</span>
              </h2>
              <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                PDF, Word, Şəkil dəstəklənir
              </span>
            </div>

            {/* Source Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="tab-source-upload"
                onClick={() => setSourceMode('upload')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  sourceMode === 'upload'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <UploadCloud className={`w-4 h-4 ${sourceMode === 'upload' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {sourceMode === 'upload' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <div className="font-bold text-xs">📂 Fayl Yüklə</div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">PDF, DOCX, TXT, Şəkil</div>
              </button>

              <button
                type="button"
                id="tab-source-platform"
                onClick={() => setSourceMode('platform')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  sourceMode === 'platform'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <User className={`w-4 h-4 ${sourceMode === 'platform' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {sourceMode === 'platform' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <div className="font-bold text-xs">👤 Platforma CV-im</div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cvData.personalInfo.fullName || 'Profil CV'}</div>
              </button>

              <button
                type="button"
                id="tab-source-custom"
                onClick={() => setSourceMode('custom_text')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  sourceMode === 'custom_text'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <FileText className={`w-4 h-4 ${sourceMode === 'custom_text' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {sourceMode === 'custom_text' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <div className="font-bold text-xs">✍️ Mətn / Qaralama</div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Mətni birbaşa yapışdır</div>
              </button>
            </div>

            {/* TAB 1: File Upload Drag & Drop Area */}
            {sourceMode === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".pdf,.docx,.doc,.txt,.rtf,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  id="cv-file-input"
                />

                {!uploadedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                        : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 hover:border-blue-400'
                    }`}
                  >
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
                      {isReadingFile ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      ) : (
                        <UploadCloud className="w-7 h-7 text-blue-600" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      CV faylınızı bura sürükləyin və ya <span className="text-blue-600 underline">kompüterdən seçin</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF, DOCX, TXT, PNG, JPG formatları dəstəklənir (Maksimum 10 MB)
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-red-600">.PDF</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-blue-600">.DOCX</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">.TXT</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-emerald-600">.PNG / .JPG</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate max-w-xs">{uploadedFile.fileName}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Hazırdır
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Ölçü: {uploadedFile.fileSizeFormatted} • Format: {uploadedFile.fileType.split('/')[1]?.toUpperCase() || 'Sənəd'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Dəyişdir
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Faylı sil"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Platform CV Preview Info */}
            {sourceMode === 'platform' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-800">{cvData.personalInfo.fullName || 'Namizəd'}</span>
                    <span className="text-xs text-slate-500">({cvData.personalInfo.jobTitle || 'Vəzifə qeyd edilməyib'})</span>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToBuilder}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    CV Generatorunda Redaktə Et →
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {cvData.personalInfo.summary || 'Profil xülasəsi qeyd edilməyib. Generator bölməsindən əlavə edə bilərsiniz.'}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cvData.skills.slice(0, 6).map((sk, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-700">
                      {sk.name}
                    </span>
                  ))}
                  {cvData.skills.length > 6 && (
                    <span className="text-[10px] text-slate-500 self-center">+{cvData.skills.length - 6} bacarıq</span>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Custom Text Paste */}
            {sourceMode === 'custom_text' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  CV Mətnini və ya Təcrübə Qeydlərini bura yapışdırın:
                </label>
                <textarea
                  rows={5}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="CV-nizin mətnini (Haqqımda, təcrübə, bacarıqlar, təhsil və s.) bura yapışdırın..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600 font-sans resize-none transition-colors"
                />
              </div>
            )}

            {/* Target Vacancy Selector */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                2. Hədəf Vakansiyanı Seçin (ATS və Açar Söz Uyğunluğu üçün)
              </label>
              <select
                value={selectedVacancyId}
                onChange={(e) => setSelectedVacancyId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-600 transition-colors"
              >
                <option value="general">🌐 Ümumi Əmək Bazarı Standartı (Peşəkar Audit)</option>
                {vacancies.map((v) => (
                  <option key={v.id} value={v.id}>
                    📌 {v.title} ({v.companyName}) — {v.city || 'Bakı'}
                  </option>
                ))}
              </select>
              {selectedVacancy ? (
                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Seçildi: {selectedVacancy.title} • {selectedVacancy.companyName} • {selectedVacancy.skills?.length || 0} tələb olunan bacarıq</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Konkret vakansiya seçdikdə sistem həmin şirkətin tələblərinə görə açar söz çatışmazlığını da hesablayacaq.
                </p>
              )}
            </div>

            {/* Start Button */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {sourceMode === 'upload' && uploadedFile
                  ? `Fayl: ${uploadedFile.fileName}`
                  : sourceMode === 'platform'
                  ? `Profil: ${cvData.personalInfo.fullName}`
                  : 'Xüsusi mətn rejimi'}
              </div>

              <button
                id="btn-run-analysis"
                disabled={isAnalyzing || (sourceMode === 'upload' && !uploadedFile)}
                onClick={runAnalysis}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{analysisStep || 'AI Analiz Edir...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>CV-ni Dərindən Analiz Et</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Analysis Results Dashboard */}
          {analysisResult ? (
            <div ref={reportRef} className="space-y-6 animate-fade-in">
              
              {/* Extracted Profile Card (if file was uploaded) */}
              {extractedProfile && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold text-sm">
                        {extractedProfile.personalInfo?.fullName?.charAt(0) || 'N'}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">
                          {extractedProfile.personalInfo?.fullName || 'Namizəd'}
                        </h3>
                        <p className="text-xs text-blue-300">
                          {extractedProfile.personalInfo?.jobTitle || 'Mütəxəssis'} • {extractedProfile.personalInfo?.email || ''}
                        </p>
                      </div>
                    </div>

                    {onImportCVData && (
                      <button
                        type="button"
                        onClick={handleImportExtractedCV}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm self-start sm:self-auto"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>CV Generatoruna Köçür</span>
                      </button>
                    )}
                  </div>

                  {extractedProfile.personalInfo?.summary && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {extractedProfile.personalInfo.summary}
                    </p>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Aşkar edilən bacarıqlar</span>
                      <span className="font-bold text-white text-xs">{extractedProfile.skills?.length || 0} ədəd</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">İş təcrübələri</span>
                      <span className="font-bold text-white text-xs">{extractedProfile.experiences?.length || 0} şirkət</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 block">Təhsil qeydi</span>
                      <span className="font-bold text-white text-xs">{extractedProfile.education?.[0]?.degree || 'Mövcuddur'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Visual Uyğunluq Panel & 5-Section HR Director Audit Report */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
                
                {/* Header of Audit Report */}
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold mb-1">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rəsmi HR Direktoru və ATS Auditi</span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900">
                      Peşəkar Namizəd Qiymətləndirmə və Rəy Hesabatı
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={handlePrintReport}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Çap et / PDF</span>
                    </button>
                    <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 font-bold px-3 py-1 rounded-xl">
                      Ümumi Bal: {analysisResult.overallScore}%
                    </span>
                  </div>
                </div>

                {/* Score & ATS Metrics Hero */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                  <div className="md:col-span-4 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-[8px] border-blue-100 border-t-blue-600 flex items-center justify-center relative shrink-0 shadow-inner bg-white">
                      <div className="text-center">
                        <span className="block text-3xl font-extrabold text-slate-900 leading-none">
                          {analysisResult.overallScore}%
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1 block">
                          Uyğunluq Balı
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 font-medium block">ATS Robot Oxunaqlığı</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-lg font-bold text-slate-900">{analysisResult.atsScore}%</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Format Testi</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${analysisResult.atsScore}%` }}></div>
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 font-medium block">Əmək Bazarında Rəqabətlilik</span>
                      <span className="text-xs font-bold text-slate-900 mt-1 block line-clamp-1">{analysisResult.marketCompetitiveness}</span>
                      <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. 📋 NAMİZƏDİN ÜMUMİ XÜLASƏSİ */}
                {analysisResult.candidateSummary && (
                  <div className="bg-blue-50/40 border border-blue-200/70 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📋</span>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                        1. Namizədin Ümumi Xülasəsi (Faktiki Profil)
                      </h5>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {analysisResult.candidateSummary}
                    </p>
                  </div>
                )}

                {/* 2 & 3: ✅ GÜCLÜ TƏRƏFLƏRİ & ⚠️ RİSKLİ / ÇATIŞMAYAN MƏQAMLAR */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 2. ✅ Güclü Tərəfləri */}
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-2.5">
                    <p className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                      <span>✅</span>
                      <span className="uppercase tracking-wide">2. Güclü Tərəfləri</span>
                    </p>
                    <ul className="text-xs text-emerald-950/90 space-y-2">
                      {analysisResult.strengths?.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. ⚠️ Riskli və ya Çatışmayan Məqamlar */}
                  <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-2.5">
                    <p className="text-xs font-bold text-amber-950 flex items-center gap-2">
                      <span>⚠️</span>
                      <span className="uppercase tracking-wide">3. Riskli və ya Çatışmayan Məqamlar</span>
                    </p>
                    <ul className="text-xs text-amber-950/90 space-y-2">
                      {(analysisResult.weaknesses || []).map((weakness, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-100">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4. 📊 UYĞUNLUQ QİYMƏTLƏNDİRİLMƏSİ */}
                {analysisResult.matchAssessment && (
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📊</span>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          4. Uyğunluq Qiymətləndirilməsi & Kriteriyalar
                        </h5>
                      </div>
                      <span className="text-xs font-extrabold text-blue-700 bg-blue-100/70 px-3 py-1 rounded-xl">
                        Vakansiya / Bazar Uyğunluğu: {analysisResult.matchAssessment.matchPercentage}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white p-3 rounded-xl border border-slate-200/70">
                      <strong>Əsaslandırma:</strong> {analysisResult.matchAssessment.rationale}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                          <span>Təhsil və İxtisas:</span>
                        </span>
                        <p className="text-xs text-slate-600">{analysisResult.matchAssessment.educationMatch}</p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                          <span>İş Təcrübəsi və Sahə:</span>
                        </span>
                        <p className="text-xs text-slate-600">{analysisResult.matchAssessment.experienceMatch}</p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-purple-600" />
                          <span>Texniki & Hard Skills:</span>
                        </span>
                        <p className="text-xs text-slate-600">{analysisResult.matchAssessment.skillsMatch}</p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-amber-600" />
                          <span>Dil Bilikləri & Digər:</span>
                        </span>
                        <p className="text-xs text-slate-600">{analysisResult.matchAssessment.languagesMatch}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. 💡 HR TÖVSİYƏSİ */}
                {analysisResult.hrRecommendation && (
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                          5. HR Direktoru Tövsiyəsi & Qərarı
                        </h5>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                        {analysisResult.hrRecommendation.decision}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-indigo-200">Strateji Məsləhət və Növbəti Addımlar:</p>
                      <p className="text-xs text-slate-200 leading-relaxed font-normal">
                        {analysisResult.hrRecommendation.advice}
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Missing Keywords Section */}
              {analysisResult.missingKeywords && analysisResult.missingKeywords.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>CV-də Çatışmayan Tövsiyə Olunan Açar Sözlər</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">Klikləyərək kopyalayın</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missingKeywords.map((kw, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyKeyword(kw)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Kopyalamaq üçün klikləyin"
                      >
                        <span>{kw}</span>
                        {copiedKeyword === kw ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-amber-600 opacity-60" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Feedback Detailed List */}
              {analysisResult.actionableFeedback && analysisResult.actionableFeedback.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Bölmələr üzrə Təkmilləşdirmə Planı</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {analysisResult.actionableFeedback.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{item.section}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              item.priority === 'Yüksək'
                                ? 'bg-red-100 text-red-700'
                                : item.priority === 'Orta'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{item.issue}</p>
                        <p className="text-xs text-slate-700 font-normal pt-1 border-t border-slate-200/60">
                          💡 {item.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-xs font-medium">ATS Robot Oxunaqlığı</p>
                  <h3 className="text-2xl font-bold mt-1 text-slate-900">{analysisResult.atsScore}%</h3>
                  <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${analysisResult.atsScore}%` }}></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-xs font-medium">Bazar Rəqabətliliyi</p>
                  <h3 className="text-sm font-bold mt-1 text-slate-900 line-clamp-1">{analysisResult.marketCompetitiveness}</h3>
                  <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-4/5"></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-xs font-medium">Tövsiyə Olunan Vəzifələr</p>
                  <h3 className="text-xs font-bold mt-1 text-slate-900 line-clamp-1">
                    {analysisResult.suggestedJobTitles?.slice(0, 2).join(', ') || 'Müvafiq sahələr'}
                  </h3>
                  <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-3/4"></div>
                  </div>
                </div>
              </div>

              {/* AI Executive Summary */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>AI Baş Rəyi & Karyera Məsləhəti</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {analysisResult.summaryFeedback}
                </p>
              </div>

              {/* Call to action to apply fixes in CV Builder */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Bu CV-ni Düzəltmək və ya Şablonunu Yeniləmək İstəyirsiniz?</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    CV Generator bölməsində təklif olunan düzəlişləri avtomatik tətbiq edə və PDF formatında yükləyə bilərsiniz.
                  </p>
                </div>
                <button
                  onClick={extractedProfile && onImportCVData ? handleImportExtractedCV : onNavigateToBuilder}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0 cursor-pointer"
                >
                  <span>{extractedProfile ? 'CV Generatoruna Köçür' : 'CV Generatoruna Keç'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">CV Analizi Üçün Fayl Yükləyin və ya Seçin</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Yuxarıdakı bölmədən PDF və ya Word sənədinizi yükləyib <strong className="text-slate-700">"CV-ni Dərindən Analiz Et"</strong> düyməsinə klikləyin. Sistem beynəlxalq ATS və işə qəbul standartları ilə tam audit təqdim edəcək.
              </p>
            </div>
          )}
        </div>

        {/* Dedicated ATS Optimization Sidebar Column */}
        {isSidebarOpen && (
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-4">
            <ATSOptimizationSidebar
              cvData={effectiveSidebarCVData}
              targetVacancy={selectedVacancy}
              customText={sourceMode === 'custom_text' ? customText : undefined}
              onNavigateToBuilder={onNavigateToBuilder}
              onToggleOpen={() => setIsSidebarOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Dynamic Animated Section Footer with Job Intelligence & Automation */}
      <JobiaSectionFooter 
        extraTagline="Süni İntellekt dəstəyi ilə CV analizi, sənəd yüklənməsi, ATS balı və beynəlxalq audit"
        showBackToTop={true}
      />
    </div>
  );
};
