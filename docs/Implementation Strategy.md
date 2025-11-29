## 1. Implementation Strategy

### 1.1 Recommended Approach: **Hybrid Vertical-Slice**

We **do not** go:

- Frontend-first → you end up with pretty but fake UIs, no real system.
    
- Backend-first → you end up with APIs that don’t quite match real UX.
    
- Pure page-by-page → you risk building random pages without end-to-end value.
    

Instead we use a **hybrid vertical-slice approach**:

> Each slice = a small, fully working feature from **UI → API → DB → (AI/GIS if needed) → tests → mini demo.**

Why this is safest for a student team:

- You always have something demo-able for advisor / coordinator.
    
- If you run out of time, you **still have a coherent system**, just with fewer features.
    
- Bugs are easier to find because each slice is small.
    
- It avoids “big bang” integration hell at the end.
    

### 1.2 What Vertical Slices Look Like for GEORISE

Each slice will:

1. Add or refine **1 user story** (e.g. “Citizen can report incident”).
    
2. Touch **frontend** (new screen / button / flow).
    
3. Touch **backend** (1–3 endpoints).
    
4. Touch **DB** (read/write on existing tables).
    
5. Optionally touch **AI** or **GIS** for that story.
    
6. Include **quick tests** + a **mini demo** (you can show to advisor).
    

Example:

> Slice: “Verified citizen can submit a basic incident report saved in DB.”

- UI: “Report Incident” form + success toast.
    
- API: `POST /citizen/incidents`.
    
- DB: write to `incidents` table with a simple `status='RECEIVED'`.
    
- Tests: one unit test + one Postman test.
    
- Demo: log in as citizen, submit incident, show it in DB and in “My Reports”.
    

---

## 2. High-Level Phases (Zero → Demo)

Let’s assume ~**14 weeks** total until final submission. We’ll use **6 phases**.

### Phase 0 – Project Setup & Tooling (Week 1)

- **Goal:** Have a clean repo, CI, and local dev environment working for the full stack.
    
- **Done When:**
    
    - Frontend runs at `http://localhost:3000`.
        
    - Backend runs at `http://localhost:8000` (or 5000).
        
    - Postgres + PostGIS running via Docker.
        
    - Simple health-check endpoint and page working.
        
- **Roles with features:** None yet, just skeleton.
    
- **Demo:** “Hello, GEORISE” on frontend calling backend `/health`.
    

---

### Phase 1 – Auth + RBAC Skeleton (Weeks 2–3)

- **Goal:** Users can sign up, log in, and have roles (Citizen, AgencyStaff, Admin).
    
- **Done When:**
    
    - JWT auth implemented.
        
    - Basic RBAC middleware in backend.
        
    - React routes protected by role.
        
- **Roles with features:** Citizen, Agency Staff, Admin can all log in and see different dashboards.
    
- **Demo:** Show login and three different dashboards (empty placeholders).
    

---

### Phase 2 – Citizen Portal MVP (Weeks 4–6)

- **Goal:** Verified citizen can report incidents and see their own incident history.
    
- **Done When:**
    
    - Citizen signup/login.
        
    - FAYDA mock verification flow.
        
    - Citizen dashboard (unverified → verified).
        
    - Basic “Report Incident” (no AI/GIS first, then add AI).
        
    - “My Reports” list + details page.
        
- **Demo:** Full citizen journey: register → verify → report → see status.
    

---

### Phase 3 – Agency Portal MVP (Weeks 7–8)

- **Goal:** Agency staff can view and manage incidents assigned to their agency.
    
- **Done When:**
    
    - Agency user can log in.
        
    - Agency incident list + detail view.
        
    - Basic workflow: verify → assign → mark in-progress → resolved.
        
    - Simple analytics (counts, maybe one chart).
        
- **Demo:** Show real incident created by citizen showing up for agency and being processed.
    

---

### Phase 4 – Admin & Verification Control (Weeks 9–10)

- **Goal:** System Admin can manage agencies, users, and FAYDA verification oversight.
    
- **Done When:**
    
    - Admin portal with user list, agencies list.
        
    - Agency access request flow.
        
    - Admin can approve agencies.
        
    - Admin can review suspicious verifications (simple version).
        
- **Demo:** Admin approving a new agency + seeing data/stats overview.
    

---

### Phase 5 – AI & GIS Enhancements & Polish (Weeks 11–12)

- **Goal:** Add real GIS and AI intelligence on top of working flows.
    
