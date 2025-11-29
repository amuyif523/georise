# 🚀 GEORISE — Elite Completion Checklist (Upgraded)

This is the full world‑class feature/UX/quality bar to take the platform from “working” to “elite”.

## 1) Core Product Flows (Citizens, Agency, Admin)
- Auth/RBAC polish: clear errors, lockout handling, password reset stub, session expiry UX.
- Citizen:
  - Incident draft/auto-save; validation; lat/lng picker; category select; cooldown (anti-spam).
  - My Reports with filters (status/category/date), pagination, status history timeline, AI classification + confidence with “Why AI is unsure” tooltip.
  - Verification flow: mock OTP + resend; banners/status chips; block reporting if unverified; optional reputation score (admin-only view).
  - In-app tutorials/tooltips; localization (English + Amharic).
- Agency:
  - Multi-tab dashboard (Queue / Map / Analytics / Recent Actions); live-refresh toggle.
  - Queue filters (status/category/time/bbox), pagination, “assigned to me/my agency”; bulk reassignment; “suspected false report” flag.
  - Incident detail: verify/assign/respond/resolve with notes; status history timeline; AI info; cross-agency escalation.
  - Field/staff reporting (mobile-friendly, current GPS, defaults to their agency).
  - Geo-fence alerts: notify when new incident appears inside jurisdiction.
  - Tailored dashboards by agency type (police/fire/medical/military) with KPIs (open/assigned/responding/SLA).
- Admin:
  - Dashboards: counts, recent status changes, AI reclass log, system health (AI up/down, DB, latency).
  - Users: list/search/filter, update verification status; bulk actions.
  - Agencies: list/edit type/city/jurisdiction; add/remove staff linkage; system config panel (AI thresholds, severity scaling, map defaults, timeouts).
  - Verification: approve/reject pending; history/audit; bulk approve/reject; Audit Trail Explorer.

## 2) Data & Domain
- Agencies: multiple types seeded (police, fire, medical, military) with locations/polygons; staff linkage.
- Incident taxonomy: categories → subcategories → codes; severity matrix (multi-parameter).
- Fraud/abuse rules: location anomalies, unusual submission patterns; citizen reputation (admin-only).
- Multi-source ingestion (future): Telegram/WhatsApp bots, call center UI.
- Data integrity: soft delete + archival, retention (e.g., archive resolved > 90 days), incident merge/dedup table.

## 3) UI/UX (World-Class)
- Theming/branding: light/dark, palette, icons, accessibility contrast.
- UX depth: breadcrumbs (admin/agency), keyboard shortcuts (/ search), command palette, sticky action bars on long pages, skeleton loaders.
- Navigation: role-aware persistent nav, clear logout everywhere.
- Forms: strong validation, helpful errors, disabled on submit.
- Lists/tables: sorting, filtering, pagination; status badges, category chips.
- Maps: legend for markers/heatmap/cluster; bbox hint; layer toggles; time slider.
- Mobile: bottom nav for citizens, swipeable incident cards, simplified mobile map clustering.
- Notifications UX: notification center (filters, read/unread), retry for failed notifications.

## 4) GIS Excellence
- API: `/gis/incidents` with bbox/time/status/category filters; caps/pagination; bbox required for heavy queries.
- Jurisdiction filtering for agency staff; agency polygons/centers on map; nearest-agency hint; optional responder layer.
- Advanced queries: incidents within X meters; near critical infrastructure; trending last N hours.
- Performance: spatial caching, precomputed heatmap tiles, nightly index maintenance.
- Overlays: hospitals, police stations, fire stations, water points, road closures/traffic, flood zones.
- Map UI: time slider, layer toggles, draw-polygon for custom spatial queries.
- Indexes: GIST on geom (present), plus supporting indexes.

## 5) AI Excellence
- Current: MiniLM + logistic regression with confidence flag.
- Upgrade: stronger model; adjustable `AI_CONFIDENCE_THRESHOLD`; low-confidence badge and “AI Review Queue”.
- Routing: map AI category/severity to recommended agency; auto-assign option with override.
- Explainability: “Why this classification” panel.
- Human corrections: feed reclass_human_feedback; build retraining dataset.
- Optional: duplicate detection; summarization; entity extraction (weapons/injuries/counts); multi-language (Amharic/English); hazard prediction maps (future).

## 6) Security & Observability (Level Up)
- Auth: JWT expiry + refresh; password hashing; IP/user rate limits (login/verify/incident); JWT blacklist on password reset.
- Geo-fencing: prevent far-away incident submissions unless allowed.
- CORS locked for prod; BODY_LIMIT set.
- Secrets: env templates for all services; no secrets in repo; README/DEPLOYMENT instructions.
- Logging: correlation IDs (present), clean error logs; append-only/tamper-resistant incident history (digitally signed optional); hashed incident detail logs for chain-of-custody.
- Metrics/Monitoring: endpoint latency, AI response times, DB slow queries, GIS errors, verification failure spikes.
- Audit permissions: audit trail viewer restricted to admin; incident history append-only.
- TLS/Proxy: Nginx/Traefik guidance, health checks, port exposure.

## 7) Testing
- Backend: unit (auth/service, AI client); integration (auth/login, verification gate, incident create + AI store, agency verify/assign/respond/resolve, admin verification, GIS bbox/polygon/nearest).
- GIS suite: bbox queries, polygon intersection, nearest agency calc.
- AI tests: classification thresholds, fallback logic.
- Security tests: brute-force login, authz bypass attempts, GIS payload overflow, fake verification attempts.
- Frontend: Vitest/RTL for login, report form validation, agency actions, admin approvals.
- E2E (Playwright): full citizen → agency → admin scenario.
- Collections: Postman/Newman smoke; optional CI job.
- CI: lint + test + build frontend/backend; optional newman job.

## 8) Performance
- Caching: Cloudflare/front cache; Redis for AI outputs and GIS queries.
- Heavy query controls: bbox requirement, dynamic pagination, lazy-loading map markers.
- AI perf: optional GPU, batch inference, model quantization.
- DB perf: indexes (status/assigned/geom/created_at), VACUUM/ANALYZE guidance.

## 9) Deployment
- Compose prod validated; env templates present; migrations authoritative (no init-time DDL).
- Seed script idempotent (upserts passwords/roles/agencies/staff/citizens/incidents).
- Blue/green deploy (via tags); zero-downtime restarts with healthchecks.
- Automated backups; migration scripts for updates; monitoring hooks (Grafana/Prometheus optional).
- Deployment guide: build/run, migrate, seed, health checks, backup policy, prod CORS/TLS.

## 10) Future Work / Nice-to-Haves
- Real ID verification API (replace mock OTP).
- WebSockets/live feed for agency/admin dashboards.
- Push/SMS/email notifications for status changes.
- Stronger AI model and reclass tooling; hazard prediction maps.
