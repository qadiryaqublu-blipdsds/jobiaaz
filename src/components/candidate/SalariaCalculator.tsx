import React, { useState, useMemo, useEffect } from 'react';
import { 
  SectorType, 
  WorkPlaceType, 
  CalculationDirection, 
  TAX_BENEFITS_LIST, 
  calculateFromGross, 
  calculateFromNet, 
  formatAZN, 
  CalculiaBreakdown 
} from '../../services/salaryCalculator';
import { 
  Calculator, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Info, 
  Copy, 
  Check, 
  Building, 
  UserCheck, 
  Briefcase, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Percent, 
  ArrowRightLeft, 
  Receipt, 
  Coins, 
  PieChart as PieIcon, 
  Building2,
  FileCheck,
  Scale,
  Palmtree,
  Calendar,
  Clock,
  Sun,
  Umbrella,
  Award,
  CheckCircle2,
  AlertCircle,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { JobiaSectionFooter } from '../JobiaSectionFooter';

interface SalariaCalculatorProps {
  initialAmount?: number;
  initialDirection?: CalculationDirection;
  defaultSubTab?: 'salaria' | 'vacatia' | 'calculia';
  onExploreJobs?: () => void;
}

export const SalariaCalculator: React.FC<SalariaCalculatorProps> = ({
  initialAmount = 2973,
  initialDirection = 'gross',
  defaultSubTab = 'salaria',
  onExploreJobs,
}) => {
  // Top-level sub-tab: 'salaria' (Salary) or 'vacatia' (Vacation)
  const normalizedDefault = defaultSubTab === 'vacatia' ? 'vacatia' : 'salaria';
  const [activeSubTab, setActiveSubTab] = useState<'salaria' | 'vacatia'>(normalizedDefault);

  useEffect(() => {
    if (defaultSubTab === 'vacatia') {
      setActiveSubTab('vacatia');
    } else if (defaultSubTab === 'salaria' || defaultSubTab === 'calculia') {
      setActiveSubTab('salaria');
    }
  }, [defaultSubTab]);

  // State for Salaria parameters
  const [direction, setDirection] = useState<CalculationDirection>(initialDirection);
  const [amountInput, setAmountInput] = useState<string>(initialAmount.toString());
  const [sector, setSector] = useState<SectorType>('private');
  const [workPlace, setWorkPlace] = useState<WorkPlaceType>('main');
  const [unionPercent, setUnionPercent] = useState<number>(0);
  const [selectedBenefitIds, setSelectedBenefitIds] = useState<string[]>([]);
  const [showBenefitsAccordion, setShowBenefitsAccordion] = useState(false);
  const [showEmployerCost, setShowEmployerCost] = useState(true);
  const [copied, setCopied] = useState(false);

  // State for Vacatia (Vacation preview calculator)
  const [vacationBaseDays, setVacationBaseDays] = useState<number>(30); // 21 or 30 days
  const [workExperienceYears, setWorkExperienceYears] = useState<number>(3); // years
  const [avgMonthlySalary, setAvgMonthlySalary] = useState<string>('1500');
  const [customAdditionalDays, setCustomAdditionalDays] = useState<number>(0);

  // Numeric amount for Salaria
  const numericAmount = parseFloat(amountInput) || 0;

  // Run calculation memoized for Salaria
  const result: CalculiaBreakdown = useMemo(() => {
    if (direction === 'gross') {
      return calculateFromGross(
        numericAmount,
        sector,
        workPlace,
        unionPercent,
        selectedBenefitIds
      );
    } else {
      return calculateFromNet(
        numericAmount,
        sector,
        workPlace,
        unionPercent,
        selectedBenefitIds
      );
    }
  }, [direction, numericAmount, sector, workPlace, unionPercent, selectedBenefitIds]);

  // Vacation calculation logic (AR Əmək Məcəlləsi Maddə 114, 116, 140)
  const vacationCalculation = useMemo(() => {
    let experienceBonusDays = 0;
    if (workExperienceYears >= 15) {
      experienceBonusDays = 6;
    } else if (workExperienceYears >= 10) {
      experienceBonusDays = 4;
    } else if (workExperienceYears >= 5) {
      experienceBonusDays = 2;
    }

    const totalDays = vacationBaseDays + experienceBonusDays + customAdditionalDays;
    const salary = parseFloat(avgMonthlySalary) || 0;
    
    // Daily vacation rate = Average Monthly Earnings / 30.4 (official standard divisor under AR Labour Code)
    const dailyRate = salary > 0 ? salary / 30.4 : 0;
    const grossVacationPay = dailyRate * totalDays;
    
    // Approximate net vacation pay after general deductions
    const deductions = calculateFromGross(grossVacationPay, 'private', 'main', 0, []);

    return {
      baseDays: vacationBaseDays,
      experienceBonusDays,
      customAdditionalDays,
      totalDays,
      salary,
      dailyRate: Math.round(dailyRate * 100) / 100,
      grossVacationPay: Math.round(grossVacationPay * 100) / 100,
      netVacationPay: Math.round(deductions.net * 100) / 100,
      totalDeductions: Math.round(deductions.totalEmployeeDeductions * 100) / 100,
    };
  }, [vacationBaseDays, workExperienceYears, avgMonthlySalary, customAdditionalDays]);

  // Handle Quick Presets
  const presets = [
    { label: '500 ₼', val: 500 },
    { label: '1,000 ₼', val: 1000 },
    { label: '1,500 ₼', val: 1500 },
    { label: '2,000 ₼', val: 2000 },
    { label: '2,500 ₼', val: 2500 },
    { label: '2,973 ₼ ⭐', val: 2973 },
    { label: '3,500 ₼', val: 3500 },
    { label: '5,000 ₼', val: 5000 },
  ];

  // Toggle Benefit Checkbox
  const toggleBenefit = (id: string) => {
    setSelectedBenefitIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const text = `📊 Salaria — 2026 Əmək Haqqı Hesabatı:
• Sektor: ${sector === 'private' ? 'Qeyri-neft/qaz (Özəl)' : 'Dövlət / Neft-qaz'}
• İş yeri: ${workPlace === 'main' ? 'Əsas iş yeri' : 'Əlavə iş yeri'}
------------------------------------
💰 GROSS Əmək haqqı: ${formatAZN(result.gross)}
💵 Ələ çatan NET: ${formatAZN(result.net)}
------------------------------------
📉 Tutulmalar:
• Gəlir vergisi: ${formatAZN(result.incomeTax)}
• DSMF (Sosial sığorta): ${formatAZN(result.dsmf)}
• İTS (Tibbi sığorta): ${formatAZN(result.healthInsurance)}
• İşsizlikdən sığorta: ${formatAZN(result.unemployment)}
${result.unionFee > 0 ? `• Həmkarlar ittifaqı: ${formatAZN(result.unionFee)}\n` : ''}• Cəmi tutulma: ${formatAZN(result.totalEmployeeDeductions)} (${result.effectiveTaxRate}%)
------------------------------------
🏢 İşəgötürənə ümumi xərc: ${formatAZN(result.totalEmployerCost)}
Hesablandı: Salaria (jobia.az)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-full space-y-6 animate-fade-in pb-20">
      
      {/* Sub-Header Navigation Tabs: Salaria vs Vacatia */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2.5 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          {/* Salaria Tab */}
          <button
            id="tab-btn-salaria-salary"
            type="button"
            onClick={() => setActiveSubTab('salaria')}
            className={`flex items-center justify-center gap-2 py-2.5 px-5 sm:px-7 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSubTab === 'salaria'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Salaria</span>
            <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
              Maaş 2026
            </span>
          </button>

          {/* Vacatia Tab */}
          <button
            id="tab-btn-vacatia-vacation"
            type="button"
            onClick={() => setActiveSubTab('vacatia')}
            className={`flex items-center justify-center gap-2 py-2.5 px-5 sm:px-7 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSubTab === 'vacatia'
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md shadow-amber-500/25'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Palmtree className="w-4 h-4 text-amber-300" />
            <span>Vacatia</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
              Məzuniyyət
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>2026 AR Vergi və Əmək Qanunvericiliyinə tam uyğundur</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SALARIA (SALARY & TAX ENGINE 2026) VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'salaria' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-blue-900/40">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md text-xs font-semibold text-blue-200 border border-blue-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Salaria • 2026 Rəsmi Vergi və Əmək Haqqı Mühərriki</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  Salaria
                </h1>
                <p className="text-sm sm:text-base text-blue-100/90 font-medium leading-relaxed">
                  Maaşının netini və grossunu 2026-cı il vergi və sığorta dərəcələri ilə dəqiq hesabla!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* 2973 AZN Verified Benchmark Pill */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3.5 text-xs flex items-center gap-3 shadow-inner">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="text-[11px] text-blue-300 uppercase font-semibold">
                      2026 Test Standartı
                    </div>
                    <div className="font-bold text-white text-xs sm:text-sm">
                      2,973 ₼ Gross ➔ 2,500.17 ₼ Net
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid: Inputs Card & Results Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Controls & Input Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
                
                {/* 1. Direction Switcher (GROSS -> NET vs NET -> GROSS) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Hesablama İstiqaməti
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setDirection('gross')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        direction === 'gross'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                      <span>GROSS ➔ NET</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDirection('net')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        direction === 'net'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                      <span>NET ➔ GROSS</span>
                    </button>
                  </div>
                </div>

                {/* 2. Amount Input & Quick Presets */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {direction === 'gross' ? 'Hesablanmış Əmək Haqqı (GROSS)' : 'Ələ Çatan Əmək Haqqı (NET)'}
                    </label>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      AZN (₼)
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="0.00"
                      className="w-full text-2xl sm:text-3xl font-black text-slate-900 bg-slate-50/70 border-2 border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors pr-12"
                    />
                    <span className="absolute right-4 text-xl font-bold text-slate-400 select-none">
                      ₼
                    </span>
                  </div>

                  {/* Quick Presets Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-500 font-semibold mr-1">Tez seçim:</span>
                    {presets.map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setAmountInput(p.val.toString())}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          numericAmount === p.val
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Sector & Workplace Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  {/* Sector Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      İqtisadi Sektor
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setSector('private')}
                        className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                          sector === 'private'
                            ? 'bg-white text-blue-700 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Qeyri-neft / Özəl
                      </button>
                      <button
                        type="button"
                        onClick={() => setSector('state')}
                        className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                          sector === 'state'
                            ? 'bg-white text-blue-700 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Dövlət / Neft-qaz
                      </button>
                    </div>
                  </div>

                  {/* Work Place Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      İş Yeri Növü
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setWorkPlace('main')}
                        className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                          workPlace === 'main'
                            ? 'bg-white text-blue-700 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Əsas iş yeri
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkPlace('extra')}
                        className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                          workPlace === 'extra'
                            ? 'bg-white text-blue-700 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Əlavə iş yeri
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Union Fee % Input */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">
                      Həmkarlar İttifaqı haqqı (%)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Könüllü üzvlük üzrə tutulma faizi (əksər hallarda 0% və ya 1%)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={unionPercent}
                      onChange={(e) => setUnionPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-20 text-center font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>

                {/* 5. Tax Benefits (Vergi Güzəştləri) Collapsible Accordion */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBenefitsAccordion(!showBenefitsAccordion)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold">
                        Vergi Güzəştləri (AR Vergi Məcəlləsi Maddə 102)
                      </span>
                      {selectedBenefitIds.length > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {selectedBenefitIds.length} seçilib (+{result.selectedBenefitsTotal} ₼)
                        </span>
                      )}
                    </div>
                    {showBenefitsAccordion ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {showBenefitsAccordion && (
                    <div className="mt-3 space-y-2 p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl max-h-72 overflow-y-auto">
                      <p className="text-[11px] text-slate-500 font-medium mb-2">
                        Müvafiq statusa uyğun gələn bəndləri seçin (hər bir güzəşt məbləği vergi tutulan bazadan çıxılır):
                      </p>
                      <div className="space-y-1.5">
                        {TAX_BENEFITS_LIST.map((benefit) => {
                          const isChecked = selectedBenefitIds.includes(benefit.id);
                          return (
                            <label
                              key={benefit.id}
                              className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleBenefit(benefit.id)}
                                className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                              />
                              <span className="flex-1 leading-relaxed text-[11.5px]">
                                {benefit.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Legal / Policy Note */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>2026-cı il tənzimləmələri:</strong> Qeyri-neft və özəl sektorda əsas iş yerində 2,500 ₼-dək gəlirin 200 ₼ hissəsi vergidən azaddır. İcbari Tibbi Sığorta (İTS) üzrə 2,500 ₼-dək 2%, 2,500 ₼-dən yuxarı hissəyə isə 0.5% dərəcəsi tətbiq olunur.
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Results, Breakdown & Visuals */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Main Net/Gross Result Card */}
              <div className="bg-gradient-to-b from-emerald-50/80 via-white to-slate-50 rounded-2xl border-2 border-emerald-300/80 shadow-md p-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <span className="text-xs font-black tracking-wider uppercase text-emerald-800 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    {direction === 'gross' ? 'Ələ Çatan Əmək Haqqı (NET)' : 'Hesablanmış Əmək Haqqı (GROSS)'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-2.5 py-1 rounded-md border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Nəticəni Kopyala</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Big Number Display */}
                <div className="py-5">
                  <div className="text-4xl sm:text-5xl font-black text-emerald-700 tracking-tight flex items-baseline gap-1">
                    <span>{direction === 'gross' ? formatAZN(result.net) : formatAZN(result.gross)}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-2 flex items-center gap-2">
                    <span>{direction === 'gross' ? 'Ümumi GROSS:' : 'Hədəf NET:'} <strong>{direction === 'gross' ? formatAZN(result.gross) : formatAZN(result.net)}</strong></span>
                    <span>•</span>
                    <span>Cəmi tutulma: <strong className="text-rose-600">-{formatAZN(result.totalEmployeeDeductions)}</strong></span>
                  </div>
                </div>

                {/* Deductions Breakdown Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs shadow-2xs divide-y divide-slate-100">
                  
                  <div className="flex items-center justify-between p-2.5 hover:bg-slate-50/80 transition-colors">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Gəlir vergisi (GV)
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatAZN(result.incomeTax)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 hover:bg-slate-50/80 transition-colors">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      Məcburi Dövlət Sosial Sığorta (DSMF)
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatAZN(result.dsmf)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 hover:bg-slate-50/80 transition-colors">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      İcbari Tibbi Sığorta (İTS)
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatAZN(result.healthInsurance)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 hover:bg-slate-50/80 transition-colors">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      İşsizlikdən Sığorta (0.5%)
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatAZN(result.unemployment)}
                    </span>
                  </div>

                  {result.unionFee > 0 && (
                    <div className="flex items-center justify-between p-2.5 hover:bg-slate-50/80 transition-colors">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Həmkarlar İttifaqı haqqı ({unionPercent}%)
                      </span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {formatAZN(result.unionFee)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-slate-50/90 font-bold text-slate-900">
                    <span className="text-rose-700">Ümumi Tutulmalar</span>
                    <span className="text-rose-700 text-sm tabular-nums">
                      -{formatAZN(result.totalEmployeeDeductions)}
                    </span>
                  </div>
                </div>

                {/* Effective Tax Rate Bar */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-600">Faktiki Tutulma Faizi:</span>
                    <span className="font-extrabold text-blue-700">{result.effectiveTaxRate}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (result.net / (result.gross || 1)) * 100)}%` }}
                      title="Net Maaş"
                    />
                    <div 
                      className="bg-rose-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, result.effectiveTaxRate)}%` }}
                      title="Tutulmalar"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Net ({Math.round((result.net / (result.gross || 1)) * 100)}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Tutulmalar ({result.effectiveTaxRate}%)
                    </span>
                  </div>
                </div>

              </div>

              {/* Employer Cost (Şirkət / İşəgötürən Xərci) Toggle Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      İşəgötürənin Ümumi Xərci
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmployerCost(!showEmployerCost)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    {showEmployerCost ? 'Gizlət' : 'Göstər'}
                  </button>
                </div>

                {showEmployerCost && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[11px] text-slate-500">
                      İşçinin maaşına əlavə olaraq şirkət tərəfindən dövlət büdcəsinə ödənilən sosial və tibbi sığorta ödənişləri:
                    </p>

                    <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-xs border border-slate-100">
                      <div className="flex justify-between text-slate-600">
                        <span>İşçinin GROSS maaşı:</span>
                        <span className="font-semibold text-slate-900">{formatAZN(result.gross)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Şirkət DSMF payı (15%/22%):</span>
                        <span className="font-semibold text-slate-900">{formatAZN(result.employerDsmf)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Şirkət İTS payı (2%/0.5%):</span>
                        <span className="font-semibold text-slate-900">{formatAZN(result.employerHealthInsurance)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Şirkət İşsizlik payı (0.5%):</span>
                        <span className="font-semibold text-slate-900">{formatAZN(result.employerUnemployment)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-indigo-900 text-sm">
                        <span>Cəmi Şirkət Xərci (Total Cost):</span>
                        <span className="text-indigo-700">{formatAZN(result.totalEmployerCost)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA: Browse Jobs with this Salary */}
              {onExploreJobs && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-5 text-center space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Bu maaş kateqoriyasına uyğun vakansiyalar axtarırsınız?
                  </h4>
                  <p className="text-xs text-slate-600">
                    Jobia-da 100% yoxlanılmış və rəsmi əmək müqaviləsi təklif edən iş elanlarına baxın.
                  </p>
                  <button
                    type="button"
                    onClick={onExploreJobs}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    Vakansiyalara Keçid Et ➔
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VACATIA (VACATION CALCULATOR ENGINE - COMING SOON / PREVIEW) VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'vacatia' && (
        <div className="space-y-6">
          
          {/* Vacatia Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white p-6 sm:p-8 shadow-lg">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-100 border border-white/20">
                  <Palmtree className="w-3.5 h-3.5 text-amber-300" />
                  <span>Vacatia • AR Əmək Məcəlləsi Məzuniyyət Mühərriki</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
                  <span>Vacatia</span>
                  <span className="bg-white/20 text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/30">
                    Hazırlanır (Tezliklə)
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-amber-100/95 font-medium leading-relaxed">
                  Əsas və əlavə məzuniyyət günlərini, orta aylıq əmək haqqı üzrə məzuniyyət haqqını və istifadə edilməmiş məzuniyyət kompensasiyasını dəqiq hesabla!
                </p>
              </div>

              {/* Status Pill */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-xs space-y-1">
                <div className="flex items-center gap-2 text-amber-200 font-bold">
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span>AR Əmək Məcəlləsi Maddə 114, 116, 140</span>
                </div>
                <div className="text-white font-medium">
                  30.4 əmsalı ilə dəqiq günbəgün hesablama
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon & Interactive Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Interactive Vacation Parameters Preview */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Məzuniyyət Parametrləri (İlkin Sınaq Rejimi)
                    </h3>
                  </div>
                  <span className="bg-amber-50 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                    Beta Rejim
                  </span>
                </div>

                {/* 1. Base Vacation Days */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Əsas Məzuniyyət Müddəti (Maddə 114)
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setVacationBaseDays(30)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        vacationBaseDays === 30
                          ? 'bg-white text-amber-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      30 Təqvim Günü (Standart / Mütəxəssis)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVacationBaseDays(21)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        vacationBaseDays === 21
                          ? 'bg-white text-amber-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      21 Təqvim Günü (Minimum)
                    </button>
                  </div>
                </div>

                {/* 2. Work Experience (Staj) for Additional Days */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Müəssisədə / Ümumi Əmək Stajı (İl ilə)
                    </label>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {workExperienceYears} İl {vacationCalculation.experienceBonusDays > 0 ? `(+${vacationCalculation.experienceBonusDays} gün əlavə)` : '(+0 gün)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setWorkExperienceYears(2)}
                      className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        workExperienceYears < 5 ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      0 – 4 il (+0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkExperienceYears(7)}
                      className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        workExperienceYears >= 5 && workExperienceYears < 10 ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      5 – 9 il (+2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkExperienceYears(12)}
                      className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        workExperienceYears >= 10 && workExperienceYears < 15 ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      10 – 14 il (+4)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkExperienceYears(18)}
                      className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        workExperienceYears >= 15 ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      15+ il (+6)
                    </button>
                  </div>
                </div>

                {/* 3. Average Monthly Salary for Calculation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Son 12 Ayın Orta Aylıq Əmək Haqqı (GROSS)
                    </label>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      AZN (₼)
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={avgMonthlySalary}
                      onChange={(e) => setAvgMonthlySalary(e.target.value)}
                      placeholder="1500"
                      className="w-full text-2xl font-black text-slate-900 bg-slate-50/70 border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:border-amber-600 focus:outline-none transition-colors pr-12"
                    />
                    <span className="absolute right-4 text-xl font-bold text-slate-400 select-none">
                      ₼
                    </span>
                  </div>
                </div>

                {/* Notice Card */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Vacatia Hazırlıq Mərhələsindədir</span>
                  </div>
                  <p className="text-[11.5px] text-amber-800/90">
                    <strong>Vacatia hazırda hazırlanır və tezliklə tam funksional təqdim ediləcəkdir.</strong> Sistem 12 aylıq əmək haqqı cədvəlini, istifadə edilməmiş günlərin son haqq-hesabını və təqvim bayram günlərinin çıxılmasını tam avtomatlaşdıracaq.
                  </p>
                </div>

              </div>
            </div>

            {/* Right: Vacation Breakdown Preview Card */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-gradient-to-b from-amber-50/80 via-white to-slate-50 rounded-2xl border-2 border-amber-300/80 shadow-md p-6 relative overflow-hidden">
                
                <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                  <span className="text-xs font-black tracking-wider uppercase text-amber-800 flex items-center gap-1.5">
                    <Palmtree className="w-4 h-4 text-amber-600" />
                    Təxmini Məzuniyyət Haqqı
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {vacationCalculation.totalDays} Günlük
                  </span>
                </div>

                {/* Big Number Display */}
                <div className="py-5">
                  <div className="text-4xl sm:text-5xl font-black text-amber-700 tracking-tight flex items-baseline gap-1">
                    <span>{formatAZN(vacationCalculation.netVacationPay)}</span>
                    <span className="text-xs font-bold text-slate-500">NET</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-2 flex items-center gap-2">
                    <span>Hesablanmış GROSS: <strong>{formatAZN(vacationCalculation.grossVacationPay)}</strong></span>
                  </div>
                </div>

                {/* Detailed Vacation Breakdown Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs shadow-2xs divide-y divide-slate-100">
                  
                  <div className="flex items-center justify-between p-2.5">
                    <span className="text-slate-600 font-medium">Əsas məzuniyyət günləri:</span>
                    <span className="font-bold text-slate-900">{vacationCalculation.baseDays} gün</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5">
                    <span className="text-slate-600 font-medium">Staja görə əlavə günlər:</span>
                    <span className="font-bold text-amber-700">+{vacationCalculation.experienceBonusDays} gün</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-amber-50/50">
                    <span className="text-slate-800 font-bold">Cəmi Məzuniyyət Müddəti:</span>
                    <span className="font-black text-amber-800">{vacationCalculation.totalDays} təqvim günü</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5">
                    <span className="text-slate-600 font-medium">1 Günlük Məzuniyyət Haqqı (Maaş / 30.4):</span>
                    <span className="font-bold text-slate-900">{formatAZN(vacationCalculation.dailyRate)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5">
                    <span className="text-slate-600 font-medium">Təxmini Vergi & Sığorta Tutulmaları:</span>
                    <span className="font-bold text-rose-600">-{formatAZN(vacationCalculation.totalDeductions)}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-4 p-3 bg-amber-100/50 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 leading-relaxed">
                  💡 AR Əmək Məcəlləsinin 140-cı maddəsinə əsasən, məzuniyyət haqqı məzuniyyətin başlanmasına ən azı 3 gün qalmış tam ödənilməlidir.
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Dynamic Animated Section Footer with Job Intelligence & Automation */}
      <JobiaSectionFooter 
        extraTagline="AR Əmək Məcəlləsi və Vergi Məcəlləsinə 100% uyğunlaşdırılmış rəsmi əməkhaqqı və məzuniyyət kalkulyatoru"
        showBackToTop={true}
      />

    </div>
  );
};

// Also export as CalculiaCalculator for backwards compatibility
export const CalculiaCalculator = SalariaCalculator;
