-- ============================================
-- 🚌 RUTANÓMADA - Inicialización de Base de Datos
-- ============================================
-- Este script se ejecuta automáticamente al crear el contenedor PostgreSQL
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TIPOS Y ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('tourist', 'admin', 'ops', 'superadmin');
CREATE TYPE user_plan AS ENUM ('free', 'premium_weekly', 'premium_monthly', 'premium_yearly');
CREATE TYPE coverage_level AS ENUM ('complete', 'partial', 'walking-only', 'none');
CREATE TYPE transport_type AS ENUM ('bus', 'metro', 'train', 'brt', 'tram', 'collectivo', 'ferry');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'expired');
CREATE TYPE data_quality AS ENUM ('real-time', 'scheduled', 'estimated', 'approximate');

-- ============================================
-- PAÍSES
-- ============================================

CREATE TABLE countries (
  code        CHAR(2) PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  currency    CHAR(3) NOT NULL,
  currency_symbol VARCHAR(5) NOT NULL,
  language    CHAR(2) NOT NULL,
  timezone    VARCHAR(50) NOT NULL,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar países soportados
INSERT INTO countries (code, name, currency, currency_symbol, language, timezone) VALUES
  ('PE', 'Perú', 'PEN', 'S/', 'es', 'America/Lima'),
  ('CO', 'Colombia', 'COP', '$', 'es', 'America/Bogota'),
  ('AR', 'Argentina', 'ARS', '$', 'es', 'America/Argentina/Buenos_Aires'),
  ('CL', 'Chile', 'CLP', '$', 'es', 'America/Santiago'),
  ('BR', 'Brasil', 'BRL', 'R$', 'pt', 'America/Sao_Paulo'),
  ('EC', 'Ecuador', 'USD', '$', 'es', 'America/Guayaquil'),
  ('VE', 'Venezuela', 'VES', 'Bs.', 'es', 'America/Caracas'),
  ('BO', 'Bolivia', 'BOB', 'Bs.', 'es', 'America/La_Paz'),
  ('UY', 'Uruguay', 'UYU', '$U', 'es', 'America/Montevideo'),
  ('PY', 'Paraguay', 'PYG', '₲', 'es', 'America/Asuncion');

-- ============================================
-- CIUDADES
-- ============================================

CREATE TABLE cities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code  CHAR(2) REFERENCES countries(code) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  center        GEOGRAPHY(POINT, 4326) NOT NULL,
  bounding_box  GEOGRAPHY(POLYGON, 4326),
  zoom          INTEGER DEFAULT 13,
  coverage      coverage_level DEFAULT 'none',
  timezone      VARCHAR(50) NOT NULL,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cities_center ON cities USING GIST (center);
CREATE INDEX idx_cities_country ON cities (country_code);
CREATE INDEX idx_cities_active ON cities (active);

-- Insertar ciudades principales
INSERT INTO cities (country_code, name, center, zoom, coverage, timezone) VALUES
  ('PE', 'Lima', ST_SetSRID(ST_MakePoint(-77.0428, -12.0464), 4326)::geography, 13, 'partial', 'America/Lima'),
  ('CO', 'Bogotá', ST_SetSRID(ST_MakePoint(-74.0721, 4.7110), 4326)::geography, 12, 'complete', 'America/Bogota'),
  ('AR', 'Buenos Aires', ST_SetSRID(ST_MakePoint(-58.3816, -34.6037), 4326)::geography, 13, 'complete', 'America/Argentina/Buenos_Aires'),
  ('CL', 'Santiago', ST_SetSRID(ST_MakePoint(-70.6693, -33.4489), 4326)::geography, 12, 'complete', 'America/Santiago'),
  ('BR', 'São Paulo', ST_SetSRID(ST_MakePoint(-46.6333, -23.5505), 4326)::geography, 12, 'complete', 'America/Sao_Paulo'),
  ('EC', 'Quito', ST_SetSRID(ST_MakePoint(-78.4678, -0.1807), 4326)::geography, 13, 'partial', 'America/Guayaquil'),
  ('VE', 'Caracas', ST_SetSRID(ST_MakePoint(-66.9036, 10.4806), 4326)::geography, 13, 'walking-only', 'America/Caracas'),
  ('BO', 'La Paz', ST_SetSRID(ST_MakePoint(-68.1193, -16.4897), 4326)::geography, 13, 'partial', 'America/La_Paz'),
  ('UY', 'Montevideo', ST_SetSRID(ST_MakePoint(-56.1645, -34.9011), 4326)::geography, 13, 'partial', 'America/Montevideo'),
  ('PY', 'Asunción', ST_SetSRID(ST_MakePoint(-57.5759, -25.2637), 4326)::geography, 13, 'walking-only', 'America/Asuncion');

-- ============================================
-- USUARIOS
-- ============================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(255),
  role            user_role DEFAULT 'tourist',
  plan            user_plan DEFAULT 'free',
  current_city_id UUID REFERENCES cities(id),
  language        CHAR(2) DEFAULT 'es',
  email_verified  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  last_login_at   TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_plan ON users (plan);

-- ============================================
-- IDENTIDADES ANÓNMAS (para usuarios sin cuenta)
-- ============================================

CREATE TABLE anonymous_identities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint VARCHAR(255) NOT NULL,
  ip_hash         VARCHAR(64) NOT NULL,
  user_agent      TEXT,
  first_seen_at   TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (device_fingerprint)
);

