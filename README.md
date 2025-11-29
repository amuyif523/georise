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

## CI
- GitHub Actions workflow runs lint + build for backend and frontend on push/PR. Current status: green.

## Demo Script (short)
1) Citizen: register/login → verify ID (mock OTP) → submit incident with lat/lng → see AI classification and status history on detail.
2) Agency staff (seeded): login → view `/agency/incidents` → open an incident → verify/assign/mark responding/resolved → watch status history and map markers.
3) Admin (seeded): login → `/admin/summary` for counts, `/admin/users` to update verification status, `/admin/agencies` to edit agency info, `/admin/verification` to approve/reject pending requests.

## Run Locally
- Backend: `cd backend && npm install && npm run migrate && npm run dev`
- Frontend: `cd frontend && npm install && npm run dev -- --host --port 3000`
- AI service: `cd ai-service && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 9000`
- Compose (dev): `cd infra && docker compose up --build`
- Seeds: `cd backend && npm run seed` (adds demo admin/incidents)

