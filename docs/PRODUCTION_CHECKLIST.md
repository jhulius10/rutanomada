# ✅ Checklist de Preparación para Producción — RutaNómada

Lista de verificación completa antes de desplegar RutaNómada en producción.

---

## 📋 Pre-Despliegue

### Código y Configuración

- [ ] Todo el código está en la rama `main` o `production`
- [ ] No hay `console.log` o `debugger` en código de producción
- [ ] Variables de entorno de producción configuradas correctamente
- [ ] `.env` NO está commiteado en el repositorio
- [ ] `.gitignore` incluye `.env`, `node_modules/`, `dist/`, `logs/`
- [ ] `package.json` tiene versión actualizada
- [ ] Dependencies están actualizadas (`npm audit` sin vulnerabilidades críticas)
- [ ] Build de producción funciona localmente (`npm run build`)
- [ ] No hay dependencias de desarrollo en bundle de producción

### Base de Datos

- [ ] Migraciones ejecutadas en base de datos de producción
- [ ] Seeds iniciales ejecutados (países, ciudades, configuración)
- [ ] Índices creados correctamente
- [ ] Extensiones PostGIS habilitadas
- [ ] Usuario de aplicación creado con permisos limitados
- [ ] Contraseñas de DB son seguras (no defaults)
- [ ] Backups automáticos configurados y probados
- [ ] Política de retención de datos definida
- [ ] Conexión SSL/TLS habilitada para DB

### Seguridad

- [ ] `JWT_SECRET` es una cadena aleatoria de al menos 32 caracteres
- [ ] `SESSION_SECRET` es diferente de `JWT_SECRET`
- [ ] Contraseñas hasheadas con Argon2id (no bcrypt/md5)
- [ ] CORS configurado solo para dominios permitidos
- [ ] Rate limiting habilitado y configurado
- [ ] HTTPS obligatorio (redirect de HTTP a HTTPS)
- [ ] Headers de seguridad configurados (HSTS, CSP, X-Frame-Options)
- [ ] Cookies con flags `Secure`, `HttpOnly`, `SameSite=Strict`
- [ ] Webhooks de pago verifican firma HMAC
- [ ] No hay secretos hardcodeados en el código
- [ ] Variables sensibles en `.env` o secrets manager
- [ ] SQL parametrizado en todas las queries (no string concatenation)
- [ ] Input validation con Zod en todos los endpoints
- [ ] Protección CSRF habilitada
- [ ] Logs no contienen datos sensibles (passwords, tokens, PII)

### APIs Externas

- [ ] Google Maps API Key configurada y restringida
  - [ ] Restricción por HTTP referrer
  - [ ] Restricción por APIs específicas
  - [ ] Presupuesto diario configurado
  - [ ] Alertas de presupuesto activadas
- [ ] Stripe configurado en modo producción
  - [ ] Webhook endpoints registrados
  - [ ] Precios creados en Stripe Dashboard
  - [ ] Webhook secret configurado
- [ ] Mercado Pago configurado (si aplica)
  - [ ] Access token de producción
  - [ ] Webhook URL registrada
- [ ] Servicio de email configurado (SMTP)
- [ ] Sentry DSN configurado para errores

### Infraestructura

