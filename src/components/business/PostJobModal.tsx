import React, { useState } from 'react';
import { Vacancy, EmploymentType, ExperienceLevel, Company } from '../../types';
import { JOB_CATEGORIES, CITIES } from '../../data/mockData';
import { 
  AZERBAIJAN_REGIONS, 
  AZERBAIJAN_CITY_COORDINATES, 
  BAKU_METRO_STATIONS, 
  getCoordinatesForCity 
} from '../../data/azerbaijanGeoData';
import { 
  X, 
  Sparkles, 
  Briefcase, 
  Plus, 
  Trash2, 
  RefreshCw,
  MapPin,
  Navigation,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface PostJobModalProps {
  company: Company;
  editingJob?: Vacancy | null;
  onClose: () => void;
  onSaveJob: (vacancy: Partial<Vacancy>) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ company, editingJob, onClose, onSaveJob }) => {
  const isEditing = !!editingJob;
  const editCount = editingJob?.editCount || 0;
  const isEditLimitReached = isEditing && editCount >= (editingJob?.maxEditsAllowed || 1);

  const [title, setTitle] = useState(editingJob?.title || '');
  const [category, setCategory] = useState(editingJob?.category || JOB_CATEGORIES[0]);
  const [employmentType, setEmploymentType] = useState<EmploymentType>(editingJob?.employmentType || 'Tam ştat');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(editingJob?.experienceLevel || 'Orta (Mid-level, 1-3 il)');
  const [city, setCity] = useState(editingJob?.city || CITIES[0]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('baku');
  const [address, setAddress] = useState(editingJob?.address || '');
  const [metroStation, setMetroStation] = useState(editingJob?.metroStation || '');
  const [latitude, setLatitude] = useState<number>(editingJob?.latitude || 40.4093);
  const [longitude, setLongitude] = useState<number>(editingJob?.longitude || 49.8671);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [minSalary, setMinSalary] = useState<number>(editingJob?.minSalary || 1500);
  const [maxSalary, setMaxSalary] = useState<number>(editingJob?.maxSalary || 2500);
  const [hideSalary, setHideSalary] = useState(editingJob?.hideSalary ?? false);
  const [description, setDescription] = useState(editingJob?.description || '');
  const [responsibilities, setResponsibilities] = useState<string[]>(
    editingJob?.responsibilities && editingJob.responsibilities.length > 0
      ? editingJob.responsibilities
      : [
          'Vəzifə üzrə gündəlik əməliyyatların icrası',
          'Komanda ilə sıx koordinasiya və hesabatlılıq',
        ]
  );
  const [requirements, setRequirements] = useState<string[]>(
    editingJob?.requirements && editingJob.requirements.length > 0
      ? editingJob.requirements
      : [
          'Müvafiq sahədə ali təhsil və 2+ il iş təcrübəsi',
          'Analitik düşüncə və komandada işləmək bacarığı',
        ]
  );
  const [benefits, setBenefits] = useState<string[]>(
    editingJob?.benefits && editingJob.benefits.length > 0
      ? editingJob.benefits
      : [
          'Rəqabətli əmək haqqı və rüblük bonuslar',
          'Könüllü tibbi sığorta paketi',
        ]
  );
  const [skills, setSkills] = useState<string[]>(
    editingJob?.skills && editingJob.skills.length > 0
      ? editingJob.skills
      : ['Komanda İşi', 'Problem Həlli']
  );
  const [contactPhone, setContactPhone] = useState(editingJob?.contactPhone || company.phone || '');
  const [contactWhatsapp, setContactWhatsapp] = useState(editingJob?.contactWhatsapp || company.phone || '');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiNotes, setAiNotes] = useState('');

  // Handle City Change and automatically adjust coordinates
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const coords = getCoordinatesForCity(newCity);
    setLatitude(coords.lat);
    setLongitude(coords.lng);
    setSelectedRegionId(coords.regionId);
    if (newCity !== 'Bakı') {
      setMetroStation('');
    }
  };

  // Detect GPS coordinates of the employer office
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Brauzeriniz geolokasiya xüsusiyyətini dəstəkləmir.');
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(5)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(5)));
        setIsLocatingGPS(false);
      },
      (err) => {
        console.error(err);
        alert('Məkan icazəsi alınmadı. Koordinatları əl ilə və ya şəhər seçimi ilə təyin edə bilərsiniz.');
        setIsLocatingGPS(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // AI Job Description Generator
  const handleAIGenerateJob = async () => {
    if (!title.trim()) {
      alert('Zəhmət olmasa əvvəlcə vəzifə adını daxil edin (məs: Senior React Developer).');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/generate-job-desc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          level: experienceLevel,
          employmentType,
          keyPoints: aiNotes,
        }),
      });

      const data = await res.json();
      if (data.description) setDescription(data.description);
      if (data.responsibilities) setResponsibilities(data.responsibilities);
      if (data.requirements) setRequirements(data.requirements);
      if (data.benefits) setBenefits(data.benefits);
      if (data.skills) setSkills(data.skills);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddResponsibility = () => setResponsibilities([...responsibilities, '']);
  const handleAddRequirement = () => setRequirements([...requirements, '']);
  const handleAddBenefit = () => setBenefits([...benefits, '']);
  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditLimitReached) {
      alert('Bu vakansiya üzrə 1 dəfəlik redaktə hüququnuzdan artıq istifadə etmisiniz.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      alert('Zəhmət olmasa başlıq və təsviri doldurun.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const deadlineDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    onSaveJob({
      id: editingJob?.id || `vac-${Date.now()}`,
      title,
      companyId: company.id,
      companyName: company.name,
      companyLogo: company.logo,
      companyVerified: company.verified,
      category,
      employmentType,
      experienceLevel,
      city,
      address: address.trim() || `${city}, Azərbaycan`,
      metroStation: metroStation || undefined,
      latitude: Number(latitude) || 40.4093,
      longitude: Number(longitude) || 49.8671,
      minSalary: Number(minSalary),
      maxSalary: Number(maxSalary),
      currency: 'AZN',
      hideSalary,
      description,
      responsibilities: responsibilities.filter((r) => r.trim().length > 0),
      requirements: requirements.filter((r) => r.trim().length > 0),
      benefits: benefits.filter((b) => b.trim().length > 0),
      skills,
      postedDate: editingJob?.postedDate || today,
      deadline: editingJob?.deadline || deadlineDate,
      isFeatured: editingJob?.isFeatured ?? false,
      isApproved: false, // Moderation required
      status: 'pending_review',
      editCount: isEditing ? (editingJob.editCount || 0) + 1 : 0,
      maxEditsAllowed: 1,
      lastEditedAt: isEditing ? new Date().toISOString() : undefined,
      viewsCount: editingJob?.viewsCount || 1,
      applicantsCount: editingJob?.applicantsCount || 0,
      contactPhone: contactPhone.trim(),
      contactWhatsapp: contactWhatsapp.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {isEditing ? 'Vakansiyanı Redaktə Et (1 Dəfəlik Hüquq)' : 'Yeni Vakansiya Elanı Yerləşdir'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Şirkət: {company.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-700">
          {/* Moderation / Edit Limit Notice */}
          {isEditing ? (
            isEditLimitReached ? (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <X className="w-4 h-4 text-red-600" />
                  <span>Redaktə Limiti Dolub (1/1 istifadə edilib)</span>
                </div>
                <p className="text-[11px] text-red-700">
                  Bu vakansiya artıq 1 dəfə redaktə olunub. Qaydalara əsasən əlavə dəyişiklik üçün platforma administratoru ilə əlaqə saxlayın.
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>1 Dəfəlik Redaktə Hüququ (0/1 istifadə edilib)</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  ⚠️ Diqqət: Vakansiyanı yalnız 1 dəfə redaktə edə bilərsiniz. Dəyişikliklər yadda saxlandıqdan sonra vakansiya təkrar admin təsdiqinə göndəriləcək və təsdiqlənənədək gözləmədə qalacaq.
                </p>
              </div>
            )
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-800">
                📌 Qeyd: Paylaşdığınız vakansiya dərhal admin moderasiyasına yönləndirilir. Admin tərəfindən təsdiq edildikdən sonra ictimai vakansiyalar bölməsində yayımlanacaq.
              </p>
            </div>
          )}

          {/* AI Helper Banner */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI Vakansiya Mətni Generatoru</span>
              </div>
              <button
                type="button"
                disabled={isGeneratingAI}
                onClick={handleAIGenerateJob}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Yaradır...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Vakansiya Mətnini AI ilə Avtomatik Yaz</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-600">
              Vəzifə adını daxil edin və düyməyə basın. AI şirkətiniz üçün peşəkar öhdəliklər, tələblər və üstünlüklər hazırlayacaq.
            </p>
          </div>

          {/* Core Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Vəzifə Başlığı *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Məsələn: Senior Frontend Developer"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Sahə / Kateqoriya</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none"
              >
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">İş Rejimi</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none"
              >
                <option value="Tam ştat">Tam ştat</option>
                <option value="Hibrid">Hibrid</option>
                <option value="Uzaqdan (Remote)">Uzaqdan (Remote)</option>
                <option value="Yarım ştat">Yarım ştat</option>
                <option value="Təcrübə proqramı">Təcrübə proqramı</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Təcrübə Səviyyəsi</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none"
              >
                <option value="Təcrübəsiz / Junior">Təcrübəsiz / Junior</option>
                <option value="Orta (Mid-level, 1-3 il)">Orta (Mid-level, 1-3 il)</option>
                <option value="Baş (Senior, 3-5+ il)">Baş (Senior, 3-5+ il)</option>
                <option value="Rəhbər / Lead">Rəhbər / Lead</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Şəhər / Rayon (Bütün Azərbaycan)</label>
              <select
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none font-medium"
              >
                {AZERBAIJAN_REGIONS.map((region) => (
                  <optgroup key={region.id} label={`📍 ${region.name}`}>
                    {region.cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="🌐 Digər">
                  <option value="Uzaqdan / Remote">Uzaqdan / Remote</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Əmək Haqqı (AZN)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  placeholder="Min"
                  className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
                <span>-</span>
                <input
                  type="number"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(Number(e.target.value))}
                  placeholder="Maks"
                  className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Detailed Address, Metro & Geolocation Coordinates Picker */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Xəritədə Dəqiq Məkan və Koordinat Təyini</span>
              </div>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocatingGPS}
                className="px-2.5 py-1 bg-white border border-blue-200 hover:border-blue-400 text-blue-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-60"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocatingGPS ? 'animate-spin' : ''}`} />
                <span>{isLocatingGPS ? 'Məkan təyin olunur...' : '📍 Ofisin GPS Koordinatını Al'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Dəqiq Ünvan / Küçə / Biznes Mərkəzi
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Məsələn: Neftçilər pr. 153, Port Baku Towers və ya Heydər Əliyev pr. 88"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-600"
                />
              </div>

              {city === 'Bakı' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Yaxınlıqdakı Metro Stansiyası
                  </label>
                  <select
                    value={metroStation}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setMetroStation(selected);
                      const st = BAKU_METRO_STATIONS.find((m) => m.name === selected);
                      if (st) {
                        setLatitude(st.lat);
                        setLongitude(st.lng);
                      }
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-600"
                  >
                    <option value="">Metro seçilməyib</option>
                    {BAKU_METRO_STATIONS.map((m) => (
                      <option key={m.name} value={m.name}>
                        🚇 {m.name} ({m.district})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Region / Şəhər Mərkəzi
                  </label>
                  <div className="p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-medium">{city} şəhəri mərkəzinə bağlandı</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Hub Pins across Azerbaijan */}
            <div>
              <div className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                <span>Ölkə üzrə Populyar Mərkəzlərdən Seç:</span>
                <span className="text-[10px] text-blue-600 font-mono">
                  Enlik: {latitude} | Uzunluq: {longitude}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {[
                  { name: 'Bakı Mərkəz (28 May / Sahil)', city: 'Bakı', lat: 40.3792, lng: 49.8512 },
                  { name: 'Sumqayıt Mərkəz', city: 'Sumqayıt', lat: 40.5897, lng: 49.6686 },
                  { name: 'Gəncə Mərkəz', city: 'Gəncə', lat: 40.6828, lng: 46.3606 },
                  { name: 'Şuşa & Qarabağ Zonası', city: 'Şuşa', lat: 39.7550, lng: 46.7510 },
                  { name: 'Naxçıvan Mərkəz', city: 'Naxçıvan', lat: 39.2089, lng: 45.4122 },
                  { name: 'Mingəçevir', city: 'Mingəçevir', lat: 40.7639, lng: 47.0494 },
                  { name: 'Qəbələ & Tufandağ', city: 'Qəbələ', lat: 40.9814, lng: 47.8458 },
                  { name: 'Quba Aqropark', city: 'Quba', lat: 41.3611, lng: 48.5134 },
                  { name: 'Lənkəran Mərkəz', city: 'Lənkəran', lat: 38.7542, lng: 48.8506 },
                  { name: 'Tovuz Mərkəz', city: 'Tovuz', lat: 40.9922, lng: 45.6289 },
                ].map((hub) => (
                  <button
                    key={hub.name}
                    type="button"
                    onClick={() => {
                      setCity(hub.city);
                      setLatitude(hub.lat);
                      setLongitude(hub.lng);
                    }}
                    className={`text-[11px] px-2 py-1 rounded-md border transition ${
                      latitude === hub.lat && longitude === hub.lng
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📍 {hub.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Vakansiya Haqqında Ümumi Təsvir *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Şirkət və komanda haqqında, işin ümumi məqsədi..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 resize-none font-sans"
            />
          </div>

          {/* Responsibilities */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Vəzifə Öhdəlikləri</label>
              <button
                type="button"
                onClick={handleAddResponsibility}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Bənd əlavə et
              </button>
            </div>
            {responsibilities.map((resp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => {
                    const newArr = [...responsibilities];
                    newArr[idx] = e.target.value;
                    setResponsibilities(newArr);
                  }}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setResponsibilities(responsibilities.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Namizədə Tələblər</label>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Tələb əlavə et
              </button>
            </div>
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => {
                    const newArr = [...requirements];
                    newArr[idx] = e.target.value;
                    setRequirements(newArr);
                  }}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Skills tags */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Tələb Olunan Əsas Bacarıqlar</label>
            <div className="flex gap-2">
              <input
                id="job-skill-input"
                type="text"
                placeholder="Məs: React, TypeScript, SQL..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('job-skill-input') as HTMLInputElement;
                  if (input && input.value) {
                    handleAddSkill(input.value);
                    input.value = '';
                  }
                }}
                className="px-3 py-2 bg-slate-800 text-white rounded-lg font-medium"
              >
                Əlavə Et
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs flex items-center gap-1"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              disabled={isEditLimitReached}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isEditing ? (
                isEditLimitReached ? (
                  <span>Redaktə Limiti Dolub (1/1)</span>
                ) : (
                  <span>Dəyişiklikləri Yadda Saxla və Göndər</span>
                )
              ) : (
                <span>Vakansiyanı Admin Təsdiqinə Göndər</span>
              )}
            </button>
          </div>
        </form>

        {/* Dynamic moving Jobia Logo at bottom of modal */}
        <ModalBottomLogo
          tagline="Jobia.az İşəgötürən və Vakansiya İdarəetmə Mərkəzi"
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
