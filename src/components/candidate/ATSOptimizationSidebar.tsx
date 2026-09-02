import React, { useState, useMemo } from 'react';
import { CVData, Vacancy } from '../../types';
import { 
  analyzeCVForATS, 
  ATSOptimizationAnalysis, 
  ATSKeywordMatch,
  ATSFormattingCheck
} from '../../utils/atsOptimizer';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Search, 
  Copy, 
  Check, 
  FileText, 
  Zap, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  Layers, 
  ArrowRight, 
  Sliders, 
  HelpCircle,
  Hash,
  ExternalLink
} from 'lucide-react';

interface ATSOptimizationSidebarProps {
  cvData: CVData;
  targetVacancy?: Vacancy | null;
  customText?: string;
  onNavigateToBuilder: () => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  className?: string;
}

export const ATSOptimizationSidebar: React.FC<ATSOptimizationSidebarProps> = ({
  cvData,
  targetVacancy,
  customText,
  onNavigateToBuilder,
  isOpen = true,
  onToggleOpen,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'keywords' | 'formatting' | 'ai-fixes' | 'raw-parser'>('keywords');
  const [keywordFilter, setKeywordFilter] = useState<'all' | 'missing' | 'optimal' | 'critical'>('all');
  const [keywordSearch, setKeywordSearch] = useState('');
  const [formattingCategoryFilter, setFormattingCategoryFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>('measurable_metrics');

  // AI Live generator state
  const [isGeneratingFix, setIsGeneratingFix] = useState(false);
  const [generatedAISnippet, setGeneratedAISnippet] = useState<string | null>(null);
  const [activeFixType, setActiveFixType] = useState<'summary' | 'bullets' | 'skills' | null>(null);

  // Real-time calculated ATS analysis
  const atsAnalysis: ATSOptimizationAnalysis = useMemo(() => {
    return analyzeCVForATS(cvData, targetVacancy, customText);
  }, [cvData, targetVacancy, customText]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered Keywords
  const filteredKeywords = useMemo(() => {
    return atsAnalysis.keywords.filter((kw) => {
      // Search term
      if (keywordSearch.trim() && !kw.keyword.toLowerCase().includes(keywordSearch.toLowerCase())) {
        return false;
      }
      if (keywordFilter === 'missing') return kw.densityStatus === 'missing';
      if (keywordFilter === 'optimal') return kw.densityStatus === 'optimal' || kw.densityStatus === 'low';
      if (keywordFilter === 'critical') return kw.importance === 'Kritik';
      return true;
    });
  }, [atsAnalysis.keywords, keywordFilter, keywordSearch]);

  // Filtered Formatting Checks
  const filteredFormattingChecks = useMemo(() => {
    if (formattingCategoryFilter === 'all') return atsAnalysis.formattingChecks;
    return atsAnalysis.formattingChecks.filter((c) => c.category === formattingCategoryFilter);
  }, [atsAnalysis.formattingChecks, formattingCategoryFilter]);

  // Generate live AI customized fix
  const handleGenerateAIFix = async (type: 'summary' | 'bullets' | 'skills') => {
    setIsGeneratingFix(true);
    setActiveFixType(type);
    setGeneratedAISnippet(null);

    const missingKeywordsList = atsAnalysis.keywords
      .filter((k) => k.densityStatus === 'missing')
      .slice(0, 5)
      .map((k) => k.keyword);

    try {
      const response = await fetch('/api/ai/generate-cv-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type === 'summary' ? 'summary' : type === 'bullets' ? 'experience_bullets' : 'skills',
          role: atsAnalysis.targetJobTitle,
          keywords: missingKeywordsList.length > 0 ? missingKeywordsList : ['liderlik', 'nəticəyönümlülük', 'optimizasiya'],
          currentText: type === 'summary' ? cvData.personalInfo.summary : '',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedAISnippet(data.content);
      } else {
        // Fallback
        setGeneratedAISnippet(
          type === 'summary'
            ? `${atsAnalysis.targetJobTitle} sahəsində təcrübəyə malik nəticəyönümlü mütəxəssis. ${missingKeywordsList.join(', ')} sahəsində praktiki biliklər və layihə idarəetməsi ilə komandanın strateji hədəflərinə dəyər qatıram.`
            : `• ${atsAnalysis.targetJobTitle} vəzifəsi üzrə əsas layihələrin icrası və proseslərin 25% optimallaşdırılması.\n• ${missingKeywordsList.slice(0, 2).join(' və ')} metodologiyaları əsasında tapşırıqların uğurla təhvili.`
        );
      }
    } catch (err) {
      console.warn('AI fix generation fallback:', err);
      setGeneratedAISnippet(
        `${atsAnalysis.targetJobTitle} sahəsi üzrə ${missingKeywordsList.join(', ')} istiqamətində layihələrin effektiv idarə olunması və səmərəli nəticələrin təmini.`
      );
    } finally {
      setIsGeneratingFix(false);
    }
  };

  const getStatusBadge = (status: ATSKeywordMatch['densityStatus']) => {
    switch (status) {
      case 'optimal':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Optimal (1-3.5%)</span>;
      case 'low':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">1x Tapıldı</span>;
      case 'missing':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">0x Çatışmır</span>;
      case 'high':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Yüksək (3.5-5%)</span>;
      case 'stuffing':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Həddən çox ({'>'}5%)</span>;
    }
  };

  return (
    <div
      id="ats-optimization-sidebar"
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* 1. Header Section */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">ATS Optimizasiya Paneli</h3>
                <span className="text-[9px] bg-blue-500/30 text-blue-300 border border-blue-400/40 px-1.5 py-0.2 rounded font-bold uppercase">
                  Real-Vaxt AI
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate max-w-[240px] sm:max-w-xs">
                Hədəf: <span className="text-blue-300 font-semibold">{atsAnalysis.targetJobTitle}</span>
                {atsAnalysis.targetCompany && ` (${atsAnalysis.targetCompany})`}
              </p>
            </div>
          </div>

          {onToggleOpen && (
            <button
              onClick={onToggleOpen}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              title="Paneli Gizlət / Göstər"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Score & Projection Gauge */}
        <div className="mt-3.5 pt-3 border-t border-slate-700/60 grid grid-cols-3 gap-2">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-medium block">Cari ATS Balı</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-xl font-bold ${
                atsAnalysis.atsRankScore >= 80 ? 'text-emerald-400' : atsAnalysis.atsRankScore >= 60 ? 'text-blue-400' : 'text-amber-400'
              }`}>
                {atsAnalysis.atsRankScore}%
              </span>
              <span className="text-[10px] text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-medium block">Açar Söz Uyğunluğu</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-white">
                {atsAnalysis.matchedKeywordsCount}/{atsAnalysis.totalKeywordsCount}
              </span>
              <span className="text-[10px] text-slate-400">({atsAnalysis.keywordMatchRate}%)</span>
            </div>
          </div>

          <div className="bg-blue-950/70 p-2.5 rounded-xl border border-blue-800/80">
            <span className="text-[10px] text-blue-300 font-medium block">Potensial Artım</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-blue-400">
                +{atsAnalysis.potentialScoreBoost}%
              </span>
              <span className="text-[10px] text-blue-300">({atsAnalysis.potentialMaxScore}%)</span>
            </div>
          </div>
        </div>

        {/* Ranking Tier Ribbon */}
        <div className="mt-2.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300 text-[11px]">Bazar Reytinqi:</span>
            <span className="text-white font-bold text-[11px]">{atsAnalysis.rankingTier}</span>
          </div>
          <span className="text-[10px] text-slate-400">Həcm: {atsAnalysis.totalWordCount} söz</span>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1 text-xs">
        <button
          id="ats-tab-keywords"
          onClick={() => setActiveTab('keywords')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'keywords'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Hash className="w-3.5 h-3.5 text-blue-600" />
          <span>Açar Sözlər</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 font-extrabold">
            {atsAnalysis.matchedKeywordsCount}/{atsAnalysis.totalKeywordsCount}
          </span>
        </button>

        <button
          id="ats-tab-formatting"
          onClick={() => setActiveTab('formatting')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'formatting'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Format & Struktur</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-extrabold">
            {atsAnalysis.passedChecksCount}/{atsAnalysis.totalChecksCount}
          </span>
        </button>

        <button
          id="ats-tab-ai-fixes"
          onClick={() => setActiveTab('ai-fixes')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ai-fixes'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>AI Təkliflər</span>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        </button>

        <button
          id="ats-tab-raw-parser"
          onClick={() => setActiveTab('raw-parser')}
          className={`py-2 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'raw-parser'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="ATS Robot Baxışı (Plain Text Stream)"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Robot Baxışı</span>
        </button>
      </div>

      {/* 3. Main Content Body */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[600px] space-y-4">
        {/* TAB 1: KEYWORD DENSITY & FREQUENCY */}
        {activeTab === 'keywords' && (
          <div className="space-y-3 animate-fade-in">
            {/* Filter & Search Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  placeholder="Açar sözlərdə axtarış..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-blue-600"
                />
                {keywordSearch && (
                  <button
                    onClick={() => setKeywordSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <button
                  onClick={() => setKeywordFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                    keywordFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Hamısı ({atsAnalysis.totalKeywordsCount})
                </button>
                <button
                  onClick={() => setKeywordFilter('missing')}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                    keywordFilter === 'missing'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  Çatışmayanlar ({atsAnalysis.keywords.filter((k) => k.densityStatus === 'missing').length})
                </button>
                <button
                  onClick={() => setKeywordFilter('optimal')}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                    keywordFilter === 'optimal'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Tapılanlar ({atsAnalysis.matchedKeywordsCount})
                </button>
                <button
                  onClick={() => setKeywordFilter('critical')}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                    keywordFilter === 'critical'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Kritik Tələblər
                </button>
              </div>
            </div>

            {/* Keyword Density Guidelines Box */}
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold">ATS Sıxlıq Qaydası:</span> Açar sözlərin ən ideal sıxlığı ümumi CV mətninin{' '}
                <span className="font-bold text-blue-700">1.0% - 3.5%</span> aralığında olmasıdır. 0% olduqda namizəd axtarışda itir, 5% və yuxarı olduqda isə "Keyword Stuffing" spama düşür.
              </div>
            </div>

            {/* Keyword Cards List */}
            <div className="space-y-2">
              {filteredKeywords.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  Axtarışa uyğun açar söz tapılmadı.
                </div>
              ) : (
                filteredKeywords.map((kw, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all ${
                      kw.densityStatus === 'missing'
                        ? 'bg-red-50/40 border-red-200 hover:border-red-300'
                        : kw.densityStatus === 'optimal'
                        ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-900">{kw.keyword}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                          {kw.category}
                        </span>
                        {kw.importance === 'Kritik' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                            Kritik
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {getStatusBadge(kw.densityStatus)}
                        <button
                          onClick={() => handleCopy(kw.keyword, `kw-${idx}`)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Açar sözü kopyala"
                        >
                          {copiedKey === `kw-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Density Meter Bar */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>
                          Sıxlıq: <strong className="text-slate-800">{kw.densityPercent}%</strong> ({kw.countInCV}x rast gəlindi)
                        </span>
                        <span>Hədəf: {kw.targetDensityRange}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full transition-all ${
                            kw.densityStatus === 'missing'
                              ? 'bg-red-400'
                              : kw.densityStatus === 'optimal'
                              ? 'bg-emerald-500'
                              : kw.densityStatus === 'high'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                          style={{
                            width: `${Math.min(Math.max(kw.densityPercent * 20, kw.countInCV > 0 ? 15 : 0), 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Section locations if found */}
                    {kw.foundInSections.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                        <span>Tapıldığı bölmələr:</span>
                        {kw.foundInSections.map((sec, sIdx) => (
                          <span key={sIdx} className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                            {sec}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-1.5 text-[11px] text-slate-600 leading-snug">
                      💡 {kw.recommendation}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FORMATTING & STRUCTURAL AUDIT */}
        {activeTab === 'formatting' && (
          <div className="space-y-3 animate-fade-in">
            {/* Category Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {['all', 'Əlaqə', 'Struktur', 'Mətn Həcmi', 'Nailiyyətlər', 'Oxunaqlıq'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFormattingCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                    formattingCategoryFilter === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Bütün Yoxlamalar' : cat}
                </button>
              ))}
            </div>

            {/* Checks list */}
            <div className="space-y-2.5">
              {filteredFormattingChecks.map((check) => {
                const isExpanded = expandedCheckId === check.id;
                return (
                  <div
                    key={check.id}
                    className={`rounded-xl border transition-all ${
                      check.status === 'pass'
                        ? 'bg-emerald-50/20 border-emerald-200'
                        : check.status === 'warning'
                        ? 'bg-amber-50/20 border-amber-200'
                        : 'bg-red-50/20 border-red-200'
                    }`}
                  >
                    <div
                      onClick={() => setExpandedCheckId(isExpanded ? null : check.id)}
                      className="p-3 flex items-start justify-between gap-2 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {check.status === 'pass' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                          {check.status === 'warning' && (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                          {check.status === 'fail' && (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-xs text-slate-900">{check.title}</h4>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                              {check.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {check.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            check.status === 'pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : check.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {check.status === 'pass' ? 'Uğurlu' : check.status === 'warning' ? 'Təkmilləşdir' : 'Kritik'}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-200/60 text-xs space-y-2 animate-fade-in">
                        <div className="p-2 rounded bg-slate-50 text-[11px] text-slate-700 font-mono">
                          <span className="font-bold text-slate-900">Analiz Detalı:</span> {check.details}
                        </div>

                        <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-950 text-[11px]">
                          <span className="font-bold block text-blue-900 mb-0.5">🛠 Necə Düzəltməli:</span>
                          {check.howToFix}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIONABLE AI SUGGESTIONS & INSTANT FIXES */}
        {activeTab === 'ai-fixes' && (
          <div className="space-y-3.5 animate-fade-in">
            {/* Top Priority Action Cards */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>Yüksək Təsirli Düzəlişlər</span>
              </h4>

              {atsAnalysis.highPrioritySuggestions.map((sug, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-900">{sug.title}</h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      +{sug.scoreBoost}% Reytinq
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{sug.description}</p>

                  {sug.suggestedContent && (
                    <div className="mt-1 p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-700 font-mono relative">
                      <p className="pr-6 whitespace-pre-wrap">{sug.suggestedContent}</p>
                      <button
                        onClick={() => handleCopy(sug.suggestedContent!, `sug-${idx}`)}
                        className="absolute right-1.5 top-1.5 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Tövsiyəni kopyala"
                      >
                        {copiedKey === `sug-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Live AI Auto-Rewriter Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <div>
                  <h4 className="font-bold text-xs text-blue-950">AI ATS Məzmun Təkmilləşdirici</h4>
                  <p className="text-[11px] text-blue-700">
                    Vakansiyadakı çatışmayan açar sözləri təbii şəkildə CV bəndlərinə yerləşdirin:
                  </p>
                </div>
              </div>

              {/* Generator Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={isGeneratingFix}
                  onClick={() => handleGenerateAIFix('summary')}
                  className="p-2 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
                >
                  {isGeneratingFix && activeFixType === 'summary' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  )}
                  <span>ATS Xülasə Yaz</span>
                </button>

                <button
                  disabled={isGeneratingFix}
                  onClick={() => handleGenerateAIFix('bullets')}
                  className="p-2 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
                >
                  {isGeneratingFix && activeFixType === 'bullets' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>Metrikalı Təcrübə Bəndləri</span>
                </button>
              </div>

              {/* Generated Result display */}
              {generatedAISnippet && (
                <div className="p-3 rounded-lg bg-white border border-blue-300 text-xs text-slate-800 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="font-bold text-[10px] text-blue-700 uppercase">AI tərəfindən optimallaşdırılmış mətn:</span>
                    <button
                      onClick={() => handleCopy(generatedAISnippet, 'ai-snippet')}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      {copiedKey === 'ai-snippet' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Kopyalandı!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-[11px] font-sans text-slate-700">
                    {generatedAISnippet}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RAW ATS PARSER PREVIEW (ROBOT SIMULATOR) */}
        {activeTab === 'raw-parser' && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-mono font-bold text-[11px] text-white">ATS Plain Text Stream Skaneri</span>
                </div>
                <button
                  onClick={() => handleCopy(atsAnalysis.atsPlainTextView, 'raw-ats-text')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'raw-ats-text' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>Mətni Kopyala</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400">
                Bu pəncərə ATS robotunun CV faylınızdan şriftləri və dizaynı silərək əldə etdiyi xam mətni göstərir. Burada hər şeyin ardıcıl və oxunaqlı olduğuna əmin olun:
              </p>

              <pre className="p-3 bg-black/40 rounded-lg text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-[360px] whitespace-pre-wrap leading-relaxed">
                {atsAnalysis.atsPlainTextView}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Quick Action Bar */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 hidden sm:block">
          Düzəlişləri tətbiq etdikdən sonra reytinq yenilənəcək
        </div>

        <button
          id="btn-sidebar-apply-in-builder"
          onClick={onNavigateToBuilder}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <span>CV Generatorunda Tətbiq Et</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
