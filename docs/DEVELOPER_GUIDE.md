# 👨‍💻 Guía para Desarrolladores — RutaNómada

Guía técnica completa para desarrolladores que trabajan en RutaNómada.

---

## Tabla de Contenidos

1. [Arquitectura del Frontend](#1-arquitectura-del-frontend)
2. [Arquitectura del Backend](#2-arquitectura-del-backend)
3. [Patrones de Diseño](#3-patrones-de-diseño)
4. [Convenciones de Código](#4-convenciones-de-código)
5. [Componentes del Frontend](#5-componentes-del-frontend)
6. [Estado Global (Zustand)](#6-estado-global-zustand)
7. [Motor de Rutas](#7-motor-de-rutas)
8. [Sistema de Temas](#8-sistema-de-temas)
9. [Integración con Mapas](#9-integración-con-mapas)
10. [API Client](#10-api-client)
11. [Testing](#11-testing)
12. [Performance](#12-performance)
13. [Debugging](#13-debugging)
14. [Contribuir al Proyecto](#14-contribuir-al-proyecto)

---

## 1. Arquitectura del Frontend

### Estructura de Componentes

```
src/
├── App.tsx                    # Router principal de vistas
├── main.tsx                   # Entry point
├── index.css                  # Estilos globales + Tailwind
├── components/                # Componentes reutilizables
│   ├── MapView.tsx            # Mapa Leaflet
│   ├── SearchBar.tsx          # Buscador con autocomplete
│   ├── RouteCard.tsx          # Tarjeta de ruta
│   ├── RouteDetail.tsx        # Detalle paso a paso
│   ├── NavigationView.tsx     # Navegación GPS activa
│   ├── Assistant.tsx          # Asistente conversacional
│   ├── Paywall.tsx            # Paywall + checkout
│   ├── AdminPanel.tsx         # Panel administrativo
│   ├── AuthScreen.tsx         # Login/registro
│   ├── FAQ.tsx                # Preguntas frecuentes
│   ├── HistoryFavorites.tsx   # Historial y favoritos
│   ├── SettingsPage.tsx       # Configuración
│   ├── SplashScreen.tsx       # Pantalla de carga
│   └── QuickActions.tsx       # Accesos rápidos
├── stores/
│   └── appStore.ts            # Estado global (Zustand)
├── themes/
│   └── ThemeEngine.ts         # Motor de temas por país
├── data/
│   ├── cities.ts              # Catálogo de ciudades
│   └── routes.ts              # Mock de rutas (demo)
└── types/
    └── index.ts               # Tipos TypeScript
```

### Flujo de la Aplicación

```
1. App inicia
2. Muestra SplashScreen (2s)
3. Solicita permisos de geolocalización
4. Carga mapa con Leaflet
5. Muestra vista home con buscador
6. Usuario busca destino
7. Se muestran rutas alternativas
8. Usuario selecciona ruta
9. Se muestra detalle paso a paso
10. Usuario inicia navegación
11. Se muestra vista de navegación activa
```

### Gestión de Vistas

El `App.tsx` funciona como un router simple basado en estado:

```typescript
type AppView = 
  | 'home'           // Vista principal con mapa
  | 'search'         // Búsqueda activa
  | 'results'        // Lista de rutas
  | 'route-detail'   // Detalle de ruta
  | 'navigation'     // Navegación GPS
  | 'assistant'      // Chat con asistente
  | 'settings'       // Configuración
  | 'paywall'        // Paywall premium
  | 'history'        // Historial/favoritos
  | 'auth'           // Login/registro
  | 'admin'          // Panel admin
  | 'faq';           // Ayuda

// Cambio de vista
setView('results');
```

---

## 2. Arquitectura del Backend

### Estructura de Módulos

```
apps/api/src/
├── modules/
│   ├── auth/           # Autenticación
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.schema.ts     # Zod schemas
│   │   └── auth.routes.ts
│   ├── users/          # Gestión de usuarios
│   ├── geo/            # Geolocalización
│   ├── routes/         # Motor de rutas
│   │   ├── routes.controller.ts
│   │   ├── routes.service.ts
│   │   ├── RouteEngine.ts     # Lógica de búsqueda
│   │   └── routes.schema.ts
│   ├── transit/        # Datos de transporte
│   ├── quotas/         # Control de cuotas
│   │   ├── quotas.service.ts
│   │   └── QuotaManager.ts    # Reserva atómica
│   ├── billing/        # Suscripciones
│   └── admin/          # Panel admin
├── providers/
│   ├── MobilityProvider.ts    # Interfaz abstracta
│   ├── GoogleMapsAdapter.ts   # Implementación Google
│   ├── GTFSAdapter.ts         # Implementación GTFS
│   └── PaymentProvider.ts     # Interfaz de pagos
├── middleware/
│   ├── auth.ts                # JWT validation
│   ├── rateLimit.ts           # Rate limiting
│   ├── cors.ts                # CORS config
│   └── errorHandler.ts        # Error handling
├── config/
│   ├── database.ts            # DB connection
│   ├── redis.ts               # Redis client
│   └── env.ts                 # Env validation
└── jobs/
    ├── cleanup.ts             # Limpieza de datos
    ├── backup.ts              # Backups
    └── sync.ts                # Sincronización GTFS
```

### Patrón de Capas

```
Controller → Service → Repository → Database
     ↓           ↓
   Schema    Provider (APIs externas)
```

**Ejemplo de flujo:**

```typescript
// Controller
async function searchRoutes(req, res) {
  const params = searchSchema.parse(req.body);
  const routes = await routeService.search(params);
  return res.send({ success: true, data: routes });
}

// Service
async function search(params: SearchParams) {
  // 1. Verificar cuota
  const hasQuota = await quotaManager.reserve(userId);
  if (!hasQuota) throw new QuotaExceededError();

  // 2. Buscar en caché
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  // 3. Consultar proveedores
  const routes = await routeEngine.search(params);

  // 4. Guardar en caché
  await cache.set(cacheKey, routes, TTL);

  return routes;
}

// Provider
class GoogleMapsAdapter implements MobilityProvider {
  async searchRoutes(origin, destination) {
    const response = await fetch(GOOGLE_ROUTES_API, { ... });
    return this.mapToInternalFormat(response);
  }
}
```

---

## 3. Patrones de Diseño

### Adapter Pattern (Proveedores)

```typescript
// Interfaz abstracta
interface MobilityProvider {
  searchRoutes(origin: Coords, destination: Coords): Promise<Route[]>;
  getStopsNearby(coords: Coords, radius: number): Promise<Stop[]>;
}

// Implementaciones
class GoogleMapsAdapter implements MobilityProvider { ... }
class GTFSAdapter implements MobilityProvider { ... }

// Uso
const providers: MobilityProvider[] = [
  new GTFSAdapter(cityId),      // Prioridad 1 (gratis)
  new GoogleMapsAdapter(cityId) // Prioridad 2 (pagado)
];
```

### Strategy Pattern (Scoring de Rutas)

```typescript
interface ScoringStrategy {
  score(route: Route): number;
}

class CheapestStrategy implements ScoringStrategy {
  score(route: Route) {
    return 1 / route.cost; // Menor costo = mayor score
  }
}

class FastestStrategy implements ScoringStrategy {
  score(route: Route) {
    return 1 / route.duration; // Menor duración = mayor score
  }
}
```

### Factory Pattern (Creación de Rutas)

```typescript
class RouteFactory {
  static createFromGTFS(data: GTFSData): Route { ... }
  static createFromGoogle(data: GoogleData): Route { ... }
  static merge(routes: Route[]): Route[] { ... }
}
```

---

## 4. Convenciones de Código

### TypeScript

```typescript
// ✅ BIEN: Tipos explícitos
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// ❌ MAL: any
const user: any = getUser();

// ✅ BIEN: Enums con const
const UserRole = {
  TOURIST: 'tourist',
  ADMIN: 'admin',
} as const;
type UserRole = typeof UserRole[keyof typeof UserRole];

// ✅ BIEN: Optional chaining
const city = user?.preferences?.city;

// ✅ BIEN: Nullish coalescing
const name = user.name ?? 'Viajero';
```

### Nomenclatura

```typescript
// Componentes: PascalCase
function SearchBar() { ... }

// Funciones: camelCase
function searchRoutes() { ... }

// Constantes: UPPER_SNAKE_CASE
const MAX_QUERIES_PER_DAY = 5;

// Tipos: PascalCase
interface RouteOption { ... }
type AppView = 'home' | 'results';

// Archivos:
// - Componentes: PascalCase.tsx (SearchBar.tsx)
// - Utils: camelCase.ts (formatCurrency.ts)
// - Types: camelCase.ts (types.ts)
```

### Imports

```typescript
// Orden de imports:
// 1. React y librerías externas
import { useState, useEffect } from 'react';
import L from 'leaflet';

// 2. Componentes internos
import SearchBar from './components/SearchBar';

// 3. Stores y servicios
import { useAppStore } from './stores/appStore';

// 4. Tipos
import { RouteOption } from './types';

// 5. Utils y constantes
import { formatCurrency } from './utils/format';
```

### CSS (Tailwind)

```tsx
// ✅ BIEN: Clases de Tailwind
<button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl">
  Click me
</button>

// ✅ BIEN: Clases condicionales
<button className={`px-4 py-2 ${isActive ? 'bg-teal-600' : 'bg-slate-200'}`}>
  Toggle
</button>

// ❌ MAL: CSS inline
<button style={{ backgroundColor: 'teal', padding: '12px' }}>
  Click me
</button>
```

---

## 5. Componentes del Frontend

### MapView

```typescript
// src/components/MapView.tsx

// Props (implícitas via Zustand)
// - userLocation: [number, number] | null
// - currentCity: City
// - selectedDestination: SearchResult | null
// - selectedRoute: RouteOption | null

// Responsabilidades:
// - Inicializar mapa Leaflet
// - Mostrar marcadores de usuario
// - Mostrar marcador de destino
// - Dibujar polyline de ruta
// - Mostrar paraderos turísticos
// - Ajustar zoom y bounds

// Uso de refs para evitar re-renders
const mapRef = useRef<L.Map | null>(null);
const markersRef = useRef<L.Marker[]>([]);
```

### SearchBar

```typescript
// src/components/SearchBar.tsx

// Estados locales:
const [isFocused, setIsFocused] = useState(false);

// Estados globales (Zustand):
const { searchQuery, setSearchQuery, setSelectedDestination } = useAppStore();

// Filtrado de resultados
const filteredResults = searchQuery.length > 0
  ? mockSearchResults.filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : [];
```

### RouteCard

```typescript
// src/components/RouteCard.tsx

// Props
interface Props {
  route: RouteOption;
  onSelect: () => void;
  isSelected?: boolean;
}

// Muestra:
// - Emoji y tipo de ruta
// - Costo total
// - Duración, caminata, transbordos
// - Líneas de transporte (badges de color)
// - Calidad de datos (real-time, scheduled, etc.)
// - Nivel de confianza (%)
```

---

## 6. Estado Global (Zustand)

### Estructura del Store

```typescript
// src/stores/appStore.ts

interface AppState {
  // Vista actual
  currentView: AppView;
  setView: (view: AppView) => void;

  // Ubicación
  userLocation: [number, number] | null;
  currentCity: City | null;
  setUserLocation: (coords: [number, number]) => void;
  setCurrentCity: (city: City) => void;

  // Búsqueda
  searchQuery: string;
  selectedDestination: SearchResult | null;
  setSearchQuery: (query: string) => void;
  setSelectedDestination: (dest: SearchResult | null) => void;

  // Rutas
  routeOptions: RouteOption[];
  selectedRoute: RouteOption | null;
  setRouteOptions: (routes: RouteOption[]) => void;
  setSelectedRoute: (route: RouteOption | null) => void;

  // Navegación
  isNavigating: boolean;
  currentStepIndex: number;
  setIsNavigating: (val: boolean) => void;
  setCurrentStepIndex: (idx: number) => void;

  // Asistente
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;

  // UI
  showLocationPrompt: boolean;
  showCitySelector: boolean;
  recentSearches: SearchResult[];

  // Cuotas
  freeQueriesRemaining: number;
  decrementQueries: () => void;
}
```

### Uso en Componentes

```typescript
// Selector específico (re-renders solo cuando cambia)
const currentCity = useAppStore(state => state.currentCity);

// Múltiples selectores
const { currentView, setView } = useAppStore();

// Acceso fuera de React
const city = useAppStore.getState().currentCity;
```

### Persistencia (opcional)

```typescript
// Con middleware de persistencia
import { persist } from 'zustand/middleware';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ... estado
    }),
    {
      name: 'rutanomada-storage',
      partialize: (state) => ({
        // Solo persistir estos campos
        recentSearches: state.recentSearches,
        currentCity: state.currentCity,
      }),
    }
  )
);
```

---

## 7. Motor de Rutas

### Flujo de Búsqueda

```typescript
// apps/api/src/modules/routes/RouteEngine.ts

async function search(params: SearchParams): Promise<RouteAlternative[]> {
  // 1. Identificar ciudad
  const city = await identifyCity(params.origin);

  // 2. Verificar cobertura
  if (city.coverage === 'none') {
    throw new NoCoverageError(city.name);
  }

  // 3. Buscar en caché
  const cacheKey = generateCacheKey(params);
  const cached = await cache.get(cacheKey);
  if (cached) {
    await cache.incrementHits(cacheKey);
    return cached;
  }

  // 4. Consultar proveedores (en orden de prioridad)
  const providers = await getProvidersForCity(city.id);
  const allRoutes: Route[] = [];

  for (const provider of providers) {
    try {
      const routes = await provider.searchRoutes(params.origin, params.destination);
      allRoutes.push(...routes);
    } catch (error) {
      logger.error('Provider failed', { provider: provider.name, error });
      // Continuar con siguiente proveedor
    }
  }

  // 5. Aplicar scoring y ordenar
  const scored = allRoutes.map(route => ({
    ...route,
    score: calculateScore(route, params.preferences),
  }));

  const sorted = scored.sort((a, b) => b.score - a.score);

  // 6. Guardar en caché
  await cache.set(cacheKey, sorted, ROUTE_CACHE_TTL);

  return sorted;
}
```

### Scoring

```typescript
function calculateScore(route: Route, preferences?: Preferences): number {
  const weights = {
    cost: 0.35,
    duration: 0.30,
    walking: 0.20,
    transfers: 0.15,
  };

  // Normalizar valores (0-1, menor es mejor)
  const normalized = {
    cost: normalize(route.cost, 0, 20),
    duration: normalize(route.duration, 0, 120),
    walking: normalize(route.walkingDistance, 0, 2000),
    transfers: normalize(route.transfers, 0, 5),
  };

  // Calcular score (0-100, mayor es mejor)
  const score = (
    weights.cost * (1 - normalized.cost) +
    weights.duration * (1 - normalized.duration) +
    weights.walking * (1 - normalized.walking) +
    weights.transfers * (1 - normalized.transfers)
  ) * 100;

  return score;
}
```

---

## 8. Sistema de Temas

### ThemeEngine

```typescript
// src/themes/ThemeEngine.ts

export interface CountryTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  neonGlow: string;
  gradient: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
}

// Paletas por país
export const countryThemes: Record<string, CountryTheme> = {
  PE: { primary: '#ff1744', neonGlow: '0 0 20px rgba(255,23,68,0.5)', ... },
  AR: { primary: '#00e5ff', neonGlow: '0 0 20px rgba(0,229,255,0.5)', ... },
  CO: { primary: '#ffd600', neonGlow: '0 0 20px rgba(255,214,0,0.5)', ... },
  // ... 10 países
};

// Aplicar tema dinámicamente
export function applyThemeToCSS(theme: CountryTheme) {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-neon-glow', theme.neonGlow);
  // ... otras variables
}
```

### Uso en Componentes

```typescript
// En App.tsx
useEffect(() => {
  if (currentCity) {
    const theme = getThemeForCountry(currentCity.countryCode);
    applyThemeToCSS(theme);
  }
}, [currentCity]);

// En CSS
.neon-button {
  background: var(--theme-primary);
  box-shadow: var(--theme-neon-glow);
}
```

---

## 9. Integración con Mapas

### Leaflet Setup

```typescript
// src/components/MapView.tsx

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Inicializar mapa
useEffect(() => {
  const map = L.map(containerRef.current, {
    center: currentCity.center,
    zoom: currentCity.zoom,
    zoomControl: false,
  });

  // Tile layer (CartoDB Positron - limpio y legible)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(map);

  mapRef.current = map;

  return () => {
    map.remove();
    mapRef.current = null;
  };
}, []);
```

### Marcadores Personalizados

```typescript
// Marcador de usuario
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Marcador de destino
const destIcon = L.divIcon({
  className: 'custom-dest-marker',
  html: `<div style="...">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
```

### Polylines de Ruta

```typescript
// Dibujar ruta
const polyline = L.polyline(routeCoords, {
  color: '#0f766e',
  weight: 5,
  opacity: 0.8,
}).addTo(map);

// Ajustar vista
map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
```

---

## 10. API Client

### Configuración

```typescript
// src/services/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message, response.status);
    }

    return response.json();
  }

  // Métodos específicos
  async searchRoutes(params: SearchParams): Promise<RouteOption[]> {
    return this.request('/routes/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getUsage(): Promise<{ remaining: number }> {
    return this.request('/usage/today');
  }
}

export const api = new ApiClient();
```

### Manejo de Errores

```typescript
class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// Uso
try {
  const routes = await api.searchRoutes(params);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      // Rate limit exceeded
      showRateLimitMessage();
    } else if (error.status === 402) {
      // Quota exceeded
      setView('paywall');
    } else {
      showError(error.message);
    }
  }
}
```

---

## 11. Testing

### Unit Tests (Vitest)

```typescript
// tests/unit/scoring.test.ts

import { describe, it, expect } from 'vitest';
import { calculateScore } from '../RouteEngine';

describe('calculateScore', () => {
  it('debe dar mayor score a rutas más baratas', () => {
    const cheapRoute = { cost: 2, duration: 30, walking: 200, transfers: 0 };
    const expensiveRoute = { cost: 10, duration: 30, walking: 200, transfers: 0 };

    const cheapScore = calculateScore(cheapRoute);
    const expensiveScore = calculateScore(expensiveRoute);

    expect(cheapScore).toBeGreaterThan(expensiveScore);
  });

  it('debe penalizar transbordos', () => {
    const noTransfers = { cost: 5, duration: 30, walking: 200, transfers: 0 };
    const withTransfers = { cost: 5, duration: 30, walking: 200, transfers: 3 };

    expect(calculateScore(noTransfers)).toBeGreaterThan(calculateScore(withTransfers));
  });
});
```

### Integration Tests

```typescript
// tests/integration/routes.test.ts

import { describe, it, expect, beforeAll } from 'vitest';
import { createTestServer } from '../helpers';

describe('POST /api/v1/routes/search', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestServer();
  });

  it('debe retornar rutas válidas', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/routes/search',
      payload: {
        origin: [-12.0464, -77.0428],
        destination: [-12.0464, -77.0299],
        cityId: 'lima-uuid',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data).toHaveLength(4);
    expect(body.data[0]).toHaveProperty('totalCost');
    expect(body.data[0]).toHaveProperty('duration');
  });

  it('debe bloquear cuando se excede la cuota', async () => {
    // Simular 5 consultas previas
    for (let i = 0; i < 5; i++) {
      await app.inject({ method: 'POST', url: '/api/v1/routes/search', ... });
    }

    // La 6ª debe fallar
    const response = await app.inject({ method: 'POST', url: '/api/v1/routes/search', ... });
    expect(response.statusCode).toBe(402);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/search.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Búsqueda de rutas', () => {
  test('debe mostrar rutas al buscar un destino', async ({ page }) => {
    await page.goto('/');
    
    // Esperar splash screen
    await page.waitForSelector('[data-testid="main-view"]');

    // Buscar destino
    await page.fill('[data-testid="search-input"]', 'Plaza de Armas');
    await page.click('[data-testid="search-result"]:first-child');

    // Verificar que se muestran rutas
    await expect(page.locator('[data-testid="route-card"]')).toHaveCount(4);
    
    // Verificar que la primera ruta tiene costo
    const firstRoute = page.locator('[data-testid="route-card"]:first-child');
    await expect(firstRoute).toContainText('S/');
  });
});
```

---

## 12. Performance

### Optimizaciones Frontend

```typescript
// 1. Lazy loading de componentes
const AdminPanel = lazy(() => import('./components/AdminPanel'));

// 2. Memoización de componentes
const RouteCard = memo(function RouteCard({ route }: Props) {
  // ...
});

// 3. Virtualización de listas largas
import { VirtualList } from 'react-window';

// 4. Debounce de búsquedas
const debouncedSearch = useMemo(
  () => debounce(search, 300),
  []
);

// 5. Code splitting por ruta
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          maps: ['leaflet'],
        },
      },
    },
  },
});
```

### Optimizaciones Backend

```typescript
// 1. Caché de rutas
const ROUTE_CACHE_TTL = 15 * 60; // 15 minutos

// 2. Conexión pooling
const pool = new Pool({
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
});

// 3. Queries optimizadas con índices
CREATE INDEX idx_stops_location ON transport_stops USING GIST (location);

// 4. Paginación
SELECT * FROM route_queries
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

// 5. Compresión de respuestas
app.register(compress, {
  encodings: ['gzip', 'deflate'],
});
```

---

## 13. Debugging

### Frontend

```typescript
// React DevTools
// Instalar extensión del navegador

// Log de estados
useEffect(() => {
  console.log('State changed:', { currentView, currentCity });
}, [currentView, currentCity]);

// Performance profiling
import { Profiler } from 'react';

<Profiler id="MapView" onRender={onRenderCallback}>
  <MapView />
</Profiler>
```

### Backend

```typescript
// Logs estructurados
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty' }
    : undefined,
});