- **Done When:**
    
    - Map integrated (Leaflet/Mapbox) on citizen and agency dashboards.
        
    - Incidents plotted on map with basic clustering.
        
    - AI classification + severity scoring integrated.
        
    - Simple heatmap in agency analytics.
        
- **Demo:** Show same incidents on the map, AI-labelled, with severity.
    

---

### Phase 6 – Testing, Hardening & Final Polish (Weeks 13–14)

- **Goal:** System stable, tested, documented, and presentation-ready.
    
- **Done When:**
    
    - Key test suites passing.
        
    - Known bugs acceptable / documented.
        
    - Screenshots captured, docs synced with reality.
        
- **Demo:** Final defense demo scenario runs smoothly end-to-end.
    

---

## 3. Detailed Task Breakdown per Phase

I’ll give **epics → tasks** with **S/M/L** estimates (Small/Medium/Large).

---

### 🔹 Phase 0 – Project Setup & Tooling

**Epic 0.1 – Repo & Basic Structure**

- Task: Create monorepo or multi-folder repo (`georise/frontend`, `backend`, `ai-service`, `infra`)
    
    - Files: root `README.md`, `.gitignore`, `/frontend`, `/backend`, `/ai-service`, `/infra`
        
    - Dep: None
        
    - Size: **S**
        
- Task: Initialize Node/Express backend project
    
    - Files: `backend/package.json`, `src/server.ts/js`
        
    - Size: **S**
        
- Task: Initialize React + Vite + Tailwind frontend
    
    - Files: `frontend/package.json`, `src/main.tsx`, etc.
        
    - Size: **S**
        

**Epic 0.2 – Infrastructure**

- Task: Create `docker-compose.yml` with services: `db`, `backend`, `frontend` (AI later)
    
    - Files: `/infra/docker-compose.yml`, `Dockerfile`s
        
    - Size: **M**
        
- Task: Setup Postgres + PostGIS container
    
    - Files: `infra/postgres/init.sql`, environment variables
        
    - Size: **M**
        

**Epic 0.3 – Tooling**

- Task: ESLint + Prettier in both frontend and backend
    
    - Size: **S**
        
- Task: Setup minimal CI (GitHub Actions or at least a script to run tests)
    
    - Size: **S**
        

---

### 🔹 Phase 1 – Auth + RBAC Skeleton

**Epic 1.1 – Backend Auth**

- Task: Implement `/auth/register` and `/auth/login`
    
    - Files: `backend/src/modules/auth/controller.ts`, `service.ts`, `routes.ts`
        
    - Dep: DB connection
        
    - Size: **M**
        
- Task: JWT issuing and verification middleware
    
    - Files: `backend/src/middleware/auth.ts`
        
    - Size: **M**
        
- Task: Seed roles in DB (Citizen, AgencyStaff, Admin)
    
    - Files: migration scripts
        
    - Size: **S**
        

**Epic 1.2 – RBAC Middleware**

- Task: Implement `requireRole(['ADMIN'])` style middleware
    
    - Files: `backend/src/middleware/rbac.ts`
        
    - Size: **S**
        
- Task: Add RBAC to sample protected routes (`/auth/me`, `/admin/ping`)
    
    - Size: **S**
        

**Epic 1.3 – Frontend Auth Shell**

- Task: Create public `Login` and `Register` pages
    
    - Files: `frontend/src/pages/public/Login.tsx`, `Register.tsx`
        
    - Size: **M**
        
- Task: Create basic `AuthContext` or token store (React Query or Zustand)
    
    - Files: `frontend/src/context/AuthContext.tsx`
        
    - Size: **M**
        
- Task: Redirect routes based on role to different dashboard placeholders
    
    - Files: routing config
        
    - Size: **M**
        

---

### 🔹 Phase 2 – Citizen Portal MVP

**Epic 2.1 – Citizen Registration & Verification (FAYDA Mock)**

- Backend:
    
    - Task: `/citizen/register` (wrapper around auth register)
        
        - Size: **S**
            
    - Task: `citizen_verifications` table (NationalID, phone, status)
        
        - Size: **M**
            
    - Task: `/citizen/verification/start` → store ID, send OTP (mock)
        
        - Size: **M**
            
    - Task: `/citizen/verification/confirm` → verify OTP, mark verified
        
        - Size: **M**
            
- Frontend:
    
    - Task: Citizen dashboard (unverified view)
        
        - Files: `CitizenDashboard.tsx`
            
        - Size: **M**
            
    - Task: FAYDA Verification page (ID form + OTP step)
        
        - Size: **M**
            

