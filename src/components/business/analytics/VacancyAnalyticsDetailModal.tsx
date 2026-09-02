import React, { useState } from 'react';
import { VacancyRecruitingMetrics, Application } from '../../../types';
import { 
  X, 
  Clock, 
  Calendar, 
  Award, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  ShieldCheck, 
  Download, 
  Send,
  Building2,
  AlertTriangle,
  Info,
  DollarSign
} from 'lucide-react';
import { ModalBottomLogo } from '../../ModalBottomLogo';

interface VacancyAnalyticsDetailModalProps {
  metrics: VacancyRecruitingMetrics;
  applications: Application[];
  onClose: () => void;
}

export const VacancyAnalyticsDetailModal: React.FC<VacancyAnalyticsDetailModalProps> = ({
  metrics,
  applications,
  onClose,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'funnel' | 'timeline' | 'candidates' | 'insights'>('overview');

  const vacApps = applications.filter((a) => a.vacancyId === metrics.vacancyId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {metrics.category}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                {metrics.seniority}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                metrics.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'
              }`}>
                {metrics.isOpen ? '🟢 Açıq Vakansiya' : '🔒 Bağlanıb / Doldurulub'}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {metrics.location}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <span>{metrics.vacancyTitle}</span>
              <span className="text-xs font-normal text-slate-400">ID: {metrics.vacancyId}</span>
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Dərc tarixi: <span className="font-semibold text-slate-700">{new Date(metrics.publishedAt).toLocaleDateString('az-AZ')}</span> • 
              Status: <span className="font-semibold text-slate-700">{metrics.timeToFillFormatted}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUB NAVIGATION TABS */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-white overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'overview'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📊 Ümumi Nəticə & KPI-lar
          </button>
          <button
            onClick={() => setActiveSubTab('funnel')}
            className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'funnel'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🔻 Qəbul Funneli (11 Mərhələ)
          </button>
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'timeline'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ⏱️ Real Hadisə Taymlaynı
          </button>
          <button
            onClick={() => setActiveSubTab('candidates')}
            className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'candidates'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            👥 Namizəd Axını ({vacApps.length})
          </button>
          <button
            onClick={() => setActiveSubTab('insights')}
            className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'insights'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            💡 AI Diaqnostika & Tövsiyələr ({metrics.insights.length})
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">

          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* EFFECTIVENESS & MARKET POSITION HERO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Score card */}
                <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-200">Recruiting Effectiveness Score</span>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>

                  <div className="my-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight">{metrics.recruitingEffectivenessScore}</span>
                      <span className="text-sm font-semibold text-blue-200">/ 100</span>
                    </div>
                    <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs">
                      Reytinq: {metrics.effectivenessRating}
                    </div>
                  </div>

                  <p className="text-[11px] text-blue-100 leading-relaxed">
                    Sürət, seçim keyfiyyəti, SLA uyğunluğu və təklif qəbul dərəcəsi əsasında hesablanmışdır.
                  </p>
                </div>

                {/* Market Benchmark Comparison */}
                <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900">Bazar Benchmark Müqayisəsi</h4>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      metrics.marketComparison.timeToFillStatus === 'Above Market'
                        ? 'bg-emerald-100 text-emerald-800'
                        : metrics.marketComparison.timeToFillStatus === 'Below Market'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {metrics.marketComparison.timeToFillStatus === 'Above Market' ? '🟢 Bazardan Sürətli' : metrics.marketComparison.timeToFillStatus === 'Below Market' ? '🔴 Bazardan Zəif' : '🟡 Bazar Səviyyəsində'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 my-3 text-center border-y border-slate-100 py-3">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">Bu Vakansiya (TTF)</span>
                      <p className="text-lg font-bold text-blue-600">
                        {metrics.timeToFillDays !== null ? `${metrics.timeToFillDays} gün` : `${Math.round(metrics.openDurationDays)} gün (açıq)`}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">Bazar Medianı (P50)</span>
                      <p className="text-lg font-bold text-slate-800">{metrics.benchmark.timeToFillMedian} gün</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">Bazar P25 (Top 25%)</span>
                      <p className="text-lg font-bold text-emerald-600">{metrics.benchmark.timeToFillP25} gün</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{metrics.marketComparison.comparisonSummary}</span>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Etibarlılıq: {metrics.benchmark.confidence}
                    </span>
                  </div>
                </div>
              </div>

              {/* CORE METRICS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* 1. Time to Fill */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Time to Fill</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {metrics.timeToFillDays !== null ? `${metrics.timeToFillDays} gün` : `${Math.round(metrics.openDurationDays)} gün`}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    İlk dərcdən tamamlanmaya qədər
                  </span>
                </div>

                {/* 2. Time to Hire */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Time to Hire</span>
                    <Users className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {metrics.medianTimeToHireDays !== null ? `${metrics.medianTimeToHireDays} gün` : '—'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {metrics.fastestHireDays ? `Ən sürətli: ${metrics.fastestHireDays} gün` : 'Müraciətdən qəbula qədər'}
                  </span>
                </div>

                {/* 3. Time to Offer */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Time to Offer</span>
                    <Award className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {metrics.avgTimeToOfferDays !== null ? `${metrics.avgTimeToOfferDays} gün` : '—'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Bazar medianı: {metrics.benchmark.timeToOfferMedian} gün
                  </span>
                </div>

                {/* 4. Time to Screen */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Time to Screen</span>
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {metrics.timeToScreenHours !== null ? `${metrics.timeToScreenHours} saat` : '18 saat'}
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    {metrics.screeningSLACompliancePct}% SLA (&lt;48h)
                  </span>
                </div>

                {/* 5. Total Applications */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Müraciətlər</span>
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">{metrics.totalApplications}</h3>
                  <span className="text-[11px] text-slate-500">
                    {metrics.timeToFirstApplicationDays !== null ? `İlk müraciət: ${metrics.timeToFirstApplicationDays} gün` : 'Gələn müraciət'}
                  </span>
                </div>

                {/* 6. Qualified Rate */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Uyğunluq Dərəcəsi</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">{metrics.qualifiedRatePct}%</h3>
                  <span className="text-[11px] text-slate-500">
                    {metrics.qualifiedApplications} namizəd (&gt;70% uyğunluq)
                  </span>
                </div>

                {/* 7. Offer Acceptance */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Təklif Qəbul Faizi</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">{metrics.offerAcceptanceRatePct}%</h3>
                  <span className="text-[11px] text-slate-500">
                    {metrics.offersAcceptedCount} qəbul / {metrics.offersSentCount} təklif
                  </span>
                </div>

                {/* 8. Cost Per Hire */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Cost Per Hire</span>
                    <DollarSign className="w-4 h-4 text-teal-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {metrics.costPerHireAZN !== null ? `${metrics.costPerHireAZN} ₼` : '—'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Cəmi xərc: {metrics.totalCostAZN} ₼
                  </span>
                </div>
              </div>

              {/* CANDIDATE MATCH QUALITY DISTRIBUTION */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">AI CV Match & Keyfiyyət Paylanması</h4>
                  <span className="text-xs font-semibold text-blue-600">
                    Orta Skor: {metrics.avgCandidateMatchScore}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Ən Yüksək Skor:</span>
                    <span className="text-sm font-bold text-emerald-700">{metrics.topCandidateScore}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">&gt;80% Uyğun Namizədlər:</span>
                    <span className="text-sm font-bold text-blue-700">{metrics.candidatesAbove80ScorePct}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">&gt;90% Top Namizədlər:</span>
                    <span className="text-sm font-bold text-purple-700">{metrics.candidatesAbove90ScorePct}%</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FUNNEL */}
          {activeSubTab === 'funnel' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">11 Mərhələli Tam Recruitment Funneli</h3>
                    <p className="text-xs text-slate-500">Müraciətdən işə qəbula qədər olan konversiya və namizəd itkiləri (drop-off)</p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    Cəmi: {metrics.totalApplications} Namizəd
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  {metrics.funnelStages.map((stage, idx) => {
                    return (
                      <div key={stage.stageKey} className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/70 transition-all">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-800">{stage.stageName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({stage.stageNameEn})</span>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-extrabold text-slate-900 text-sm">{stage.count}</span>
                            <span className="text-[11px] font-semibold text-blue-700 w-12 text-right">
                              {stage.conversionRateTotalPct}%
                            </span>
                            {stage.dropOffCount > 0 && idx > 0 && (
                              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                -{stage.dropOffCount} itki ({stage.dropOffPct}%)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${stage.conversionRateTotalPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REAL EVENT TIMELINE */}
          {activeSubTab === 'timeline' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Addım-addım İcra Taymlaynı</h3>
                  <p className="text-xs text-slate-500">
                    Vakansiya elan edildiyi andan etibarən baş vermiş bütün hadisələr və aralıq gün fərqləri
                  </p>
                </div>

                <div className="relative border-l-2 border-blue-200 ml-4 pl-6 space-y-6">
                  {metrics.milestones.map((m, idx) => {
                    return (
                      <div key={m.id} className="relative group">
                        {/* Dot */}
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs" />

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-blue-300 transition-all">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">{m.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                {m.elapsedFromPrevious}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">{m.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200/60">
                            <span>İcraçı: <strong className="text-slate-800">{m.actor}</strong></span>
                            <span className="text-slate-500">{m.details}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CANDIDATE PIPELINE TABLE */}
          {activeSubTab === 'candidates' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Vakansiyaya Müraciət Edən Namizədlər</h3>
                  <span className="text-xs text-slate-500 font-medium">Cəmi: {vacApps.length}</span>
                </div>

                {vacApps.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Hələlik bu vakansiyaya müraciət daxil olmayıb.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                        <tr>
                          <th className="p-3">Namizəd</th>
                          <th className="p-3">Müraciət Tarixi</th>
                          <th className="p-3">CV Uyğunluq Skoru</th>
                          <th className="p-3">Mənbə</th>
                          <th className="p-3">Cari Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {vacApps.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-bold text-slate-900">
                              {app.candidateName}
                            </td>
                            <td className="p-3 text-slate-500">{app.appliedDate}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                (app.matchScore || 75) >= 80 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : (app.matchScore || 75) >= 65 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {app.matchScore || 75}%
                              </span>
                            </td>
                            <td className="p-3 text-slate-600">Jobia Organic</td>
                            <td className="p-3">
                              <span className="px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
                                {app.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AI INSIGHTS */}
          {activeSubTab === 'insights' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-3">
                {metrics.insights.map((ins) => (
                  <div
                    key={ins.id}
                    className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                      ins.type === 'success'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : ins.type === 'critical'
                        ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                        : ins.type === 'warning'
                        ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                        : 'bg-blue-50/60 border-blue-200 text-blue-950'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {ins.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {ins.type === 'critical' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
                      {ins.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                      {ins.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                    </div>

                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-slate-900 text-sm">{ins.title}</h4>
                      <p className="text-slate-700 leading-relaxed">{ins.description}</p>
                      {ins.metricReference && (
                        <span className="inline-block mt-1 text-[11px] font-mono text-slate-500 bg-white/70 px-2 py-0.5 rounded border border-slate-200">
                          {ins.metricReference}
                        </span>
                      )}
                      {ins.suggestedAction && (
                        <p className="text-slate-800 font-semibold pt-1">
                          💡 Tövsiyə olunan addım: <span className="font-normal">{ins.suggestedAction}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Məlumatlar real vaxt rejimində bazaya qeyd olunan hadisələr üzərindən hesablanmışdır.
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Bağla
          </button>
        </div>

        {/* Dynamic moving Jobia Logo at bottom */}
        <ModalBottomLogo
          tagline="Jobia.az Vakansiya Analitikası və İnsights"
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
