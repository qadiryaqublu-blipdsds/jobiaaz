import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Vacancy } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import L from 'leaflet';
import { 
  AZERBAIJAN_REGIONS, 
  AZERBAIJAN_CITY_COORDINATES, 
  BAKU_METRO_STATIONS,
  calculateDistanceKm,
  getCommuteEstimate,
  getCoordinatesForCity,
  AzerbaijanRegion
} from '../../data/azerbaijanGeoData';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Filter, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Compass, 
  ArrowRight, 
  Bookmark, 
  Zap, 
  CheckCircle2, 
  Building2, 
  Car, 
  Footprints, 
  Train, 
  ExternalLink, 
  RotateCcw,
  Sparkles,
  Layers,
  Map as MapIcon,
  List as ListIcon,
  BarChart3,
  TrendingUp,
  Download,
  Globe,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  SlidersHorizontal,
  HelpCircle
} from 'lucide-react';
import { JobiaSectionFooter } from '../JobiaSectionFooter';

interface NearbyJobsMapProps {
  vacancies: Vacancy[];
  onSelectVacancy: (vacancy: Vacancy) => void;
  savedJobIds: string[];
  onToggleBookmark: (jobId: string) => void;
  onQuickApply?: (vacancy: Vacancy) => void;
}

export const NearbyJobsMap: React.FC<NearbyJobsMapProps> = ({
  vacancies,
  onSelectVacancy,
  savedJobIds,
  onToggleBookmark,
  onQuickApply,
}) => {
  const { dict, language } = useLanguage();

  // Map Tile Layers & Providers (100% working, real-time, no API key prompts)
  const MAP_TILE_PROVIDERS = {
    'google-streets': {
      name: 'Google Xəritə',
      shortName: 'Google',
      icon: '🗺️',
      url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps &copy; Jobia.az',
    },
    'google-hybrid': {
      name: 'Google Peyk (Hibrid)',
      shortName: 'Peyk',
      icon: '🛰️',
      url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Satellite &copy; Jobia.az',
    },
    'osm': {
      name: 'OpenStreetMap',
      shortName: 'OSM',
      icon: '🌍',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c'],
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; Jobia.az',
    },
    'esri-streets': {
      name: 'Esri Şəhər Küçələri',
      shortName: 'Esri',
      icon: '🏛️',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      subdomains: [],
      maxZoom: 19,
      attribution: '&copy; Esri &copy; Jobia.az',
    },
  };

  type TileProviderKey = keyof typeof MAP_TILE_PROVIDERS;

  const [activeTileProvider, setActiveTileProvider] = useState<TileProviderKey>('google-streets');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);

  // User location / reference point state (Default to Baku Center)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string; regionId?: string }>({
    lat: 40.4093,
    lng: 49.8671,
    label: 'Bakı Mərkəz (Nizami k.)',
    regionId: 'baku',
  });

  const [selectedRegionId, setSelectedRegionId] = useState<string>('all'); // 'all' = Nationwide Azerbaijan
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedMetro, setSelectedMetro] = useState<string>('all');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(0); // 0 = unlimited / whole country
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWorkplace, setSelectedWorkplace] = useState<string>('all');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'salary' | 'newest'>('distance');
  
  // Collapsible sections for clean, immediate first-viewport UX
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Request browser geolocation
  const handleDetectLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError(
        language === 'az'
          ? 'Brauzeriniz geolokasiya xüsusiyyətini dəstəkləmir.'
          : language === 'ru'
          ? 'Ваш браузер не поддерживает геолокацию.'
          : 'Your browser does not support geolocation.'
      );
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          label:
            language === 'az'
              ? '📍 Dəqiq Cari Məkanım (GPS)'
              : language === 'ru'
              ? '📍 Точное местоположение (GPS)'
              : '📍 Current Precise Location (GPS)',
        });
        setIsLocating(false);

        // Center map smoothly on detected user location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, {
            duration: 1.2,
          });
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocationError(
          language === 'az'
            ? 'Cari məkan təyin edilə bilmədi (GPS icazəsi verilmədi). Standart mərkəz Bakı olaraq saxlanıldı.'
            : 'Could not retrieve location. Defaulting to Baku Center.'
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Switch Active Region
  const handleSelectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    setSelectedCity('all');
    setSelectedMetro('all');

    if (regionId === 'all') {
      setUserLocation({
        lat: 40.4093,
        lng: 49.8671,
        label: 'Azərbaycan (Bakı Mərkəz)',
        regionId: 'all',
      });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([40.35, 48.8], 8, { duration: 1.2 });
      }
      return;
    }

    const reg = AZERBAIJAN_REGIONS.find((r) => r.id === regionId);
    if (reg) {
      setUserLocation({
        lat: reg.centerLat,
        lng: reg.centerLng,
        label: `${reg.name} Zonası`,
        regionId: reg.id,
      });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([reg.centerLat, reg.centerLng], 10, {
          duration: 1.2,
        });
      }
    }
  };

  // Switch City
  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    if (cityName === 'all') return;

    const coords = AZERBAIJAN_CITY_COORDINATES[cityName] || getCoordinatesForCity(cityName);
    if (coords) {
      setUserLocation({
        lat: coords.lat,
        lng: coords.lng,
        label: `${cityName} Şəhəri`,
        regionId: coords.regionId,
      });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([coords.lat, coords.lng], 13, { duration: 1.2 });
      }
    }
  };

  // Switch Metro Station
  const handleSelectMetro = (metroName: string) => {
    setSelectedMetro(metroName);
    if (metroName === 'all') return;

    const metro = BAKU_METRO_STATIONS.find((m) => m.name === metroName);
    if (metro) {
      setUserLocation({
        lat: metro.lat,
        lng: metro.lng,
        label: `🚇 ${metro.name} m/s`,
        regionId: 'baku',
      });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([metro.lat, metro.lng], 15, { duration: 1.2 });
      }
    }
  };

  // Regional Statistics Breakdown
  const regionalStats = useMemo(() => {
    return AZERBAIJAN_REGIONS.map((region) => {
      const regionVacancies = vacancies.filter((v) => {
        const coords = getCoordinatesForCity(v.city);
        return coords.regionId === region.id;
      });

      const totalCount = regionVacancies.length;
      const percentage = vacancies.length > 0 ? Math.round((totalCount / vacancies.length) * 100) : 0;
      
      const salaries = regionVacancies
        .map((v) => v.maxSalary || v.minSalary || 0)
        .filter((s) => s > 0);
      const avgSalary = salaries.length > 0 ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length) : 0;

      return {
        regionId: region.id,
        regionName: region.name,
        count: totalCount,
        percentage,
        avgSalary,
      };
    });
  }, [vacancies]);

  // Enriched vacancies with real geo distance and commute estimates
  const vacanciesWithDistance = useMemo(() => {
    let list = vacancies
      .filter((v) => v.isApproved !== false)
      .map((job) => {
        const cityCoords = getCoordinatesForCity(job.city);
        const actualLat = job.latitude || cityCoords.lat;
        const actualLng = job.longitude || cityCoords.lng;
        const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, actualLat, actualLng);
        const commute = getCommuteEstimate(distanceKm);

        return {
          ...job,
          actualLat,
          actualLng,
          distanceKm,
          commute,
          cityRegionId: cityCoords.regionId,
        };
      });

    // 1. Economic Region Filter
    if (selectedRegionId !== 'all') {
      list = list.filter((j) => j.cityRegionId === selectedRegionId);
    }

    // 2. City Filter
    if (selectedCity !== 'all') {
      list = list.filter((j) => j.city.toLowerCase() === selectedCity.toLowerCase());
    }

    // 3. Metro Filter
    if (selectedMetro !== 'all') {
      list = list.filter((j) => j.metroStation === selectedMetro);
    }

    // 4. Radius Filter
    if (selectedRadiusKm > 0) {
      list = list.filter((j) => j.distanceKm <= selectedRadiusKm);
    }

    // 5. Category Filter
    if (selectedCategory !== 'all') {
      list = list.filter((j) => j.category === selectedCategory);
    }

    // 6. Workplace Filter
    if (selectedWorkplace !== 'all') {
      list = list.filter((j) => j.workplaceType === selectedWorkplace);
    }

    // 7. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.category.toLowerCase().includes(q) ||
          j.city.toLowerCase().includes(q) ||
          (j.skills && j.skills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    // 8. Sorting
    list.sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'salary') return (b.maxSalary || b.minSalary || 0) - (a.maxSalary || a.minSalary || 0);
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    return list;
  }, [
    vacancies,
    userLocation,
    selectedRegionId,
    selectedCity,
    selectedMetro,
    selectedRadiusKm,
    selectedCategory,
    selectedWorkplace,
    searchQuery,
    sortBy,
  ]);

  const activeSelectedJob = useMemo(() => {
    return vacanciesWithDistance.find((j) => j.id === selectedJobId) || null;
  }, [vacanciesWithDistance, selectedJobId]);

  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    vacancies.forEach((v) => {
      if (v.category) set.add(v.category);
    });
    return Array.from(set);
  }, [vacancies]);

  const currentActiveRegion = useMemo(() => {
    return AZERBAIJAN_REGIONS.find((r) => r.id === selectedRegionId);
  }, [selectedRegionId]);

  // Export Regional Statistics as CSV
  const handleExportCSV = () => {
    const headers = 'Region ID,Region Adı,Vakansiya Sayı,Ümumi Pay %,Orta Maaş (AZN)\n';
    const rows = regionalStats
      .map((r) => `"${r.regionId}","${r.regionName}",${r.count},${r.percentage},${r.avgSalary}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Jobia_Az_Regional_Statistika_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // Prevent Leaflet "Map container is already initialized" error
      if ((mapContainerRef.current as any)._leaflet_id && !mapInstanceRef.current) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [userLocation.lat, userLocation.lng],
          zoom: 12,
          zoomControl: false, // Custom position to prevent button overlap
        });

        // Add 100% reliable, fast tile layer (Google Maps / OpenStreetMap)
        const provider = MAP_TILE_PROVIDERS[activeTileProvider] || MAP_TILE_PROVIDERS['google-streets'];
        const tileLayer = L.tileLayer(provider.url, {
          attribution: provider.attribution,
          maxZoom: provider.maxZoom,
          subdomains: provider.subdomains && provider.subdomains.length > 0 ? provider.subdomains : 'abc',
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        // Add Zoom Control to bottom-right to avoid mobile header collision
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const markersGroup = L.layerGroup().addTo(map);
        markersGroupRef.current = markersGroup;
        mapInstanceRef.current = map;

        // Enable map click to move user reference location
        map.on('click', (e: L.LeafletMouseEvent) => {
          setUserLocation({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            label: `📍 Xəritədə Seçilmiş Nöqtə (${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})`,
          });
        });
      }
    } catch (mapErr) {
      console.warn('Leaflet map initialization warning:', mapErr);
    }

    return () => {
      // Map cleanup on unmount
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          tileLayerRef.current = null;
        }
      } catch {}
    };
  }, []);

  // Dynamic Map Layer update when user switches map provider
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      const provider = MAP_TILE_PROVIDERS[activeTileProvider] || MAP_TILE_PROVIDERS['google-streets'];
      const newTileLayer = L.tileLayer(provider.url, {
        attribution: provider.attribution,
        maxZoom: provider.maxZoom,
        subdomains: provider.subdomains && provider.subdomains.length > 0 ? provider.subdomains : 'abc',
      }).addTo(map);

      // Ensure tile layer is behind markers
      if ((newTileLayer as any).bringToBack) {
        (newTileLayer as any).bringToBack();
      }
      tileLayerRef.current = newTileLayer;
    } catch (err) {
      console.warn('Error changing tile layer:', err);
    }
  }, [activeTileProvider]);

  // Update User Marker & Radius Circle on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove previous user marker
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }
    if (userCircleRef.current) {
      map.removeLayer(userCircleRef.current);
    }

    // User Location Icon (Pulsing blue pin)
    const userPinHtml = `
      <div class="relative flex items-center justify-center">
        <div class="w-7 h-7 bg-blue-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-black ring-4 ring-blue-400/40 animate-pulse">
          🎯
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userPinHtml,
      className: 'custom-user-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    userMarker.bindTooltip(
      `<strong>${userLocation.label}</strong><br/><span style="font-size:10px; color:#64748b;">(İstənilən yerə klikləyərək dəyişə bilərsiniz)</span>`,
      { direction: 'top', offset: [0, -14] }
    );
    userMarkerRef.current = userMarker;

    // Optional Radius Circle if selected
    if (selectedRadiusKm > 0) {
      userCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: selectedRadiusKm * 1000,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '5, 5',
      }).addTo(map);
    }
  }, [userLocation, selectedRadiusKm]);

  // Render Vacancy Markers on Leaflet Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (vacanciesWithDistance.length === 0) return;

    const bounds = L.latLngBounds([]);

    vacanciesWithDistance.forEach((job) => {
      bounds.extend([job.actualLat, job.actualLng]);

      const isSelected = selectedJobId === job.id;
      const isHighSalary = (job.maxSalary || job.minSalary || 0) >= 2000;

      // Custom marker Pin HTML
      const markerHtml = `
        <div class="relative group cursor-pointer transition-all duration-300 transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl shadow-md border text-xs font-bold whitespace-nowrap transition-all ${
            isSelected
              ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/30'
              : isHighSalary
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-300'
              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-500'
          }">
            <span class="text-xs">💼</span>
            <span class="max-w-[100px] truncate text-[11px] font-semibold">${job.title}</span>
            <span class="text-[10px] opacity-80 font-bold ml-0.5">${job.distanceKm}km</span>
          </div>
          <div class="w-2 h-2 bg-current rotate-45 mx-auto -mt-1 ${isSelected ? 'text-blue-600' : isHighSalary ? 'text-orange-600' : 'text-white'}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-job-pin',
        iconSize: [130, 32],
        iconAnchor: [65, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([job.actualLat, job.actualLng], {
        icon: customIcon,
      }).addTo(markersGroup);

      // Compact Popup Content
      const popupHtml = `
        <div class="p-2.5 max-w-xs text-slate-800 space-y-2">
          <div class="flex items-center gap-2 border-b pb-2">
            <img src="${job.companyLogo}" class="w-8 h-8 rounded-lg object-cover border" onerror="this.src='https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100'" />
            <div class="overflow-hidden">
              <h4 class="font-bold text-xs leading-tight truncate text-slate-900">${job.title}</h4>
              <p class="text-[11px] text-slate-500 truncate">${job.companyName}</p>
            </div>
          </div>

          <div class="text-xs space-y-1 bg-slate-50 p-2 rounded-lg">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-500">📍 Məsafə:</span>
              <strong class="text-blue-600 font-bold">${job.distanceKm} km (${job.city})</strong>
            </div>
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-500">💰 Maaş:</span>
              <strong class="text-emerald-600 font-bold">${job.maxSalary ? `₼${job.minSalary} - ₼${job.maxSalary}` : job.minSalary ? `₼${job.minSalary}` : 'Razılaşma ilə'}</strong>
            </div>
            <div class="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>🚶 ${job.commute.walkMin} dəq</span>
              <span>🚗 ${job.commute.carMin} dəq</span>
              <span>🚇 ${job.commute.transitMin} dəq</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5 pt-1">
            <button id="btn-view-${job.id}" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition text-center cursor-pointer">
              Bax & Müraciət
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${job.actualLat},${job.actualLng}" target="_blank" rel="noopener noreferrer" class="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer" title="Google Xəritədə Marşrut">
              🧭
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        setSelectedJobId(job.id);
        const btn = document.getElementById(`btn-view-${job.id}`);
        if (btn) {
          btn.onclick = () => onSelectVacancy(job);
        }
      });

      marker.on('click', () => {
        setSelectedJobId(job.id);
      });
    });

    // Auto fit bounds on initial load if we have vacancies
    if (vacanciesWithDistance.length > 0 && !selectedJobId && selectedRegionId === 'all') {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [vacanciesWithDistance, selectedJobId]);

  // Center map on specific job when card clicked
  const handleJobCardClick = (job: typeof vacanciesWithDistance[0]) => {
    setSelectedJobId(job.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([job.actualLat, job.actualLng], 14, {
        duration: 1.0,
      });
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedRegionId('all');
    setSelectedCity('all');
    setSelectedMetro('all');
    setSelectedRadiusKm(0);
    setSelectedCategory('all');
    setSelectedWorkplace('all');
    setSearchQuery('');
    setSortBy('distance');
    setUserLocation({
      lat: 40.4093,
      lng: 49.8671,
      label: 'Bakı Mərkəz (Nizami k.)',
      regionId: 'baku',
    });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([40.35, 48.8], 8, { duration: 1.0 });
    }
  };

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (selectedRegionId !== 'all') c++;
    if (selectedCity !== 'all') c++;
    if (selectedMetro !== 'all') c++;
    if (selectedRadiusKm > 0) c++;
    if (selectedCategory !== 'all') c++;
    if (selectedWorkplace !== 'all') c++;
    if (searchQuery.trim()) c++;
    return c;
  }, [selectedRegionId, selectedCity, selectedMetro, selectedRadiusKm, selectedCategory, selectedWorkplace, searchQuery]);

  return (
    <div id="nearby-jobs-map-view" className="w-full space-y-3 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. ULTRA-COMPACT SLEEK TOP BAR (FIRST VIEWPORT FOCUS - NO GIANT PUSH DOWNS) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Title & Live Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-blue-400/30">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-200 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                  Xəritə ilə Axtarış
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                  {vacanciesWithDistance.length} Vakansiya
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                Məkan: <strong className="text-cyan-300">{userLocation.label}</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons & Dropdown Controls */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            
            {/* Quick GPS button */}
            <button
              id="btn-detect-gps-location"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-70 cursor-pointer whitespace-nowrap"
              title="Brauzer GPS vasitəsilə cari yerinizi təyin edin"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : 'text-cyan-200'}`} />
              <span>{isLocating ? 'Təyin olunur...' : '📍 GPS Məkanım'}</span>
            </button>

            {/* Quick All Azerbaijan Button */}
            <button
              onClick={() => handleSelectRegion('all')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                selectedRegionId === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>🇦🇿 Bütün Ölkə</span>
            </button>

            {/* Filter Drawer Toggle */}
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                isFiltersOpen || activeFilterCount > 0
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-200" />
              <span>Filtrlər</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-indigo-900 text-[10px] font-black flex items-center justify-center ml-0.5">
                  {activeFilterCount}
                </span>
              )}
              {isFiltersOpen ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            {/* Regional Stats Accordion Toggle */}
            <button
              onClick={() => setIsStatsOpen(!isStatsOpen)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                isStatsOpen
                  ? 'bg-amber-600 text-white border-amber-400 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">Region Statistikası</span>
              <span className="sm:hidden">Statistika</span>
              {isStatsOpen ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            {/* Guide Accordion Toggle */}
            <button
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              title="Xəritə necə işləyir?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Mobile Map / List Tab switch */}
            <div className="lg:hidden flex bg-white/15 p-0.5 rounded-xl border border-white/15 ml-auto">
              <button
                onClick={() => setMobileTab('map')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  mobileTab === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80'
                }`}
              >
                🗺️ Xəritə
              </button>
              <button
                onClick={() => setMobileTab('list')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  mobileTab === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80'
                }`}
              >
                📋 Siyahı ({vacanciesWithDistance.length})
              </button>
            </div>
          </div>
        </div>

        {/* Location Error notification */}
        {locationError && (
          <div className="mt-2 bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVE FILTER BADGES / CHIPS (Real User Feedback)                     */}
      {/* ========================================================================= */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-blue-50/80 border border-blue-200 rounded-xl text-xs">
          <span className="font-bold text-blue-900 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Aktiv filtrlər:</span>
          </span>

          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-blue-200 text-blue-800 font-semibold shadow-2xs">
              🔍 "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedRegionId !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-blue-200 text-blue-800 font-semibold shadow-2xs">
              📍 {currentActiveRegion?.name || selectedRegionId}
              <button onClick={() => setSelectedRegionId('all')} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCity !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-blue-200 text-blue-800 font-semibold shadow-2xs">
              🏛️ {selectedCity}
              <button onClick={() => setSelectedCity('all')} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedMetro !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-blue-200 text-blue-800 font-semibold shadow-2xs">
              🚇 {selectedMetro}
              <button onClick={() => setSelectedMetro('all')} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedWorkplace !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-blue-200 text-blue-800 font-semibold shadow-2xs">
              🏢 {selectedWorkplace}
              <button onClick={() => setSelectedWorkplace('all')} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedRadiusKm > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-blue-200 text-blue-800 font-semibold shadow-2xs">
              📏 {selectedRadiusKm} km
              <button onClick={() => setSelectedRadiusKm(0)} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-blue-200 text-blue-800 font-semibold shadow-2xs">
              💼 {selectedCategory}
              <button onClick={() => setSelectedCategory('all')} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="ml-auto text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer text-[11px]"
          >
            Hamısını Sıfırla
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. COLLAPSIBLE FILTERS DRAWER                                            */}
      {/* ========================================================================= */}
      {isFiltersOpen && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Ətraflı Axtarış Filtrləri</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Filterləri Sıfırla</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Açar Sözlə Axtarış
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Vakansiya, şirkət, bacarıq..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Region / Economic Zone Dropdown */}
            <div className="lg:col-span-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                İqtisadi Region (8 Zona)
              </label>
              <select
                value={selectedRegionId}
                onChange={(e) => handleSelectRegion(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white font-medium text-slate-700"
              >
                <option value="all">🇦🇿 Bütün Azərbaycan (Ölkə)</option>
                {AZERBAIJAN_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    📍 {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-City / District Dropdown */}
            <div className="lg:col-span-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Şəhər / Rayon
              </label>
              <select
                value={selectedCity}
                onChange={(e) => handleSelectCity(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white font-medium text-slate-700"
              >
                <option value="all">Bütün Şəhərlər ({selectedRegionId === 'all' ? 'Ölkə' : currentActiveRegion?.name})</option>
                {selectedRegionId === 'all'
                  ? Object.keys(AZERBAIJAN_CITY_COORDINATES).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  : currentActiveRegion?.cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="lg:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Kateqoriya
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white font-medium text-slate-700"
              >
                <option value="all">Bütün Kateqoriyalar</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Radius Selector Pills */}
            <div className="lg:col-span-5">
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                Məsafə Radiusu:{' '}
                <span className="text-blue-600 font-bold">
                  {selectedRadiusKm === 0 ? 'Məhdudiyyətsiz (Bütün Ölkə)' : `${selectedRadiusKm} km radius`}
                </span>
              </label>
              <div className="flex gap-1">
                {[5, 15, 35, 80, 200, 0].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRadiusKm(r)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                      selectedRadiusKm === r
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {r === 0 ? 'Hamısı' : `${r}km`}
                  </button>
                ))}
              </div>
            </div>

            {/* Baku Metro Station Filter */}
            <div className="lg:col-span-4">
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                🚇 Bakı Metrosu
              </label>
              <select
                value={selectedMetro}
                onChange={(e) => handleSelectMetro(e.target.value)}
                className="w-full py-1 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white font-medium text-slate-700"
              >
                <option value="all">Bütün Metro Stansiyaları</option>
                {BAKU_METRO_STATIONS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.district})
                  </option>
                ))}
              </select>
            </div>

            {/* Workplace Format & Sort By */}
            <div className="lg:col-span-3">
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                İş Formatı & Sıralama
              </label>
              <div className="flex gap-1.5">
                <select
                  value={selectedWorkplace}
                  onChange={(e) => setSelectedWorkplace(e.target.value)}
                  className="flex-1 py-1 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
                >
                  <option value="all">Format: Hamısı</option>
                  <option value="Ofis">Ofis</option>
                  <option value="Hibrid">Hibrid</option>
                  <option value="Remote">Uzaqdan (Remote)</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 py-1 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
                >
                  <option value="distance">📍 Ən yaxın</option>
                  <option value="salary">💰 Maaş</option>
                  <option value="newest">⚡ Ən yeni</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. COLLAPSIBLE NATIONWIDE VACANCY STATS DRAWER                           */}
      {/* ========================================================================= */}
      {isStatsOpen && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Azərbaycanın 8 İqtisadi Zonası üzrə Vakansiya Sıxlığı və Maaş Statistikası
                </h3>
                <p className="text-[11px] text-slate-500">
                  İstənilən zonaya klik edərək xəritəni həmin zonaya fokuslayın
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Statistika Cədvəlini CSV formatında yüklə"
              >
                <Download className="w-3 h-3 text-slate-600" />
                <span>CSV Yüklə</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {regionalStats.map((stat) => {
              const isSelected = selectedRegionId === stat.regionId;
              return (
                <div
                  key={stat.regionId}
                  onClick={() => handleSelectRegion(stat.regionId)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-2xs'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-800 truncate" title={stat.regionName}>
                    {stat.regionName.split(' ')[0]}
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-sm font-black text-blue-600">{stat.count}</span>
                    <span className="text-[10px] font-semibold text-slate-500">%{stat.percentage}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, stat.percentage)}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 truncate">
                    {stat.avgSalary > 0 ? `~₼${stat.avgSalary}` : 'Razılaşma'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. COLLAPSIBLE MAP GUIDE ACCORDION                                       */}
      {/* ========================================================================= */}
      {isGuideOpen && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Xəritə ilə Axtarışdan Necə İstifadə Etməli?</span>
            </span>
            <button onClick={() => setIsGuideOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p>
            1. <strong>Cari Məkan:</strong> "📍 GPS Məkanım" düyməsinə basaraq və ya xəritədə istənilən nöqtəyə klikləyərək istinad nöqtənizi təyin edin.
          </p>
          <p>
            2. <strong>Yaxınlıq Hesablanması:</strong> Bütün vakansiyalar real vaxt rejimində həmin nöqtədən olan dəqiq kilometr məsafəsi, piyada, avtomobil və ictimai nəqliyyat vaxtı ilə göstərilir.
          </p>
          <p>
            3. <strong>Google Maps Marşrutu:</strong> Hər hansı vakansiyanın markerinə klikləyərək dərhal birbaşa Google Xəritədə naviqasiya marşrutunu aça bilərsiniz.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MAIN FIRST-VIEWPORT MAP & SPLIT INTERFACE                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start relative">
        
        {/* MAP CONTAINER (Dominant and immediate on screen) */}
        <div
          className={`lg:col-span-7 xl:col-span-8 transition-all ${
            mobileTab === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm relative overflow-hidden">
            
            {/* Map Canvas */}
            <div
              ref={mapContainerRef}
              id="leaflet-job-map-canvas"
              className="w-full h-[460px] sm:h-[540px] lg:h-[620px] rounded-xl z-0"
              style={{ minHeight: '440px' }}
            />

            {/* Floating Top-Left Badge: Live Vacancies Count */}
            <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{vacanciesWithDistance.length} vakansiya xəritədə</span>
            </div>

            {/* Floating Top-Right: Map Style & Layer Switcher */}
            <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5">
              <div className="relative">
                <button
                  id="btn-map-layer-toggle"
                  type="button"
                  onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                  className="bg-white/95 hover:bg-white backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  title="Xəritə görünüşünü dəyişdir (Google, Peyk, OpenStreetMap, Esri)"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">{MAP_TILE_PROVIDERS[activeTileProvider]?.name || 'Google Xəritə'}</span>
                  <span className="sm:hidden">{MAP_TILE_PROVIDERS[activeTileProvider]?.shortName || 'Xəritə'}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLayerMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLayerMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white/98 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 py-1 z-[450] animate-fade-in text-xs">
                    <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Xəritə Qatı Seçin</span>
                      <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Aktiv</span>
                    </div>
                    {(Object.keys(MAP_TILE_PROVIDERS) as TileProviderKey[]).map((key) => {
                      const prov = MAP_TILE_PROVIDERS[key];
                      const isSelected = activeTileProvider === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setActiveTileProvider(key);
                            setIsLayerMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left font-medium transition cursor-pointer ${
                            isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{prov.icon}</span>
                            <div>
                              <div className="text-xs">{prov.name}</div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Floating Recenter Pin Button */}
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.0 });
                }
              }}
              className="absolute bottom-5 right-5 z-[400] bg-white hover:bg-slate-50 text-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Mənim Məkanımı Mərkəzləşdir"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Məkanım</span>
            </button>

            {/* Floating Active Job Quick Preview Card (if selected) */}
            {activeSelectedJob && (
              <div className="absolute bottom-4 left-4 right-16 sm:right-auto sm:max-w-md z-[400] bg-white/98 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-blue-200 animate-slideUp">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={activeSelectedJob.companyLogo}
                      alt={activeSelectedJob.companyName}
                      className="w-8 h-8 rounded-lg object-cover border shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute(
                          'src',
                          'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100'
                        );
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate">{activeSelectedJob.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{activeSelectedJob.companyName} • 📍 {activeSelectedJob.distanceKm} km</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedJobId(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div className="font-extrabold text-blue-600 text-xs">
                    {activeSelectedJob.maxSalary
                      ? `₼${activeSelectedJob.minSalary} - ₼${activeSelectedJob.maxSalary}`
                      : activeSelectedJob.minSalary
                      ? `₼${activeSelectedJob.minSalary}`
                      : 'Razılaşma ilə'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${activeSelectedJob.actualLat},${activeSelectedJob.actualLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3 text-blue-600" />
                      <span>Marşrut</span>
                    </a>
                    <button
                      onClick={() => onSelectVacancy(activeSelectedJob)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-2xs"
                    >
                      Bax & Müraciət
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR: COMPACT COLLAPSIBLE VACANCY LIST (Right on desktop, tabbed on mobile) */}
        <div
          className={`lg:col-span-5 xl:col-span-4 space-y-2.5 transition-all ${
            mobileTab === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Header of the list with search & count */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-1.5">
              <ListIcon className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900">
                Yaxınlıqdakı Vakansiyalar ({vacanciesWithDistance.length})
              </span>
            </div>

            <div className="text-[11px] text-slate-500 font-semibold">
              Məsafəyə görə
            </div>
          </div>

          {/* Cards List container */}
          {vacanciesWithDistance.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-lg">
                🗺️
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                Seçilmiş radiusda vakansiya tapılmadı
              </h3>
              <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
                Məsafə radiusunu artırın və ya "🇦🇿 Bütün Azərbaycan" rejimini seçin.
              </p>
              <div className="flex justify-center gap-1.5 pt-1">
                <button
                  onClick={() => setSelectedRadiusKm(0)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
                >
                  Radiusu Aç
                </button>
                <button
                  onClick={() => handleSelectRegion('all')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Bütün Ölkə
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[560px] lg:max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
              {vacanciesWithDistance.map((job) => {
                const isSelected = selectedJobId === job.id;
                const isSaved = savedJobIds.includes(job.id);

                return (
                  <div
                    key={job.id}
                    id={`nearby-job-card-${job.id}`}
                    onClick={() => handleJobCardClick(job)}
                    className={`bg-white rounded-xl p-3 border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm bg-blue-50/20'
                        : 'border-slate-200 hover:border-blue-300 hover:shadow-2xs'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={job.companyLogo}
                          alt={job.companyName}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-100 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute(
                              'src',
                              'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100'
                            );
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-600 transition">
                            {job.title}
                          </h4>
                          <span className="text-[11px] text-slate-500 truncate block">{job.companyName}</span>
                        </div>
                      </div>

                      {/* Bookmark button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(job.id);
                        }}
                        className={`p-1 rounded-lg border transition ${
                          isSaved
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                        }`}
                        title={isSaved ? 'Saxlanılıb' : 'Yadda saxla'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    {/* Proximity Pill Tags */}
                    <div className="flex flex-wrap items-center gap-1 mb-2 text-[10px]">
                      <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold px-1.5 py-0.5 rounded-md">
                        📍 {job.distanceKm} km
                      </span>
                      <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold px-1.5 py-0.5 rounded-md">
                        🏛️ {job.city}
                      </span>
                      {job.metroStation && (
                        <span className="inline-flex items-center gap-0.5 bg-purple-50 text-purple-700 border border-purple-200/60 font-medium px-1.5 py-0.5 rounded-md">
                          🚇 {job.metroStation}
                        </span>
                      )}
                      <span className="text-slate-500">
                        🚗 ~{job.commute.carMin} dəq
                      </span>
                    </div>

                    {/* Salary & Action */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                      <div className="font-black text-blue-600 text-xs">
                        {job.maxSalary
                          ? `₼${job.minSalary} - ₼${job.maxSalary}`
                          : job.minSalary
                          ? `₼${job.minSalary}`
                          : 'Razılaşma ilə'}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectVacancy(job);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Bax</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Animated Section Footer with Job Intelligence & Automation */}
      <JobiaSectionFooter 
        extraTagline="Xəritə üzərindən Bakı və Azərbaycanın bütün regionlarında olan vakansiyaları məsafə və gediş-gəliş vaxtına görə kəşf edin"
        showBackToTop={true}
      />
    </div>
  );
};

export default NearbyJobsMap;
