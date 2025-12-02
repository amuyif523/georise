# Implementation Strat 2.0 — Remaining Work Plan

This plan covers what’s left from the Full Feature & Excellence Checklist. Foundation (auth/RBAC, basic citizen reporting with AI stored/displayed, basic agency/admin, geom + GIS endpoint, seeds, consistency rules) is done.

## Gap Checklist (fix before/during Sprint 1)
- Agency domain: only one agency type seeded; no police/fire/medical/military differentiation; no assignment assist UI/API; no KPIs per agency type.
- GIS: no overlays (hospitals/police/fire/traffic/flood), no layer toggles/time slider/draw-polygon, no advanced queries (within X meters/critical infra/trending), no virtualized markers at scale.
- AI: no explainability panel or AI review queue UI; routing suggestions not surfaced; stronger model options not wired; no human feedback UI.
- UX/Navigation: theming/branding minimal; no command palette/shortcuts; breadcrumbs missing; notification center absent; mobile nav/cards missing; admin logout/menus minimal.
- Security/Privacy (updated): JWT refresh/blacklist implemented (access rotation, logout revokes jti); geofencing enforced on incident create via `GEO_BBOX`; prod CORS/body-limit guard added (ALLOWED_ORIGINS required in prod); password reset/lockout UX stubbed (forgot/reset endpoints, login lockout hint); ethical/privacy/threat model surfaced below; frontend auto-refresh on 401 added in api client.
- Notifications/Queueing: no queue/worker, no retry/DLQ, no notification center UI.
- Performance/Scalability (in progress): in-memory GIS cache added; optional Redis cache wired (set REDIS_URL to enable); GIS requires bbox + page/limit (server cap via GIS_MAX_PAGE_SIZE); agency map lazy-loads markers with “load more” paging; Cloudflare/front-cache guidance added to README.
- Deployment/DR: DR/backup plan documented; still need automation for snapshots/restore and basic monitoring hooks.
- Testing: minimal coverage; missing GIS suite, AI threshold/fallback tests, security/bruteforce tests, Playwright E2E, Newman in CI.
- Admin advanced: no feature flags, announcement banner, two-person approval, audit trail explorer UI.
- Offline/WebSockets: not implemented (stretch).

## Sprints (remaining work)
### Sprint 1: Agency & Domain Depth
- Seed multiple agency types (police/fire/medical/military) with locations/polygons; link staff; diverse incidents with AI outputs.
- Agency-type dashboards with KPIs (open/assigned/responding/SLA).
- Assignment assist: AI category/severity + recommended agency; nearest agency/unit suggestion; manual override; cross-agency escalation path.
- Field/staff reporting (mobile-friendly, current GPS, default to their agency).
- Geo-fence alerts when new incident appears in jurisdiction.
- Data taxonomy/severity matrix; integrity assurance rules (location anomalies, unusual patterns, citizen reputation admin-only).

### Sprint 2: GIS & Map UX/Performance
- Overlays/layers: hospitals, police, fire, water points, traffic/road closures, flood zones; agency polygons/centers.
- Map UI: layer toggles, time slider, draw-polygon queries; legend/bbox hints.
- Advanced queries: within X meters, near critical infrastructure, trending last N hours; enforce bbox/limits.
- Performance: virtualized markers/on-demand tiles for 1000+ markers; spatial caching/precomputed heatmap tiles; nightly index maintenance.
- Jurisdiction filtering solid; nearest-agency hint surfaced in UI; optional responder layer.

### Sprint 3: AI Explainability & Routing
- AI explainability suite: low-confidence badge, AI review queue UI, “why this classification” panel.
- Routing surfaced: category/severity + recommended agency; auto-assign option with override.
- Human feedback loop: reclass_human_feedback UI; feed retraining dataset.
- Optional: stronger model, dedup detection, summarization/entity extraction, multi-language.

### Sprint 4: UX, Notifications, Security/Privacy
- UX polish: branding/theming (light/dark, palette, icons, accessibility), command palette/shortcuts, sticky action bars, skeleton loaders, mobile nav/cards, notification center (read/unread, retry UX).
- Navigation: role-aware persistent nav, breadcrumbs for admin/agency, visible logout everywhere.
- Notifications: queue design with retry + rate limit + DLQ (worker).
- Security/Observability: JWT refresh/blacklist; IP/user rate limits; geo-fencing enforcement; structured logs with correlation IDs; metrics (latency/counts/AI/GIS/verification spikes); ethical/privacy notes; lite STRIDE mitigations.

### Sprint 5: Performance, Testing, DR & Offline (stretch)
- Caching/perf: Redis for AI outputs and GIS queries (optional upgrade); Cloudflare/front cache guidance; bbox requirement; dynamic pagination; lazy/virtualized map markers (baseline done; consider server-side clustering for 5k+).
- AI perf: optional GPU, batch inference, quantization.
- DB perf: indexes (status/assigned/created_at/geom), VACUUM/ANALYZE guidance.
- Notification worker: retries with backoff, DLQ storage.
- DR: backups/snapshots, documented restore, RTO/RPO targets.
- Scalability targets (set now): handle 1k incidents/day MVP; scalable to 50k/day; map render target <500ms for ≤5k markers; GIS bbox query target <200ms with GIST; plan for 10k/100k/1M growth; peak-load simulation goals.
- Testing: GIS suite (bbox/polygon/nearest), AI thresholds/fallback, security (bruteforce/authz bypass/GIS overflow), frontend Vitest, Playwright E2E (citizen+agency+admin), Postman/Newman smoke, CI lint+test+build (add newman job).
- Offline-first (stretch): local draft storage, offline banner, background sync; WebSockets/live feed for agency/admin; optional real ID API, Telegram/WhatsApp bots, hazard prediction maps.

## Execution Order
- Work Sprints 1 + 2 + 3 + 4; Sprint 5 is stretch/perf/DR/offline once core is stable.
- Each sprint should end with a demoable slice (UI + API + DB + tests) tied to checklist items above.

## Threat Model (lite STRIDE) & Ethics/Privacy Notes
- Spoofing (fake reports): mitigate with verification + geofence; rate limits on auth/verification/incident create.
- Tampering (incident history): append-only history tables; avoid destructive updates to status logs.
- Repudiation: audit status history and AI reclass logs with actor + timestamp.
- Information Disclosure: RBAC on routes; minimal PII stored; CORS locked in prod; BODY_LIMIT enforced.
- DoS: rate limits on auth/verification/incidents; bbox required on heavy GIS queries.
- Elevation of Privilege: role checks on sensitive routes (admin/agency).
- Ethics/Privacy: purpose limitation, data minimization, fairness awareness for AI outputs, human override for low-confidence AI, retention policy (archive resolved > 90 days), communicate data use to users.