**Epic 2.2 – Incident Reporting (without AI/GIS first)**

- Backend:
    
    - Task: Create `incidents` table (id, reporter_id, description, category, status, created_at, etc.)
        
        - Size: **M**
            
    - Task: `POST /citizen/incidents`
        
        - Size: **M**
            
    - Task: `GET /citizen/incidents` (my incidents)
        
        - Size: **M**
            
    - Task: `GET /citizen/incidents/:id`
        
        - Size: **S**
            
- Frontend:
    
    - Task: “Report Incident” page (form)
        
        - Size: **M**
            
    - Task: “My Reports” page (list + filter)
        
        - Size: **M**
            
    - Task: “Incident Details” modal/page
        
        - Size: **M**
            
- Testing:
    
    - Postman collection for incident endpoints (**S**)
        
    - Frontend: simple test that form validates required fields (**S**)
        

**Epic 2.3 – Add AI Classification (Phase 2.5)**

- AI Microservice:
    
    - Task: Setup FastAPI `POST /classify` with stubbed logic returning fake category + severity
        
        - Size: **M**
            
- Backend:
    
    - Task: On incident creation, call AI service and store results in `incident_ai_outputs` table
        
        - Size: **M**
            
- Frontend:
    
    - Task: Show AI category + severity on incident detail
        
        - Size: **S**
            

---

### 🔹 Phase 3 – Agency Portal MVP

**Epic 3.1 – Agency Accounts & RBAC**

- Backend:
    
    - Task: `agencies` table (name, type, city, jurisdiction_geom nullable) (**M**)
        
    - Task: `agency_staff` table linking users to agencies (**M**)
        
    - Task: Seed one test agency + staff (**S**)
        
- Frontend:
    
    - Task: Agency Dashboard skeleton (list + map placeholder) (**M**)
        

**Epic 3.2 – Incident Queue & Workflow**

- Backend:
    
    - Task: `GET /agency/incidents` (filter by agency jurisdiction or assigned_agency_id) (**M**)
        
    - Task: `PATCH /agency/incidents/:id/verify` (**M**)
        
    - Task: `PATCH /agency/incidents/:id/assign` (**M**)
        
    - Task: `PATCH /agency/incidents/:id/status` (responding/resolved) (**M**)
        
- Frontend:
    
    - Task: Agency incident list page (**M**)
        
    - Task: Incident detail view with actions (**M**)
        
- DB:
    
    - Task: `incident_status_history` table for audit (**M**)
        

---

### 🔹 Phase 4 – Admin & Verification Control

**Epic 4.1 – Admin Management**

- Backend:
    
    - Task: `GET /admin/users`, `PATCH /admin/users/:id/status` (**M**)
        
    - Task: `GET /admin/agencies`, `PATCH /admin/agencies/:id` (**M**)
        
    - Task: `GET /admin/verification/pending`, `PATCH /admin/verification/:id` (**M**)
        
- Frontend:
    
    - Task: Admin dashboard + user table (**M**)
        
    - Task: Agency list page (**M**)
        
    - Task: Verification review page (**M**)
        

---

### 🔹 Phase 5 – AI & GIS Enhancements & Polish

**Epic 5.1 – GIS**

- Backend:
    
    - Task: Enable PostGIS extension (**S**)
        
    - Task: Add `geom` column (POINT) to `incidents` (**M**)
        
    - Task: `GET /gis/incidents` returning GeoJSON (**M**)
        
- Frontend:
    
    - Task: Map component (Leaflet/Mapbox) (**M/L**)
        
    - Task: Show incident markers (**M**)
        
    - Task: Basic clustering / heatmaps (**M/L**)
        

**Epic 5.2 – AI Enhancements**

- AI:
    
    - Task: Replace stub with real NLP model (DistilBERT / shallow model) (**L**)
        
    - Task: Severity scoring model (**M**)
        
- Backend:
    
    - Task: Add confidence, severity threshold logic (**M**)
        

---

### 🔹 Phase 6 – Testing & Hardening

- Fill out missing tests (unit + integration).
    
- Fix major bugs.
    
- Optimize obvious performance issues.
    

---

## 4. Vertical-Slice Implementation Order

Here’s the **exact slice order** you can follow.

---

### Slice 1 – Minimal Auth + “Hello, GEORISE”

- **User Story:**  
    “As any user, I can open the app, log in with a seeded account, and see a dashboard.”
    
- **Frontend Pages:**
    
    - Login page
        
    - Very simple dashboard per role (Citizen/Agency/Admin placeholders)
        
