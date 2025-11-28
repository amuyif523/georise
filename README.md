# GEORISE

Monorepo scaffold for the senior project.

## Structure
- frontend/  (React/Vite app)
- backend/   (API service)
- ai-service/ (AI microservice stub)
- infra/     (docker-compose, db init)
- .github/   (CI workflow)

## Next Steps
- Create real `.env` from the examples in backend/, frontend/, ai-service/ before running locally.
- In `infra/`, run `docker compose up --build` to start db + backend + frontend.
- Add AI service stub (FastAPI) when starting Slice 4.
- Seed demo data for Slice 1 (admin, agency, citizens) once schema exists.

