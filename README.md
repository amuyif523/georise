# GEORISE

Full-stack incident reporting with GIS and AI classification.

## Structure
- `frontend/` (React + Vite + Leaflet/Mapbox)
- `backend/` (Express + Postgres/PostGIS)
- `ai-service/` (FastAPI + sentence-transformers)
- `infra/` (docker-compose dev/prod)
- `.github/` (CI)

## Environment setup
- Create `.env` in each service from the provided examples.
  - backend: `DATABASE_URL`, `JWT_SECRET`, `AI_SERVICE_URL`, `AI_CONFIDENCE_THRESHOLD`, `ALLOWED_ORIGINS`, `BODY_LIMIT`
  - frontend: `VITE_API_URL`, `VITE_MAPBOX_TOKEN` (optional; falls back to OSM)
  - ai-service: port and defaults; no secrets required
- Dev compose: `cd infra && docker compose up --build`
- Migrate + seed: `cd backend && npm run migrate && npm run seed`
  - Seeds: admin@example.com/admin123, staff@example.com/staff123, citizen.verified@example.com/citizen123, citizen.unverified@example.com/citizen123

## Caching & scaling (perf quick notes)
- Static assets: serve via CDN (e.g., Cloudflare) with long cache headers; keep API responses short-TTL.
- GIS GETs: require bbox, cap page size with `GIS_MAX_PAGE_SIZE`, and use short TTL via `GIS_CACHE_MS`; set `cluster=1` to get server-side clustering for large marker sets.
- AI classify: cached briefly (`AI_CACHE_MS`, ms). Redis optional—set `REDIS_URL` to enable; otherwise in-memory cache is used.
- Frontend map: fetches by bbox with paging and supports cluster mode; keep CDN caching on built assets enabled.

## CI
- GitHub Actions runs lint + test (when present) + build for backend and frontend on push/PR.

## Demo (short)
1) Citizen: register/login → verify (mock OTP) → report incident with lat/lng → view AI classification, confidence, model version, and status history.
2) Agency staff: login → `/agency/incidents` → open incident → verify/assign/respond/resolve → see map markers/heatmap/cluster + status history.
3) Admin: login → `/admin/summary` for counts → `/admin/users` to update verification status → `/admin/agencies` to edit → `/admin/verification` for approvals and history.

## Production (compose)
- See `docs/DEPLOYMENT.md` for env, build/run, migrations/seeds, and hardening notes.