- **Backend Endpoints:**
    
    - `POST /auth/login`
        
    - `GET /auth/me`
        
- **DB Tables:**
    
    - `users`
        
    - `roles` (could be enum or separate table)
        
- **Tests:**
    
    - 1 backend unit test for login
        
    - 1 Postman test hitting `/auth/login`
        
- **Demo:**  
    Login as seeded Admin and show “Hello, Admin”.
    

---

### Slice 2 – Citizen Signup + Verified/Unverified State

- **User Story:**  
    “As a citizen, I can sign up and see that I am unverified until I complete verification.”
    
- **Frontend:**
    
    - Citizen signup page
        
    - Citizen dashboard with verification banner
        
    - FAYDA verification start page
        
- **Backend:**
    
    - `POST /citizen/register`
        
    - `POST /citizen/verification/start`
        
    - Fake OTP generation
        
- **DB:**
    
    - `citizen_verifications`
        
- **Tests:**
    
    - Verify unverified citizen can’t access reporting route.
        
- **Demo:**  
    Register as citizen → see “You are not verified” badge.
    

---

### Slice 3 – Basic Incident Reporting (No AI/GIS)

- **User Story:**  
    “As a verified citizen, I can submit a simple incident report stored in the system, and I can see it in my ‘My Reports’ page.”
    
- **Frontend:**
    
    - “Report Incident” page
        
    - “My Reports” page
        
- **Backend:**
    
    - `POST /citizen/incidents`
        
    - `GET /citizen/incidents`
        
- **DB:**
    
    - `incidents`
        
- **Tests:**
    
    - Backend: incident is linked to correct citizen
        
    - Frontend: form validation works
        
- **Demo:**  
    Citizen verifies → submits an incident → refresh page → sees it listed.
    

---

### Slice 4 – AI Classification Integration

- **User Story:**  
    “As an agency operator, I want incident reports to include AI-generated type and severity to help me prioritize.”
    
- **Frontend:**
    
    - Show category & severity in incident detail (citizen + agency view)
        
- **Backend:**
    
    - Integrate `AI /classify` call in `POST /citizen/incidents`
        
    - `incident_ai_outputs` table
        
- **AI Service:**
    
    - Simple FastAPI stub returning class/severity
        
- **Demo:**  
    Submit incident → show classification fields populated.
    

---

### Slice 5 – Agency Dashboard with Incident List

- **User Story:**  
    “As agency staff, I can log in and see all incidents assigned to my agency.”
    
- **Frontend:**
    
    - Agency dashboard with list
        
    - Detail page with actions (verify, assign)
        
- **Backend:**
    
    - `GET /agency/incidents`
        
    - `GET /agency/incidents/:id`
        
- **DB:**
    
    - `agencies`, `agency_staff`, `incidents.assigned_agency_id`
        
- **Demo:**  
    Citizen submits → Admin/seed ties it to agency → Agency sees it.
    

---

### Slice 6 – Basic GIS Map Visualization

- **User Story:**  
    “As agency staff, I can see incidents on a city map.”
    
- **Frontend:**
    
    - Map component, pins from `/gis/incidents`
        
- **Backend:**
    
    - `GET /gis/incidents` (with GeoJSON)
        
- **DB:**
    
    - `incidents.geom` column (POINT)
        
- **Demo:**  
    Filter incidents and show them on the map.
    

---

### Slice 7 – FAYDA Verification + Blocking Logic

- **User Story:**  
    “As a system, I must ensure only verified citizens can report incidents.”
    
- **Frontend:**
    
    - Block “Report Incident” button if not verified
        
- **Backend:**
    
    - Middleware on `POST /citizen/incidents` checking verification
        
- **Demo:**  
    Try to report before verification → blocked. After verification → works.
    

---

### Slice 8 – Heatmaps & Filters

- **User Story:**  
    “As agency analyst, I want to visually see hotspots of incidents.”
    
- **Frontend:**
    
    - Toggle map to heatmap mode, filter by type & severity.
        
- **Backend:**
    
    - Aggregation endpoint (or same `/gis/incidents` but with extra metadata).
        

---

### Slice 9 – Admin Essentials

- **User Story:**  
    “As system admin, I want to approve agencies and manage users.”
    
- **Frontend:**
    
    - Admin dashboard
        
    - User list page
        
    - Agency requests page
        
- **Backend:**
    
    - `/admin/users`, `/admin/agencies`, `/admin/agency-requests`
        

---

