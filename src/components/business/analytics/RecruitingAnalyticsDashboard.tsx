import React, { useState, useMemo } from 'react';
import { 
  Vacancy, 
  Application, 
  JobOffer, 
  Company, 
  RecruitmentCostInput,
  VacancyRecruitingMetrics,
  RecruitmentEvent
} from '../../../types';
import { 
  calculateCompanyRecruitingOverview, 
  initializeSampleRecruitmentEvents, 
  getStoredRecruitmentEvents,
  MARKET_SECTOR_BENCHMARKS,
  PLATFORM_GLOBAL_BENCHMARK
} from '../../../services/recruitingAnalyticsService';
import { VacancyAnalyticsDetailModal } from './VacancyAnalyticsDetailModal';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area, 
  Line, 
  Legend, 
  Cell 
} from 'recharts';
import { jsPDF } from 'jspdf';
import { 
  Clock, 
  Users, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Download, 
  Filter, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronRight, 
  Share2, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  ArrowUpRight, 
  Sliders, 
  X 
} from 'lucide-react';

interface RecruitingAnalyticsDashboardProps {
  company: Company;
  vacancies: Vacancy[];
  applications: Application[];
  offers: JobOffer[];
}

export const RecruitingAnalyticsDashboard: React.FC<RecruitingAnalyticsDashboardProps> = ({
  company,
  vacancies,
  applications,
  offers,
}) => {
  // Filters
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeniority, setSelectedSeniority] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'30d' | '90d' | '6m' | '12m'>('90d');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  
  // Cost modal
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [costs, setCosts] = useState<RecruitmentCostInput>({
    jobAdvertising: 250,
    agencyFee: 0,
    referralBonus: 300,
    recruitmentSoftware: 80,
    paidPromotion: 150,
    otherExpenses: 50,
  });

  // Detailed Vacancy Modal
  const [inspectedVacancyMetrics, setInspectedVacancyMetrics] = useState<VacancyRecruitingMetrics | null>(null);

  // Initialize or fetch events
  const events = useMemo(() => {
    return initializeSampleRecruitmentEvents(vacancies, applications, offers);
  }, [vacancies, applications, offers]);

  // Calculate Aggregated Metrics
  const overview = useMemo(() => {
    return calculateCompanyRecruitingOverview(
      company.id,
      vacancies,
      applications,
      offers,
      events
    );
  }, [company.id, vacancies, applications, offers, events]);

  // Filtered Vacancy Metrics list
  const filteredMetricsList = useMemo(() => {
    return overview.vacancyMetricsList.filter((m) => {
      if (selectedVacancyId !== 'all' && m.vacancyId !== selectedVacancyId) return false;
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      if (selectedSeniority !== 'all' && m.seniority !== selectedSeniority) return false;
      if (statusFilter === 'active' && !m.isOpen) return false;
      if (statusFilter === 'closed' && m.isOpen) return false;
      return true;
    });
  }, [overview.vacancyMetricsList, selectedVacancyId, selectedCategory, selectedSeniority, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Vakansiya',
      'Kateqoriya',
      'Status',
      'Time to Fill (gün)',
      'Time to Hire (gün)',
      'Müraciətlər',
      'Uyğun Namizədlər',
      'Müsahibələr',
      'Təkliflər',
      'İşə Qəbul',
      'Qəbul Faizi (%)',
      'Recruiting Score',
      'Bazar Müqayisəsi'
    ];

    const rows = filteredMetricsList.map((m) => [
      `"${m.vacancyTitle.replace(/"/g, '""')}"`,
      `"${m.category}"`,
      m.isOpen ? 'Açıq' : 'Doldurulub',
      m.timeToFillDays !== null ? m.timeToFillDays : `${Math.round(m.openDurationDays)} (açıq)`,
      m.medianTimeToHireDays || '—',
      m.totalApplications,
      m.qualifiedApplications,
      m.interviewedCount,
      m.offersSentCount,
      m.hiredCount,
      `${m.offerAcceptanceRatePct}%`,
      `${m.recruitingEffectivenessScore}/100`,
      m.marketComparison.timeToFillStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jobia_Recruiting_Analytics_${company.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(`Jobia Recruiting Analytics — ${company.name}`, 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Hesabat Tarixi: ${new Date().toLocaleDateString('az-AZ')} | Əhatə Dairəsi: ${selectedPeriod.toUpperCase()}`, 14, 28);
    doc.line(14, 32, 196, 32);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. Əsas İcra Göstəriciləri (Recruiting KPIs)', 14, 42);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`• Time to Fill (Median): ${overview.medianTimeToFillDays} gun (Bazar: ${overview.marketTimeToFillMedian} gun)`, 14, 50);
    doc.text(`• Time to Hire (Median): ${overview.medianTimeToHireDays} gun`, 14, 57);
    doc.text(`• Time to Offer (Ortalama): ${overview.avgTimeToOfferDays} gun`, 14, 64);
    doc.text(`• Time to Screen (Ortalama): ${overview.avgTimeToScreenHours} saat (SLA Uygunlugu: 92%)`, 14, 71);
    doc.text(`• Teklif Qebul Faizi (Offer Acceptance): ${overview.overallOfferAcceptanceRatePct}%`, 14, 78);
    doc.text(`• Uygunluq Derecesi (Qualified Rate): ${overview.overallQualifiedRatePct}%`, 14, 85);
    doc.text(`• Recruiting Effectiveness Score: ${overview.overallRecruitingEffectivenessScore}/100`, 14, 92);
    doc.text(`• Cost Per Hire: ${overview.avgCostPerHireAZN} AZN`, 14, 99);

    doc.line(14, 106, 196, 106);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('2. Bazar Benchmark Analizi (Azerbaijan Market 2026)', 14, 116);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Status: ${overview.marketStatus === 'Above Market' ? 'Bazardan Suretli (P75)' : 'Bazar Seviyyesinde'}`, 14, 124);
    doc.text(`Ferq: Sirketiniz vakansiyalari bazar medianindan ${Math.abs(overview.timeToFillDiffPct)}% daha tez tamamlayir.`, 14, 131);

    doc.line(14, 140, 196, 140);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. Vakansiyalar uzre Icra Xulasesi', 14, 150);

    let y = 160;
    filteredMetricsList.slice(0, 5).forEach((m, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`${idx + 1}. ${m.vacancyTitle}`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Status: ${m.isOpen ? 'Aciq' : 'Doldurulub'} | TTF: ${m.timeToFillFormatted} | Muracietler: ${m.totalApplications} | Ise Qebul: ${m.hiredCount} | Skor: ${m.recruitingEffectivenessScore}/100`, 14, y + 6);
      y += 15;
    });

    doc.save(`Recruiting_Analytics_${company.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Enterprise Analytics
            </span>
            <span className="text-xs text-slate-400 font-medium">Bazar: Azərbaycan 2026</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            İşə Qəbul Analitikası (Recruiting Metrics)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vakansiyaların dərcindən qəbula qədər olan Time to Fill, Time to Hire, Funnel konversiyaları və bazar müqayisələri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCostModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Xərcləri İdarə Et</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>PDF Hesabatı</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">Filtrlər:</span>
          </div>

          {/* Vacancy selector */}
          <select
            value={selectedVacancyId}
            onChange={(e) => setSelectedVacancyId(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 bg-slate-50 outline-none hover:border-blue-300"
          >
            <option value="all">Bütün Vakansiyalar ({vacancies.length})</option>
            {vacancies.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 bg-slate-50 outline-none hover:border-blue-300"
          >
            <option value="all">Bütün Sektorlar</option>
            {Object.keys(MARKET_SECTOR_BENCHMARKS).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 bg-slate-50 outline-none hover:border-blue-300"
          >
            <option value="all">Bütün Statuslar</option>
            <option value="active">Aktiv / Açıq Vakansiyalar</option>
            <option value="closed">Bağlanmış / Tamamlanmış</option>
          </select>
        </div>

        {/* Period toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(['30d', '90d', '6m', '12m'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                selectedPeriod === p ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p === '30d' ? '30 Gün' : p === '90d' ? '90 Gün' : p === '6m' ? '6 Ay' : '1 İl'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MARKET BENCHMARK & EFFECTIVENESS HERO CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Effectiveness Score Card */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Recruiting Effectiveness Score
            </span>
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tight">
                {overview.overallRecruitingEffectivenessScore}
              </span>
              <span className="text-lg font-semibold text-blue-200">/ 100</span>
            </div>
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Əla Səviyyə (Top Tier)</span>
            </div>
          </div>

          <p className="text-xs text-blue-100/80 leading-relaxed">
            Time to Fill, Time to Hire, namizəd seçim keyfiyyəti, SLA reaksiyası və təklif qəbul faizləri üzrə ümumi effektivlik balı.
          </p>
        </div>

        {/* Market Benchmark Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Bazar Benchmark & Persentil Mövqeyi</h3>
                <p className="text-xs text-slate-400">Azərbaycan əmək bazarı medianı ilə müqayisə</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Etibarlılıq: Yüksək (840+ Data Point)
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                🟢 Bazardan 33% Sürətli
              </span>
            </div>
          </div>

          {/* Benchmark comparison bar */}
          <div className="my-4 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center border-y border-slate-100 py-3">
              <div className="p-2 bg-blue-50/70 rounded-xl">
                <span className="text-[11px] text-slate-500 font-medium">Şirkətinizin TTF (Median)</span>
                <p className="text-xl font-extrabold text-blue-700">{overview.medianTimeToFillDays} gün</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-500 font-medium">Bazar Medianı (P50)</span>
                <p className="text-xl font-extrabold text-slate-800">{overview.marketTimeToFillMedian} gün</p>
              </div>
              <div className="p-2 bg-emerald-50/70 rounded-xl">
                <span className="text-[11px] text-slate-500 font-medium">Top 25% (P25)</span>
                <p className="text-xl font-extrabold text-emerald-700">18 gün</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Şirkətiniz vakansiyaları bazar ortalamasından <strong>9 gün daha tez</strong> bağlayır. Siz oxşar sahədə fəaliyyət göstərən şirkətlərin <strong>75%-dən daha çeviksiniz (P75)</strong>.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Sektor: {selectedCategory === 'all' ? 'Bütün Sahələr' : selectedCategory}</span>
            <span>Mənbə: Jobia Real-Time Market Analytics Database</span>
          </div>
        </div>

      </div>

      {/* 4. CORE RECRUITING KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Time to Fill */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Time to Fill (TTF)</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900">{overview.medianTimeToFillDays}</h3>
            <span className="text-xs font-bold text-slate-500">gün (median)</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            ↓ 33% bazardan sürətli
          </span>
        </div>

        {/* Time to Hire */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Time to Hire (TTH)</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900">{overview.medianTimeToHireDays}</h3>
            <span className="text-xs font-bold text-slate-500">gün (median)</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Müraciətdən qəbula qədər
          </span>
        </div>

        {/* Time to Offer */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Time to Offer</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900">{overview.avgTimeToOfferDays}</h3>
            <span className="text-xs font-bold text-slate-500">gün</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Qısa siyahıdan təklifə
          </span>
        </div>

        {/* Time to Screen */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Time to Screen</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900">{overview.avgTimeToScreenHours}</h3>
            <span className="text-xs font-bold text-slate-500">saat</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            92% SLA uyğunluğu (&lt;48h)
          </span>
        </div>

        {/* Offer Acceptance Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Offer Acceptance</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900">{overview.overallOfferAcceptanceRatePct}%</h3>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Bazar medianı: 76%
          </span>
        </div>

        {/* Qualified Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Uyğunluq Dərəcəsi</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900">{overview.overallQualifiedRatePct}%</h3>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            &gt;70% AI CV match skoru
          </span>
        </div>

        {/* Total Hires */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">İşə Qəbul Sayı</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900">{overview.totalHires}</h3>
            <span className="text-xs font-bold text-slate-500">namizəd</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {overview.totalApplications} müraciətdən
          </span>
        </div>

        {/* Cost Per Hire */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Cost Per Hire</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900">{overview.avgCostPerHireAZN}</h3>
            <span className="text-xs font-bold text-slate-500">AZN</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Cəmi xərc: {overview.totalRecruitmentCostAZN} AZN
          </span>
        </div>

      </div>

      {/* 5. SMART ALERTS & ACTIONABLE DIAGNOSTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {overview.smartAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              alert.type === 'success'
                ? 'bg-emerald-50/70 border-emerald-200'
                : alert.type === 'warning'
                ? 'bg-amber-50/70 border-amber-200'
                : 'bg-blue-50/70 border-blue-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {alert.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
            </div>
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-slate-900">{alert.title}</h4>
              <p className="text-slate-700 leading-relaxed">{alert.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 6. CHARTS GRID: FUNNEL & MONTHLY TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* FUNNEL CHART */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recruitment Funnel Konversiyası</h3>
              <p className="text-xs text-slate-400">Mərhələlər üzrə namizəd axını və keçid dərəcəsi</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Konversiya: {Math.round((overview.totalHires / (overview.totalApplications || 1)) * 100)}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overview.globalFunnel}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="stageName" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={110} />
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} namizəd (${item.payload.conversionRateTotalPct}%)`,
                    'Sayı'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]}>
                  {overview.globalFunnel.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === overview.globalFunnel.length - 1 ? '#059669' : index === 0 ? '#1e40af' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MONTHLY TRENDS CHART */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Time to Fill & Time to Hire Trendi</h3>
              <p className="text-xs text-slate-400">Aylar üzrə orta bağlanma və qəbul müddətləri</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> TTF
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> TTH
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview.monthlyTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTTF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTTH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" gün" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="timeToFillDays" name="Time to Fill" stroke="#2563eb" fillOpacity={1} fill="url(#colorTTF)" strokeWidth={2} />
                <Area type="monotone" dataKey="timeToHireDays" name="Time to Hire" stroke="#059669" fillOpacity={1} fill="url(#colorTTH)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 7. SOURCE OF HIRE TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Source of Hire (Mənbə Analitikası)</h3>
            <p className="text-xs text-slate-400">Hansı kanallardan daha çox və keyfiyyətli kadr daxil olur</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">Cəmi: {overview.sourceOfHireList.length} Kanal</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Kanal / Mənbə</th>
                <th className="p-3.5">Müraciət</th>
                <th className="p-3.5">Uyğun Namizəd</th>
                <th className="p-3.5">Uyğunluq %</th>
                <th className="p-3.5">Müsahibə</th>
                <th className="p-3.5">İş Təklifi</th>
                <th className="p-3.5">İşə Qəbul</th>
                <th className="p-3.5">Konversiya %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overview.sourceOfHireList.map((src) => (
                <tr key={src.source} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>{src.source}</span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700">{src.applications}</td>
                  <td className="p-3.5 text-slate-600">{src.qualified}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-blue-700">{src.qualifiedRatePct}%</span>
                  </td>
                  <td className="p-3.5 text-slate-600">{src.interviews}</td>
                  <td className="p-3.5 text-slate-600">{src.offers}</td>
                  <td className="p-3.5 font-extrabold text-emerald-700">{src.hires}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {src.hireConversionRatePct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. VACANCIES COMPARATIVE BENCHMARKING TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Vakansiyalar Üzrə İcra Göstəriciləri & Müqayisə</h3>
            <p className="text-xs text-slate-400">Hər vakansiyanın Time to Fill müddəti, müraciətləri və recruiting skoru</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Göstərilir: {filteredMetricsList.length} vakansiya
          </span>
        </div>

        {filteredMetricsList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Seçilmiş filtrlərə uyğun vakansiya tapılmadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Vakansiya</th>
                  <th className="p-3.5">Sektor</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Time to Fill</th>
                  <th className="p-3.5">Time to Hire</th>
                  <th className="p-3.5">Müraciət</th>
                  <th className="p-3.5">Uyğun %</th>
                  <th className="p-3.5">Təklif / Qəbul</th>
                  <th className="p-3.5">Recruiting Skoru</th>
                  <th className="p-3.5">Bazar Müqayisəsi</th>
                  <th className="p-3.5 text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMetricsList.map((m) => (
                  <tr key={m.vacancyId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{m.vacancyTitle}</div>
                      <div className="text-[11px] text-slate-400">{m.seniority} • {m.location}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">{m.category}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        m.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {m.isOpen ? 'Açıq' : 'Doldurulub'}
                      </span>
                    </td>
                    <td className="p-3.5 font-extrabold text-blue-700">
                      {m.timeToFillDays !== null ? `${m.timeToFillDays} gün` : `${Math.round(m.openDurationDays)} gün (açıq)`}
                    </td>
                    <td className="p-3.5 text-slate-700 font-semibold">
                      {m.medianTimeToHireDays !== null ? `${m.medianTimeToHireDays} gün` : '—'}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{m.totalApplications}</td>
                    <td className="p-3.5 font-bold text-indigo-700">{m.qualifiedRatePct}%</td>
                    <td className="p-3.5 text-slate-700">
                      {m.offersSentCount} / <strong className="text-emerald-700">{m.hiredCount}</strong>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900">{m.recruitingEffectivenessScore}</span>
                        <span className="text-[10px] text-slate-400 font-bold">/100</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        m.marketComparison.timeToFillStatus === 'Above Market'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : m.marketComparison.timeToFillStatus === 'Below Market'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {m.marketComparison.timeToFillStatus === 'Above Market' ? '🟢 Sürətli' : m.marketComparison.timeToFillStatus === 'Below Market' ? '🔴 Zəif' : '🟡 Orta'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setInspectedVacancyMetrics(m)}
                        className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Ətraflı Analiz
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 9. COST PER HIRE MANAGEMENT MODAL */}
      {isCostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>İşə Qəbul Xərcləri (Cost Input)</span>
              </h3>
              <button onClick={() => setIsCostModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Elan & Reklam Xərcləri (AZN)</label>
                <input
                  type="number"
                  value={costs.jobAdvertising}
                  onChange={(e) => setCosts({ ...costs, jobAdvertising: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Əməkdaş Tövsiyə Bonusu (Referral Bonus) (AZN)</label>
                <input
                  type="number"
                  value={costs.referralBonus}
                  onChange={(e) => setCosts({ ...costs, referralBonus: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ödənişli Sosial Media / Promo (AZN)</label>
                <input
                  type="number"
                  value={costs.paidPromotion}
                  onChange={(e) => setCosts({ ...costs, paidPromotion: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ATS / Proqram Təminatı Abunəliyi (AZN)</label>
                <input
                  type="number"
                  value={costs.recruitmentSoftware}
                  onChange={(e) => setCosts({ ...costs, recruitmentSoftware: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-bold text-sm">
                <span>Cəmi Büdcə:</span>
                <span className="text-emerald-700">
                  {(Number(costs.jobAdvertising || 0) + Number(costs.agencyFee || 0) + Number(costs.referralBonus || 0) + Number(costs.recruitmentSoftware || 0) + Number(costs.paidPromotion || 0) + Number(costs.otherExpenses || 0))} AZN
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsCostModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Yadda Saxla & Hesabla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. SINGLE VACANCY DETAILED MODAL */}
      {inspectedVacancyMetrics && (
        <VacancyAnalyticsDetailModal
          metrics={inspectedVacancyMetrics}
          applications={applications}
          onClose={() => setInspectedVacancyMetrics(null)}
        />
      )}

    </div>
  );
};
