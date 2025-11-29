## Deployment Guide (Prod-ish via docker-compose.prod.yml)

### Prereqs
- Docker + Docker Compose installed.
- Secrets ready:
  - `POSTGRES_PASSWORD`
  - `JWT_SECRET`
  - `ALLOWED_ORIGINS` (comma-separated, e.g., `https://app.example.com`)
  - Optional: `VITE_MAPBOX_TOKEN`
  - `VITE_API_URL` (frontend -> backend URL; defaults to `http://localhost:8000`)

### 1) Prepare env file
Create `.env.prod` in `infra/`:
```
POSTGRES_PASSWORD=change-me
JWT_SECRET=change-me
ALLOWED_ORIGINS=https://app.example.com
VITE_API_URL=https://api.example.com
VITE_MAPBOX_TOKEN=your-mapbox-token
```

### 2) Build and start
```
cd infra
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Services:
- db (Postgres + PostGIS)
- backend (Express)
- frontend (Vite build served via dev server; swap to nginx for production hardening if desired)
- ai-service (FastAPI)

### 3) Apply migrations + seeds
```
docker compose -f docker-compose.prod.yml --env-file .env.prod exec backend npm run migrate
docker compose -f docker-compose.prod.yml --env-file .env.prod exec backend npm run seed
```

### 4) Health checks
- Backend: `curl http://localhost:8000/health`
- Frontend: open `http://localhost:3000`
- AI: `curl http://localhost:9000/classify` with sample body

### 5) Notes / Hardening
- Add a reverse proxy (nginx/traefik) for TLS termination and static frontend hosting.
- Set DB backups, strong passwords, and restricted network access.
- Ensure `ALLOWED_ORIGINS` matches deployed domains; set `BODY_LIMIT` if needed.
- GIS: production DB has indexes (status, assigned_agency_id, geom GIST).

### 6) Tear down
```
docker compose -f docker-compose.prod.yml --env-file .env.prod down
```