## 5. Concrete Frontend Implementation Plan

### 5.1 React Routing Structure (v1)

`/ (Landing) /login /register /agency/request-access  /citizen/dashboard /citizen/verify /citizen/report /citizen/incidents /citizen/incidents/:id  /agency/dashboard /agency/incidents /agency/incidents/:id /agency/analytics  /admin/dashboard /admin/users /admin/agencies /admin/verification`

### 5.2 Route-by-Route Notes

- **Public** (Phase 0–1)
    
    - `/` – Landing (Slice 1, already partly done)
        
    - `/login` – Slice 1
        
    - `/register` – Slice 2
        
    - `/agency/request-access` – Phase 4
        
- **Citizen**
    
    - `/citizen/dashboard` – Slice 2 (unverified); Slice 3 (verified view)
        
    - `/citizen/verify` – Slice 2
        
    - `/citizen/report` – Slice 3
        
    - `/citizen/incidents` – Slice 3
        
    - `/citizen/incidents/:id` – Slice 3–4 (add AI info)
        
- **Agency**
    
    - `/agency/dashboard` – Slice 5–6
        
    - `/agency/incidents` – Slice 5
        
    - `/agency/incidents/:id` – Slice 5
        
    - `/agency/analytics` – Phase 5
        
- **Admin**
    
    - `/admin/dashboard` – Slice 9
        
    - `/admin/users` – Slice 9
        
    - `/admin/agencies` – Slice 9
        
    - `/admin/verification` – Phase 4
        

### 5.3 Layout Strategy

- `PublicLayout` – Used for `/`, `/login`, `/register`, etc.
    
- `CitizenLayout` – Sidebar: Dashboard, My Reports, Settings.
    
- `AgencyLayout` – Sidebar: Dashboard, Incidents, Analytics.
    
- `AdminLayout` – Sidebar: Dashboard, Users, Agencies, Verification.
    

**Shared Components (create early, expand later):**

- `PrimaryButton`, `SecondaryButton`
    
- `Modal`
    
- `DataTable` wrapper
    
- `MapWrapper` (Leaflet/Mapbox abstraction)
    
- `FormInput`, `FormSelect`, `FormTextArea`
    
- `StatusBadge` (Pending/Verified/Resolved etc.)
    
- `Toast` / Notifications bar
    

---

## 6. Concrete Backend Implementation Plan

### 6.1 Backend Folder Structure (Node/Express example)

`backend/   src/     app.ts     server.ts     config/       db.ts       env.ts     middleware/       auth.ts       rbac.ts       errorHandler.ts     modules/       auth/         auth.controller.ts         auth.service.ts         auth.routes.ts       users/       agencies/       incidents/       verification/       gis/       ai/       admin/       notifications/     utils/   prisma/ or migrations/`

### 6.2 First Endpoints per Module

- **auth**
    
    - `POST /auth/register` (P1)
        
    - `POST /auth/login` (P1)
        
    - `GET /auth/me` (P1)
        
- **users**
    
    - `GET /users/:id` (P3)
        
    - `GET /admin/users` (P4)
        
- **incidents**
    
    - `POST /citizen/incidents` (P2/3)
        
    - `GET /citizen/incidents` (P2/3)
        
    - `GET /agency/incidents` (P3)
        
    - `PATCH /agency/incidents/:id/status` (P3)
        
- **verification**
    
    - `POST /citizen/verification/start` (P2)
        
    - `POST /citizen/verification/confirm` (P2)
        
    - `GET /admin/verification/pending` (P4)
        
- **gis**
    
    - `GET /gis/incidents` (P5)
        
- **ai**
    
    - internal client for AI service; no public endpoint initially (P2.5)
        
- **admin**
    
    - `GET /admin/agencies` (P4)
        
    - `PATCH /admin/agencies/:id` (P4)
        

### 6.3 DB + RBAC Basics

- **Postgres connection**: use `pg` or ORM (Prisma/TypeORM).
    
- **Migrations**: use a migration tool (Prisma Migrate, Knex migrations).
    
- **RBAC middleware:**
    
    - Read user role from JWT.
        
    - `requireRole(['ADMIN'])` used on admin routes.
        
    - `requireVerifiedCitizen` for incident report.
        
- **DTO/Validation**:
    
    - Use `zod` / `Joi` / `yup` for request bodies (e.g., `createIncidentSchema`).
        

---

## 7. Database Implementation Steps (Postgres + PostGIS)

### 7.1 Table Creation Order

1. `roles`
    
2. `users` (FK → roles)
    