-- ============================================
-- CUOTAS DE USO
-- ============================================

CREATE TABLE usage_quotas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  anonymous_id    UUID REFERENCES anonymous_identities(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  queries_used    INTEGER DEFAULT 0,
  queries_limit   INTEGER DEFAULT 5,
  reset_at        TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_user_or_anon CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  ),
  UNIQUE (user_id, date),
  UNIQUE (anonymous_id, date)
);

CREATE INDEX idx_usage_quotas_user_date ON usage_quotas (user_id, date);
CREATE INDEX idx_usage_quotas_reset ON usage_quotas (reset_at);

-- ============================================
-- OPERADORES DE TRANSPORTE
-- ============================================

CREATE TABLE transport_operators (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id       UUID REFERENCES cities(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  type          transport_type NOT NULL,
  official      BOOLEAN DEFAULT FALSE,
  website       VARCHAR(500),
  contact       VARCHAR(255),
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_operators_city ON transport_operators (city_id);
CREATE INDEX idx_operators_type ON transport_operators (type);

-- ============================================
-- LÍNEAS DE TRANSPORTE
-- ============================================

CREATE TABLE transport_lines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id   UUID REFERENCES transport_operators(id) ON DELETE CASCADE,
  short_name    VARCHAR(50) NOT NULL,
  long_name     VARCHAR(255),
  type          transport_type NOT NULL,
  color         VARCHAR(7), -- Hex color #RRGGBB
  text_color    VARCHAR(7) DEFAULT '#FFFFFF',
  url           VARCHAR(500),
  geometry      GEOGRAPHY(LINESTRING, 4326),
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lines_operator ON transport_lines (operator_id);
CREATE INDEX idx_lines_geometry ON transport_lines USING GIST (geometry);

-- ============================================
-- PARADEROS
-- ============================================

CREATE TABLE transport_stops (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id       UUID REFERENCES transport_lines(id) ON DELETE CASCADE,
  code          VARCHAR(50),
  name          VARCHAR(255) NOT NULL,
  location      GEOGRAPHY(POINT, 4326) NOT NULL,
  platform_code VARCHAR(20),
  wheelchair    BOOLEAN DEFAULT FALSE,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stops_location ON transport_stops USING GIST (location);
CREATE INDEX idx_stops_line ON transport_stops (line_id);
CREATE INDEX idx_stops_code ON transport_stops (code);

-- ============================================
-- HORARIOS
-- ============================================

CREATE TABLE transport_schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id       UUID REFERENCES transport_lines(id) ON DELETE CASCADE,
  stop_id       UUID REFERENCES transport_stops(id) ON DELETE CASCADE,
  arrival_time  TIME NOT NULL,
  departure_time TIME,
  direction     VARCHAR(100),
  day_type      VARCHAR(20) DEFAULT 'weekday', -- weekday, saturday, sunday
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedules_line_stop ON transport_schedules (line_id, stop_id);
CREATE INDEX idx_schedules_time ON transport_schedules (arrival_time);

-- ============================================
-- TARIFAS
-- ============================================

CREATE TABLE transport_fares (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id         UUID REFERENCES transport_lines(id) ON DELETE CASCADE,
  amount          NUMERIC(10, 2) NOT NULL,
  currency        CHAR(3) NOT NULL,
  payment_method  VARCHAR(50), -- 'cash', 'card', 'both'
  valid_from      DATE,
  valid_to        DATE,
  notes           TEXT,
  verified        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fares_line ON transport_fares (line_id);
CREATE INDEX idx_fares_valid ON transport_fares (valid_from, valid_to);

-- ============================================
-- CONSULTAS DE RUTAS
-- ============================================

CREATE TABLE route_queries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  city_id         UUID REFERENCES cities(id),
  origin          GEOGRAPHY(POINT, 4326) NOT NULL,
  destination     GEOGRAPHY(POINT, 4326) NOT NULL,
  origin_name     VARCHAR(255),
  destination_name VARCHAR(255),
  preferences     JSONB,
  routes_data     JSONB,
  execution_time  INTEGER, -- ms
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queries_user ON route_queries (user_id);
CREATE INDEX idx_queries_city ON route_queries (city_id);
CREATE INDEX idx_queries_origin ON route_queries USING GIST (origin);
CREATE INDEX idx_queries_created ON route_queries (created_at);

-- ============================================
-- CACHÉ DE RUTAS
-- ============================================

CREATE TABLE route_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key       VARCHAR(255) UNIQUE NOT NULL,
  origin          GEOGRAPHY(POINT, 4326),
  destination     GEOGRAPHY(POINT, 4326),
  city_id         UUID REFERENCES cities(id),
  routes_data     JSONB NOT NULL,
  hits            INTEGER DEFAULT 0,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_route_cache_key ON route_cache (cache_key);
CREATE INDEX idx_route_cache_geo ON route_cache USING GIST (origin);
CREATE INDEX idx_route_cache_expires ON route_cache (expires_at);

-- ============================================
-- SUSCRIPCIONES
-- ============================================

CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  plan              user_plan NOT NULL,
  status            subscription_status DEFAULT 'active',
  provider          VARCHAR(30) NOT NULL, -- 'stripe', 'mercadopago'
  provider_sub_id   VARCHAR(255) UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);
CREATE INDEX idx_subscriptions_provider ON subscriptions (provider_sub_id);

-- ============================================
-- TRANSACCIONES DE PAGO
-- ============================================

CREATE TABLE payment_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id),
  subscription_id   UUID REFERENCES subscriptions(id),
  provider          VARCHAR(30) NOT NULL,
  provider_tx_id    VARCHAR(255) UNIQUE,
  amount            NUMERIC(10, 2) NOT NULL,
  currency          CHAR(3) NOT NULL,
  status            payment_status NOT NULL,
  webhook_payload   JSONB,
  error_message     TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON payment_transactions (user_id);
CREATE INDEX idx_transactions_provider ON payment_transactions (provider_tx_id);
CREATE INDEX idx_transactions_status ON payment_transactions (status);
CREATE INDEX idx_transactions_created ON payment_transactions (created_at);

-- ============================================
-- EVENTOS DE WEBHOOK
-- ============================================

CREATE TABLE payment_webhook_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider          VARCHAR(30) NOT NULL,
  event_id          VARCHAR(255) UNIQUE NOT NULL,
  event_type        VARCHAR(100) NOT NULL,
  payload           JSONB NOT NULL,
  processed         BOOLEAN DEFAULT FALSE,
  processed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_provider ON payment_webhook_events (provider, event_id);
CREATE INDEX idx_webhook_events_processed ON payment_webhook_events (processed);

-- ============================================
-- FAVORITOS
-- ============================================

CREATE TABLE favorites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  address         VARCHAR(500),
  location        GEOGRAPHY(POINT, 4326) NOT NULL,
  icon            VARCHAR(10) DEFAULT '📍',
  category        VARCHAR(50),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_favorites_user ON favorites (user_id);
CREATE INDEX idx_favorites_location ON favorites USING GIST (location);

-- ============================================
-- PROVEEDORES DE MOVILIDAD
-- ============================================

CREATE TABLE mobility_providers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  type            VARCHAR(50) NOT NULL, -- 'google_maps', 'gtfs', 'gtfs_rt'
  city_id         UUID REFERENCES cities(id) ON DELETE CASCADE,
  config          JSONB,
  priority        INTEGER DEFAULT 1,
  enabled         BOOLEAN DEFAULT TRUE,
  daily_budget_usd NUMERIC(10, 2),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_providers_city ON mobility_providers (city_id);
CREATE INDEX idx_providers_enabled ON mobility_providers (enabled);

-- ============================================
-- USO DE PROVEEDORES
-- ============================================

CREATE TABLE provider_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id     UUID REFERENCES mobility_providers(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  calls           INTEGER DEFAULT 0,
  cost_usd        NUMERIC(10, 4) DEFAULT 0,
  errors          INTEGER DEFAULT 0,
  avg_latency_ms  INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (provider_id, date)
);

CREATE INDEX idx_provider_usage_date ON provider_usage (date);

-- ============================================
-- CONFIGURACIÓN DEL SISTEMA
-- ============================================

CREATE TABLE system_settings (
  key             VARCHAR(100) PRIMARY KEY,
  value           JSONB NOT NULL,
  description     TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_by      UUID REFERENCES users(id)
);

-- Configuración inicial
INSERT INTO system_settings (key, value, description) VALUES
  ('free_queries_per_day', '5'::jsonb, 'Consultas gratuitas por día'),
  ('premium_weekly_price', '1.00'::jsonb, 'Precio semanal Premium (USD)'),
  ('premium_monthly_price', '3.99'::jsonb, 'Precio mensual Premium (USD)'),
  ('premium_yearly_price', '29.99'::jsonb, 'Precio anual Premium (USD)'),
  ('google_maps_daily_budget', '100'::jsonb, 'Presupuesto diario Google Maps (USD)'),
  ('route_cache_ttl_minutes', '15'::jsonb, 'TTL de caché de rutas (minutos)'),
  ('maintenance_mode', 'false'::jsonb, 'Modo mantenimiento');

-- ============================================
-- LOGS DE AUDITORÍA
-- ============================================

CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  action          VARCHAR(100) NOT NULL,
  resource_type   VARCHAR(50),
  resource_id     UUID,
  details         JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs (user_id);
CREATE INDEX idx_audit_action ON audit_logs (action);
CREATE INDEX idx_audit_created ON audit_logs (created_at);

-- ============================================
-- IMPORTACIONES GTFS
-- ============================================

CREATE TABLE gtfs_imports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id         UUID REFERENCES cities(id) ON DELETE CASCADE,
  file_name       VARCHAR(255) NOT NULL,
  file_hash       VARCHAR(64),
  file_size_bytes BIGINT,
  status          VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  records_imported JSONB,
  error_log       TEXT,
  imported_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gtfs_city ON gtfs_imports (city_id);
CREATE INDEX idx_gtfs_status ON gtfs_imports (status);

-- ============================================
-- FUNCIÓN: Reserva atómica de cuota
-- ============================================

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

  -- Calcular próximo reset (medianoche en timezone del usuario)
  SELECT (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMPTZ INTO v_reset_at;

  -- Intentar insertar o actualizar atómicamente
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

-- ============================================
-- FUNCIÓN: Limpiar caché expirada
-- ============================================

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

-- ============================================
-- TRIGGERS: Actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- POLÍTICAS DE RETENCIÓN (limpieza programada)
-- ============================================

-- Función para limpiar datos antiguos
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
  -- Limpiar caché expirada
  PERFORM clean_expired_cache();

  -- Limpiar logs de auditoría antiguos (> 90 días)
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

  -- Limpiar queries antiguas (> 30 días para usuarios free)
  DELETE FROM route_queries
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND user_id IN (SELECT id FROM users WHERE plan = 'free');

  -- Limpiar eventos de webhook procesados (> 7 días)
  DELETE FROM payment_webhook_events
  WHERE processed = TRUE AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Usuarios con suscripción activa
CREATE VIEW v_active_subscribers AS
SELECT
  u.id,
  u.email,
  u.name,
  u.plan,
  s.provider,
  s.current_period_end,
  c.name as city_name,
  c.country_code
FROM users u
JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
LEFT JOIN cities c ON c.id = u.current_city_id;

-- Vista: Estadísticas diarias de uso
CREATE VIEW v_daily_usage_stats AS
SELECT
  date,
  COUNT(DISTINCT user_id) as active_users,
  SUM(queries_used) as total_queries,
  AVG(queries_used) as avg_queries_per_user
FROM usage_quotas
GROUP BY date
ORDER BY date DESC;

-- Vista: Costos de proveedores
CREATE VIEW v_provider_costs AS
SELECT
  mp.name as provider_name,
  mp.type,
  pu.date,
  pu.calls,
  pu.cost_usd,
  pu.errors,
  pu.avg_latency_ms
FROM provider_usage pu
JOIN mobility_providers mp ON mp.id = pu.provider_id
ORDER BY pu.date DESC, pu.cost_usd DESC;

-- ============================================
-- PERMISOS Y ROLES
-- ============================================

-- Crear rol de aplicación
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rutanomada_app') THEN
    CREATE ROLE rutanomada_app WITH LOGIN PASSWORD 'secret';
  END IF;
END
$$;

-- Otorgar permisos
GRANT CONNECT ON DATABASE rutanomada TO rutanomada_app;
GRANT USAGE ON SCHEMA public TO rutanomada_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rutanomada_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rutanomada_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO rutanomada_app;

-- ============================================
-- MENSAJE FINAL
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Base de datos RutaNómada inicializada correctamente';
  RAISE NOTICE '📊 Tablas creadas: 20+';
  RAISE NOTICE '🌍 Países cargados: 10';
  RAISE NOTICE '🏙️  Ciudades cargadas: 10';
  RAISE NOTICE '🔐 Usuario de aplicación: rutanomada_app';
END
$$;