- [ ] VPS con recursos suficientes (mínimo 2 vCPU, 2GB RAM)
- [ ] Firewall configurado (solo puertos 22, 80, 443)
- [ ] SSH con clave pública (no password)
- [ ] Usuario `deploy` creado con permisos de Docker
- [ ] Docker y Docker Compose instalados
- [ ] Caddy configurado con dominio correcto
- [ ] DNS apuntando al IP del VPS
- [ ] Certificados SSL automáticos (Let's Encrypt via Caddy)
- [ ] Volúmenes de Docker persistentes configurados
- [ ] Límites de recursos en containers (CPU, RAM)
- [ ] Logs con rotación configurada
- [ ] Backups automáticos funcionando
- [ ] Monitoreo de uptime configurado (UptimeRobot, etc.)

---

## 🚀 Despliegue

### Paso a Paso

```bash
# 1. Conectar al servidor
ssh deploy@tu-servidor.com

# 2. Ir al directorio del proyecto
cd /opt/rutanomada

# 3. Pull de últimos cambios
git pull origin main

# 4. Configurar variables de entorno
cp .env.example .env
nano .env  # Completar con valores de producción

# 5. Construir imágenes
docker compose -f docker-compose.prod.yml build

# 6. Levantar servicios
docker compose -f docker-compose.prod.yml up -d

# 7. Verificar que todo esté corriendo
docker compose -f docker-compose.prod.yml ps

# 8. Ejecutar migraciones
docker compose -f docker-compose.prod.yml exec api pnpm db:migrate:prod

# 9. Crear administrador inicial (si es primera vez)
docker compose -f docker-compose.prod.yml exec api pnpm create-admin

# 10. Verificar que la API responda
curl https://api.rutanomada.com/health

# 11. Verificar que el frontend cargue
curl -I https://rutanomada.com

# 12. Revisar logs por errores
docker compose -f docker-compose.prod.yml logs --tail=50
```

### Verificación Post-Despliegue

- [ ] Frontend carga correctamente en https://rutanomada.com
- [ ] API responde en https://api.rutanomada.com/health
- [ ] Mapa de Leaflet se renderiza
- [ ] Geolocalización funciona (permite acceso)
- [ ] Búsqueda de destinos funciona
- [ ] Cálculo de rutas funciona
- [ ] Login/registro funciona
- [ ] Panel admin accesible
- [ ] Webhooks de pago reciben eventos
- [ ] Emails de notificación se envían
- [ ] Backups se ejecutan automáticamente

---

## 📊 Monitoreo Post-Despliegue

### Primeras 24 Horas

- [ ] Monitorear errores en Sentry
- [ ] Revisar logs de API cada hora
- [ ] Verificar que no haya picos de error
- [ ] Confirmar que backups se ejecutaron
- [ ] Revisar consumo de Google Maps API
- [ ] Verificar que pagos se procesan correctamente

### Primera Semana

- [ ] Revisar métricas de uso diario
- [ ] Analizar patrones de uso (horarios pico)
- [ ] Verificar cache hit rate (> 50%)
- [ ] Revisar conversión free → premium
- [ ] Ajustar rate limits si es necesario
- [ ] Optimizar queries lentas identificadas
- [ ] Revisar feedback de usuarios

### Primer Mes

- [ ] Análisis completo de costos vs ingresos
- [ ] Revisión de seguridad (penetration test básico)
- [ ] Actualización de dependencias
- [ ] Revisión de backups (prueba de restauración)
- [ ] Documentación de lecciones aprendidas
- [ ] Plan de escalamiento si es necesario

---

## 🔧 Comandos Útiles de Producción

### Ver estado de servicios

```bash
docker compose -f docker-compose.prod.yml ps
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Solo API
docker compose -f docker-compose.prod.yml logs -f api

# Solo últimos 100 líneas
docker compose -f docker-compose.prod.yml logs --tail=100 api
```

### Reiniciar servicios

```bash
# Reiniciar API (sin downtime)
docker compose -f docker-compose.prod.yml restart api

# Reiniciar todo
docker compose -f docker-compose.prod.yml restart
```

### Ejecutar comandos en containers

```bash
# Entrar al container de API
docker compose -f docker-compose.prod.yml exec api sh

# Conectar a PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U rutanomada -d rutanomada

# Ver tamaño de base de datos
docker compose -f docker-compose.prod.yml exec postgres psql -U rutanomada -d rutanomada -c "SELECT pg_size_pretty(pg_database_size('rutanomada'));"
```

### Actualizar aplicación

```bash
# 1. Pull cambios
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

### Backup y restauración

```bash
# Backup manual
./infrastructure/scripts/backup.sh

# Listar backups
ls -lh /backups/

# Restaurar backup específico
gunzip -c /backups/db_20260115_030000.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -U rutanomada -d rutanomada
```

### Limpieza

```bash
# Limpiar imágenes antiguas
docker image prune -f

# Limpiar volúmenes no usados (¡CUIDADO!)
docker volume prune -f

# Limpiar logs antiguos
find /var/log/rutanomada -name "*.log" -mtime +30 -delete
```

---

## 🚨 Plan de Contingencia

### Si la API no responde

1. Verificar que el container esté corriendo:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

2. Revisar logs:
   ```bash
   docker compose -f docker-compose.prod.yml logs api
   ```

3. Reiniciar el servicio:
   ```bash
   docker compose -f docker-compose.prod.yml restart api
   ```

4. Si persiste, verificar base de datos:
   ```bash
   docker compose -f docker-compose.prod.yml exec postgres pg_isready
   ```

### Si la base de datos está lenta

1. Verificar conexiones activas:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

2. Identificar queries lentas:
   ```sql
   SELECT * FROM pg_stat_activity WHERE state = 'active' ORDER BY query_start;
   ```

3. Reindexar:
   ```sql
   REINDEX DATABASE rutanomada;
   ```

4. Analizar tablas:
   ```sql
   VACUUM ANALYZE;
   ```

### Si los pagos no se procesan

1. Verificar webhooks en Stripe/MercadoPago Dashboard
2. Revisar logs de webhooks:
   ```bash
   docker compose -f docker-compose.prod.yml logs api | grep webhook
   ```
3. Verificar que las variables de entorno estén correctas
4. Procesar webhooks pendientes manualmente:
   ```bash
   docker compose -f docker-compose.prod.yml exec api pnpm billing:retry-webhooks
   ```

### Si el sitio está completamente caído

1. Verificar que el VPS esté respondiendo:
   ```bash
   ping tu-servidor.com
   ```

2. Conectar por SSH:
   ```bash
   ssh deploy@tu-servidor.com
   ```

3. Verificar que Docker esté corriendo:
   ```bash
   systemctl status docker
   ```

4. Levantar todos los servicios:
   ```bash
   cd /opt/rutanomada
   docker compose -f docker-compose.prod.yml up -d
   ```

5. Si nada funciona, reiniciar el servidor:
   ```bash
   sudo reboot
   ```

---

## 📞 Contactos de Emergencia

| Rol | Nombre | Contacto |
|-----|--------|----------|
| **DevOps** | - | devops@rutanomada.com |
| **Backend** | - | backend@rutanomada.com |
| **Frontend** | - | frontend@rutanomada.com |
| **Soporte** | - | soporte@rutanomada.com |
| **Hosting** | - | Ticket en panel del VPS |
| **Google Maps** | - | Google Cloud Support |
| **Stripe** | - | Stripe Support |

---

## ✅ Sign-off Final

Antes de declarar el sistema en producción:

- [ ] **Desarrollador principal** aprobó el despliegue
- [ ] **QA** ejecutó pruebas de smoke testing
- [ ] **Seguridad** revisó el checklist de seguridad
- [ ] **Ops** verificó la infraestructura
- [ ] **Producto** aprobó la funcionalidad
- [ ] **Documentación** está actualizada
- [ ] **Monitoreo** está configurado
- [ ] **Backups** están funcionando
- [ ] **Plan de contingencia** está documentado
- [ ] **Equipo** conoce los procedimientos de emergencia

---

**Fecha de despliegue**: _______________

**Responsable**: _______________

**Versión**: _______________

**Notas**: _______________

---

*Este checklist debe completarse para cada despliegue a producción. Archivar copia firmada.*
