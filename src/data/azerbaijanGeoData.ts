export interface AzerbaijanRegion {
  id: string;
  name: string;
  nameEn: string;
  nameRu: string;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
  cities: string[];
}

export interface AzerbaijanCityCoord {
  city: string;
  regionId: string;
  lat: number;
  lng: number;
  isRayonCenter?: boolean;
}

// 14 Economic & Geographic Regions of Azerbaijan
export const AZERBAIJAN_REGIONS: AzerbaijanRegion[] = [
  {
    id: 'baku',
    name: 'Bakı və Abşeron',
    nameEn: 'Baku & Absheron',
    nameRu: 'Баку и Абшерон',
    centerLat: 40.4093,
    centerLng: 49.8671,
    defaultZoom: 12,
    cities: ['Bakı', 'Sumqayıt', 'Xırdalan', 'Abşeron r-nu', 'Pirallahı'],
  },
  {
    id: 'ganja-gazakh',
    name: 'Gəncə-Qazax və Qərb',
    nameEn: 'Ganja-Gazakh & West',
    nameRu: 'Гянджа-Газах и Запад',
    centerLat: 40.6828,
    centerLng: 46.3606,
    defaultZoom: 9,
    cities: ['Gəncə', 'Tovuz', 'Qazax', 'Şəmkir', 'Ağstafa', 'Gədəbəy', 'Göygöl', 'Samux', 'Daşkəsən', 'Naftalan'],
  },
  {
    id: 'karabakh',
    name: 'Qarabağ və Şərqi Zəngəzur',
    nameEn: 'Karabakh & East Zangezur',
    nameRu: 'Карабах и Восточный Зангезур',
    centerLat: 39.7550,
    centerLng: 46.7510,
    defaultZoom: 9,
    cities: ['Şuşa', 'Xankəndi', 'Ağdam', 'Füzuli', 'Zəngilan', 'Laçın', 'Kəlbəcər', 'Cəbrayıl', 'Qubadlı', 'Xocalı', 'Xocavənd', 'Bərdə', 'Tərtər', 'Ağcabədi'],
  },
  {
    id: 'sheki-zagatala',
    name: 'Şəki-Zaqatala və Şimal-Qərb',
    nameEn: 'Sheki-Zagatala & North-West',
    nameRu: 'Шеки-Закатала и Северо-Запад',
    centerLat: 41.1919,
    centerLng: 47.1706,
    defaultZoom: 9,
    cities: ['Şəki', 'Qəbələ', 'Zaqatala', 'Balakən', 'Qax', 'Oğuz', 'İsmayıllı', 'Şamaxı', 'Qobustan'],
  },
  {
    id: 'quba-khachmaz',
    name: 'Quba-Xaçmaz və Şimal',
    nameEn: 'Guba-Khachmaz & North',
    nameRu: 'Губа-Хачмаз и Север',
    centerLat: 41.3611,
    centerLng: 48.5134,
    defaultZoom: 9,
    cities: ['Quba', 'Qusar', 'Xaçmaz', 'Xudat', 'Şabran', 'Siyəzən'],
  },
  {
    id: 'lankaran-astara',
    name: 'Lənkəran-Astara və Cənub',
    nameEn: 'Lankaran-Astara & South',
    nameRu: 'Лянкяран-Астара и Юг',
    centerLat: 38.7542,
    centerLng: 48.8506,
    defaultZoom: 9,
    cities: ['Lənkəran', 'Masallı', 'Astara', 'Lerik', 'Yardımlı', 'Cəlilabad'],
  },
  {
    id: 'central-aran',
    name: 'Mərkəzi Aran və Şirvan',
    nameEn: 'Central Aran & Shirvan',
    nameRu: 'Центральный Аран и Ширван',
    centerLat: 40.2316,
    centerLng: 47.7816,
    defaultZoom: 9,
    cities: ['Mingəçevir', 'Yevlax', 'Göyçay', 'Şirvan', 'Salyan', 'Neftçala', 'Sabirabad', 'Saatlı', 'İmişli', 'Beyləqan', 'Kürdəmir', 'Ucar', 'Zərdab', 'Hacıqabul', 'Biləsuvar'],
  },
  {
    id: 'nakhchivan',
    name: 'Naxçıvan Muxtar Respublikası',
    nameEn: 'Nakhchivan Autonomous Republic',
    nameRu: 'Нахчыванская Автономная Республика',
    centerLat: 39.2089,
    centerLng: 45.4122,
    defaultZoom: 10,
    cities: ['Naxçıvan', 'Şərur', 'Ordubad', 'Culfa', 'Şahbuz', 'Babək', 'Kəngərli', 'Sədərək'],
  },
];

