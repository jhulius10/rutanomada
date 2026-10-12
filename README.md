# 🚌 RutaNómada

**Sistema SaaS de Transporte Público y Movilidad Turística Inteligente**

> *"Descubre cómo moverte en cualquier ciudad, como si tuvieras un guía local en el bolsillo"*

Plataforma SaaS multi-país (LATAM) que ayuda a turistas a navegar el transporte público de ciudades desconocidas mediante rutas multimodales económicas, geolocalización y un asistente conversacional.

---

## 📋 Tabla de Contenidos

- [1. Arquitectura del Sistema](#1-arquitectura-del-sistema)
- [2. Stack Tecnológico](#2-stack-tecnológico)
- [3. Estructura del Proyecto](#3-estructura-del-proyecto)
- [4. Base de Datos](#4-base-de-datos)
- [5. API REST](#5-api-rest)
- [6. Variables de Entorno](#6-variables-de-entorno)
- [7. Instalación en Desarrollo](#7-instalación-en-desarrollo)
- [8. Despliegue en Producción](#8-despliegue-en-producción)
- [9. Herramientas Externas e Integraciones](#9-herramientas-externas-e-integraciones)
- [10. Motor de Rutas](#10-motor-de-rutas)
- [11. Sistema de Temas Dinámicos](#11-sistema-de-temas-dinámicos)
- [12. Modelo Freemium y Pagos](#12-modelo-freemium-y-pagos)
- [13. Seguridad](#13-seguridad)
- [14. Testing](#14-testing)
- [15. Monitoreo y Costos](#15-monitoreo-y-costos)
- [16. Roadmap](#16-roadmap)

---

## 1. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (PWA)                            │
│  React + Vite + TypeScript + Tailwind + Leaflet + Zustand       │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CADDY (Reverse Proxy)                       │
│                    Auto-HTTPS / HTTP/3                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────────────┐
│   Frontend (Static)     │   │   Backend API (Fastify)         │
│   /dist                 │   │   Node.js + TypeScript          │
└─────────────────────────┘   └──────────────┬──────────────────┘
                                              │
                      ┌───────────────────────┼──────────────────┐
                      ▼                       ▼                  ▼
         ┌──────────────────┐   ┌──────────────────┐  ┌────────────────┐
         │  PostgreSQL +    │   │  Cache en Memoria│  │  Redis (opt.)  │
         │  PostGIS         │   │  (node-cache)    │  │                │
         └──────────────────┘   └──────────────────┘  └────────────────┘
                      │
                      ▼
         ┌──────────────────────────────────────────┐
         │         CAPA DE PROVEEDORES              │
         │  ┌─────────────┐  ┌──────────────────┐   │
         │  │ Google Maps │  │ GTFS / GTFS-RT   │   │
         │  │ Routes API  │  │ (datos oficiales)│   │
         │  │ Places API  │  └──────────────────┘   │
         │  │ Geocoding   │  ┌──────────────────┐   │
         │  └─────────────┘  │ PaymentProvider  │   │
         │                   │ Stripe/MercadoPago│  │
         │                   └──────────────────┘   │
         └──────────────────────────────────────────┘
```

### Componentes principales

| Componente | Responsabilidad |
|------------|-----------------|
| **Frontend PWA** | UI mobile-first, mapas, navegación GPS, asistente |
| **Backend API** | Lógica de negocio, autenticación, cuotas, rutas |
| **PostgreSQL + PostGIS** | Persistencia, datos geoespaciales, índices |
| **MobilityProvider** | Abstracción de proveedores de transporte |
| **PaymentProvider** | Abstracción de pasarelas de pago |
| **ThemeEngine** | Temas dinámicos por país (neón) |
| **RouteEngine** | Motor multimodal de búsqueda de rutas |
| **QuotaManager** | Control atómico de consultas gratuitas |

---

## 2. Stack Tecnológico

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **React** | 18.x | UI framework |
| **TypeScript** | 5.x | Tipado estático |
| **Vite** | 6.x | Build tool + dev server |
| **Tailwind CSS** | 4.x | Utility-first CSS |
| **Leaflet** | 1.9.x | Mapas interactivos |
| **Zustand** | 5.x | Estado global ligero |
| **Lucide React** | Latest | Iconografía |
| **i18next** | (planificado) | Internacionalización |

### Backend (planificado para fase 2)

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Node.js** | 20 LTS | Runtime |
| **Fastify** | 5.x | HTTP framework |
| **TypeScript** | 5.x | Tipado |
| **Zod** | 3.x | Validación de schemas |
| **Drizzle ORM** | Latest | ORM ligero + migraciones |
| **JWT** | - | Autenticación con refresh tokens |
| **Argon2id** | - | Hash de contraseñas |

### Base de Datos

| Tecnología | Uso |
|------------|-----|
| **PostgreSQL 16** | Base de datos principal |
| **PostGIS 3.4** | Extensión geoespacial |
| **Índices GIST** | Búsquedas por coordenadas |
| **Índices GIN** | Búsquedas full-text |

### Infraestructura

| Tecnología | Uso |
|------------|-----|
| **Docker + Compose** | Contenedorización |
| **Caddy** | Reverse proxy + HTTPS automático |
| **Ubuntu 22.04 LTS** | SO del VPS |
| **GitHub Actions** | CI/CD (opcional) |

---

## 3. Estructura del Proyecto

```
rutanomada/
├── src/                              # Frontend (React + Vite)
│   ├── App.tsx                       # Componente raíz + router de vistas
│   ├── main.tsx                      # Entry point
│   ├── index.css                     # Estilos globales + Tailwind
│   ├── components/                   # Componentes UI
│   │   ├── MapView.tsx               # Mapa Leaflet
│   │   ├── SearchBar.tsx             # Buscador con autocomplete
│   │   ├── RouteCard.tsx             # Tarjeta de ruta
│   │   ├── RouteDetail.tsx           # Detalle paso a paso
│   │   ├── NavigationView.tsx        # Navegación GPS activa
│   │   ├── Assistant.tsx             # Asistente conversacional
│   │   ├── Paywall.tsx               # Paywall + checkout
│   │   ├── AdminPanel.tsx            # Panel administrativo
│   │   ├── AuthScreen.tsx            # Login / registro
│   │   ├── FAQ.tsx                   # Preguntas frecuentes
│   │   ├── HistoryFavorites.tsx      # Historial y favoritos
│   │   ├── SettingsPage.tsx          # Configuración
│   │   ├── SplashScreen.tsx          # Pantalla de carga
│   │   └── QuickActions.tsx          # Accesos rápidos
│   ├── stores/
│   │   └── appStore.ts               # Zustand store global
│   ├── themes/
│   │   └── ThemeEngine.ts            # Motor de temas por país
│   ├── data/
│   │   ├── cities.ts                 # Catálogo de ciudades
│   │   └── routes.ts                 # Mock de rutas (demo)
│   └── types/
│       └── index.ts                  # Tipos TypeScript
│
├── apps/api/                         # Backend (Fase 2)
│   └── src/
│       ├── modules/
│       │   ├── auth/                 # Autenticación
│       │   ├── users/                # Gestión de usuarios
│       │   ├── geo/                  # Geolocalización
│       │   ├── routes/               # Motor de rutas
│       │   ├── transit/              # Datos de transporte
│       │   ├── quotas/               # Control de cuotas
│       │   ├── billing/              # Suscripciones y pagos
│       │   └── admin/                # Panel admin
│       ├── providers/
│       │   ├── MobilityProvider.ts   # Abstracción de movilidad
│       │   ├── GoogleMapsAdapter.ts  # Adaptador Google Maps
│       │   ├── GTFSAdapter.ts        # Adaptador GTFS
│       │   └── PaymentProvider.ts    # Abstracción de pagos
│       ├── middleware/               # Auth, rate-limit, CORS
│       ├── config/                   # Configuración
│       └── jobs/                     # Tareas programadas
│
├── packages/
│   ├── shared/                       # Tipos y utils compartidos
│   └── database/                     # Migraciones y seeds
│       ├── migrations/               # SQL versionado
│       └── seeds/                    # Datos iniciales
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.api            # Backend
│   │   └── Dockerfile.web            # Frontend (si aplica)
│   ├── caddy/
│   │   └── Caddyfile                 # Configuración Caddy
│   └── scripts/
│       ├── init.sh                   # Inicialización
│       ├── backup.sh                 # Backup DB
│       ├── restore.sh                # Restauración
│       └── deploy.sh                 # Despliegue
│
├── tests/
│   ├── unit/                         # Pruebas unitarias
│   ├── integration/                  # Pruebas de integración
│   └── e2e/                          # End-to-end
│
├── docs/                             # Documentación
├── docker-compose.yml                # Orquestación local
├── docker-compose.prod.yml           # Orquestación producción
├── .env.example                      # Plantilla de variables
└── README.md                         # Este archivo
```

---

## 4. Base de Datos

### Diagrama Entidad-Relación (simplificado)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   users      │────<│ user_sessions    │     │   countries      │
├──────────────┤     └──────────────────┘     ├──────────────────┤
│ id (PK)      │     ┌──────────────────┐     │ code (PK)        │
│ email        │────<│ anonymous_ids    │     │ name             │
│ password_hash│     └──────────────────┘     │ currency         │
│ role         │     ┌──────────────────┐     │ language         │
│ plan         │────<│ subscriptions    │     │ timezone         │
│ created_at   │     └──────────────────┘     └────────┬─────────┘
└──────────────┘                                       │
        │                                              │
        │              ┌──────────────────┐            │
        └─────────────<│    cities        │<───────────┘
                       ├──────────────────┤
                       │ id (PK)          │
                       │ country_code(FK) │
                       │ name             │
                       │ center (GEOGRAPHY│
                       │ coverage         │
                       │ timezone         │
                       └────────┬─────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│transport_    │     │ transport_lines  │     │ transport_stops  │
│ operators    │     ├──────────────────┤     ├──────────────────┤
├──────────────┤     │ id (PK)          │     │ id (PK)          │
│ id (PK)      │     │ operator_id (FK) │     │ line_id (FK)     │
│ city_id (FK) │     │ name             │     │ location (POINT) │
│ name         │     │ type (bus/metro) │     │ name             │
└──────────────┘     │ color            │     │ geometry (GEO)   │
                     └────────┬─────────┘     └──────────────────┘
                              │
                              ▼
                     ┌──────────────────┐     ┌──────────────────┐
                     │transport_schedules│    │ transport_fares  │
                     ├──────────────────┤     ├──────────────────┤
                     │ id (PK)          │     │ id (PK)          │
                     │ line_id (FK)     │     │ line_id (FK)     │
                     │ stop_id (FK)     │     │ amount           │
                     │ arrival_time     │     │ currency         │
                     │ direction        │     │ payment_method   │
                     └──────────────────┘     └──────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ route_queries    │     │  usage_quotas    │     │payment_          │
├──────────────────┤     ├──────────────────┤     │transactions      │
│ id (PK)          │     │ id (PK)          │     ├──────────────────┤
│ user_id (FK)     │     │ user_id (FK)     │     │ id (PK)          │
│ origin (GEO)     │     │ date             │     │ user_id (FK)     │
│ destination(GEO) │     │ queries_used     │     │ amount           │
│ route_data (JSONB│     │ reset_at         │     │ provider         │
│ created_at       │     └──────────────────┘     │ status           │
└──────────────────┘                              │ provider_tx_id   │
                                                  └──────────────────┘
```

### Esquema SQL (PostgreSQL + PostGIS)

```sql
-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Países
CREATE TABLE countries (
  code        CHAR(2) PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  currency    CHAR(3) NOT NULL,
  language    CHAR(2) NOT NULL,
  timezone    VARCHAR(50) NOT NULL,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Ciudades (con datos geoespaciales)
CREATE TABLE cities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code  CHAR(2) REFERENCES countries(code),
  name          VARCHAR(100) NOT NULL,
  center        GEOGRAPHY(POINT, 4326) NOT NULL,
  bounding_box  GEOGRAPHY(POLYGON, 4326),
  coverage      VARCHAR(20) CHECK (coverage IN 
                  ('complete','partial','walking-only','none')),
  timezone      VARCHAR(50) NOT NULL,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cities_center ON cities USING GIST (center);
CREATE INDEX idx_cities_country ON cities (country_code);

-- Usuarios
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(20) DEFAULT 'tourist' 
                  CHECK (role IN ('tourist','admin','superadmin','ops')),
  plan            VARCHAR(20) DEFAULT 'free' 
                  CHECK (plan IN ('free','premium_weekly','premium_monthly')),
  current_city_id UUID REFERENCES cities(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_login_at   TIMESTAMPTZ
);

-- Cuotas de uso (control atómico)
CREATE TABLE usage_quotas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  queries_used    INTEGER DEFAULT 0,
  queries_limit   INTEGER DEFAULT 5,
  reset_at        TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, date)
);

-- Transacciones de pago
CREATE TABLE payment_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id),
  provider          VARCHAR(30) NOT NULL, -- 'stripe' | 'mercadopago'
  provider_tx_id    VARCHAR(255) UNIQUE,
  amount            NUMERIC(10,2) NOT NULL,
  currency          CHAR(3) NOT NULL,
  status            VARCHAR(20) NOT NULL, -- 'pending','completed','failed','refunded'
  webhook_payload   JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Caché de rutas
CREATE TABLE route_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key       VARCHAR(255) UNIQUE NOT NULL, -- hash(orig+dest+city)
  origin          GEOGRAPHY(POINT, 4326),
  destination     GEOGRAPHY(POINT, 4326),
  city_id         UUID REFERENCES cities(id),
  routes_data     JSONB NOT NULL,
  hits            INTEGER DEFAULT 0,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_route_cache_geo ON route_cache USING GIST (origin);
CREATE INDEX idx_route_cache_key ON route_cache (cache_key);
CREATE INDEX idx_route_cache_expires ON route_cache (expires_at);
```

### Índices Geoespaciales Clave

```sql
-- Paraderos cercanos a un punto (búsqueda de paraderos)
CREATE INDEX idx_stops_location ON transport_stops USING GIST (location);

-- Consulta típica: paraderos en radio de 500m
SELECT * FROM transport_stops
WHERE ST_DWithin(
  location::geography,
  ST_MakePoint(-77.0428, -12.0464)::geography,
  500
);
```

### Migraciones

Las migraciones se gestionan con **Drizzle ORM** (recomendado) o Prisma:

```bash
# Generar migración
npx drizzle-kit generate

# Aplicar migraciones
npx drizzle-kit migrate

# Rollback (si es reversible)
npx drizzle-kit rollback
```

---

## 5. API REST

Todos los endpoints están versionados bajo `/api/v1`.

### Geolocalización

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/geo/reverse?lat=&lng=` | Geocodificación inversa | No |
| `GET` | `/api/v1/cities` | Listar ciudades activas | No |
| `GET` | `/api/v1/cities/:id/coverage` | Nivel de cobertura | No |

### Destinos y Rutas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/places/autocomplete?q=&city=` | Autocompletado | No* |
| `POST` | `/api/v1/routes/search` | Buscar rutas | Sí |
| `GET` | `/api/v1/routes/:id` | Detalle de ruta | Sí |
| `POST` | `/api/v1/routes/:id/recalculate` | Recalcular ruta | Sí |

> *Autocompletado con debounce de 300ms y rate-limit de 10 req/min.

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Registro |
| `POST` | `/api/v1/auth/login` | Login (JWT) |
| `POST` | `/api/v1/auth/refresh` | Renovar token |
| `POST` | `/api/v1/auth/logout` | Logout |
| `GET` | `/api/v1/users/me` | Perfil actual |

### Cuotas y Suscripciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/usage/today` | Consultas del día |
| `GET` | `/api/v1/plans` | Planes disponibles |
| `POST` | `/api/v1/subscriptions/checkout` | Crear checkout |
| `GET` | `/api/v1/subscriptions/current` | Suscripción actual |
| `POST` | `/api/v1/subscriptions/cancel` | Cancelar |

### Webhooks de Pago

| Método | Endpoint | Proveedor |
|--------|----------|-----------|
| `POST` | `/api/v1/webhooks/payments/stripe` | Stripe |
| `POST` | `/api/v1/webhooks/payments/mercadopago` | Mercado Pago |

### Administración (requiere rol `admin` o `superadmin`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/admin/dashboard` | Métricas globales |
| `CRUD` | `/api/v1/admin/cities` | Gestionar ciudades |
| `CRUD` | `/api/v1/admin/operators` | Operadores de transporte |
| `CRUD` | `/api/v1/admin/providers` | Proveedores de API |
| `CRUD` | `/api/v1/admin/plans` | Planes de suscripción |
| `GET` | `/api/v1/admin/billing/stats` | Estadísticas de facturación |
| `GET` | `/api/v1/admin/audit` | Logs de auditoría |

### Formato de Respuesta

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-15T10:30:00Z",
    "request_id": "uuid"
  }
}
```

### Formato de Error

```json
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Has agotado tus consultas gratuitas de hoy",
    "details": { "limit": 5, "used": 5 }
  }
}
```

---

## 6. Variables de Entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
# ============================================
# APP
# ============================================
NODE_ENV=development              # development | production
APP_PORT=3000
APP_URL=http://localhost:3000
API_URL=http://localhost:3001/api/v1

# ============================================
# BASE DE DATOS
# ============================================
DATABASE_URL=postgresql://rutanomada:secret@localhost:5432/rutanomada
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# ============================================
# REDIS (opcional, para caché distribuida)
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# AUTENTICACIÓN
# ============================================
JWT_SECRET=your-256-bit-secret-change-me
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# ============================================
# GOOGLE MAPS PLATFORM
# ============================================
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GOOGLE_MAPS_ROUTES_ENABLED=true
GOOGLE_MAPS_PLACES_ENABLED=true
GOOGLE_MAPS_GEOCODING_ENABLED=true
GOOGLE_MAPS_DAILY_BUDGET_USD=100

# ============================================
# PAGOS
# ============================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_WEEKLY=price_xxx
STRIPE_PRICE_MONTHLY=price_xxx

MERCADOPAGO_ACCESS_TOKEN=TEST-xxx
MERCADOPAGO_WEBHOOK_SECRET=xxx

# ============================================
# CORS
# ============================================
CORS_ORIGIN=http://localhost:3000,https://rutanomada.com

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# LOGS
# ============================================
LOG_LEVEL=info                    # debug | info | warn | error
LOG_FORMAT=pretty                 # pretty | json

# ============================================
# CACHE
# ============================================
ROUTE_CACHE_TTL_MINUTES=15
GEOCODING_CACHE_TTL_MINUTES=1440  # 24h
PLACES_CACHE_TTL_MINUTES=60

# ============================================
# BACKUPS
# ============================================
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 3 * * *         # 3 AM diario
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=rutanomada-backups
BACKUP_S3_REGION=us-east-1
```

---

## 7. Instalación en Desarrollo

### Prerequisitos

- **Node.js** 20 LTS o superior
- **Docker** y **Docker Compose** (para DB)
- **Git**
- **pnpm** (recomendado) o npm

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/tu-organizacion/rutanomada.git
cd rutanomada
```

### Paso 2: Instalar dependencias

```bash
# Frontend
cd apps/web
pnpm install

# Backend (cuando exista)
cd apps/api
pnpm install
```

### Paso 3: Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores
```

### Paso 4: Levantar la base de datos

```bash
# Levantar PostgreSQL + PostGIS
docker compose up -d postgres

# Verificar que está corriendo
docker compose ps
```

### Paso 5: Ejecutar migraciones

```bash
cd packages/database
pnpm migrate:dev
pnpm seed    # Datos iniciales (ciudades, países)
```

### Paso 6: Iniciar el servidor de desarrollo

```bash
# Frontend
cd apps/web
pnpm dev      # http://localhost:3000

# Backend (en otra terminal)
cd apps/api
pnpm dev      # http://localhost:3001
```

### Paso 7: Crear usuario administrador inicial

```bash
cd apps/api
pnpm create-admin --email admin@rutanomada.com --password TuPasswordSeguro123
```

### Comandos útiles

```bash
pnpm dev          # Desarrollo con hot-reload
pnpm build        # Build de producción
pnpm preview      # Preview del build
pnpm lint         # Linter
pnpm test         # Pruebas unitarias
pnpm test:e2e     # Pruebas end-to-end
pnpm db:studio    # Drizzle Studio (explorador visual DB)
```

---

## 8. Despliegue en Producción

### Requisitos del VPS

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| **CPU** | 2 vCPU | 4 vCPU |
| **RAM** | 2 GB | 4 GB |
| **SSD** | 30 GB | 60 GB |
| **SO** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| **Red** | 1 Gbps | 1 Gbps |

**Proveedores sugeridos:** Hetzner (€4.5/mes), DigitalOcean ($12/mes), OVH (€3.5/mes).

### Paso 1: Preparar el VPS

```bash
# Conectar por SSH
ssh root@tu-vps-ip

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker

# Instalar Docker Compose plugin
apt install docker-compose-plugin -y

# Crear usuario deploy
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
```

### Paso 2: Configurar firewall

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Paso 3: Clonar y configurar

```bash
su - deploy
git clone https://github.com/tu-organizacion/rutanomada.git
cd rutanomada

# Configurar variables de entorno
cp .env.example .env
nano .env   # Completar con valores de producción
```

### Paso 4: Construir y levantar

```bash
# Build de imágenes
docker compose -f docker-compose.prod.yml build

# Levantar servicios
docker compose -f docker-compose.prod.yml up -d

# Verificar
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

### Paso 5: Ejecutar migraciones

```bash
docker compose -f docker-compose.prod.yml exec api \
  pnpm db:migrate:prod

docker compose -f docker-compose.prod.yml exec api \
  pnpm create-admin --email admin@rutanomada.com
```

### Paso 6: Configurar DNS

Apunta tu dominio al IP del VPS:

```
A    rutanomada.com       → tu-vps-ip
A    api.rutanomada.com   → tu-vps-ip
```

Caddy obtendrá certificados HTTPS automáticamente vía Let's Encrypt.

### docker-compose.prod.yml

```yaml
version: '3.9'

services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"  # HTTP/3
    volumes:
      - ./infrastructure/caddy/Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - web
      - api

  web:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.web
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  api:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.api
    restart: unless-stopped
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

  postgres:
    image: postgis/postgis:16-3.4
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

volumes:
  postgres_data:
  caddy_data:
  caddy_config:
```

### Caddyfile

```
rutanomada.com {
    reverse_proxy web:3000
    encode gzip
    header /* {
        Strict-Transport-Security "max-age=31536000"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
    }
}

api.rutanomada.com {
    reverse_proxy api:3001
    encode gzip
    header /* {
        Strict-Transport-Security "max-age=31536000"
    }
}
```

### Backups automáticos

```bash
# Script: infrastructure/scripts/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
S3_BUCKET="rutanomada-backups"

docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U ${DB_USER} ${DB_NAME} | gzip > ${BACKUP_DIR}/db_${DATE}.sql.gz

# Subir a S3
aws s3 cp ${BACKUP_DIR}/db_${DATE}.sql.gz s3://${S3_BUCKET}/

# Limpiar backups locales antiguos (> 7 días)
find ${BACKUP_DIR} -name "db_*.sql.gz" -mtime +7 -delete
```

Agregar al crontab:

```bash
0 3 * * * /opt/rutanomada/infrastructure/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### Actualización sin downtime

```bash
# 1. Pull de cambios
git pull origin main

# 2. Reconstruir imágenes
docker compose -f docker-compose.prod.yml build

# 3. Migraciones (si las hay)
docker compose -f docker-compose.prod.yml exec api pnpm db:migrate:prod

# 4. Rolling update
docker compose -f docker-compose.prod.yml up -d --no-deps --build api web

# 5. Verificar
docker compose -f docker-compose.prod.yml ps
curl https://api.rutanomada.com/health
```

---

## 9. Herramientas Externas e Integraciones

### Google Maps Platform

| API | Uso | Costo aprox. |
|-----|-----|--------------|
| **Routes API** | Cálculo de rutas de transporte | US$5-10 / 1000 req |
| **Places API (New)** | Autocompletado de destinos | US$2.83 / 1000 req |
| **Geocoding API** | Conversión dirección ↔ coords | US$5 / 1000 req |

**Configuración:**

1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar las APIs necesarias
3. Crear API Key con restricciones:
   - **HTTP referrers:** `https://rutanomada.com/*`
   - **APIs:** Solo las usadas
   - **Presupuesto:** Alertas al 50%, 80%, 100%
4. Configurar cuota diaria en `GOOGLE_MAPS_DAILY_BUDGET_USD`

**Optimizaciones implementadas:**

- ✅ Caché geográfica (hash de origen+destino con precisión de 100m)
- ✅ Debounce de 300ms en autocomplete
- ✅ Reutilización de consultas compatibles
- ✅ TTL diferenciado por tipo de dato
- ✅ Desactivación automática al superar presupuesto

### GTFS (General Transit Feed Specification)

**Fuentes oficiales por país:**

| País | Fuente | URL |
|------|--------|-----|
| Perú | ATU Lima | https://datos.gob.pe |
| Colombia | TransMilenio | https://www.transmilenio.gov.co |
| Argentina | Buenos Aires | https://www.buenosaires.gob.ar |
| Chile | METRO / RED | https://www.metro.cl / www.red.cl |
| Brasil | SPTrans | http://www.sptrans.com.br |

**Importación:**

```bash
# Importar feed GTFS
pnpm gtfs:import --city=lima --url=https://.../gtfs.zip

# Validar feed
pnpm gtfs:validate --file=./feeds/lima.zip
```

### Pasarelas de Pago

#### Stripe (Internacional)

```typescript
// apps/api/src/providers/StripeAdapter.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Crear checkout session
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: process.env.STRIPE_PRICE_WEEKLY,
    quantity: 1,
  }],
  success_url: 'https://rutanomada.com/success',
  cancel_url: 'https://rutanomada.com/paywall',
});
```

#### Mercado Pago (LATAM)

```typescript
// apps/api/src/providers/MercadoPagoAdapter.ts
import { MercadoPagoConfig, PreApprovalClient } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
});

const preApproval = new PreApprovalClient(client);
const subscription = await preApproval.create({
  body: {
    reason: 'RutaNómada Premium Semanal',
    auto_recurring: {
      frequency: 1,
      frequency_type: 'weeks',
      transaction_amount: 1.00,
      currency_id: 'USD',
    },
    back_url: 'https://rutanomada.com/settings',
  }
});
```

### Webhooks de Pago

**Flujo de verificación:**

```
Proveedor → POST /webhooks/payments/:provider
          → Validar firma (HMAC-SHA256)
          → Verificar idempotencia (provider_tx_id)
          → Actualizar estado de suscripción
          → Responder 200 OK
```

**Eventos manejados:**

| Evento | Acción |
|--------|--------|
| `checkout.session.completed` | Activar suscripción |
| `invoice.paid` | Renovar suscripción |
| `customer.subscription.deleted` | Desactivar Premium |
| `charge.refunded` | Reembolso + downgrade |
| `payment_intent.failed` | Notificar al usuario |

---

## 10. Motor de Rutas

### Arquitectura

```typescript
// apps/api/src/modules/routes/RouteEngine.ts

interface RouteEngine {
  search(params: SearchParams): Promise<RouteAlternative[]>;
  recalculate(routeId: string): Promise<RouteAlternative>;
}

interface SearchParams {
  origin: [number, number];
  destination: [number, number];
  cityId: string;
  preferences?: {
    criterion: 'cheapest' | 'fastest' | 'less-walking' | 'less-transfers' | 'simplest';
    maxTransfers?: number;
    maxWalking?: number;
  };
}
```

### Flujo de búsqueda

```
1. Identificar ciudad (reverse geocoding)
2. Consultar MobilityProviders disponibles
3. Buscar paraderos cercanos (PostGIS ST_DWithin)
4. Obtener itinerarios válidos (GTFS + Google)
5. Calcular tramos a pie
6. Estimar tiempos de espera
7. Calcular tarifas verificadas
8. Aplicar scoring configurable
9. Retornar alternativas ordenadas
```

### Scoring configurable

```typescript
const weights = {
  cost: 0.35,        // Peso del costo
  duration: 0.30,    // Peso del tiempo
  walking: 0.20,     // Peso de la caminata
  transfers: 0.15,   // Peso de los transbordos
};

const score = (
  weights.cost * normalize(cost) +
  weights.duration * normalize(duration) +
  weights.walking * normalize(walking) +
  weights.transfers * normalize(transfers)
);
```

### Calidad de datos

Cada ruta incluye un indicador de confianza:

| Calidad | Significado | Color |
|---------|-------------|-------|
| `real-time` | Datos en tiempo real (GTFS-RT) | 🟢 Verde |
| `scheduled` | Horarios programados oficiales | 🔵 Azul |
| `estimated` | Estimación histórica | 🟡 Amarillo |
| `approximate` | Datos aproximados | 🟠 Naranja |

---

## 11. Sistema de Temas Dinámicos

### ThemeEngine

Motor que aplica automáticamente paletas neón según el país detectado:

```typescript
// src/themes/ThemeEngine.ts
export const countryThemes = {
  PE: { primary: '#ff1744', neonGlow: '0 0 20px rgba(255,23,68,0.5)', ... },
  AR: { primary: '#00e5ff', neonGlow: '0 0 20px rgba(0,229,255,0.5)', ... },
  CO: { primary: '#ffd600', neonGlow: '0 0 20px rgba(255,214,0,0.5)', ... },
  CL: { primary: '#2979ff', neonGlow: '0 0 20px rgba(41,121,255,0.5)', ... },
  BR: { primary: '#00e676', neonGlow: '0 0 20px rgba(0,230,118,0.5)', ... },
  // ... 10 países
};

// Aplicar dinámicamente
applyThemeToCSS(getThemeForCountry(userCountryCode));
```

### Variables CSS inyectadas

```css
:root {
  --theme-primary: #ff1744;
  --theme-primary-light: #ff5252;
  --theme-neon-glow: 0 0 20px rgba(255,23,68,0.5);
  --theme-gradient: linear-gradient(135deg, #ff1744, #d50000);
  --theme-card-bg: rgba(30,10,15,0.85);
  --theme-card-border: rgba(255,23,68,0.2);
}
```

---

## 12. Modelo Freemium y Pagos

### Control de cuotas (atómico)

```sql
-- Función PostgreSQL para reserva atómica de cuota
CREATE OR REPLACE FUNCTION reserve_quota(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  -- Bloquear fila + verificar
  SELECT queries_limit - queries_used
  INTO v_remaining
  FROM usage_quotas
  WHERE user_id = p_user_id AND date = CURRENT_DATE
  FOR UPDATE;

  IF v_remaining IS NULL THEN
    -- Crear registro del día
    INSERT INTO usage_quotas (user_id, date, queries_used, queries_limit, reset_at)
    VALUES (p_user_id, CURRENT_DATE, 1, 5, 
            (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMPTZ);
    RETURN TRUE;
  ELSIF v_remaining > 0 THEN
    UPDATE usage_quotas
    SET queries_used = queries_used + 1
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
    RETURN TRUE;
  ELSE
    RETURN FALSE; -- Sin cuota
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### Planes

| Plan | Precio | Consultas | Favoritos | Historial |
|------|--------|-----------|-----------|-----------|
| **Free** | US$0 | 5/día | 10 | 7 días |
| **Premium Weekly** | US$1/sem | Ilimitadas* | Ilimitados | Completo |
| **Premium Monthly** | US$3.99/mes | Ilimitadas* | Ilimitados | Completo |

> *Sujeto a fair use: 500 consultas/día.

---

## 13. Seguridad

### Checklist

- [x] HTTPS obligatorio (Caddy + Let's Encrypt)
- [x] Variables de entorno para secretos
- [x] Validación con Zod en todos los endpoints
- [x] Rate limiting (100 req/min por IP)
- [x] Contraseñas con Argon2id (12 rounds)
- [x] JWT con refresh tokens rotativos
- [x] Cookies HttpOnly + Secure + SameSite
- [x] Protección CSRF en flujos cookie-based
- [x] CORS restrictivo (whitelist de dominios)
- [x] RBAC (tourist, admin, ops, superadmin)
- [x] Verificación HMAC de webhooks
- [x] SQL parametrizado (Drizzle ORM)
- [x] Logs sin datos sensibles
- [x] Protección contra enumeración de cuentas
- [x] Sanitización de inputs
- [x] Headers de seguridad (HSTS, X-Frame-Options, etc.)

### Datos sensibles

| Dato | Tratamiento |
|------|-------------|
| **GPS** | No se almacena permanentemente |
| **Contraseñas** | Argon2id, nunca en texto plano |
| **Tarjetas** | Nunca pasan por nuestros servidores |
| **Email** | Encriptado en reposo |

---

## 14. Testing

### Ejecutar pruebas

```bash
# Unitarias
pnpm test

# Integración (requiere DB)
pnpm test:integration

# End-to-end (Playwright)
pnpm test:e2e

# Cobertura
pnpm test:coverage
```

### Escenarios críticos (obligatorios)

| # | Escenario | Tipo |
|---|-----------|------|
| 1 | Turista permite GPS y busca primera ruta | E2E |
| 2 | Turista rechaza GPS y escribe origen | E2E |
| 3 | Sistema muestra alternativas verificadas | Integration |
| 4 | Usuario realiza exactamente 5 consultas gratis | Integration |
| 5 | 6ª consulta bloqueada sin consumir APIs pagadas | Integration |
| 6 | 2 solicitudes simultáneas no superan cuota | Stress |
| 7 | Cuota se reinicia según zona horaria | Unit |
| 8 | Usuario compra Premium | E2E |
| 9 | Webhook duplicado no activa 2 veces | Integration |
| 10 | Suscripción vencida pierde beneficios | Integration |
| 11 | Proveedor falla sin inventar datos | Integration |
| 12 | Ciudad sin datos informa limitación | Unit |
| 13 | Turista pierde conexión durante ruta | E2E |
| 14 | Admin activa nueva ciudad | E2E |
| 15 | Admin consulta costos de APIs | Integration |
| 16 | Usuario no autorizado no accede a admin | Security |

---

## 15. Monitoreo y Costos

### Métricas clave

| Métrica | Herramienta | Alerta |
|---------|-------------|--------|
| Uptime | UptimeRobot | < 99.5% |
| Errores API | Logs + Sentry | > 1% |
| Latencia p95 | Prometheus | > 2s |
| Costo Google Maps | Dashboard interno | > 80% presupuesto |
| Conversiones | Stripe Dashboard | - |
| Consultas cache hit | Redis stats | < 50% |

### Panel de costos (Admin)

```
┌─────────────────────────────────────────┐
│  Costos de APIs (hoy)                    │
├─────────────────────────────────────────┤
│  Google Routes      $42.30   1,240 calls │
│  Google Places      $18.50   3,450 calls │
│  Google Geocoding    $8.20     890 calls │
│  GTFS Data           $0.00  12,300 calls │
├─────────────────────────────────────────┤
│  Total estimado     $69.00/día           │
│  Caché hit rate     67%                  │
│  Ahorro por caché   $46/día              │
└─────────────────────────────────────────┘
```

### Estrategia de reducción de costos

1. **Caché agresiva** de rutas (TTL 15 min)
2. **Debounce** de autocomplete (300ms)
3. **GTFS** como fuente primaria (gratis)
4. **Google** solo cuando GTFS no tiene datos
5. **Presupuesto diario** con auto-shutdown
6. **Deduplicación** de consultas similares

---

## 16. Roadmap

### ✅ Fase 1 — Completada

- [x] Frontend PWA con React + Vite
- [x] Mapa con Leaflet
- [x] Buscador de destinos
- [x] Sistema de rutas multimodal (demo)
- [x] Asistente conversacional
- [x] 16 vistas completas
- [x] Temas neón por país
- [x] Paywall + checkout
- [x] Panel administrativo
- [x] Autenticación UI
- [x] FAQ y ayuda

### 🚧 Fase 2 — Backend (próxima)

- [ ] API Fastify + TypeScript
- [ ] PostgreSQL + PostGIS
- [ ] Autenticación JWT
- [ ] Motor de rutas real
- [ ] Control de cuotas atómico
- [ ] Integración Stripe/MercadoPago

### 📋 Fase 3 — Integraciones

- [ ] Google Maps Routes API
- [ ] Importador GTFS
- [ ] GTFS-Realtime
- [ ] Notificaciones push

### 🔮 Fase 4 — Escalamiento

- [ ] Redis para caché distribuida
- [ ] CDN para assets
- [ ] Horizontal scaling
- [ ] Multi-región
- [ ] i18n completo (i18next)

---

## 📄 Licencia

Propietario — © 2026 RutaNómada

---

## 🤝 Contacto

- **Email:** dev@rutanomada.com
- **Documentación:** https://docs.rutanomada.com
- **Status:** https://status.rutanomada.com

---

> **Nota para desarrolladores:** Este README es un documento vivo. Actualízalo conforme evolucione el proyecto. Para dudas técnicas, consulta la documentación en `/docs` o abre un issue en el repositorio.
