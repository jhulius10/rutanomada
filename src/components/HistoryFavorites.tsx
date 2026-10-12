import { useState } from 'react';
import { ArrowLeft, Clock, Star, Trash2, MapPin, Navigation, Calendar, Search } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { SearchResult } from '../types';

type Tab = 'history' | 'favorites';

export default function HistoryFavorites() {
  const { setView } = useAppStore();
  const [tab, setTab] = useState<Tab>('history');

  // Mock data for history
  const history = [
    { id: 'h1', destination: 'Plaza de Armas', date: 'Hoy, 14:30', cost: 'S/ 2.50', duration: '35 min', icon: '🏛️' },
    { id: 'h2', destination: 'Museo Larco', date: 'Hoy, 10:15', cost: 'S/ 3.50', duration: '22 min', icon: '🏺' },
    { id: 'h3', destination: 'Miraflores Malecón', date: 'Ayer, 18:00', cost: 'S/ 2.50', duration: '40 min', icon: '🌊' },
    { id: 'h4', destination: 'Aeropuerto Jorge Chávez', date: 'Ayer, 06:30', cost: 'S/ 5.00', duration: '55 min', icon: '✈️' },
    { id: 'h5', destination: 'Parque Kennedy', date: '12 Oct, 15:20', cost: 'S/ 2.50', duration: '30 min', icon: '🌳' },
  ];

  const favorites: SearchResult[] = [
    { id: 'f1', name: 'Hotel Sheraton', address: 'Centro de Lima', type: 'hotel', coords: [-12.0514, -77.0296], icon: '🏨' },
    { id: 'f2', name: 'Casa de mi amigo', address: 'Miraflores', type: 'address', coords: [-12.1215, -77.0285], icon: '🏠' },
    { id: 'f3', name: 'Restaurante Central', address: 'Centro de Lima', type: 'restaurant', coords: [-12.0464, -77.0299], icon: '🍽️' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-white/10">
        <button onClick={() => setView('home')} className="p-2 text-white/70">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Historial y Favoritos</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setTab('history')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            tab === 'history' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50'
          }`}
        >
          <Clock size={16} /> Historial
        </button>
        <button
          onClick={() => setTab('favorites')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            tab === 'favorites' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50'
          }`}
        >
          <Star size={16} /> Favoritos
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'history' ? (
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{item.destination}</p>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Calendar size={10} />
                    <span>{item.date}</span>
                    <span>•</span>
                    <Navigation size={10} />
                    <span>{item.duration}</span>
                    <span>•</span>
                    <span className="text-amber-400">{item.cost}</span>
                  </div>
                </div>
                <button className="p-2 text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((fav) => (
              <div key={fav.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <span className="text-2xl">{fav.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{fav.name}</p>
                  <p className="text-xs text-white/50 truncate flex items-center gap-1">
                    <MapPin size={10} /> {fav.address}
                  </p>
                </div>
                <button className="p-2 text-amber-400">
                  <Star size={16} fill="currentColor" />
                </button>
              </div>
            ))}

            <button className="w-full mt-4 py-3 border border-dashed border-white/20 rounded-xl text-white/40 text-sm flex items-center justify-center gap-2 hover:border-amber-400/50 hover:text-amber-400 transition-colors">
              <Star size={16} /> Agregar nuevo favorito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