3. `agencies`
    
4. `agency_staff` (FK → users, agencies)
    
5. `citizen_verifications` (FK → users)
    
6. `incidents` (FK → users, agencies)
    
7. `incident_ai_outputs` (FK → incidents)
    
8. `incident_status_history` (FK → incidents, users)
    
9. `notifications`
    
10. `agency_applications` (for future)
    

### 7.2 PostGIS Activation

- Enable PostGIS in a migration:
    

`CREATE EXTENSION IF NOT EXISTS postgis;`

- Add geometry field in **Phase 5**:
    

`ALTER TABLE incidents ADD COLUMN geom geometry(Point, 4326); CREATE INDEX incidents_geom_gix ON incidents USING GIST (geom);`

Later:

- Add polygons for `agencies.jurisdiction_geom` with `MULTIPOLYGON`.
    

---

## 8. AI & GIS Implementation Timeline

### 8.1 When to Integrate

- **AI classification:**
    
    - Stub in Phase 2 (Slice 4).
        
    - FastAPI + simple rule-based → then optionally upgrade to real model.
        
- **Severity scoring:**
    
    - Add once basic classification works (Phase 5).
        
- **GIS (map, markers):**
    
    - Start with static markers or simple coordinates in Phase 3.
        
    - Then integrate full PostGIS + GeoJSON in Phase 5.
        
    - Heatmaps + clustering at the end of Phase 5.
        

### 8.2 Stubbing Strategy

**AI stub example:**

- In Phase 2: backend calls `http://ai-service/classify`.
    
- If service is offline, have fallback:
    

`if (AI offline) {   category = 'General Incident';   severity = 3;   confidence = 0.5; }`

Later, you just **turn on** the real AI microservice, same endpoint, same contract.

**GIS stub example:**

- Start by storing lat/lng columns as numeric columns.
    
- Later switch to geometry type + PostGIS while keeping same API interface.
    

---

## 9. Testing & Quality Gates

### 9.1 Minimum Tests per Slice

- **Slice 1:**
    
    - One unit test on login password check.
        
    - Manual UI test for login.
        
- **Slice 2:**
    
    - Verify unverified user cannot call `/citizen/incidents` POST.
        
    - Postman test for verification endpoints.
        
- **Slice 3:**
    
    - Backend: create incident → exists in DB.
        
    - Frontend: “My Reports” shows correct count.
        

…and so on.

### 9.2 “Definition of Done” Checklist for Each Slice

For every slice:

-  All planned endpoints implemented.
    
-  Frontend screens functional and connected to backend.
    
-  No TypeScript/ESLint errors.
    
-  Key happy path manually tested.
    
-  1–3 automated tests added (backend or frontend).
    
-  Demo scenario written and tested.
    
-  Code committed and pushed.
    

---

## 10. Timeline & Weekly Plan (Approx. 14 Weeks)

Assume: **Week 1 = now-ish** → **Week 14 = near final defense**.

### Week 1 – Phase 0 / Slice 1

- Goals: Repo, Docker, basic frontend/backend skeleton, health-check, login placeholder.
    
- Risks: Docker setup headaches.
    
- Demo: Login with hardcoded user → show basic dashboard.
    

### Week 2 – Phase 1 / Slice 2 (start)

- Goals: Real auth, DB migrations for `users`, `roles`.
    
- Risks: JWT confusion, ORM learning.
    
- Demo: Register + login + role-based dashboard.
    

### Week 3 – Phase 2 / Slice 2 (finish)

- Goals: FAYDA verification stub; citizen verification banner.
    
- Demo: Citizen cannot report until verified.
    

### Week 4 – Phase 2 / Slice 3

- Goals: incidents table; citizen report form; list + details.
    
- Demo: Citizen submits incident and sees it in “My Reports”.
    

### Week 5 – Phase 2 / Slice 4

- Goals: AI stub service; classification integrated.
    
- Demo: New report shows AI-generated category + severity.
    

### Week 6 – Phase 3 / Slice 5 (start)

- Goals: agencies + staff tables; agency login; incident list for agency.
    
- Demo: Agency staff sees incidents created by citizens.
    

### Week 7 – Phase 3 / Slice 5 (finish)

- Goals: status updates (verify/assign/respond/resolved); status history.
    
- Demo: End-to-end: citizen report → agency processes.
    

### Week 8 – Phase 5 / Slice 6

- Goals: GIS: add geom, simple map on agency dashboard.
    
- Demo: Show incidents on map.
    

