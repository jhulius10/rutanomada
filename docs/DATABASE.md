# 🗄️ Documentación de Base de Datos — RutaNómada

Documentación técnica completa del esquema de base de datos PostgreSQL + PostGIS.

---

## Tabla de Contenidos

1. [Resumen](#1-resumen)
2. [Extensiones](#2-extensiones)
3. [Diagrama ER Completo](#3-diagrama-er-completo)
4. [Tablas Principales](#4-tablas-principales)
5. [Índices Geoespaciales](#5-índices-geoespaciales)
6. [Consultas Comunes](#6-consultas-comunes)
7. [Funciones y Procedimientos](#7-funciones-y-procedimientos)
8. [Vistas](#8-vistas)
9. [Triggers](#9-triggers)
10. [Optimización](#10-optimización)
11. [Backup y Restauración](#11-backup-y-restauración)
12. [Migraciones](#12-migraciones)

---

## 1. Resumen

### Especificaciones

| Parámetro | Valor |
|-----------|-------|
| **Motor** | PostgreSQL 16 |
| **Extensión geoespacial** | PostGIS 3.4 |
| **Codificación** | UTF-8 |
| **Collation** | en_US.UTF-8 |
| **Tamaño inicial** | ~50 MB |
| **Tamaño proyectado (1 año)** | ~5 GB |

### Tablas

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| **Core** | 5 | Países, ciudades, usuarios, cuotas, configuración |
| **Transporte** | 6 | Operadores, líneas, paraderos, horarios, tarifas, GTFS |
| **Rutas** | 3 | Consultas, caché, favoritos |
| **Pagos** | 4 | Suscripciones, transacciones, webhooks, proveedores |
| **Sistema** | 4 | Auditoría, logs, proveedores de movilidad, uso |
| **Total** | **22** | |

---

## 2. Extensiones

```sql
-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS postgis;        -- Datos geoespaciales
CREATE EXTENSION IF NOT EXISTS pgcrypto;       -- Funciones criptográficas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- Generación de UUIDs
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;  -- Estadísticas de queries
```

### PostGIS

Permite almacenar y consultar datos geoespaciales:

```sql
-- Tipos de datos
GEOGRAPHY(POINT, 4326)      -- Punto en coordenadas GPS
GEOGRAPHY(LINESTRING, 4326) -- Línea (ruta de transporte)
GEOGRAPHY(POLYGON, 4326)    -- Polígono (área de cobertura)

-- Funciones útiles
ST_DWithin(geog1, geog2, distance_meters)  -- ¿Están dentro de X metros?
ST_Distance(geog1, geog2)                  -- Distancia en metros
ST_MakePoint(lng, lat)                     -- Crear punto
ST_SetSRID(point, 4326)                    -- Asignar sistema de referencia
```

---

## 3. Diagrama ER Completo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CORE                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐       ┌──────────────────┐       ┌──────────────┐    │
│  │  countries   │       │     cities       │       │    users     │    │
│  ├──────────────┤       ├──────────────────┤       ├──────────────┤    │
│  │ code (PK)    │──┐    │ id (PK)          │    ┌──│ id (PK)      │    │
│  │ name         │  │    │ country_code(FK) │◄───┘  │ email        │    │
│  │ currency     │  └───►│ name             │       │ password_hash│    │
│  │ language     │       │ center (GEO)     │       │ role         │    │
│  │ timezone     │       │ coverage         │       │ plan         │    │
│  └──────────────┘       │ timezone         │       │ current_city │    │
│                         └────────┬─────────┘       └──────┬───────┘    │
│                                  │                        │            │
│                                  │                        │            │
│  ┌──────────────────┐            │            ┌───────────▼────────┐   │
│  │  usage_quotas    │            │            │   subscriptions    │   │
│  ├──────────────────┤            │            ├────────────────────┤   │
│  │ id (PK)          │            │            │ id (PK)            │   │
│  │ user_id (FK)     │◄───────────┼────────────│ user_id (FK)       │   │
│  │ date             │            │            │ plan               │   │
│  │ queries_used     │            │            │ status             │   │
│  │ queries_limit    │            │            │ provider           │   │
│  │ reset_at         │            │            │ current_period_end │   │
│  └──────────────────┘            │            └────────────────────┘   │
│                                  │                                     │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │
┌──────────────────────────────────┼─────────────────────────────────────┐
│                           TRANSPORT                                   │
├──────────────────────────────────┼─────────────────────────────────────┤
│                                  │                                     │
│  ┌──────────────────┐            │            ┌──────────────────┐    │
│  │transport_operators│           │            │ transport_lines  │    │
│  ├──────────────────┤           │            ├──────────────────┤    │
│  │ id (PK)          │           │            │ id (PK)          │    │
│  │ city_id (FK)     │◄──────────┘            │ operator_id (FK) │    │
│  │ name             │                        │ short_name       │    │
│  │ type             │                        │ long_name        │    │
│  │ official         │                        │ type             │    │
│  └──────────────────┘                        │ color            │    │
│                                              │ geometry (GEO)   │    │
│                                              └────────┬─────────┘    │
│                                                       │              │
│                      ┌────────────────────────────────┼──────────┐   │
│                      │                                │          │   │
│                      ▼                                ▼          │   │
│  ┌──────────────────────────┐    ┌──────────────────────┐       │   │
│  │   transport_stops        │    │ transport_schedules  │       │   │
│  ├──────────────────────────┤    ├──────────────────────┤       │   │
│  │ id (PK)                  │    │ id (PK)              │       │   │
│  │ line_id (FK)             │◄───│ line_id (FK)         │       │   │
│  │ code                     │    │ stop_id (FK)         │       │   │
│  │ name                     │    │ arrival_time         │       │   │
│  │ location (GEO POINT)     │    │ direction            │       │   │
│  │ wheelchair               │    │ day_type             │       │   │
│  └──────────────────────────┘    └──────────────────────┘       │   │
│                                                                  │   │
│  ┌──────────────────────────┐                                    │   │
│  │   transport_fares        │                                    │   │
│  ├──────────────────────────┤                                    │   │
│  │ id (PK)                  │                                    │   │
│  │ line_id (FK)             │◄───────────────────────────────────┘   │
│  │ amount                   │                                        │
│  │ currency                 │                                        │
│  │ payment_method           │                                        │
│  │ verified                 │                                        │
│  └──────────────────────────┘                                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                           ROUTES & QUERIES                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────┐       ┌──────────────────────────┐    │
│  │    route_queries         │       │     route_cache          │    │
│  ├──────────────────────────┤       ├──────────────────────────┤    │
│  │ id (PK)                  │       │ id (PK)                  │    │
│  │ user_id (FK)             │       │ cache_key (UNIQUE)       │    │
│  │ city_id (FK)             │       │ origin (GEO)             │    │
│  │ origin (GEO)             │       │ destination (GEO)        │    │
│  │ destination (GEO)        │       │ city_id (FK)             │    │
│  │ routes_data (JSONB)      │       │ routes_data (JSONB)      │    │
│  │ execution_time           │       │ hits                     │    │
│  │ created_at               │       │ expires_at               │    │
│  └──────────────────────────┘       └──────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────┐                                        │
│  │      favorites           │                                        │
│  ├──────────────────────────┤                                        │
│  │ id (PK)                  │                                        │
│  │ user_id (FK)             │                                        │
│  │ name                     │                                        │
│  │ location (GEO)           │                                        │
│  │ icon                     │                                        │
│  │ category                 │                                        │
│  └──────────────────────────┘                                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                           PAYMENTS                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────┐       ┌──────────────────────────┐    │
│  │ payment_transactions     │       │ payment_webhook_events   │    │
│  ├──────────────────────────┤       ├──────────────────────────┤    │
│  │ id (PK)                  │       │ id (PK)                  │    │
│  │ user_id (FK)             │       │ provider                 │    │
│  │ subscription_id (FK)     │       │ event_id (UNIQUE)        │    │
│  │ provider                 │       │ event_type               │    │
│  │ provider_tx_id (UNIQUE)  │       │ payload (JSONB)          │    │
│  │ amount                   │       │ processed                │    │
│  │ currency                 │       │ processed_at             │    │
│  │ status                   │       └──────────────────────────┘    │
│  │ webhook_payload (JSONB)  │                                        │
│  └──────────────────────────┘                                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                           SYSTEM                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────┐       ┌──────────────────────────┐    │
│  │    audit_logs            │       │   system_settings        │    │
│  ├──────────────────────────┤       ├──────────────────────────┤    │
│  │ id (PK)                  │       │ key (PK)                 │    │
│  │ user_id (FK)             │       │ value (JSONB)            │    │
│  │ action                   │       │ description              │    │
│  │ resource_type            │       │ updated_by               │    │
│  │ resource_id              │       └──────────────────────────┘    │
│  │ details (JSONB)          │                                        │
│  │ ip_address               │       ┌──────────────────────────┐    │
│  │ created_at               │       │  mobility_providers      │    │
│  └──────────────────────────┘       ├──────────────────────────┤    │
│                                     │ id (PK)                  │    │
│                                     │ name                     │    │
│                                     │ type                     │    │
│                                     │ city_id (FK)             │    │
│                                     │ config (JSONB)           │    │
│                                     │ priority                 │    │
│                                     │ enabled                  │    │
│                                     │ daily_budget_usd         │    │
│                                     └──────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tablas Principales

### countries

```sql
CREATE TABLE countries (
  code        CHAR(2) PRIMARY KEY,           -- ISO 3166-1 alpha-2
  name        VARCHAR(100) NOT NULL,
  currency    CHAR(3) NOT NULL,              -- ISO 4217
  currency_symbol VARCHAR(5) NOT NULL,
  language    CHAR(2) NOT NULL,              -- ISO 639-1
  timezone    VARCHAR(50) NOT NULL,          -- IANA timezone
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Datos iniciales:** 10 países de LATAM (PE, CO, AR, CL, BR, EC, VE, BO, UY, PY)

### cities

```sql
CREATE TABLE cities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code  CHAR(2) REFERENCES countries(code) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  center        GEOGRAPHY(POINT, 4326) NOT NULL,  -- Centro de la ciudad
  bounding_box  GEOGRAPHY(POLYGON, 4326),         -- Límites
  zoom          INTEGER DEFAULT 13,
  coverage      coverage_level DEFAULT 'none',
  timezone      VARCHAR(50) NOT NULL,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**
- `idx_cities_center` (GIST) - Búsqueda geoespacial
- `idx_cities_country` - Filtro por país
- `idx_cities_active` - Ciudades activas

### users

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,        -- Argon2id
  name            VARCHAR(255),
  role            user_role DEFAULT 'tourist',
  plan            user_plan DEFAULT 'free',
  current_city_id UUID REFERENCES cities(id),
  language        CHAR(2) DEFAULT 'es',
  email_verified  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  last_login_at   TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ                   -- Soft delete
);
```

**Índices:**
- `idx_users_email` - Búsqueda por email
- `idx_users_role` - Filtro por rol
- `idx_users_plan` - Filtro por plan

### usage_quotas

```sql
CREATE TABLE usage_quotas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  anonymous_id    UUID REFERENCES anonymous_identities(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  queries_used    INTEGER DEFAULT 0,
  queries_limit   INTEGER DEFAULT 5,
  reset_at        TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: solo user_id O anonymous_id, no ambos
  CONSTRAINT chk_user_or_anon CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  ),
  
  UNIQUE (user_id, date),
  UNIQUE (anonymous_id, date)
);
```

**Propósito:** Control atómico de consultas gratuitas por día.

### transport_stops

```sql
CREATE TABLE transport_stops (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id       UUID REFERENCES transport_lines(id) ON DELETE CASCADE,
  code          VARCHAR(50),
  name          VARCHAR(255) NOT NULL,
  location      GEOGRAPHY(POINT, 4326) NOT NULL,  -- Ubicación GPS
  platform_code VARCHAR(20),
  wheelchair    BOOLEAN DEFAULT FALSE,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**
- `idx_stops_location` (GIST) - Búsqueda de paraderos cercanos
- `idx_stops_line` - Paraderos de una línea
- `idx_stops_code` - Búsqueda por código

---

## 5. Índices Geoespaciales

### Tipos de índices

```sql
-- GIST: Para datos geoespaciales (búsquedas por proximidad)
CREATE INDEX idx_stops_location ON transport_stops USING GIST (location);

-- B-Tree: Para búsquedas exactas y rangos
CREATE INDEX idx_users_email ON users (email);

-- GIN: Para JSONB y full-text search
CREATE INDEX idx_routes_data ON route_queries USING GIN (routes_data);
```

### Consultas geoespaciales comunes

```sql
-- 1. Paraderos cercanos a un punto (radio de 500m)
SELECT *
FROM transport_stops
WHERE ST_DWithin(
  location::geography,
  ST_MakePoint(-77.0428, -12.0464)::geography,  -- lng, lat
  500  -- metros
)
ORDER BY ST_Distance(location::geography, ST_MakePoint(-77.0428, -12.0464)::geography)
LIMIT 10;

-- 2. Ciudad más cercana a un punto
SELECT name, ST_Distance(center, ST_MakePoint(-77.0428, -12.0464)::geography) AS distance
FROM cities
WHERE active = true
ORDER BY center <-> ST_MakePoint(-77.0428, -12.0464)::geography
LIMIT 1;

-- 3. Paraderos dentro de un bounding box
SELECT *
FROM transport_stops
WHERE location && ST_MakeEnvelope(
  -77.1, -12.1,  -- min_lng, min_lat
  -77.0, -12.0,  -- max_lng, max_lat
  4326
)::geometry;

-- 4. Distancia entre dos puntos
SELECT ST_Distance(
  ST_MakePoint(-77.0428, -12.0464)::geography,  -- Lima
  ST_MakePoint(-74.0721, 4.7110)::geography     -- Bogotá
) / 1000 AS distance_km;  -- Convertir a km
```

---

## 6. Consultas Comunes

### Dashboard de Admin

```sql
-- Usuarios activos hoy
SELECT COUNT(DISTINCT user_id) AS active_users
FROM usage_quotas
WHERE date = CURRENT_DATE;

-- Consultas del día
SELECT SUM(queries_used) AS total_queries
FROM usage_quotas
WHERE date = CURRENT_DATE;

-- Ingresos del mes
SELECT SUM(amount) AS revenue
FROM payment_transactions
WHERE status = 'completed'
  AND created_at >= DATE_TRUNC('month', NOW());

-- Top ciudades por uso
SELECT c.name, COUNT(rq.id) AS queries
FROM route_queries rq
JOIN cities c ON c.id = rq.city_id
WHERE rq.created_at >= NOW() - INTERVAL '7 days'
GROUP BY c.id, c.name
ORDER BY queries DESC
LIMIT 10;
```

### Búsqueda de Rutas

```sql
-- Obtener líneas que pasan cerca de un punto
SELECT DISTINCT l.*
FROM transport_lines l
JOIN transport_stops s ON s.line_id = l.id
WHERE ST_DWithin(s.location::geography, ST_MakePoint(-77.0428, -12.0464)::geography, 300)
  AND l.active = true;

-- Horarios de una línea en un paradero
SELECT arrival_time, direction
FROM transport_schedules
WHERE line_id = 'line-uuid'
  AND stop_id = 'stop-uuid'
  AND day_type = 'weekday'
  AND arrival_time > NOW()::time
ORDER BY arrival_time
LIMIT 5;
```

### Control de Cuotas

```sql
-- Verificar cuota restante
SELECT queries_limit - queries_used AS remaining
FROM usage_quotas
WHERE user_id = 'user-uuid'
  AND date = CURRENT_DATE;

-- Reservar cuota (función atómica)
SELECT reserve_quota('user-uuid');  -- Retorna true/false
```

---

## 7. Funciones y Procedimientos

### reserve_quota

```sql
CREATE OR REPLACE FUNCTION reserve_quota(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_remaining INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  -- Obtener límite del sistema
  SELECT (value::text)::int INTO v_remaining
  FROM system_settings
  WHERE key = 'free_queries_per_day';

  -- Calcular próximo reset (medianoche)
  SELECT (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMPTZ INTO v_reset_at;

  -- Insertar o actualizar atómicamente
  INSERT INTO usage_quotas (user_id, date, queries_used, queries_limit, reset_at)
  VALUES (p_user_id, CURRENT_DATE, 1, v_remaining, v_reset_at)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    queries_used = CASE
      WHEN usage_quotas.queries_used < usage_quotas.queries_limit
      THEN usage_quotas.queries_used + 1
      ELSE usage_quotas.queries_used
    END
  RETURNING (queries_used <= queries_limit) INTO v_remaining;

  RETURN v_remaining > 0;
END;
$$ LANGUAGE plpgsql;
```

**Uso:**
```typescript
// En el backend
const hasQuota = await db.query(
  'SELECT reserve_quota($1) AS allowed',
  [userId]
);

if (!hasQuota.rows[0].allowed) {
  throw new QuotaExceededError();
}
```

### clean_expired_cache

```sql
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM route_cache
  WHERE expires_at < NOW();

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;
```

**Ejecución programada:**
```bash
# Cron job diario
0 2 * * * psql -U rutanomada -d rutanomada -c "SELECT clean_expired_cache();"
```

### cleanup_old_data

```sql
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
  -- Limpiar caché expirada
  PERFORM clean_expired_cache();

  -- Limpiar logs de auditoría (> 90 días)
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

  -- Limpiar queries de usuarios free (> 30 días)
  DELETE FROM route_queries
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND user_id IN (SELECT id FROM users WHERE plan = 'free');

  -- Limpiar webhooks procesados (> 7 días)
  DELETE FROM payment_webhook_events
  WHERE processed = TRUE AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;
```

---

## 8. Vistas

### v_active_subscribers

```sql
CREATE VIEW v_active_subscribers AS
SELECT
  u.id,
  u.email,
  u.name,
  u.plan,
  s.provider,
  s.current_period_end,
  c.name AS city_name,
  c.country_code
FROM users u
JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
LEFT JOIN cities c ON c.id = u.current_city_id;
```

**Uso:**
```sql
SELECT * FROM v_active_subscribers WHERE country_code = 'PE';
```

### v_daily_usage_stats

```sql
CREATE VIEW v_daily_usage_stats AS
SELECT
  date,
  COUNT(DISTINCT user_id) AS active_users,
  SUM(queries_used) AS total_queries,
  AVG(queries_used) AS avg_queries_per_user
FROM usage_quotas
GROUP BY date
ORDER BY date DESC;
```

**Uso:**
```sql
SELECT * FROM v_daily_usage_stats WHERE date >= NOW() - INTERVAL '30 days';
```

### v_provider_costs

```sql
CREATE VIEW v_provider_costs AS
SELECT
  mp.name AS provider_name,
  mp.type,
  pu.date,
  pu.calls,
  pu.cost_usd,
  pu.errors,
  pu.avg_latency_ms
FROM provider_usage pu
JOIN mobility_providers mp ON mp.id = pu.provider_id
ORDER BY pu.date DESC, pu.cost_usd DESC;
```

**Uso:**
```sql
SELECT * FROM v_provider_costs WHERE date = CURRENT_DATE;
```

---

## 9. Triggers

### Auto-update updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Audit log trigger

```sql
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
    VALUES (
      NEW.id,
      'role_changed',
      'user',
      NEW.id,
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_user_role_changes
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_changes();
```

---

## 10. Optimización

### EXPLAIN ANALYZE

```sql
-- Analizar query
EXPLAIN ANALYZE
SELECT *
FROM transport_stops
WHERE ST_DWithin(
  location::geography,
  ST_MakePoint(-77.0428, -12.0464)::geography,
  500
)
LIMIT 10;

-- Output esperado:
-- Index Scan using idx_stops_location on transport_stops
--   Index Cond: (location && ...)
--   Filter: ST_DWithin(...)
--   Rows Removed by Filter: 0
-- Planning Time: 0.5 ms
-- Execution Time: 2.3 ms
```

### VACUUM y ANALYZE

```sql
-- Actualizar estadísticas
VACUUM ANALYZE transport_stops;
VACUUM ANALYZE route_queries;

-- Full vacuum (bloquea tabla)
VACUUM FULL transport_stops;
```

### Configuración de PostgreSQL

```ini
# postgresql.conf

# Memoria
shared_buffers = 512MB          # 25% de RAM total
effective_cache_size = 1536MB   # 75% de RAM total
work_mem = 16MB                 # Por operación de ordenamiento
maintenance_work_mem = 128MB    # Para VACUUM, CREATE INDEX

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Queries
random_page_cost = 1.1          # Para SSD
effective_io_concurrency = 200  # Para SSD

# Logging
log_min_duration_statement = 1000  # Log queries > 1s
```

### Índices parciales

```sql
-- Índice solo para usuarios activos
CREATE INDEX idx_users_active_email ON users (email) WHERE deleted_at IS NULL;

-- Índice solo para caché no expirada
CREATE INDEX idx_route_cache_active ON route_cache (cache_key) WHERE expires_at > NOW();
```

---

## 11. Backup y Restauración

### Backup Completo

```bash
# Backup comprimido
pg_dump -U rutanomada -h localhost rutanomada | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup con formato custom (paralelizable)
pg_dump -U rutanomada -h localhost -Fc -Z 6 rutanomada > backup_$(date +%Y%m%d).dump
```

### Backup de Tabla Específica

```bash
pg_dump -U rutanomada -h localhost -t users rutanomada > users_backup.sql
```

### Restaurar

```bash
# Desde backup comprimido
gunzip -c backup_20260115_030000.sql.gz | psql -U rutanomada -h localhost -d rutanomada

# Desde formato custom
pg_restore -U rutanomada -h localhost -d rutanomada -j 4 backup_20260115.dump
```

### Automatización con Cron

```bash
# /etc/cron.d/rutanomada-backup
0 3 * * * postgres /opt/rutanomada/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### Verificar Integridad

```bash
# Verificar que el backup se puede restaurar
createdb -U rutanomada test_restore
gunzip -c backup.sql.gz | psql -U rutanomada -d test_restore

# Comparar conteos
psql -U rutanomada -d rutanomada -c "SELECT COUNT(*) FROM users;"
psql -U rutanomada -d test_restore -c "SELECT COUNT(*) FROM users;"

# Limpiar
dropdb -U rutanomada test_restore
```

---

## 12. Migraciones

### Drizzle ORM (Recomendado)

```bash
# Generar migración
npx drizzle-kit generate

# Aplicar migraciones
npx drizzle-kit migrate

# Rollback
npx drizzle-kit rollback

# Studio (UI visual)
npx drizzle-kit studio
```

### Estructura de Migraciones

```
packages/database/migrations/
├── 0001_initial_schema.sql
├── 0002_add_transport_tables.sql
├── 0003_add_payment_tables.sql
└── 0004_add_audit_logs.sql
```

### Ejemplo de Migración

```sql
-- migrations/0005_add_favorites.sql

-- Up
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_favorites_user ON favorites (user_id);
CREATE INDEX idx_favorites_location ON favorites USING GIST (location);

-- Down (rollback)
DROP TABLE IF EXISTS favorites;
```

### Prisma (Alternativa)

```bash
# Generar cliente
npx prisma generate

# Aplicar migraciones
npx prisma migrate deploy

# Studio
npx prisma studio
```

---

## Métricas de Salud

```sql
-- Tamaño de base de datos
SELECT pg_size_pretty(pg_database_size('rutanomada'));

-- Tamaño de tablas
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS data_size,
  pg_size_pretty(pg_indexes_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Conexiones activas
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Queries lentas
SELECT
  query,
  calls,
  total_time / 1000 AS total_seconds,
  mean_time / 1000 AS avg_seconds
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Índices no usados
SELECT
  schemaname,
  relname,
  indexrelname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY idx_scan;
```

---

*Para más información, consulta la [documentación oficial de PostgreSQL](https://www.postgresql.org/docs/) y [PostGIS](https://postgis.net/documentation/).*
