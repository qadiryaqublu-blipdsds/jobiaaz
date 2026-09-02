import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import { STORED_SALARY_TRENDS } from '../../data/salaryTrendsData';
import { Vacancy } from '../../types';
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Award, 
  MapPin, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Search, 
  ArrowUpRight, 
  ChevronRight,
  Info,
  Calendar,
  Building2
} from 'lucide-react';
import { JobiaSectionFooter } from '../JobiaSectionFooter';

interface SalaryTrendsViewProps {
  vacancies: Vacancy[];
  onSelectVacancy?: (vacancy: Vacancy) => void;
}

export const SalaryTrendsView: React.FC<SalaryTrendsViewProps> = ({
  vacancies,
  onSelectVacancy,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(STORED_SALARY_TRENDS[0].roleId);
  const [selectedCategory, setSelectedCategory] = useState<string>('Hamısı');
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<'AZN' | 'USD'>('AZN');
  const [chartType, setChartType] = useState<'timeline' | 'experience' | 'cities'>('timeline');

  // Conversion rate (1 USD = 1.7 AZN)
  const rate = currency === 'USD' ? 1 / 1.7 : 1;
  const currencySymbol = currency === 'USD' ? '$' : '₼';

  const formatMoney = (amount: number) => {
    const val = Math.round(amount * rate);
    return `${val.toLocaleString()} ${currencySymbol}`;
  };

  // Filtered roles list for selection
  const filteredRoles = useMemo(() => {
    return STORED_SALARY_TRENDS.filter((role) => {
      if (selectedCategory !== 'Hamısı' && role.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          role.roleName.toLowerCase().includes(q) ||
          role.category.toLowerCase().includes(q) ||
          role.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Selected role object
  const currentRole = useMemo(() => {
    return (
      STORED_SALARY_TRENDS.find((r) => r.roleId === selectedRoleId) ||
      STORED_SALARY_TRENDS[0]
    );
  }, [selectedRoleId]);

  // Match live vacancies stored in the portal for this role
  const matchingVacancies = useMemo(() => {
    const roleKeywords = currentRole.roleName.toLowerCase().split(/[ /()]/).filter((w) => w.length > 2);
    return vacancies.filter((v) => {
      if (v.isApproved === false) return false;
      const titleLower = v.title.toLowerCase();
      const catLower = v.category.toLowerCase();
      return (
        catLower === currentRole.category.toLowerCase() ||
        roleKeywords.some((kw) => titleLower.includes(kw))
      );
    });
  }, [vacancies, currentRole]);

  // Compute live active vacancies salary average
  const liveSalaryStats = useMemo(() => {
    const validSalaries = matchingVacancies
      .filter((v) => !v.hideSalary && v.minSalary && v.maxSalary)
      .map((v) => ({
        min: v.minSalary || 0,
        max: v.maxSalary || 0,
        mid: ((v.minSalary || 0) + (v.maxSalary || 0)) / 2,
      }));

    if (validSalaries.length === 0) return null;
    const avg = Math.round(validSalaries.reduce((acc, curr) => acc + curr.mid, 0) / validSalaries.length);
    const min = Math.min(...validSalaries.map((s) => s.min));
    const max = Math.max(...validSalaries.map((s) => s.max));
    return { avg, min, max, count: validSalaries.length };
  }, [matchingVacancies]);

  // Formatted chart data with currency scaling
  const timelineChartData = useMemo(() => {
    return currentRole.trendHistory.map((pt) => ({
      period: pt.period,
      'Minimum Maaş': Math.round(pt.minSalary * rate),
      'Orta Bazar Maaşı': Math.round(pt.avgSalary * rate),
      'Maksimum Maaş': Math.round(pt.maxSalary * rate),
      'Vakansiya Sayı': pt.openingsCount,
    }));
  }, [currentRole, rate]);

  const experienceChartData = useMemo(() => {
    return currentRole.experienceBreakdown.map((exp) => ({
      level: exp.level,
      'Orta Maaş': Math.round(exp.avgSalary * rate),
      'Min': Math.round(exp.minSalary * rate),
      'Maks': Math.round(exp.maxSalary * rate),
      sampleSize: exp.sampleSize,
    }));
  }, [currentRole, rate]);

  const cityChartData = useMemo(() => {
    return currentRole.cityComparison.map((city) => ({
      city: city.city,
      'Orta Maaş': Math.round(city.avgSalary * rate),
    }));
  }, [currentRole, rate]);

  const categoriesList = ['Hamısı', ...Array.from(new Set(STORED_SALARY_TRENDS.map((r) => r.category)))];

  // Custom tooltip for Sleek theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[170px]">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white">
                {entry.name === 'Vakansiya Sayı' ? `${entry.value} elan` : `${entry.value.toLocaleString()} ${currencySymbol}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Azərbaycan Əmək Bazarı & Recharts Analitikası</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Vəzifələr Üzrə Maaş Trendləri və Bazar İcmalı
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Tarixi və cari vakansiya məlumatları əsasında formalaşdırılmış interaktiv qrafiklər, təcrübə səviyyələri və bazar proqnozları.
          </p>
        </div>

        {/* Currency toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center text-xs font-medium">
            <button
              onClick={() => setCurrency('AZN')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                currency === 'AZN'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ₼ AZN
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>

      {/* Role Selection & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Vəzifə və ya ixtisas axtar..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Roles Carousel / Horizontal Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 pb-1 scrollbar-none">
          {filteredRoles.map((role) => (
            <button
              key={role.roleId}
              onClick={() => setSelectedRoleId(role.roleId)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all border shrink-0 ${
                selectedRoleId === role.roleId
                  ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>{role.roleName.split('(')[0].trim()}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                {formatMoney(role.currentAvgSalary)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Cards for Selected Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Cari Orta Maaş</span>
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{currentRole.yearlyGrowthPct}%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5">
            {formatMoney(currentRole.currentAvgSalary)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            İllik artım tempi: <span className="font-semibold text-slate-700">Davamlı yüksələn</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Bazar Aralığı</span>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Min - Maks
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5">
            {formatMoney(currentRole.currentMinSalary)} - {formatMoney(currentRole.currentMaxSalary)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Real bazar diapazonu
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Bazar Tələbatı</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {currentRole.demandLevel}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5">
            {currentRole.demandLevel}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Portalda <span className="font-bold text-blue-600">{matchingVacancies.length}</span> aktiv elan
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Uzaqdan / Remote Əlavəsi</span>
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Qlobal
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5">
            {formatMoney(currentRole.cityComparison.find(c => c.city.includes('Remote'))?.avgSalary || currentRole.currentAvgSalary * 1.35)}
          </div>
          <p className="text-[11px] text-purple-700 font-medium mt-1">
            Yerli tariflərdən ~35-40% yüksək
          </p>
        </div>
      </div>

      {/* Main Visualization Interactive Section */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{currentRole.roleName}</span>
              <span className="text-xs font-normal text-slate-500">({currentRole.category})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{currentRole.description}</p>
          </div>

          {/* Chart View Switcher */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1 text-xs font-medium w-full sm:w-auto overflow-x-auto scrollbar-none">
            <button
              onClick={() => setChartType('timeline')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                chartType === 'timeline'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maaş Dinamikası
            </button>
            <button
              onClick={() => setChartType('experience')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                chartType === 'experience'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Təcrübə Səviyyəsi
            </button>
            <button
              onClick={() => setChartType('cities')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                chartType === 'cities'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Şəhər & Remote
            </button>
          </div>
        </div>

        {/* 1. TIMELINE RECHARTS VISUALIZATION */}
        {chartType === 'timeline' && (
          <div className="space-y-4">
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineChartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val.toLocaleString()} ${currencySymbol}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    formatter={(val) => <span className="text-xs font-semibold text-slate-700">{val}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="Maksimum Maaş"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMax)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Orta Bazar Maaşı"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAvg)"
                  />
                  <Line
                    type="monotone"
                    dataKey="Minimum Maaş"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#94a3b8' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Qrafikdə son 8 rüb üzrə real iş təklifləri və əmək bazarı sorğularının orta rəqəmləri əks olunmuşdur.</span>
              </span>
              <span className="font-bold text-slate-900 hidden sm:inline">
                Davamlı artım: +{currentRole.yearlyGrowthPct}%
              </span>
            </div>
          </div>
        )}

        {/* 2. EXPERIENCE LEVEL RECHARTS VISUALIZATION */}
        {chartType === 'experience' && (
          <div className="space-y-4">
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={experienceChartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="level" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val.toLocaleString()} ${currencySymbol}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(val) => <span className="text-xs font-semibold text-slate-700">{val}</span>}
                  />
                  <Bar dataKey="Orta Maaş" fill="#2563eb" radius={[6, 6, 0, 0]}>
                    {experienceChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 3 ? '#1e40af' : index === 2 ? '#2563eb' : index === 1 ? '#3b82f6' : '#60a5fa'} 
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="Min" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Maks" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {currentRole.experienceBreakdown.map((exp, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block text-xs">{exp.level}</span>
                  <div className="text-sm font-bold text-blue-700 mt-1">
                    {formatMoney(exp.avgSalary)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Aralıq: {formatMoney(exp.minSalary)} - {formatMoney(exp.maxSalary)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CITIES & REMOTE COMPARISON RECHARTS */}
        {chartType === 'cities' && (
          <div className="space-y-4">
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cityChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val.toLocaleString()} ${currencySymbol}`}
                  />
                  <YAxis 
                    dataKey="city" 
                    type="category"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Orta Maaş" fill="#2563eb" radius={[0, 6, 6, 0]}>
                    {cityChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.city.includes('Remote') ? '#7c3aed' : '#2563eb'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
              <span>
                💡 <strong>Distant (Remote) İş İmkanları:</strong> Xarici və beynəlxalq şirkətlərə uzaqdan çalışan Azərbaycanlı mütəxəssislər orta hesabla <strong>{formatMoney(currentRole.cityComparison.find(c => c.city.includes('Remote'))?.avgSalary || 0)}</strong> qazanırlar.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Grid: Top Value Skills & Live Vacancies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top Skills That Boost Salary */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Ən Çox Dəyər Qatan Bacarıqlar</span>
            </h4>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              Maaş Artımı
            </span>
          </div>

          <div className="space-y-2.5">
            {currentRole.topSkillsValue.map((skillItem, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800">{skillItem.skill}</span>
                </div>
                <span className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 shrink-0">
                  {skillItem.salaryBoost}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500">
            📌 Bu bacarıqları CV-nizə əlavə edərək və layihələrlə təsdiqləyərək şirkətlərlə əmək haqqı danışıqlarında üstünlük qazana bilərsiniz.
          </div>
        </div>

        {/* Right Column: Portalda Bu Vəzifə Üzrə Mövcud Aktiv Vakansiyalar */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Portalda Aktiv Uyğun Vakansiyalar ({matchingVacancies.length})</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bu sahə üzrə dərhal müraciət edə biləcəyiniz elanlar
              </p>
            </div>

            {liveSalaryStats && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Elanlar üzrə orta</span>
                <span className="text-xs font-bold text-blue-700">{formatMoney(liveSalaryStats.avg)}</span>
              </div>
            )}
          </div>

          {matchingVacancies.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
              Bu vəzifə üzrə hazırda yeni vakansiya elanı gözlənilir. Digər kateqoriyalara baxa bilərsiniz.
            </div>
          ) : (
            <div className="space-y-2.5">
              {matchingVacancies.slice(0, 4).map((vac) => (
                <div
                  key={vac.id}
                  onClick={() => onSelectVacancy && onSelectVacancy(vac)}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer bg-white flex items-center justify-between gap-3 text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={vac.companyLogo}
                      alt={vac.companyName}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {vac.title}
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        {vac.companyName} • {vac.city} • {vac.employmentType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {vac.hideSalary ? 'Müsahibə ilə' : `${formatMoney(vac.minSalary || 0)} - ${formatMoney(vac.maxSalary || 0)}`}
                    </span>
                    <span className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Animated Section Footer with Job Intelligence & Automation */}
      <JobiaSectionFooter 
        extraTagline="Azərbaycan üzrə peşəkar maaş statistikası, bazar medianları və təcrübə pillələri"
        showBackToTop={true}
      />
    </div>
  );
};