### Week 9 – Phase 4 / Slice 7

- Goals: Hard check: only verified citizens can report; admin view for verification.
    
- Demo: Show blocked unverified incident submission.
    

### Week 10 – Phase 5 / Slice 8

- Goals: Heatmap & filters on map.
    
- Demo: Filter incidents by type/severity and show hotspots.
    

### Week 11 – Phase 4 / Slice 9

- Goals: Admin portal — users + agencies management.
    
- Demo: Admin approves new agency, sees stats.
    

### Week 12 – Phase 6 (Testing & Polish)

- Goals: Strengthen tests, UX clean-up, bug fixes.
    
- Demo: Full scenario smooth.
    

### Weeks 13–14 – Finalization + Docs + Defense Prep

- Goals:
    
    - Capture screenshots
        
    - Run performance tests
        
    - Align docs with actual implementation
        
    - Prepare PowerPoint & demo script
        
- Demo: Practice defense.

---

## 12. Remaining Workplan From Current State to Deployment

### Current State (completed)
- Phases 0�?"5 largely implemented: repo/infra, auth/RBAC, citizen verification + incident reporting, agency workflow, admin panels, AI stub, GIS point storage + map markers.

### Phase 6 �?" Testing & Hardening (in progress)
- Add integration/Postman suites for auth, citizen incidents, agency actions, admin endpoints.
- Expand unit/UI tests (agency/admin pages, GIS endpoint, status transitions).
- Add rate limiting (login, verification, incident submit) and pagination/filters on lists.
- Surface incident status history in UI; tighten CORS/config.

### Phase 7 �?" GIS Maturity
- `/gis/incidents` with bbox/time/status/category filters; add clustering/heatmap option.
- Jurisdiction filtering: agency sees incidents intersecting their polygons.
- Frontend: map filters, clustering toggle, heatmap view.

### Phase 8 �?" AI Maturity
- Swap rule-based stub for real model (DistilBERT/shallow model) container; keep same `/classify` contract.
- Add severity/confidence thresholds and UI flags; store model version and reclass logs.

### Phase 9 �?" Admin/Agency Polish
- Admin: richer dashboards, user status updates, agency edits, verification audit trail.
- Agency: live incident feed (WebSocket/polling), better filters, status history display.
- Seed scripts for demo data (admin, agency, citizens, incidents).

### Phase 10 �?" Migrations & Seeds
- Introduce migration tool (Prisma/Knex/sqlx) and formal seeds (roles, admin user, agency, staff, sample incidents).
- Align schema with migrations; drop init-time DDL after migration adoption.

### Phase 11 �?" Deployment Readiness
- Docker-compose prod profile; env templates; health checks.
- Basic monitoring/logging; security pass (secrets, CORS, TLS guidance).
- Final performance pass: indexes, bbox limits, payload limits.

### Phase 12 �?" Documentation & Demo Prep
- Update docs to match implementation; record CI status; capture screenshots.
- Demo script covering citizen �+' agency �+' admin flows with AI/GIS visible.
---

## 11. Execution Hardening Addendum

### 11.1 Quick Risk Register (mitigation in parentheses)

- Docker/PostGIS friction (ship `infra/docker-compose.yml` + `init.sql` + README with `docker compose up db` smoke test).
- Auth/RBAC bugs (one integration test per protected route in each slice; seed baseline users).
- AI/GIS availability (stub fallback: default category/severity; keep API contract stable).
- Map tokens/quotas (store token in `.env`; allow Leaflet fallback).

### 11.2 Seed Data for Demos/Tests

- Users: system_admin, agency_admin (linked to demo agency), agency_staff (operator), citizen_unverified, citizen_verified.
- Agencies: one approved agency with jurisdiction placeholder.
- Incidents: 5-10 sample rows covering statuses/severities.

### 11.3 Slice-Specific Acceptance Reminders

- Slice 1: `/auth/login` works; `/auth/me` returns role; role-guarded placeholder dashboards render.
- Slice 2: Unverified citizen blocked on `POST /citizen/incidents`; verification banner + flow updates status.
- Slice 3: Verified citizen can submit and see new incident in `My Reports`; DB row links to reporter.
- Slice 4: `/ai/classify` called; AI output stored and rendered on detail view; fallback works if AI down.
- Slice 5: Agency user sees assigned/incidents list filtered by agency; detail actions update status history.
- Slice 6: Map view renders incidents via `/gis/incidents` (GeoJSON or lat/lng fallback).

### 11.4 Observability & Logging

