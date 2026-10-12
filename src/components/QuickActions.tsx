import { Compass, TrendingUp, Star, Clock } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { SearchResult } from '../types';

const popularDestinations: SearchResult[] = [
  { id: 'p1', name: 'Plaza de Armas', address: 'Centro Histórico de Lima', type: 'landmark', coords: [-12.0464, -77.0299], icon: '🏛️' },
  { id: 'p2', name: 'Miraflores Malecón', address: 'Costa Verde, Miraflores', type: 'tourist', coords: [-12.1294, -77.0373], icon: '🌊' },
  { id: 'p3', name: 'Museo Larco', address: 'Pueblo Libre', type: 'tourist', coords: [-12.0789, -77.0756], icon: '🏺' },
  { id: 'p4', name: 'Barranco', address: 'Distrito de Barranco', type: 'tourist', coords: [-12.1433, -77.0218], icon: '🎨' },
  { id: 'p5', name: 'Parque de la Reserva', address: 'Centro de Lima', type: 'tourist', coords: [-12.0607, -77.0328], icon: '⛲' },
  { id: 'p6', name: 'Huaca Pucllana', address: 'Miraflores', type: 'tourist', coords: [-12.1196, -77.0282], icon: '🏺' },
];

interface Props {
  onSelectDestination: (dest: SearchResult) => void;
}

export default function QuickActions({ onSelectDestination }: Props) {
  const { recentSearches, currentCity } = useAppStore();

  return (
    <div className="px-4 py-3 space-y-4">
      {/* Quick access buttons */}
      <div className="grid grid-cols-4 gap-2">
        <QuickButton icon="🗺️" label="Explorar" onClick={() => {}} />
        <QuickButton icon="📍" label="Favoritos" onClick={() => {}} />
        <QuickButton icon="🎫" label="Tarjetas" onClick={() => {}} />
        <QuickButton icon="🆘" label="Emergencia" onClick={() => {}} />
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={14} className="text-slate-400" />
            <p className="text-xs font-semibold text-slate-500 uppercase">Búsquedas recientes</p>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {recentSearches.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectDestination(r)}
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shrink-0 hover:border-teal-300 transition-colors"
              >
                <span>{r.icon}</span>
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{r.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular destinations */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp size={14} className="text-teal-500" />
          <p className="text-xs font-semibold text-slate-500 uppercase">Destinos populares en {currentCity?.name}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {popularDestinations.slice(0, 4).map((dest) => (
            <button
              key={dest.id}
              onClick={() => onSelectDestination(dest)}
              className="bg-white border border-slate-200 rounded-xl p-3 text-left hover:border-teal-300 hover:shadow-sm transition-all active:scale-95"
            >
              <span className="text-2xl mb-1 block">{dest.icon}</span>
              <p className="font-medium text-slate-800 text-sm truncate">{dest.name}</p>
              <p className="text-xs text-slate-400 truncate">{dest.address}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Transport info */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-3 border border-teal-100">
        <div className="flex items-center gap-2 mb-1">
          <Compass size={14} className="text-teal-600" />
          <p className="text-xs font-bold text-teal-800">Transporte disponible en {currentCity?.name}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {currentCity?.providers.map((provider) => (
            <span key={provider} className="bg-white/80 text-teal-700 text-xs px-2 py-1 rounded-full border border-teal-200">
              {provider}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 bg-white border border-slate-200 rounded-xl py-2.5 hover:border-teal-300 transition-colors active:scale-95"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-medium text-slate-600">{label}</span>
    </button>
  );
}
