# GEORISE — Full Feature & Excellence Checklist (Updated)

Use this as the master list for a world‑class release.

## 1) Core Product Flows
- Auth/RBAC: clear errors, lockout handling, password reset stub, session expiry UX; role route guards.
- Citizen:
  - Incident draft/auto-save; validation; lat/lng picker; category select; anti-spam cooldown.
  - My Reports: filters (status/category/date), pagination, status history timeline, AI classification + confidence with “why” tooltip.
  - Verification: mock OTP + resend; banners/status chips; block reporting if unverified; optional reputation score (admin-only).
  - Tutorials/tooltips; localization (English + Amharic).
  - **Offline-first (optional but excellent)**: local draft storage, background sync when online, graceful offline errors.
- Agency:
  - Multi-tab dashboard (Queue / Map / Analytics / Recent Actions); live-refresh toggle.
  - Queue filters (status/category/time/bbox), pagination, “assigned to me/my agency”; bulk reassignment; suspected-false flag.
  - Incident detail: verify/assign/respond/resolve with notes; history timeline; AI info; cross-agency escalation.
  - Field/staff reporting (mobile-friendly, current GPS, defaults to their agency).
  - Geo-fence alerts: notify when new incident appears inside jurisdiction.
  - Agency-type dashboards (police/fire/medical/military) with KPIs (open/assigned/responding/SLA).
- Admin:
  - Dashboards: counts, recent status changes, AI reclass log, system health (AI/DB/API).
  - Users: list/search/filter, update verification status; bulk actions.
  - Agencies: list/edit type/city/jurisdiction; add/remove staff; system config panel (AI thresholds, severity scaling, map defaults, timeouts).
  - Verification: approve/reject pending; history/audit; bulk approve/reject; audit trail explorer.
  - **Advanced admin**: feature flags (toggle AI, map layers), system-wide announcement banner, multi-admin approval for high-risk actions.

## 2) Data & Domain
- Agencies: multiple types seeded with locations/polygons; staff linkage.
- Incidents: diverse seeds (locations/categories/statuses/severities) with AI outputs.
- Taxonomy: categories → subcategories → codes; severity matrix.
- Integrity assurance (renamed from fraud): location anomalies, unusual submission patterns; citizen reputation (admin-only).
- Multi-source ingestion (future): Telegram/WhatsApp bots, call center UI.
- Integrity: soft delete + archival, retention policy (e.g., archive resolved > 90 days), merge/dedup table.
- **Consistency rule**: timestamps UTC ISO8601; coordinates EPSG:4326; severity 0–5.

## 3) UI/UX
- Branding/theming: light/dark, palette, icons, accessibility contrast.
- Navigation: role-aware persistent nav, breadcrumbs (admin/agency), visible logout.
- UX depth: keyboard shortcuts (/ search), command palette, sticky action bars, skeleton loaders.
- Forms: strong validation, helpful errors, disabled on submit.
- Lists/tables: sorting, filtering, pagination; status badges, category chips.
- Maps: legend, bbox hint, layer toggles, time slider.
- Mobile: bottom nav for citizens, swipeable incident cards, simplified mobile map clustering.
- Notifications: notification center (filters, read/unread), retry for failed sends.

## 4) GIS
- API: `/gis/incidents` bbox/time/status/category filters; caps/pagination; bbox required for heavy queries.
- Jurisdiction filtering; agency polygons/centers on map; nearest-agency hint; optional responder layer.
- Advanced queries: within X meters; near critical infrastructure; trending last N hours.
- Performance: spatial caching, precomputed heatmap tiles, nightly index maintenance; **virtualized marker rendering / on-demand tiles** for 1000+ markers.
- Overlays: hospitals, police stations, fire stations, water points, road closures/traffic, flood zones.
- Map UI: time slider, layer toggles, draw-polygon for custom spatial queries.
- Indexes: GIST on geom; supporting indexes (status/assigned/created_at).

## 5) AI (Explainability Suite)
- Current: MiniLM + logistic regression, confidence flag.
- Upgrade: stronger model; adjustable `AI_CONFIDENCE_THRESHOLD`; low-confidence badge; **AI review queue**.
- Routing: AI category/severity → recommended agency; auto-assign option with override.
- Explainability: “Why this classification” panel (groups low-confidence + review + explainability together).
- Human feedback: reclass_human_feedback; retraining dataset.
- Optional: dedup detection; summarization; entity extraction; multi-language; hazard prediction (future).

## 6) Security & Observability
- Auth: JWT expiry + refresh; password hashing; IP/user rate limits; JWT blacklist on password reset.
- Geo-fencing: prevent far-away submissions unless allowed.
- CORS locked for prod; BODY_LIMIT set; secrets via env templates (no secrets in repo).
- Logging: correlation IDs; clean errors; append-only/tamper-resistant history (optional signing); hashed incident detail logs.
- Metrics/monitoring: endpoint latency, AI response times, DB slow queries, GIS errors, verification failure spikes.
- Audit permissions: audit viewer restricted to admin; history append-only.
- TLS/Proxy: Nginx/Traefik guidance, health checks, port exposure.
- **Ethical & Privacy layer**: fairness/bias awareness; privacy-by-design; data minimization; ethical AI usage notes.
- **Privacy Threat Model (lite STRIDE)**: spoofing (fake reports) → verification/geofencing; tampering → append-only logs; repudiation → audits; disclosure → RBAC/minimization; DoS → rate limits; privilege escalation → RBAC/enforcement.

## 7) Testing
- Backend: unit (auth/service, AI client); integration (auth/login, verification gate, incident create + AI store, agency verify/assign/respond/resolve, admin verification, GIS bbox/polygon/nearest).
- GIS suite: bbox queries, polygon intersection, nearest agency calc.
- AI tests: thresholds, fallback logic.
- Security tests: brute-force, authz bypass attempts, GIS payload overflow, fake verification attempts.
- Frontend: Vitest/RTL for login, report form, agency actions, admin approvals.
- E2E (Playwright): citizen → agency → admin scenario.
- Collections: Postman/Newman smoke; optional CI job.
- CI: lint + test + build frontend/backend; optional newman.

## 8) Performance & Scalability
- Caching: Cloudflare/front cache; Redis for AI outputs and GIS queries.
- Heavy query controls: bbox requirement, dynamic pagination, lazy-loading map markers.
- AI perf: optional GPU, batch inference, model quantization.
- DB perf: indexes, VACUUM/ANALYZE guidance.
- **Map performance**: virtualized markers / on-demand tiles for large incident sets.
- **Scalability targets** (example): support 1k incidents/day at MVP; scalable to 50k/day city-wide; map render <500ms for ≤5k markers; GIS bbox query <200ms with GIST; plan for 10k/100k/1M incident growth trajectories.

## 9) Deployment & Resilience
- Compose prod validated; env templates; migrations authoritative.
- Seed script idempotent (upserts passwords/roles/agencies/staff/citizens/incidents).
- Blue/green deploy (tags); zero-downtime restarts with healthchecks.
- Automated backups; migration scripts; monitoring hooks (Grafana/Prometheus optional).
- Deployment guide: build/run, migrate, seed, health checks, backup policy, prod CORS/TLS.
- **Notification delivery queue**: retry queue, rate-limited delivery, dead-letter queue (design/implementation).
- **Backup & DR**: RTO/RPO targets, DB snapshot automation, restore procedure.

## 10) Future Work / Nice-to-Haves
- Real ID verification API (replace mock OTP).
- WebSockets/live feed for agency/admin dashboards.
- Push/SMS/email notifications for status changes.
- Stronger AI model and reclass tooling; hazard prediction maps.