- Request logging with correlation id; auth failures logged; incident lifecycle transitions logged to `incident_status_history`.
- Basic metrics: request count/latency for auth, incident POST, `/gis/incidents`.
- Central error handler returning consistent JSON envelope.

### 11.5 Security Hygiene (baseline)

- Password hashing (bcrypt/argon2), JWT expiry (e.g., 15-30m) + optional refresh; rate limits on login, verification start/confirm, incident submit.
- CORS default to localhost dev domains; input validation via zod/Joi on every POST/PATCH.
- Mask FAYDA IDs; store secrets in `.env` (never in repo).

### 11.6 Environment & Config Checklist

- `.env.example` for frontend/backend/ai/infra: DB URL, JWT secret, MAPBOX_TOKEN (optional), AI_SERVICE_URL, PORTs.
- Local vs demo: toggle `USE_FAKE_AI`, `USE_FAKE_FAYDA`; map provider flag (mapbox/leaflet).

### 11.7 Testing & CI Minimums

- Per slice: 1-3 automated tests (unit or integration) + Postman/Newman smoke where applicable.
- CI steps: `lint` → `test` (frontend/backend) → optional `e2e-smoke` (Postman) on main branches.
- GIS: pgTap or simple SQL checks for geometry columns/indexes once PostGIS is enabled.

### 11.8 Performance Guardrails (targets)

- Auth/login < 500ms, incident POST with AI stub < 1s, `/gis/incidents` bbox query < 300ms with GIST index.
- Map payload bounded by viewport (require bbox/limit to avoid overload).

### 11.9 GIS & AI Contracts

- GIS interim: store lat/lng numeric in early slices; migrate to `geometry(Point,4326)` with stable API (always return GeoJSON).
- AI contract: `POST /ai/classify` body `{text, language?, location?, timestamp?}` → `{category, severity_score, severity_label, confidence, summary, model_version}`; if AI unavailable, backend returns safe defaults and flags `ai_status='fallback'`.

## 13. From Current State to Fully Functional (Structured Plan)

### Inputs you must supply up front
- Map token if using Mapbox tiles: set `MAPBOX_TOKEN` in `frontend/.env` (Leaflet/OSM works without it).
- TLS certs + domain for production HTTPS (configure NGINX/compose accordingly).
- Real ID verification API keys (optional): add to `backend/.env` if moving beyond mock OTP.
- Production admin credentials to override demo seeds.

### Phase A: AI Maturity
- Swap TF-IDF/logreg to a real model (e.g., DistilBERT/severity) in ai-service; keep `/classify` contract.
- Tune severity/confidence thresholds; flag low-confidence in UI; log reclass history.

### Phase B: GIS Maturity (implemented)
  - Map tiles now prefer Mapbox when `MAPBOX_TOKEN` is set in `frontend/.env`; OSM is the fallback.
  - Agency map supports markers, heatmap, and basic clustering; GIS responses are bbox-aware and paginated/limited.
  - Jurisdiction filter uses agency polygons when present; env for map token is documented.

### Phase C: Agency/Admin Polish (implemented)
  - Agency dashboard now uses live incident queue with filters and map bbox + modes; polling tightened.
  - Admin dashboard shows recent status history and AI reclass log; bulk verification actions supported.

### Phase D: Testing & CI (in progress)
  - Postman/Newman smoke collection added (`docs/postman/GEORISE_smoke.postman_collection.json`); wire into CI later if needed.
  - Backend Jest tests added for auth service (register/login with mocks) + existing AI client; CI now runs tests where available.
  - Frontend Vitest test already covers citizen report form; expand to agency/admin actions next.

### Phase E: Migrations & Seeds
- Keep migrations authoritative; no init-time DDL.
- Seed full demo: admin, agency staff, verified/unverified citizens, multiple incidents with lat/lng; document seed creds.

### Phase F: Observability & Security
- Add request logging with correlation IDs; basic metrics or guidance (latency/error counts).
- Harden CORS for prod domains; document secret management; add payload limits and rate limits where missing.
- TLS/NGINX guidance and JWT secret rotation policy for production.

### Phase G: Deployment
- Validate `docker-compose.prod.yml` with env files; document prod deploy steps.
- Add DB indexes for common filters (status, assigned_agency_id, geom GIST); set bbox limits and response caps on GIS endpoints.

### Phase H: Documentation & Demo
- Update README/DEMO_SCRIPT with final URLs, env setup, migrations/seeds, screenshots.
- Note optional future work (real ID API, push/WebSocket live feed) if deferred.

