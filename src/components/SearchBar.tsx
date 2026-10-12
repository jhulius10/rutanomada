import { useState } from 'react';
import { Search, X, MapPin, Clock, Star } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { mockSearchResults } from '../data/routes';
import { SearchResult } from '../types';

export default function SearchBar() {
  const { searchQuery, setSearchQuery, setSelectedDestination, setView, recentSearches, addRecentSearch } = useAppStore();
  const [isFocused, setIsFocused] = useState(false);

  const filteredResults = searchQuery.length > 0
    ? mockSearchResults.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelect = (result: SearchResult) => {
    setSelectedDestination(result);
    addRecentSearch(result);
    setSearchQuery('');
    setView('results');
  };

  return (
    <div className="relative">
      <div className="flex items-center bg-white rounded-2xl shadow-lg border border-slate-200 px-4 py-3 gap-3">
        <Search size={20} className="text-teal-600 shrink-0" />
        <input
          type="text"
          placeholder="¿A dónde quieres ir hoy?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-base"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}>
            <X size={18} className="text-slate-400" />
          </button>
        )}
      </div>

      {(isFocused || searchQuery.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-slide-up">
          {filteredResults.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {filteredResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-teal-50 transition-colors text-left border-b border-slate-50 last:border-0"
                >
                  <span className="text-xl">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{result.name}</p>
                    <p className="text-sm text-slate-500 truncate">{result.address}</p>
                  </div>
                  <MapPin size={16} className="text-teal-500 shrink-0" />
                </button>
              ))}
            </div>
          ) : searchQuery.length > 0 ? (
            <div className="p-4 text-center text-slate-500">
              <p>No se encontraron resultados</p>
              <p className="text-sm mt-1">Intenta con otro nombre o dirección</p>
            </div>
          ) : (
            <div className="p-3">
              {recentSearches.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase px-2 mb-2 flex items-center gap-1">
                    <Clock size={12} /> Recientes
                  </p>
                  {recentSearches.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r)}
                      className="flex items-center gap-3 w-full px-3 py-2 hover:bg-teal-50 rounded-lg transition-colors text-left"
                    >
                      <span className="text-lg">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700 text-sm truncate">{r.name}</p>
                        <p className="text-xs text-slate-400 truncate">{r.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase px-2 mb-2 flex items-center gap-1">
                  <Star size={12} /> Sugerencias turísticas
                </p>
                {mockSearchResults.filter(r => r.type === 'tourist').slice(0, 4).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r)}
                    className="flex items-center gap-3 w-full px-3 py-2 hover:bg-teal-50 rounded-lg transition-colors text-left"
                  >
                    <span className="text-lg">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 text-sm truncate">{r.name}</p>
                      <p className="text-xs text-slate-400 truncate">{r.address}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
