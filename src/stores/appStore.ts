import { create } from 'zustand';
import { AppView, City, RouteOption, SearchResult, ChatMessage } from '../types';
import { cities } from '../data/cities';

interface AppState {
  // View
  currentView: AppView;
  setView: (view: AppView) => void;

  // Location
  userLocation: [number, number] | null;
  currentCity: City | null;
  setUserLocation: (coords: [number, number]) => void;
  setCurrentCity: (city: City) => void;

  // Search
  searchQuery: string;
  searchResults: SearchResult[];
  selectedDestination: SearchResult | null;
  setSearchQuery: (query: string) => void;
  setSelectedDestination: (dest: SearchResult | null) => void;

  // Routes
  routeOptions: RouteOption[];
  selectedRoute: RouteOption | null;
  setRouteOptions: (routes: RouteOption[]) => void;
  setSelectedRoute: (route: RouteOption | null) => void;

  // Navigation
  isNavigating: boolean;
  currentStepIndex: number;
  setIsNavigating: (val: boolean) => void;
  setCurrentStepIndex: (idx: number) => void;

  // Assistant
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;

  // UI
  showLocationPrompt: boolean;
  setShowLocationPrompt: (val: boolean) => void;
  showCitySelector: boolean;
  setShowCitySelector: (val: boolean) => void;
  recentSearches: SearchResult[];
  addRecentSearch: (result: SearchResult) => void;

  // Free queries
  freeQueriesRemaining: number;
  decrementQueries: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  setView: (view) => set({ currentView: view }),

  userLocation: null,
  currentCity: cities[0], // Lima default
  setUserLocation: (coords) => {
    const city = cities.find(c => {
      const dist = Math.sqrt(
        Math.pow(c.center[0] - coords[0], 2) + Math.pow(c.center[1] - coords[1], 2)
      );
      return dist < 0.5;
    });
    set({ userLocation: coords, currentCity: city || cities[0] });
  },
  setCurrentCity: (city) => set({ currentCity: city }),

  searchQuery: '',
  searchResults: [],
  selectedDestination: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedDestination: (dest) => set({ selectedDestination: dest }),

  routeOptions: [],
  selectedRoute: null,
  setRouteOptions: (routes) => set({ routeOptions: routes }),
  setSelectedRoute: (route) => set({ selectedRoute: route }),

  isNavigating: false,
  currentStepIndex: 0,
  setIsNavigating: (val) => set({ isNavigating: val }),
  setCurrentStepIndex: (idx) => set({ currentStepIndex: idx }),

  chatMessages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente de movilidad turística. Puedo ayudarte a encontrar rutas, entender el transporte local, o resolver dudas sobre tu viaje. ¿En qué puedo ayudarte?',
      timestamp: new Date()
    }
  ],
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),

  showLocationPrompt: true,
  setShowLocationPrompt: (val) => set({ showLocationPrompt: val }),
  showCitySelector: false,
  setShowCitySelector: (val) => set({ showCitySelector: val }),
  recentSearches: [],
  addRecentSearch: (result) => set((state) => ({
    recentSearches: [result, ...state.recentSearches.filter(r => r.id !== result.id)].slice(0, 5)
  })),

  freeQueriesRemaining: 5,
  decrementQueries: () => set((state) => ({
    freeQueriesRemaining: Math.max(0, state.freeQueriesRemaining - 1)
  })),
}));