// Coordinates lookup map for all cities, rayons and districts of Azerbaijan
export const AZERBAIJAN_CITY_COORDINATES: Record<string, { lat: number; lng: number; regionId: string; regionName: string }> = {
  // Bakı və Abşeron
  'Bakı': { lat: 40.4093, lng: 49.8671, regionId: 'baku', regionName: 'Bakı və Abşeron' },
  'Sumqayıt': { lat: 40.5897, lng: 49.6686, regionId: 'baku', regionName: 'Bakı və Abşeron' },
  'Xırdalan': { lat: 40.4503, lng: 49.7548, regionId: 'baku', regionName: 'Bakı və Abşeron' },
  'Abşeron r-nu': { lat: 40.4500, lng: 49.7500, regionId: 'baku', regionName: 'Bakı və Abşeron' },
  'Pirallahı': { lat: 40.4722, lng: 50.3283, regionId: 'baku', regionName: 'Bakı və Abşeron' },

  // Gəncə-Qazax
  'Gəncə': { lat: 40.6828, lng: 46.3606, regionId: 'ganja-gazakh', regionName: 'Gəncə-Qazax və Qərb' },
  'Tovuz': { lat: 40.9922, lng: 45.6289, regionId: 'ganja-gazakh', regionName: 'Gəncə-Qazax və Qərb' },
  'Qazax': { lat: 41.0925, lng: 45.3656, regionId: 'ganja-gazakh', regionName: 'Gəncə-Qazax və Qərb' },
  'Şəmkir': { lat: 40.8289, lng: 46.0178, regionId: 'ganja-gazakh', regionName: 'Gəncə-Qazax və Qərb' },
  'Ağstafa': { lat: 41.1189, lng: 45.4539, regionId: 'ganja-gazakh', regionName: 'Gəncə-Qazax və Qərb' },
  'Gədəbəy': { lat: 40.5656, lng: 45.8161, regionId: 'ganja-gazakh', regionName: 'Gəncə-Qazax və Qərb' },
  'Göygöl': { lat: 40.5858, lng: 46.3189, regionId: 'ganja-gazakh', regionName: 'Gəncə-Qazax və Qərb' },
  'Samux': { lat: 40.7628, lng: 46.4089, regionId: 'ganja-gazakh', regionName: 'Gəncə-Qazax və Qərb' },
  'Daşkəsən': { lat: 40.5203, lng: 46.0778, regionId: 'ganja-gazakh', regionName: 'Gəncə-Qazax və Qərb' },
  'Naftalan': { lat: 40.5067, lng: 46.8250, regionId: 'ganja-gazakh', regionName: 'Gəncə-Qazax və Qərb' },

  // Qarabağ və Şərqi Zəngəzur
  'Şuşa': { lat: 39.7550, lng: 46.7510, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Xankəndi': { lat: 39.8265, lng: 46.7656, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Ağdam': { lat: 39.9911, lng: 46.9297, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Füzuli': { lat: 39.6003, lng: 47.1431, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Zəngilan': { lat: 39.0858, lng: 46.6525, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Laçın': { lat: 39.6383, lng: 46.5461, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Kəlbəcər': { lat: 40.1103, lng: 46.0361, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Cəbrayıl': { lat: 39.3997, lng: 47.0267, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Qubadlı': { lat: 39.3439, lng: 46.5819, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Xocalı': { lat: 39.9133, lng: 46.7936, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Xocavənd': { lat: 39.7953, lng: 47.1108, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Bərdə': { lat: 40.3758, lng: 47.1261, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Tərtər': { lat: 40.3444, lng: 46.9317, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },
  'Ağcabədi': { lat: 40.0500, lng: 47.4589, regionId: 'karabakh', regionName: 'Qarabağ və Şərqi Zəngəzur' },

  // Şəki-Zaqatala
  'Şəki': { lat: 41.1919, lng: 47.1706, regionId: 'sheki-zagatala', regionName: 'Şəki-Zaqatala və Şimal-Qərb' },
  'Qəbələ': { lat: 40.9814, lng: 47.8458, regionId: 'sheki-zagatala', regionName: 'Şəki-Zaqatala və Şimal-Qərb' },
  'Zaqatala': { lat: 41.6336, lng: 46.6433, regionId: 'sheki-zagatala', regionName: 'Şəki-Zaqatala və Şimal-Qərb' },
  'Balakən': { lat: 41.7261, lng: 46.4044, regionId: 'sheki-zagatala', regionName: 'Şəki-Zaqatala və Şimal-Qərb' },
  'Qax': { lat: 41.4222, lng: 46.9242, regionId: 'sheki-zagatala', regionName: 'Şəki-Zaqatala və Şimal-Qərb' },
  'Oğuz': { lat: 41.0728, lng: 47.4653, regionId: 'sheki-zagatala', regionName: 'Şəki-Zaqatala və Şimal-Qərb' },
  'İsmayıllı': { lat: 40.7847, lng: 48.1517, regionId: 'sheki-zagatala', regionName: 'Şəki-Zaqatala və Şimal-Qərb' },
  'Şamaxı': { lat: 40.6319, lng: 48.6414, regionId: 'sheki-zagatala', regionName: 'Şəki-Zaqatala və Şimal-Qərb' },
  'Qobustan': { lat: 40.5333, lng: 48.9281, regionId: 'sheki-zagatala', regionName: 'Şəki-Zaqatala və Şimal-Qərb' },

  // Quba-Xaçmaz
  'Quba': { lat: 41.3611, lng: 48.5134, regionId: 'quba-khachmaz', regionName: 'Quba-Xaçmaz və Şimal' },
  'Qusar': { lat: 41.4275, lng: 48.4300, regionId: 'quba-khachmaz', regionName: 'Quba-Xaçmaz və Şimal' },
  'Xaçmaz': { lat: 41.4636, lng: 48.8058, regionId: 'quba-khachmaz', regionName: 'Quba-Xaçmaz və Şimal' },
  'Xudat': { lat: 41.6308, lng: 48.6811, regionId: 'quba-khachmaz', regionName: 'Quba-Xaçmaz və Şimal' },
  'Şabran': { lat: 41.2131, lng: 48.9953, regionId: 'quba-khachmaz', regionName: 'Quba-Xaçmaz və Şimal' },
  'Siyəzən': { lat: 40.9856, lng: 49.1128, regionId: 'quba-khachmaz', regionName: 'Quba-Xaçmaz və Şimal' },

  // Lənkəran-Astara
  'Lənkəran': { lat: 38.7542, lng: 48.8506, regionId: 'lankaran-astara', regionName: 'Lənkəran-Astara və Cənub' },
  'Masallı': { lat: 39.0342, lng: 48.6653, regionId: 'lankaran-astara', regionName: 'Lənkəran-Astara və Cənub' },
  'Astara': { lat: 38.4558, lng: 48.8747, regionId: 'lankaran-astara', regionName: 'Lənkəran-Astara və Cənub' },
  'Lerik': { lat: 38.7739, lng: 48.4153, regionId: 'lankaran-astara', regionName: 'Lənkəran-Astara və Cənub' },
  'Yardımlı': { lat: 38.9078, lng: 48.2408, regionId: 'lankaran-astara', regionName: 'Lənkəran-Astara və Cənub' },
  'Cəlilabad': { lat: 39.2081, lng: 48.4914, regionId: 'lankaran-astara', regionName: 'Lənkəran-Astara və Cənub' },

  // Mərkəzi Aran və Şirvan
  'Mingəçevir': { lat: 40.7639, lng: 47.0494, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Yevlax': { lat: 40.6172, lng: 47.1500, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Göyçay': { lat: 40.6536, lng: 47.7406, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Şirvan': { lat: 39.9378, lng: 48.9289, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Salyan': { lat: 39.5961, lng: 48.9839, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Neftçala': { lat: 39.3756, lng: 49.2472, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Sabirabad': { lat: 40.0086, lng: 48.4772, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Saatlı': { lat: 39.9322, lng: 48.3697, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'İmişli': { lat: 39.8708, lng: 48.0600, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Beyləqan': { lat: 39.7756, lng: 47.6186, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Kürdəmir': { lat: 40.3436, lng: 48.1606, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Ucar': { lat: 40.5186, lng: 47.6542, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Zərdab': { lat: 40.2189, lng: 47.7125, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Hacıqabul': { lat: 40.0394, lng: 48.9431, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },
  'Biləsuvar': { lat: 39.4589, lng: 48.5450, regionId: 'central-aran', regionName: 'Mərkəzi Aran və Şirvan' },

  // Naxçıvan MR
  'Naxçıvan': { lat: 39.2089, lng: 45.4122, regionId: 'nakhchivan', regionName: 'Naxçıvan Muxtar Respublikası' },
  'Şərur': { lat: 39.5536, lng: 44.9797, regionId: 'nakhchivan', regionName: 'Naxçıvan Muxtar Respublikası' },
  'Ordubad': { lat: 38.9056, lng: 46.0233, regionId: 'nakhchivan', regionName: 'Naxçıvan Muxtar Respublikası' },
  'Culfa': { lat: 38.9567, lng: 45.6308, regionId: 'nakhchivan', regionName: 'Naxçıvan Muxtar Respublikası' },
  'Şahbuz': { lat: 39.4072, lng: 45.5739, regionId: 'nakhchivan', regionName: 'Naxçıvan Muxtar Respublikası' },
  'Babək': { lat: 39.1508, lng: 45.4486, regionId: 'nakhchivan', regionName: 'Naxçıvan Muxtar Respublikası' },
  'Kəngərli': { lat: 39.3833, lng: 45.1667, regionId: 'nakhchivan', regionName: 'Naxçıvan Muxtar Respublikası' },
  'Sədərək': { lat: 39.7142, lng: 44.8833, regionId: 'nakhchivan', regionName: 'Naxçıvan Muxtar Respublikası' },
};

// Baku Metro Stations with precise lat & lng
export const BAKU_METRO_STATIONS = [
  { name: '28 May', line: 'Qırmızı / Yaşıl', lat: 40.3792, lng: 49.8512, district: 'Nəsimi' },
  { name: 'Sahil', line: 'Qırmızı', lat: 40.3712, lng: 49.8532, district: 'Səbail' },
  { name: 'İçərişəhər', line: 'Qırmızı', lat: 40.3661, lng: 49.8322, district: 'Səbail' },
  { name: 'Nizami', line: 'Yaşıl', lat: 40.3795, lng: 49.8298, district: 'Yasamal' },
  { name: 'Elmlər Akademiyası', line: 'Yaşıl', lat: 40.3742, lng: 49.8135, district: 'Yasamal' },
  { name: 'İnşaatçılar', line: 'Yaşıl', lat: 40.3854, lng: 49.8021, district: 'Yasamal' },
  { name: '20 Yanvar', line: 'Yaşıl', lat: 40.3953, lng: 49.8118, district: 'Yasamal / Nəsimi' },
  { name: 'Memar Əcəmi', line: 'Yaşıl / Bənövşəyi', lat: 40.4109, lng: 49.8167, district: 'Nəsimi' },
  { name: 'Nəsimi', line: 'Yaşıl', lat: 40.4243, lng: 49.8139, district: 'Nəsimi / Binəqədi' },
  { name: 'Azadlıq Prospekti', line: 'Yaşıl', lat: 40.4258, lng: 49.8436, district: 'Binəqədi' },
  { name: 'Dərnəgül', line: 'Yaşıl', lat: 40.4208, lng: 49.8601, district: 'Binəqədi' },
  { name: 'Gənclik', line: 'Qırmızı / Yaşıl', lat: 40.4005, lng: 49.8518, district: 'Nərimanov' },
  { name: 'Nəriman Nərimanov', line: 'Qırmızı / Yaşıl', lat: 40.4022, lng: 49.8719, district: 'Nərimanov' },
  { name: 'Ulduz', line: 'Qırmızı / Yaşıl', lat: 40.4150, lng: 49.8911, district: 'Nizami' },
  { name: 'Koroğlu', line: 'Qırmızı / Yaşıl', lat: 40.4201, lng: 49.9192, district: 'Nizami' },
  { name: 'Qara Qarayev', line: 'Qırmızı / Yaşıl', lat: 40.4178, lng: 49.9450, district: 'Nizami' },
  { name: 'Neftçilər', line: 'Qırmızı / Yaşıl', lat: 40.4111, lng: 49.9422, district: 'Nizami' },
  { name: 'Xalqlar Dostluğu', line: 'Qırmızı / Yaşıl', lat: 40.3972, lng: 49.9533, district: 'Nizami / Xətai' },
  { name: 'Əhmədli', line: 'Qırmızı / Yaşıl', lat: 40.3867, lng: 49.9542, district: 'Xətai' },
  { name: 'Həzi Aslanov', line: 'Qırmızı / Yaşıl', lat: 40.3736, lng: 49.9536, district: 'Xətai' },
  { name: 'Cəfər Cabbarlı', line: 'Yaşıl', lat: 40.3798, lng: 49.8495, district: 'Nəsimi' },
  { name: 'Xətai', line: 'Yaşıl', lat: 40.3809, lng: 49.8821, district: 'Xətai' },
  { name: 'Avtovağzal', line: 'Bənövşəyi', lat: 40.4209, lng: 49.7961, district: 'Binəqədi' },
  { name: '8 Noyabr', line: 'Bənövşəyi', lat: 40.3986, lng: 49.8242, district: 'Nəsimi' },
  { name: 'Xocəsən', line: 'Bənövşəyi', lat: 40.4150, lng: 49.7600, district: 'Binəqədi' },
];

// Helper to get coordinates from city string or fallback
export function getCoordinatesForCity(city: string, district?: string): { lat: number; lng: number; regionId: string; regionName: string } {
  // If city matches directly
  if (AZERBAIJAN_CITY_COORDINATES[city]) {
    return AZERBAIJAN_CITY_COORDINATES[city];
  }

  // Check if city string contains a recognized city name
  for (const [cityName, coord] of Object.entries(AZERBAIJAN_CITY_COORDINATES)) {
    if (city.toLowerCase().includes(cityName.toLowerCase()) || cityName.toLowerCase().includes(city.toLowerCase())) {
      return coord;
    }
  }

  // Default to Baku Center
  return {
    lat: 40.4093,
    lng: 49.8671,
    regionId: 'baku',
    regionName: 'Bakı və Abşeron',
  };
}

// Distance calculation using Haversine formula (km)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Estimate travel times for city / regional travel
export function getCommuteEstimate(distanceKm: number) {
  if (distanceKm <= 5) {
    const walkMin = Math.round((distanceKm / 4.5) * 60);
    const carMin = Math.max(3, Math.round((distanceKm / 25) * 60 + 2));
    const transitMin = Math.max(6, Math.round((distanceKm / 18) * 60 + 4));
    return { walkMin, carMin, transitMin, travelType: 'Şəhərdaxili Yaxın' };
  } else if (distanceKm <= 40) {
    const walkMin = Math.round((distanceKm / 4.5) * 60);
    const carMin = Math.round((distanceKm / 45) * 60 + 5);
    const transitMin = Math.round((distanceKm / 30) * 60 + 10);
    return { walkMin, carMin, transitMin, travelType: 'Abşeron / Şəhərətrafı' };
  } else {
    // Inter-city regional travel
    const walkMin = Math.round((distanceKm / 4.5) * 60);
    const carMin = Math.round((distanceKm / 75) * 60 + 15);
    const transitMin = Math.round((distanceKm / 55) * 60 + 30);
    return { walkMin, carMin, transitMin, travelType: 'Regionlararası Magistral' };
  }
}
