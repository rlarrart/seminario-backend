# MiniMax Backend — Guía de Desarrollo y Arquitectura

Guía para levantar el entorno de desarrollo: base de datos PostgreSQL y API NestJS con hot-reload.

---

## Prerrequisitos

- [Docker](https://docs.docker.com/get-docker/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)
- [Node.js](https://nodejs.org/) (v20+) — solo si se ejecuta la API fuera de Docker

Verificar instalación:

```bash
docker --version
docker compose version
```

---

## Configuración Inicial

### 1. Variables de entorno

Copiar la plantilla y ajustar si es necesario:

```bash
cp .env.example .env
```

Los valores por defecto ya están listos para desarrollo local:

| Variable | Valor | Descripción |
|---|---|---|
| `PORT` | `3001` | Puerto de la API |
| `FRONTEND_URL` | `http://localhost:5173` | Origen CORS del frontend |
| `DB_HOST` | `localhost` | Host de PostgreSQL |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_USERNAME` | `postgres` | Usuario de la BD |
| `DB_PASSWORD` | `postgres` | Contraseña de la BD |
| `DB_NAME` | `minimax_dev` | Nombre de la BD |
| `JWT_SECRET` | `super_secret_key_...` | Clave para firmar tokens JWT |
| `JWT_EXPIRES_IN` | `7d` | Expiración del token |

---

## Modo A — Solo PostgreSQL en Docker (recomendado para desarrollo)

Ejecutar la base de datos en Docker y la API localmente con hot-reload. Este es el flujo más ágil para desarrollo.

```bash
# 1. Levantar PostgreSQL
docker compose up -d postgres

# 2. Verificar que está saludable
docker compose ps

# 3. Instalar dependencias (primera vez)
npm install

# 4. Poblar la BD con datos de prueba
npm run seed

# 5. Levantar la API con hot-reload
npm run start:dev
```

La API estará en `http://localhost:3001/api` y se recargará automáticamente al guardar cambios.

---

## Modo B — Todo en Docker (API + PostgreSQL)

Levanta ambos servicios en contenedores. La API se ejecuta con `start:dev` y el código fuente se monta como volumen para mantener el hot-reload.

```bash
# Construir y levantar ambos servicios
docker compose up -d --build

# Ver los logs en tiempo real
docker compose logs -f api
```

> **Nota:** cuando se usa este modo, `DB_HOST` se sobreescribe automáticamente a `postgres` (nombre del servicio interno de Docker). No hace falta tocar el `.env`.

Los archivos `src/`, `tsconfig.json`, `tsconfig.build.json` y `nest-cli.json` se montan como volúmenes, por lo que cualquier cambio en el código se refleja al instante dentro del contenedor.

---

## Scripts de NestJS (Fuera de Docker)

Si estás trabajando con Node.js en tu host, puedes utilizar los scripts estándar de NestJS:

```bash
# Instalar dependencias
$ npm install

# Desarrollo
$ npm run start
$ npm run start:dev  # watch mode (hot-reload)
$ npm run start:prod # production mode

# Testing
$ npm run test
$ npm run test:e2e
$ npm run test:cov
```

---

## Comandos Útiles de Docker

### Gestión de servicios

```bash
# Ver estado de los contenedores
docker compose ps

# Detener sin perder datos
docker compose down

# Detener y BORRAR datos de la BD
docker compose down -v

# Reconstruir imagen de la API tras cambio en dependencias
docker compose up -d --build api

# Reiniciar solo la API
docker compose restart api
```

### Logs

```bash
# Todos los servicios
docker compose logs -f

# Solo la API
docker compose logs -f api

# Solo PostgreSQL
docker compose logs -f postgres
```

### Acceso directo a la Base de Datos

```bash
# Desde el contenedor
docker compose exec postgres psql -U postgres -d minimax_dev

# Desde el host (requiere psql instalado)
psql -h localhost -p 5432 -U postgres -d minimax_dev
```

Consultas útiles dentro de `psql`:

```sql
-- Ver todas las tablas
\dt

-- Contar registros por tabla
SELECT 'users' AS tabla, COUNT(*) FROM users
UNION ALL SELECT 'opportunities', COUNT(*) FROM opportunities
UNION ALL SELECT 'adhesions', COUNT(*) FROM adhesions
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL SELECT 'contact_requests', COUNT(*) FROM contact_requests;
```

---

## Resolución de Problemas

| Problema | Solución |
|---|---|
| `port 5432 already in use` | Otro PostgreSQL está corriendo. Detenerlo: `sudo systemctl stop postgresql` |
| `ECONNREFUSED` al conectar | Verificar que PostgreSQL esté levantado: `docker compose ps` |
| Seed falla con conexión | Asegurar que `DB_HOST=localhost` en `.env` si se ejecuta fuera de Docker |
| Cambios no se reflejan (Modo B) | Verificar que los volúmenes estén montados: `docker compose logs api` |
| FATAL: password authentication failed | Ocurre porque la BD retuvo el config viejo. Usar: `docker compose down -v` y levantar de nuevo |
