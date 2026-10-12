# 📋 Manual del Administrador — RutaNómada

Guía completa para administradores del sistema SaaS RutaNómada.

---

## Tabla de Contenidos

1. [Acceso al Panel](#1-acceso-al-panel)
2. [Dashboard Principal](#2-dashboard-principal)
3. [Gestión de Ciudades](#3-gestión-de-ciudades)
4. [Gestión de Usuarios](#4-gestión-de-usuarios)
5. [Gestión de Transporte](#5-gestión-de-transporte)
6. [Gestión de Proveedores](#6-gestión-de-proveedores)
7. [Planes y Precios](#7-planes-y-precios)
8. [Facturación y Pagos](#8-facturación-y-pagos)
9. [Monitoreo de Costos](#9-monitoreo-de-costos)
10. [Auditoría y Logs](#10-auditoría-y-logs)
11. [Backups y Restauración](#11-backups-y-restauración)
12. [Resolución de Problemas](#12-resolución-de-problemas)

---

## 1. Acceso al Panel

### URL de acceso
```
https://rutanomada.com/admin
```

### Roles disponibles

| Rol | Permisos |
|-----|----------|
| **Superadministrador** | Acceso total: todo |
| **Administrador de operaciones** | Usuarios, ciudades, monitoreo |
| **Administrador de contenido** | Transporte, tarifas, GTFS |
| **Soporte** | Solo lectura + tickets |

### Primer acceso

```bash
# Crear superadmin inicial
cd apps/api
pnpm create-admin --email admin@rutanomada.com --password TuPasswordSeguro123
```

### Recuperar acceso

Si pierdes acceso al panel:

```bash
# Resetear password desde el servidor
docker compose exec api pnpm reset-admin-password --email admin@rutanomada.com
```

---

## 2. Dashboard Principal

### Métricas clave

| Métrica | Descripción | Alerta |
|---------|-------------|--------|
| **Usuarios activos** | Usuarios con actividad en últimas 24h | - |
| **Consultas hoy** | Total de búsquedas de rutas | > 50,000 |
| **Ingresos (mes)** | Ingresos acumulados del mes | - |
| **Conversión** | % de usuarios free → premium | < 2% |
| **Costo APIs** | Gasto diario en APIs externas | > 80% presupuesto |
| **Cache hit rate** | % de consultas servidas desde caché | < 50% |
| **Errores** | Errores en últimas 24h | > 1% |

### Gráficos

- **Usuarios por país**: Distribución geográfica
- **Consultas por hora**: Picos de uso
- **Ingresos vs costos**: Margen diario
- **Top ciudades**: Más usadas

---

## 3. Gestión de Ciudades

### Activar nueva ciudad

1. Ir a **Ciudades** → **Activar nueva ciudad**
2. Completar:
   - Nombre de la ciudad
   - País (del catálogo)
   - Coordenadas del centro
   - Zona horaria
   - Nivel de cobertura inicial
3. Guardar

### Niveles de cobertura

| Nivel | Significado | Implicaciones |
|-------|-------------|---------------|
| **complete** | Todos los datos disponibles | Rutas completas |
| **partial** | Algunos sistemas | Rutas parciales |
| **walking-only** | Solo peatonal | Sin transporte público |
| **none** | Sin datos | No aparece en buscador |

### Configurar proveedores por ciudad

```sql
-- Ejemplo: Agregar Google Maps para Lima
INSERT INTO mobility_providers (name, type, city_id, config, priority, enabled)
VALUES (
  'Google Maps Routes - Lima',
  'google_maps',
  (SELECT id FROM cities WHERE name = 'Lima'),
  '{"api_key": "sk_...", "budget_daily": 50}'::jsonb,
  2,
  true
);
```

### Desactivar ciudad temporalmente

```sql
UPDATE cities SET active = false WHERE id = '...';
-- Los usuarios en esa ciudad verán mensaje de "cobertura no disponible"
```

---

## 4. Gestión de Usuarios

### Buscar usuarios

- Por email
- Por nombre
- Por ciudad
- Por plan (free/premium)
- Por estado (activo/bloqueado)

### Acciones disponibles

| Acción | Descripción |
|--------|-------------|
| **Ver detalle** | Perfil completo, historial, consumo |
| **Cambiar plan** | Manual override (solo superadmin) |
| **Resetear cuota** | Dar consultas adicionales |
| **Bloquear** | Suspender cuenta (con justificación) |
| **Eliminar** | Borrado lógico (GDPR) |
| **Exportar datos** | Para solicitud de portabilidad |

### Bloquear usuario

1. Buscar usuario
2. Click en **Bloquear**
3. Seleccionar motivo:
   - Abuso de API
   - Fraude de pago
   - Violación de términos
   - Solicitud del usuario
4. Agregar nota interna
5. Confirmar

El usuario recibirá email notificando el bloqueo.

### Estadísticas de usuario

```sql
-- Consultar consumo de un usuario específico
SELECT
  u.email,
  u.plan,
  COUNT(rq.id) as total_queries,
  SUM(CASE WHEN rq.created_at > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as queries_7d,
  MAX(rq.created_at) as last_query
FROM users u
LEFT JOIN route_queries rq ON rq.user_id = u.id
WHERE u.id = 'user-uuid'
GROUP BY u.id;
```

---

## 5. Gestión de Transporte

### Importar datos GTFS

1. Ir a **Transporte** → **Importar GTFS**
2. Seleccionar ciudad
3. Subir archivo `.zip` o proporcionar URL
4. El sistema validará y procesará:
   - `agency.txt` → Operadores
   - `routes.txt` → Líneas
   - `stops.txt` → Paraderos
   - `stop_times.txt` → Horarios
   - `shapes.txt` → Geometrías
5. Revisar reporte de importación
6. Confirmar

### Validar datos

```bash
# Validar feed GTFS
pnpm gtfs:validate --file=./feeds/lima.zip

# Output esperado:
# ✅ agency.txt: 3 registros válidos
# ✅ routes.txt: 142 registros válidos
# ✅ stops.txt: 8,432 registros válidos
# ⚠️  stop_times.txt: 12 registros con tiempos inválidos
# ✅ shapes.txt: 142 geometrías válidas
```

### Editar tarifas

1. Ir a **Transporte** → **Tarifas**
2. Filtrar por ciudad/línea
3. Editar monto, moneda, método de pago
4. Marcar como "verificada" si es oficial
5. Guardar

### Agregar operador manual

Para transporte informal sin GTFS:

```sql
INSERT INTO transport_operators (city_id, name, type, official)
VALUES (
  (SELECT id FROM cities WHERE name = 'Lima'),
  'Colectivos Amarillos Centro',
  'collectivo',
  false
);
```

---

## 6. Gestión de Proveedores

### Proveedores de movilidad

| Proveedor | Tipo | Costo | Prioridad |
|-----------|------|-------|-----------|
| Google Maps Routes | API pagada | ~$5/1000 req | 2 |
| Google Maps Places | API pagada | ~$2.83/1000 | 3 |
| Google Maps Geocoding | API pagada | ~$5/1000 | 4 |
| GTFS Lima | Datos oficiales | Gratis | 1 |
| GTFS Bogotá | Datos oficiales | Gratis | 1 |

### Configurar límites de gasto

```sql
-- Establecer presupuesto diario para Google Maps
UPDATE mobility_providers
SET daily_budget_usd = 100,
    config = jsonb_set(config, '{alert_thresholds}', '[50, 80, 100]'::jsonb)
WHERE type = 'google_maps';
```

### Desactivar proveedor ante problemas

```sql
-- Desactivar temporalmente
UPDATE mobility_providers
SET enabled = false
WHERE id = 'provider-uuid';

-- El sistema usará automáticamente el siguiente proveedor por prioridad
```

### Monitorear consumo

```sql
-- Consumo de hoy por proveedor
SELECT
  mp.name,
  pu.calls,
  pu.cost_usd,
  pu.errors,
  pu.avg_latency_ms,
  mp.daily_budget_usd,
  ROUND((pu.cost_usd / mp.daily_budget_usd * 100), 2) as budget_used_pct
FROM provider_usage pu
JOIN mobility_providers mp ON mp.id = pu.provider_id
WHERE pu.date = CURRENT_DATE
ORDER BY pu.cost_usd DESC;
```

---

## 7. Planes y Precios

### Configurar planes

```sql
-- Actualizar precios
UPDATE system_settings SET value = '1.50'::jsonb
WHERE key = 'premium_weekly_price';

-- Actualizar consultas gratuitas
UPDATE system_settings SET value = '10'::jsonb
WHERE key = 'free_queries_per_day';
```

### Crear nuevo plan

```sql
-- Ejemplo: Plan mensual anualizado
INSERT INTO subscription_plans (name, price_usd, period_days, features)
VALUES (
  'Premium Anual',
  29.99,
  365,
  '["consultas_ilimitadas", "favoritos_ilimitados", "historial_completo", "soporte_prioritario", "sin_anuncios"]'::jsonb
);
```

### Promociones

```sql
-- Crear código promocional
INSERT INTO promo_codes (code, discount_type, discount_value, valid_until, max_uses)
VALUES ('BLACKFRIDAY', 'percentage', 50, '2026-12-01', 1000);
```

---

## 8. Facturación y Pagos

### Ver transacciones

Filtros disponibles:
- Por fecha
- Por usuario
- Por proveedor (Stripe/MercadoPago)
- Por estado (completado/pendiente/fallido)
- Por monto

### Reembolsos

1. Buscar transacción
2. Click en **Reembolsar**
3. Seleccionar monto (total/parcial)
4. Agregar motivo
5. Confirmar

El sistema:
- Procesa reembolso vía proveedor
- Downgrade del usuario a free
- Notifica por email
- Registra en auditoría

### Conciliación

```bash
# Ejecutar conciliación manual
pnpm billing:reconcile --date=2026-01-15

# Output:
# ✅ 234 transacciones conciliadas
# ⚠️  3 discrepancias encontradas
# 💰  Total: US$1,234.56
```

### Reportes financieros

```sql
-- Ingresos del mes por plan
SELECT
  s.plan,
  COUNT(DISTINCT s.user_id) as subscribers,
  SUM(pt.amount) as revenue,
  pt.currency
FROM subscriptions s
JOIN payment_transactions pt ON pt.subscription_id = s.id
WHERE pt.status = 'completed'
  AND pt.created_at >= DATE_TRUNC('month', NOW())
GROUP BY s.plan, pt.currency;
```

---

## 9. Monitoreo de Costos

### Dashboard de costos

| Métrica | Valor | Acción si... |
|---------|-------|--------------|
| Google Maps hoy | $69 | > $80: revisar caché |
| Costo por consulta | $0.002 | > $0.005: optimizar |
| Margen bruto | 78% | < 60%: ajustar precios |
| Cache hit rate | 67% | < 50%: revisar TTL |

### Alertas configuradas

```yaml
# infrastructure/monitoring/alerts.yml
alerts:
  - name: google_maps_budget_80
    condition: "daily_cost > budget * 0.8"
    action: notify_admin
    channel: slack
    
  - name: google_maps_budget_100
    condition: "daily_cost > budget"
    action: disable_provider
    channel: slack + email
    
  - name: error_rate_high
    condition: "error_rate > 0.01"
    action: notify_ops
    channel: slack
    
  - name: latency_high
    condition: "p95_latency > 2000ms"
    action: notify_ops
    channel: slack
```

### Optimización de costos

1. **Aumentar TTL de caché** si los datos no cambian frecuentemente
2. **Reducir precisión** de geocoding para agrupar consultas
3. **Priorizar GTFS** sobre Google Maps
4. **Implementar deduplicación** de consultas similares
5. **Revisar proveedores** con mayor costo/beneficio

---

## 10. Auditoría y Logs

### Ver logs de auditoría

Filtros:
- Por usuario
- Por acción
- Por fecha
- Por recurso

### Acciones registradas

| Categoría | Ejemplos |
|-----------|----------|
| **Auth** | login, logout, password_change |
| **Admin** | city_activate, user_block, plan_change |
| **Transport** | gtfs_import, fare_update, operator_add |
| **Billing** | refund, plan_upgrade, subscription_cancel |
| **System** | backup, config_change, provider_toggle |

### Exportar logs

```bash
# Exportar logs de auditoría del mes
pnpm audit:export --from=2026-01-01 --to=2026-01-31 --format=csv > audit_jan.csv
```

### Retención

| Tipo de log | Retención |
|-------------|-----------|
| Auditoría | 1 año |
| API access | 90 días |
| Errores | 30 días |
| Queries | 30 días (free) / ilimitado (premium) |

---

## 11. Backups y Restauración

### Backups automáticos

Configurados en `infrastructure/scripts/backup.sh`:

- **Frecuencia**: Diario a las 3:00 AM
- **Retención local**: 7 días
- **Retención S3**: 30 días
- **Formato**: SQL comprimido con gzip

### Backup manual

```bash
# Backup completo
./infrastructure/scripts/backup.sh

# Backup de una tabla específica
docker compose exec postgres pg_dump -U rutanomada -t users rutanomada > users_backup.sql
```

### Restaurar backup

```bash
# ⚠️ ADVERTENCIA: Esto sobrescribirá la base de datos actual

# 1. Detener servicios
docker compose stop api

# 2. Restaurar
cat backup_20260115.sql.gz | gunzip | docker compose exec -T postgres psql -U rutanomada -d rutanomada

# 3. Reiniciar servicios
docker compose start api

# 4. Verificar
curl https://api.rutanomada.com/health
```

### Verificar integridad

```bash
# Verificar último backup
./infrastructure/scripts/verify-backup.sh

# Output esperado:
# ✅ Backup de 2026-01-15 verificado
# ✅ 20 tablas restauradas correctamente
# ✅ 12,847 usuarios
# ✅ 34,521 consultas
```

---

## 12. Resolución de Problemas

### Problemas comunes

#### La app no carga el mapa

**Causa**: API key de Google Maps inválida o cuota excedida

**Solución**:
```bash
# Verificar logs
docker compose logs api | grep "google_maps"

# Verificar cuota en Google Cloud Console
# https://console.cloud.google.com/apis/dashboard
```

#### Usuarios reportan rutas incorrectas

**Causa**: Datos GTFS desactualizados

**Solución**:
```bash
# Re-importar GTFS actualizado
pnpm gtfs:import --city=lima --url=https://nueva-url/gtfs.zip

# Invalidar caché de rutas
pnpm cache:invalidate --city=lima
```

#### Pagos no se procesan

**Causa**: Webhook no recibido o firma inválida

**Solución**:
```bash
# Verificar webhooks pendientes
pnpm billing:check-webhooks

# Reintentar procesamiento
pnpm billing:retry-webhook --id=webhook-uuid
```

#### Base de datos lenta

**Causa**: Índices desactualizados o queries pesadas

**Solución**:
```bash
# Analizar queries lentas
docker compose exec postgres psql -U rutanomada -d rutanomada -c "
  SELECT query, calls, total_time, mean_time
  FROM pg_stat_statements
  ORDER BY total_time DESC
  LIMIT 10;
"

# Reindexar
docker compose exec postgres psql -U rutanomada -d rutanomada -c "REINDEX DATABASE rutanomada;"

# Analizar tablas
docker compose exec postgres psql -U rutanomada -d rutanomada -c "VACUUM ANALYZE;"
```

#### Alto consumo de Google Maps

**Causa**: Caché no funcionando o TTL muy bajo

**Solución**:
```bash
# Verificar hit rate
pnpm cache:stats

# Aumentar TTL
UPDATE system_settings SET value = '30'::jsonb WHERE key = 'route_cache_ttl_minutes';

# Limpiar y reconstruir caché
pnpm cache:rebuild
```

### Comandos de diagnóstico

```bash
# Estado general del sistema
pnpm system:status

# Verificar conectividad DB
pnpm db:health

# Verificar conectividad Redis
pnpm redis:health

# Verificar proveedores externos
pnpm providers:health

# Ver métricas de rendimiento
pnpm metrics:summary

# Ver errores recientes
pnpm logs:errors --last=1h
```

### Soporte técnico

- **Email**: dev@rutanomada.com
- **Slack**: #rutanomada-tech
- **Documentación**: https://docs.rutanomada.com
- **Status page**: https://status.rutanomada.com

---

## Checklist de Mantenimiento Semanal

- [ ] Revisar dashboard de costos
- [ ] Verificar backups exitosos
- [ ] Revisar errores críticos
- [ ] Actualizar GTFS si hay nuevas versiones
- [ ] Revisar conversiones free → premium
- [ ] Verificar tiempos de respuesta (p95 < 2s)
- [ ] Revisar logs de auditoría (acciones sensibles)
- [ ] Limpiar datos antiguos (> 90 días)

---

*Última actualización: Enero 2026*