logger.info({ userId, cityId }, 'Route search initiated');
logger.error({ error, stack }, 'Provider failed');

// Debug de queries SQL
if (process.env.DEBUG === 'true') {
  db.on('query', (query) => {
    console.log('SQL:', query.sql);
    console.log('Params:', query.bindings);
  });
}
```

### Base de Datos

```sql
-- Queries lentas
SELECT * FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start;

-- Tamaño de tablas
SELECT
  relname AS table,
  pg_size_pretty(pg_total_relation_size(relid)) AS size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Índices no usados
SELECT
  schemaname,
  relname,
  indexrelname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

---

## 14. Contribuir al Proyecto

### Flujo de Trabajo

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-org/rutanomada.git
cd rutanomada

# 2. Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# 3. Desarrollar
# ... hacer cambios ...

# 4. Ejecutar tests
pnpm test
pnpm lint

# 5. Commit con mensaje convencional
git commit -m "feat: agregar búsqueda por voz"

# 6. Push y crear PR
git push origin feature/nueva-funcionalidad
# Crear Pull Request en GitHub
```

### Convenciones de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, punto y coma, etc.
refactor: refactorización de código
test: agregar o corregir tests
chore: tareas de mantenimiento
perf: mejoras de performance
```

### Pull Requests

- [ ] Código sigue las convenciones del proyecto
- [ ] Tests pasan localmente
- [ ] No hay conflictos con `main`
- [ ] Documentación actualizada (si aplica)
- [ ] PR describe claramente los cambios
- [ ] Screenshots/videos si hay cambios de UI

### Code Review

- Ser respetuoso y constructivo
- Explicar el "por qué" de las sugerencias
- Aprobar solo si está listo para producción
- Hacer preguntas si no entiendes algo

---

## Recursos Útiles

### Documentación

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Leaflet](https://leafletjs.com/reference.html)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Fastify](https://www.fastify.io/docs/latest/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [PostGIS](https://postgis.net/documentation/)

### Herramientas

- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Postman](https://www.postman.com/) - Testing de APIs
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio) - DB Explorer
- [Sentry](https://sentry.io/) - Error tracking

---

*¿Preguntas? Abre un issue en GitHub o contacta al equipo en Slack.*
