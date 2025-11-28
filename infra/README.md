# Infra

- `docker-compose.yml`: Postgres+PostGIS ready; backend/frontend/ai-service stubs are commented until their Dockerfiles exist.
- `postgres/init.sql`: enables PostGIS extension; add seeds later if desired.
- Usage: `docker compose up db` (from infra/) to start the database locally.

