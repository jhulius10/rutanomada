import { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, MessageCircle, Settings, Globe, X, CheckCircle2, AlertCircle, Info, Crown } from 'lucide-react';
import { useAppStore } from './stores/appStore';
import { cities, coverageLabels } from './data/cities';
import { generateRoutes } from './data/routes';
import MapView from './components/MapView';
import SearchBar from './components/SearchBar';
import RouteCard from './components/RouteCard';
import RouteDetail from './components/RouteDetail';
import NavigationView from './components/NavigationView';
import Assistant from './components/Assistant';
import SplashScreen from './components/SplashScreen';
import SettingsPage from './components/SettingsPage';
import QuickActions from './components/QuickActions';
import Paywall from './components/Paywall';
import HistoryFavorites from './components/HistoryFavorites';
import AuthScreen from './components/AuthScreen';
import AdminPanel from './components/AdminPanel';
import FAQ from './components/FAQ';
import { getThemeForCountry, applyThemeToCSS } from './themes/ThemeEngine';
import { City } from './types';

// Fix Leaflet default icon issue with bundlers
if (typeof window !== 'undefined' && L.Icon && L.Icon.Default) {
  try {
    // @ts-ignore
    if (L.Icon.Default.prototype._getIconUrl) {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
    }
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  } catch (e) {
    console.warn('Leaflet icon fix failed:', e);
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const {
    currentView, setView,
    currentCity, setCurrentCity,
    userLocation, setUserLocation,
    selectedDestination, selectedRoute, setSelectedRoute,
    setRouteOptions,
    showLocationPrompt, setShowLocationPrompt,
    showCitySelector, setShowCitySelector,
    freeQueriesRemaining, decrementQueries,
  } = useAppStore();

  // ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURN
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Apply theme based on current city
  useEffect(() => {
    if (currentCity) {
      const theme = getThemeForCountry(currentCity.countryCode);
      applyThemeToCSS(theme);
    }
  }, [currentCity]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setShowLocationPrompt(false);
        },
        () => {
          // Default to Lima if permission denied
          setUserLocation([-12.0464, -77.0428]);
          setShowLocationPrompt(false);
        },
        { timeout: 5000 }
      );
    } else {
      setUserLocation([-12.0464, -77.0428]);
      setShowLocationPrompt(false);
    }
  }, []);

  // Generate routes when destination is selected
  useEffect(() => {
    if (selectedDestination && currentView === 'results') {
      const routes = generateRoutes(selectedDestination);
      setRouteOptions(routes);
      decrementQueries();
    }
  }, [selectedDestination, currentView]);

  // === NOW CONDITIONAL RENDERS ===

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Navigation view
  if (currentView === 'navigation') {
    return <NavigationView />;
  }

  // Assistant view
  if (currentView === 'assistant') {
    return <Assistant />;
  }

  // Settings view
  if (currentView === 'settings') {
    return <SettingsPage />;
  }

  // Paywall view
  if (currentView === 'paywall') {
    return <Paywall />;
  }

  // History/Favorites view
  if (currentView === 'history') {
    return <HistoryFavorites />;
  }

  // Auth view
  if (currentView === 'auth') {
    return <AuthScreen />;
  }

  // Admin panel view
  if (currentView === 'admin') {
    return <AdminPanel />;
  }

  // FAQ view
  if (currentView === 'faq') {
    return <FAQ />;
  }

  // Route detail view
  if (currentView === 'route-detail' && selectedRoute) {
    return <RouteDetail />;
  }

  // Results view
  if (currentView === 'results' && selectedDestination) {
    return <ResultsView />;
  }

  // Home view
  return (
    <div className="h-full relative">
      {/* Map */}
      <MapView />

      {/* Location permission prompt */}
      {showLocationPrompt && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-center text-slate-800 mb-2">
              ¿Dónde estás ahora?
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              Necesitamos tu ubicación para mostrarte las mejores rutas de transporte público cercanas. Tu ubicación no se comparte con nadie.
            </p>
            <button
              onClick={() => setShowLocationPrompt(false)}
              className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl mb-2 hover:bg-teal-700 transition-colors"
            >
              Usar mi ubicación
            </button>
            <button
              onClick={() => { setShowCitySelector(true); setShowLocationPrompt(false); }}
              className="w-full text-teal-600 font-medium py-2 text-sm"
            >
              Seleccionar ciudad manualmente
            </button>
          </div>
        </div>
      )}

      {/* City selector modal */}
      {showCitySelector && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Selecciona tu ciudad</h3>
              <button onClick={() => setShowCitySelector(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-3">
              {cities.map((city) => (
                <CityItem key={city.id} city={city} onSelect={(c) => { setCurrentCity(c); setShowCitySelector(false); }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4">
        <div className="glass-effect rounded-2xl shadow-lg px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowCitySelector(true)}
              className="flex items-center gap-2 bg-teal-50 px-3 py-1.5 rounded-full"
            >
              <Globe size={14} className="text-teal-600" />
              <span className="text-sm font-medium text-teal-800">
                {currentCity?.name}, {currentCity?.country}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                {freeQueriesRemaining} gratis
              </span>
              <button onClick={() => setView('assistant')} className="p-2 bg-slate-100 rounded-full">
                <MessageCircle size={18} className="text-slate-600" />
              </button>
            </div>
          </div>
          <SearchBar />
        </div>
      </div>

      {/* Coverage indicator */}
      {currentCity && (
        <div className="absolute top-36 left-4 z-20">
          <CoverageBadge city={currentCity} />
        </div>
      )}

      {/* Bottom sheet with quick actions */}
      <div className="absolute bottom-16 left-0 right-0 z-20 max-h-[40vh] overflow-y-auto hide-scrollbar">
        <div className="glass-effect rounded-t-3xl shadow-lg">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>
          <QuickActions onSelectDestination={(dest) => {
            useAppStore.getState().setSelectedDestination(dest);
            useAppStore.getState().addRecentSearch(dest);
            setView('results');
          }} />
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-3 pb-2">
        <div className="glass-effect rounded-2xl shadow-lg px-1 py-1.5 flex items-center justify-around">
          <NavButton icon={<MapPin size={18} />} label="Mapa" active={currentView === 'home'} onClick={() => setView('home')} />
          <NavButton icon={<Navigation size={18} />} label="Rutas" active={false} onClick={() => setView('history')} />
          <NavButton icon={<MessageCircle size={18} />} label="Asistente" active={false} onClick={() => setView('assistant')} />
          <NavButton icon={<Settings size={18} />} label="Ajustes" active={false} onClick={() => setView('settings')} />
        </div>
      </div>
    </div>
  );
}

function CityItem({ city, onSelect }: { city: City; onSelect: (city: City) => void }) {
  const coverage = coverageLabels[city.coverage];
  const flagEmoji: Record<string, string> = {
    PE: '🇵🇪', CO: '🇨🇴', AR: '🇦🇷', CL: '🇨🇱', BR: '🇧🇷',
    EC: '🇪🇨', VE: '🇻🇪', BO: '🇧🇴', UY: '🇺🇾', PY: '🇵🇾'
  };
  return (
    <button
      onClick={() => onSelect(city)}
      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-teal-50 transition-colors text-left"
    >
      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg">
        {flagEmoji[city.countryCode] || '🌍'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800">{city.name}</p>
        <p className={`text-xs ${coverage.color} flex items-center gap-1`}>
          <span>{coverage.emoji}</span> {coverage.label}
        </p>
      </div>
      <div className="text-xs text-slate-400">{city.currencySymbol}</div>
    </button>
  );
}

function CoverageBadge({ city }: { city: City }) {
  const coverage = coverageLabels[city.coverage];
  return (
    <div className="glass-effect rounded-xl px-3 py-2 shadow-md flex items-center gap-2">
      <span className="text-sm">{coverage.emoji}</span>
      <span className={`text-xs font-medium ${coverage.color}`}>{coverage.label}</span>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${
        active ? 'bg-teal-100 text-teal-700' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function ResultsView() {
  const { selectedDestination, routeOptions, selectedRoute, setSelectedRoute, setView, currentCity, freeQueriesRemaining } = useAppStore();

  if (!selectedDestination) return null;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 text-white px-4 pt-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setView('home')} className="p-1">
            <X size={24} />
          </button>
          <div className="flex-1">
            <p className="text-sm opacity-80">Rutas hacia</p>
            <p className="font-bold text-lg flex items-center gap-2">
              <span>{selectedDestination.icon}</span> {selectedDestination.name}
            </p>
          </div>
        </div>

        {/* Destination info */}
        <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
          <Info size={16} className="opacity-80" />
          <p className="text-sm opacity-90">
            {selectedDestination.address} • {currentCity?.name}
          </p>
        </div>
      </div>

      {/* Route options */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-slate-800">Opciones de ruta</p>
          <span className="text-xs text-slate-500">{routeOptions.length} alternativas</span>
        </div>

        {routeOptions.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            isSelected={selectedRoute?.id === route.id}
            onSelect={() => setSelectedRoute(route)}
          />
        ))}

        {/* Data notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Importante sobre los datos</p>
              <p className="text-xs text-amber-700 mt-1">
                Las rutas mostradas se basan en datos de horarios programados y estimaciones. Los tiempos de espera pueden variar.
                Las tarifas del transporte informal pueden cambiar sin aviso.
              </p>
            </div>
          </div>
        </div>

        {/* Premium notice / Paywall */}
        {freeQueriesRemaining === 0 ? (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={18} />
              <p className="font-bold">¡Consultas agotadas!</p>
            </div>
            <p className="text-sm opacity-90 mb-3">
              Has utilizado tus 5 rutas gratuitas de hoy. Sigue explorando con Premium por solo US$1/semana.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setView('paywall')}
                className="bg-white text-amber-700 font-bold px-4 py-2 rounded-lg text-sm flex-1"
              >
                Activar Premium
              </button>
              <button
                onClick={() => setView('home')}
                className="bg-white/20 text-white font-medium px-4 py-2 rounded-lg text-sm"
              >
                Mis rutas
              </button>
            </div>
          </div>
        ) : freeQueriesRemaining <= 2 ? (
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-4 text-white mt-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} />
              <p className="font-bold">RutaNómada Premium</p>
            </div>
            <p className="text-sm opacity-90 mb-3">
              Te quedan {freeQueriesRemaining} consultas gratuitas. Obtén rutas ilimitadas con Premium.
            </p>
            <button
              onClick={() => setView('paywall')}
              className="bg-white text-teal-700 font-bold px-4 py-2 rounded-lg text-sm"
            >
              Activar Premium — US$1/semana
            </button>
          </div>
        ) : null}
      </div>

      {/* Bottom action */}
      {selectedRoute && (
        <div className="p-4 bg-white border-t border-slate-100 animate-slide-up">
          <button
            onClick={() => setView('route-detail')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-200 transition-all active:scale-95"
          >
            Ver detalles de la ruta {selectedRoute.emoji}
          </button>
        </div>
      )}
    </div>
  );
}
