# ✅ **GEORISE — FULL SYSTEM DESIGN PACKAGE**

**Low-Level Design • Wireframes • Frontend–Backend Integration • Implementation Roadmaps • Sequence Diagrams • Subsystem Interaction**

This is the complete next-phase document after the architecture blueprint.

---

# ⭐ **SECTION 1 — DETAILED SYSTEM DESIGN (LOW-LEVEL DESIGN DOCUMENT)**

This section breaks down every subsystem into modules, functions, validation rules, state logic, and internal interactions.

---

# 1.1 **System Architecture Recap (Low-Level View)**

`┌───────────────────────────────────────────────────────────────┐ │                         CLIENT (Web App)                      │ │  React • React Query • Mapbox/Leaflet • Tailwind • Zustand    │ └───────────────▲───────────────────────────────▲───────────────┘                 │                               │         Citizen/Agency/Admin              Real-time Updates                 │                               │ (WebSockets)                 ▼                               ▼ ┌───────────────────────────────────────────────────────────────┐ │                          API GATEWAY                          │ │  FastAPI / Node (Express) • Auth • RBAC • Rate Limiting       │ └──────────────────┬────────────────────────────────────────────┘                    │       ┌────────────┼───────────────────────────────────────────┐       │            │                                           │       ▼            ▼                                           ▼ ┌──────────┐  ┌──────────────┐                        ┌─────────────────┐ │ Auth/     │  │ Incident      │                        │ AI Service      │ │ Identity  │  │ Management    │                        │ (Classification │ │ Service   │  │ Service       │                        │  Severity/NLP)  │ └──────────┘  └──────────────┘                        └─────────────────┘                   │                                           │       ┌───────────┼───────────────────────────┐               │       ▼           ▼                           ▼               ▼ ┌──────────┐  ┌──────────────┐       ┌────────────────┐ ┌──────────────┐ │ Agency    │  │ GIS Engine    │       │ Verification    │ │ Notification │ │ Mgmt      │  │ (PostGIS)     │       │ (FAYDA + OTP)   │ │ Service      │ └──────────┘  └──────────────┘       └────────────────┘ └──────────────┘`

Each subsystem will now be fully detailed.

---

# ⭐ 1.2 **Auth & RBAC Service — Low-Level Design**

### **Modules**

1. **AuthController**
    
2. **TokenService (JWT)**
    
3. **PasswordService**
    
4. **RoleService**
    
5. **VerificationService (FAYDA)**
    
6. **SessionService**
    

### **Internal Functions**

- `registerCitizen()`
    
- `verifyFaydaNationalID()`
    
- `registerAgencyApplicant()`
    
- `approveAgency()`
    
- `createAgencyStaff()`
    
- `login()`
    
- `logout()`
    
- `refreshToken()`
    

### **RBAC Matrix (Internal Storage)**

|Action|Citizen|Verified Citizen|Agency Staff|Agency Admin|System Admin|
|---|---|---|---|---|---|
|Report incident|❌|✔️|❌|❌|❌|
|View public incidents|✔️|✔️|✔️|✔️|✔️|
|Assign incidents|❌|❌|✔️(dispatcher)|❌|✔️|
|Approve agencies|❌|❌|❌|❌|✔️|

### **Validation Rules**

- Email format check
    
- Strong password
    
- National ID:
    
    - 12–16 digits
        
    - Must match full name + DOB from FAYDA API
        

### **Error States**

- ID not found
    
- Name mismatch (>20% Levenshtein distance)
    
- Already verified
    
- Suspicious activity → flagged
    

---

# ⭐ 1.3 **Incident Management Service — Low-Level Design**

### **Modules**

1. **IncidentController**
    
2. **AIServiceConnector**
    
3. **GISProcessor**
    
4. **IncidentAssignmentService**
    
5. **IncidentStateMachine**
    
6. **IncidentLogService**
    

### **Important Classes**

`Incident {   id: UUID   reporter_id: UUID   location: GEOMETRY(Point)   category: string   severity: int   status: enum   verified_by: UUID?   assigned_agency: UUID?   created_at   updated_at }`

### **Incident Status State Machine**

`RECEIVED → AI_CLASSIFIED → OPERATOR_VERIFIED → ASSIGNED → RESPONDED → RESOLVED → ARCHIVED`

### **Internal Logic**

- Create incident entry
    
- Run AI classification
    
- Re-score severity
    
- Queue for operator verification
    
- Dispatch to selected agency
    
- Geo-validate:
    
    - Within agency jurisdiction polygon?
        
    - If not → reroute to nearest agency zone
        

---

# ⭐ 1.4 **GIS Subsystem — Low-Level Design**

### **Modules**

1. **SpatialIndexingModule**
    
2. **JurisdictionOverlayModule**
    
3. **HeatmapEngine**
    
4. **ClusteringEngine (DBSCAN)**
    
5. **RoutingModule**
    

### **Core Functions**

- `getIncidentsByRadius(lat, lng, r)`
    
- `getIncidentsByPolygon()`
    
- `computeHotspots()`
    
- `mapJurisdictions()`
    
- `findNearestAgency()`
    

### **Geometry Types**

- POINT for incidents
    
- MULTIPOLYGON for agency jurisdiction
    
- LINESTRING for routes
    
- POLYGON for geofencing zones
    

### **Indexing**

`CREATE INDEX idx_incidents_geom ON incidents USING GIST (location);`

---

# ⭐ 1.5 **AI Subsystem — Low-Level Design**

### **Models**

- Transformer small model (DistilBERT)
    
- Multi-class classification:
    
    - Crime
        
    - Accident
        
    - Fire
        
    - Health emergency
        
    - Hazard
        
    - Infrastructure failure
        
- Severity regression:
    
    - 1–5 scale
        

### **Pipeline**

`Raw text → Cleaning → Tokenization → Classification → Severity scoring → Confidence output`

### **Output Format**

`{   "class": "Fire",   "confidence": 0.87,   "severity": 4,   "explanation": "Keywords: smoke, burning, flames" }`

---

# ⭐ 1.6 **Verification Subsystem (FAYDA)**

### **Data Fields Required**

- National ID number
    
- First name
    
- Father name
    
- Grandfather name
    
- DOB
    
- Phone
    

### **OTP Flow**

1. User submits ID → verify match
    
2. OTP sent to official FAYDA-linked phone number
    
3. User enters OTP
    
4. Citizen verified
    

### **Fraud Detection**

- Multiple accounts using same ID
    
- Repeated failed OTP attempts
    
- ID registered from suspicious IP
    

---

# ⭐ 1.7 **Real-Time System**

### **WebSocket Channels**

- Incident updates
    
- Assignment changes
    
- Agency notifications
    
- Map refresh events
    

---

# ⭐ 1.8 **Deployment Strategy**

Local:

- Docker Compose
    
- Local Postgres + PostGIS
    
- Local AI service (FastAPI)
    
- Map tiles served via Mapbox free tier
    

Production (Academic):

- Render / Railway deploy
    
- Free-tier Postgres
    
- Static CDN for frontend
    

---

# ⭐ **SECTION 2 — FRONTEND SCREENS & ROUTING MAP**

**All roles covered.**

---

# 2.1 **Screen List (Master Index)**

## Visitor

- `/` Landing
    
- `/login`
    
- `/signup`
    
- `/agency/request-access`
    

## Citizen (Unverified)

- `/citizen/dashboard`
    
- `/citizen/verify-id`
    
- `/citizen/incidents`
    
- `/citizen/view/:id`
    

## Citizen (Verified)

- `/citizen/report`
    
- `/citizen/report/confirm`
    
- `/citizen/profile`
    

## Agency Applicant

- `/agency/application`
    
- `/agency/application/status`
    

## Agency Staff

- `/agency/dashboard`
    
- `/agency/incidents/queue`
    
- `/agency/incidents/:id`
    
- `/agency/analytics`
    

## Agency Admin

- `/agency/admin/staff`
    
- `/agency/admin/settings`
    

## System Admin

- `/admin/agencies`
    
- `/admin/users`
    
- `/admin/logs`
    
- `/admin/config`
    

---

# ⭐ **2.2 PER-SCREEN ROUTING MAP + PURPOSE + PERMISSIONS**

(Will generate the full detailed routing map and all screens in the next message due to length.)

# ⭐ 2. Frontend Screens & Routing Map (Full Detail)

I’ll go role by role. For each screen:

- Path
    
- Purpose
    
- Main components
    
- Navigation logic
    
- Permission checks
    
- Key states
    

---

## 2.1 Visitor / Public Routes

### 2.1.1 `/` – Landing Page

**Purpose:**  
Explain GEORISE, capture trust, route users to citizen/agency/admin flows.

**Components:**

- `TopNav` (logo, “Login”, “Request Agency Access”, “Learn More”)
    
- `HeroSection` (headline, subheadline, primary CTAs)
    
- `HowItWorksSection` (4-step flow: Report → Analyze → Assign → Respond)
    
- `Role-BasedFeaturesSection` (Citizens / Agencies / Government)
    
- `TechOverviewSection` (AI + GIS explanation)
    
- `TrustSection` (ethics, data privacy, academic prototype)
    
- `CallToActionSection` (buttons: Start as Citizen / Request Agency Access)
    
- `Footer`
    

**Navigation logic:**

- “Login” → open `LoginRoleModal` → `/login/citizen` or `/login/agency` or `/login/admin`
    
- “Start as Citizen” → `/login/citizen`
    
- “Request Agency Access” → `/agency/request-access`
    

**Permission:** public.

**States:**

- Default
    
- Sticky nav after scroll
    

---

### 2.1.2 `/login/citizen`, `/login/agency`, `/login/admin`

**Purpose:**  
Authenticate users for the correct portal.

**Components:**

- `AuthCard` (title, description)
    
- `InputField` for identifier (phone or email)
    
- `PasswordField`
    
- `LoginButton`
    
- Link to `ForgotPassword` or `CreateCitizenAccount`
    

**Logic:**

- On submit → call `/auth/login` with role hint
    
- On success → redirect:
    
    - citizen → `/citizen/dashboard`
        
    - agency → `/agency/dashboard`
        
    - admin → `/admin/dashboard`
        

**States:**

- Loading (disabled button, spinner)
    
- Error (invalid credentials)
    

---

### 2.1.3 `/signup/citizen`

**Purpose:**  
Create citizen account.

**Components:**

- `AuthCard`
    
- Fields: name, phone, email (optional), password, confirm password
    
- Checkbox: “I accept responsible reporting policy”
    
- `SubmitButton`
    

**Logic:**

- On success → auto-login OR show success → `/citizen/dashboard`
    

**Permission:** public (but block if logged-in citizen tries to access; redirect to dashboard).

---

### 2.1.4 `/agency/request-access`

**Purpose:**  
Let a real agency request onboarding.

**Components:**

- `PageTitle` + explanation
    
- Form fields: agency name, type, city, contact name, email, phone, notes
    
- `SubmitButton`
    
- Success banner when submitted
    

**Logic:**

- POST `/agency/request-access`
    
- On success: “We will contact you after review”
    

---

## 2.2 Citizen Portal Routes

All under `CitizenLayout`, guarded by `role === 'citizen'`.

### 2.2.1 `/citizen/dashboard`

**Purpose:**  
User’s home base – verification status, quick access, alerts.

**Components:**

- `TopBar` (name, verification badge)
    
- `VerificationBanner`:
    
    - If `verification_status != 'verified'`: call to action → `/citizen/verify`
        
- `AlertFeed`:
    
    - List of nearby incidents (read-only)
        
- `QuickActions`:
    
    - “Report Incident” (disabled or blocked if unverified)
        
    - “My Reports”
        
- `NotificationBell`
    

**Logic:**

- If user clicks “Report Incident” and unverified → show blocking modal.
    

---

### 2.2.2 `/citizen/verify` (National ID Verification)

**Purpose:**  
Do FAYDA verification so user can report.

**Components:**

- Explanation section: why verification is needed
    
- Form:
    
    - FAYDA ID
        
    - Full Name
        
    - DOB
        
    - Phone
        
- `VerifyButton`
    

**States:**

- Idle
    
- Submitting
    
- Pending (if external API)
    
- Success (banner + redirect countdown)
    
- Failure (error message + retry)
    

**Logic:**

- POST `/citizen/verification/fayda/start`
    
- If OTP step exists: show second step for OTP
    
- On success: update `AuthContext` → `verification_status='verified'`
    
- Redirect to `/citizen/report` or `/citizen/dashboard`
    

---

### 2.2.3 `/citizen/report`

**Guard:**

- If not logged in → `/login/citizen`
    
- If citizen but not verified → redirect `/citizen/verify`
    

**Purpose:**  
Submit new incident.

**Components:**

- Step indicator (1: Details, 2: Location, 3: Review)
    
- Fields:
    
    - Type (optional)
        
    - Description (multiline)
        
    - Optional image upload component
        
- Map component:
    
    - Center at current location if permission allowed
        
    - Option to drag marker
        
- `SubmitReportButton`
    

**States:**

- Loading location
    
- Offline or GPS failure
    
- Submitting
    
- Success (modal or redirect)
    

**Logic:**

- On submit: POST `/citizen/incidents`
    
- On success: redirect to `/citizen/incidents/:id` with success toast
    

---

### 2.2.4 `/citizen/incidents`

**Purpose:**  
List of all reports by citizen.

**Components:**

- `FilterBar` (status chips: All, Pending, Verified, Resolved, Rejected)
    
- `IncidentList` (cards)
    
- Empty state: “No incidents yet”
    

**Logic:**

- GET `/citizen/incidents` with filters
    
- Clicking a card → `/citizen/incidents/:id`
    

---

### 2.2.5 `/citizen/incidents/:id`

**Purpose:**  
Show full details of a specific incident.

**Components:**

- `StatusTimeline` (Submitted → Pending → Verified → Assigned → Responding → Resolved)
    
- `IncidentInfo` (type, severity, time, description)
    
- `MapPreview`
    
- `AgencyInfo` if assigned
    
- `SystemMessages` / notifications (e.g., operator requested more info)
    

---

### 2.2.6 `/citizen/profile`

**Purpose:**  
Account and identity info.

**Components:**

- Profile summary:
    
    - Name, phone, email
        
    - Verification status + FAYDA masked ID
        
- Forms:
    
    - Change phone/email
        
    - Change password
        
- Danger zone (optional): delete account (for now you can omit in MVP).
    

---

## 2.3 Agency Portal Routes

All under `AgencyLayout`, guard `role in ['agency_staff', 'agency_admin']`.

### 2.3.1 `/agency/dashboard`

**Purpose:**  
Central mission control for agency.

**Components:**

- `MapPanel` (half screen)
    
- `IncidentListPanel` (table of incidents)
    
- Filters: status, severity, time range, incident type
    
- Summary stats (cards): `Active Incidents`, `New Today`, etc.
    

**Logic:**

- GET `/agency/incidents`
    
- Subscribe to WebSocket channel for updates
    
- Clicking marker or row → `/agency/incidents/:id` (or side drawer)
    

---

### 2.3.2 `/agency/incidents`

**Purpose:**  
Dedicated full list of incidents (advanced filters).

**Components:**

- `AdvancedFilterBar` (search text, date picker, severity slider, type dropdown)
    
- `DataTable` with columns:
    
    - ID, Category, Severity, Status, Reported At, Location, Citizen Verified (yes/no)
        

---

### 2.3.3 `/agency/incidents/:id`

**Purpose:**  
Operator / dispatcher detail screen with actions.

**Components:**

- Header with status + severity badge
    
- Tabs:
    
    - Details (description, AI summary)
        
    - Timeline (status history)
        
    - Map & proximity (nearby critical assets)
        
- Actions panel:
    
    - For operator:
        
        - Verify
            
        - Reject
            
        - Request more information
            
    - For dispatcher:
        
        - Assign to internal unit
            
        - Update status to “Responding”, “Resolved”
            

**States:**

- Only certain controls enabled based on role & current status.
    

---

### 2.3.4 `/agency/analytics`

**Purpose:**  
High-level insights for agency.

**Components:**

- Charts:
    
    - Incidents over time
        
    - Incidents by type
        
    - Average response time
        
- Map heatmap of hotspots
    
- Filters: date range, severity, type
    

---

### 2.3.5 `/agency/staff` (Agency Admin Only)

**Purpose:**  
Manage staff accounts.

**Components:**

- Staff table: name, role, status (active/suspended)
    
- Button: “Add Staff” → `/agency/staff/new`
    

---

### 2.3.6 `/agency/staff/new`

**Purpose:**  
Invite staff user.

**Components:**

- Input: name, email, phone
    
- Select: role (operator, dispatcher, analyst)
    
- Submit → sends invite / creates temporary account.
    

---

### 2.3.7 `/agency/settings`

**Purpose:**  
Agency configuration.

**Components:**

- Agency info
    
- Jurisdiction map editor (draw/adjust polygon)
    
- Notification preferences
    
- Categories handled (e.g., police doesn’t handle fire)
    

---

## 2.4 Admin Portal Routes

`AdminLayout`, guard `role === 'system_admin'`.

### 2.4.1 `/admin/dashboard`

**Purpose:**  
Global view.

**Components:**

- Cards: total agencies, citizens, incidents
    
- Chart: Incidents by city
    
- Tiles: recent critical incidents
    

---

### 2.4.2 `/admin/agency-requests`

**Purpose:**  
Review & approve/deny new agencies.

**Components:**

- Table of pending requests
    
- Row actions: “View / Approve / Reject”
    

---

### 2.4.3 `/admin/agencies`

**Purpose:**  
Manage existing agencies.

**Components:**

- Table: name, city, type, status
    
- Row: open `/admin/agencies/:id`
    

---

### 2.4.4 `/admin/agencies/:id`

**Purpose:**  
View & update an agency.

**Components:**

- Agency info
    
- Jurisdiction map
    
- List of staff accounts
    
- Status toggle (active/inactive)
    

---

### 2.4.5 `/admin/users`

**Purpose:**  
View & manage all users.

**Components:**

- Table with filters: role, status, verification
    
- Actions: suspend/reactivate
    

---

### 2.4.6 `/admin/logs`

**Purpose:**  
Audit & security logs.

**Components:**

- Log feed: actor, action, target, timestamp, metadata
    
- Filters by action type, date, actor
    

---

### 2.4.7 `/admin/settings`

**Purpose:**  
System-level config.

**Components:**

- Incident categories
    
- Severity thresholds
    
- Allowed cities
    
- Feature toggles (e.g., enable FAYDA integration)
    

---

# ⭐ 3. API → Frontend Integration Mapping (Condensed but Clear)

We’ll map key flows.

---

## 3.1 Auth Flow

**Screens:**

- `/login/citizen`, `/login/agency`, `/login/admin`
    

**API:**

- `POST /auth/login`
    

**Frontend Logic:**

- On submit → set `isLoading=true`
    
- On success:
    
    - Store token in memory/secure storage
        
    - Set user context with `role`, `verification_status`, `agency_id`
        
    - Redirect based on role
        
- On error → show “Invalid login credentials”
    

---

## 3.2 Citizen Verification

**Screens:**

- `/citizen/verify`
    
- Block modal on `/citizen/report` if unverified
    

**API:**

- `POST /citizen/verification/fayda/start`
    
- (Optional) `POST /citizen/verification/fayda/confirm`
    

**Integration:**

- On verification submit → show spinner
    
- On success: update `AuthContext.verification_status`
    
- On error: show generic but safe error (“Verification failed. Please check your details or contact support.”)
    

---

## 3.3 Citizen Report

**Screen:**

- `/citizen/report`
    

**API:**

- `POST /citizen/incidents`
    

**Frontend:**

- Build `location` object from map coordinates
    
- Pass description, optional type & image URL
    
- On success: redirect `/citizen/incidents/:id` + toast
    
- On error: show message, allow retry
    

---

## 3.4 Agency Dashboard

**Screen:**

- `/agency/dashboard`
    

**API:**

- `GET /agency/incidents` with filters
    
- WS: subscribe to `agency/{agency_id}/incidents` channel
    

**Frontend:**

- On load: fetch incidents → populate map & table
    
- On WebSocket event:
    
    - Update local list and map markers
        
    - Show toast for new high-severity incident
        

---

## 3.5 Incident Verification (Operator)

**Screen:**

- `/agency/incidents/:id`
    

**API:**

- `GET /agency/incidents/:id`
    
- `PATCH /agency/incidents/:id/verify`
    
- `PATCH /agency/incidents/:id/reject`
    

**Frontend:**

- Show existing values, AI suggestions
    
- On verify:
    
    - send payload with final category & severity
        
    - optimistic update status → Verified
        

---

## 3.6 Admin Agency Approval

**Screen:**

- `/admin/agency-requests`
    

**API:**

- `GET /admin/agency-requests`
    
- `POST /admin/agency-requests/{id}/approve`
    
- `POST /admin/agency-requests/{id}/reject`
    

**Frontend:**

- Approve:
    
    - Immediately changes status in UI
        
    - Optionally open modal showing credentials or “Agency admin invited”
        

---

# ⭐ 4. Component Library Specification (Core)

To avoid bloating, I’ll list key reusable components that matter for implementation & proposal.

---

## 4.1 Generic Components

- `Button` – variants: primary, secondary, danger, ghost.
    
- `Input` – text, email, number.
    
- `TextArea` – for description.
    
- `Select` – for incident type, roles.
    
- `Badge` – severity, status, verification.
    
- `Modal` – confirmation dialogs, blocking messages.
    
- `Toast` – global notifications.
    
- `Tabs` – for agency incident detail.
    
- `Table` – data lists.
    
- `Card` – for stats and grouped content.
    
- `Stepper` – multi-step forms (report, verification).
    

---

## 4.2 Specialized Components

- `VerificationStatusBadge`
    
    - Props: `status` (`unverified | pending | verified | rejected`)
        
- `IncidentStatusTimeline`
    
    - Props: `history` (status changes with timestamps)
        
- `IncidentSeverityPill`
    
    - Props: `severityLabel` (1–5)
        
- `MapView`
    
    - Props: `incidents`, `center`, `selectedIncident`, `onMarkerClick`
        
- `JurisdictionEditor`
    
    - Props: polygon, onSave
        
- `IncidentFilterBar`
    
    - Props: filters, onChange
        
- `NotificationBell`
    
    - Props: `unreadCount`
        

---

# ⭐ 5. Backend Implementation Roadmap (Condensed)

Assume ~10–12 weeks for a solid academic project. You can compress if needed.

---

## Week 1–2: Foundations

- Setup project structure (FastAPI or NestJS)
    
- Connect to Postgres + PostGIS
    
- Implement `users` table, migration system
    
- Implement basic auth (`/auth/login`, `/auth/signup/citizen`)
    
- Implement RBAC decorators/guards
    

---

## Week 3: Citizen Core

- Implement `citizen` endpoints:
    
    - `/citizen/incidents` (GET/POST)
        
    - Basic incident schema (without AI or GIS integration yet)
        
- Seed some incidents for testing
    
- Add basic validation & status enum
    

---

## Week 4: GIS Basics

- Enable PostGIS
    
- Add `geom` column + GIST index to incidents
    
- Implement `/maps/incidents` for bounding box queries
    
- Return GeoJSON from backend
    

---

## Week 5: AI Service

- Stand up a separate minimal FastAPI microservice
    
- Implement `/ai/classify` that returns stubbed classification first
    
- Integrate call from main API when citizen posts incident
    
- Store AI output in `ai_outputs`
    

---

## Week 6: Agency Module

- Implement `agencies` table and `agency_applications`
    
- Implement `/agency/request-access`
    
- Implement `/admin/agency-requests` to review
    
- Create `agency_staff` users and guard
    

---

## Week 7: Incident Lifecycle

- Implement operator verification flows
    
- Implement dispatcher assignment flows
    
- Implement `incident_status_history`
    
- Add notifications table + simple polling
    

---

## Week 8: Verification (FAYDA)

- Implement `citizen_verifications` table
    
- Build `/citizen/verification/fayda/start` with mock validation
    
- Gate reporting behind `verification_status='verified'`
    

---

## Week 9: Analytics & Admin

- Implement agency-level analytics endpoints
    
- Implement admin dashboards (users, logs)
    

---

## Week 10+: Polish & Demo Mode

- Seed DB with demo data
    
- Add fake AI responses & fake verification flows
    
- Fix security holes, timeouts, error handling
    

---

# ⭐ 6. Frontend Implementation Roadmap (Condensed)

## Week 1–2

- Scaffold React app with routing & Tailwind
    
- Create `PublicLayout`, `CitizenLayout`, `AgencyLayout`, `AdminLayout`
    
- Implement landing page and login forms
    

## Week 3–4

- Implement `AuthContext` and guards
    
- Build citizen dashboard screens
    
- Implement `/citizen/verify` and `/citizen/report`
    

## Week 5–6

- Integrate map library & show incidents
    
- Implement citizen “My Incidents” list & detail
    

## Week 7–8

- Agency dashboard with map & table
    
- Incident detail view with actions
    
- Admin screens (basic)
    

## Week 9–10

- Analytics charts
    
- WebSocket support (optional but nice)
    
- Polish UI/UX; handle edge states
    

---

# ⭐ 7. Integration Workflow (GIS + AI + Verification)

**End-to-end pipeline when a citizen reports:**

1. **Auth & Verification**
    
    - User has `verification_status='verified'`.
        
2. **Report submission**
    
    - POST `/citizen/incidents` with GPS location.
        
3. **Backend**
    
    - Store incident record in DB.
        
    - Call AI `/ai/classify` with text + location.
        
    - Store AI output; map severity score to severity label.
        
    - Status `pending_verification`.
        
4. **GIS Engine**
    
    - Location field stored in `geom`.
        
    - Future queries include this point.
        
5. **Agency Dashboard**
    
    - Pull incidents via `GET /agency/incidents`.
        
    - Map draws markers; filter by jurisdiction.
        
6. **Operator**
    
    - Opens incident → sees AI suggestion + FAYDA verified citizen.
        
7. **Dispatcher**
    
    - Assigns to relevant unit.
        
8. **Response**
    
    - Status moves to `in_response` then `resolved`.
        
9. **Citizen**
    
    - Sees timeline change via `/citizen/incidents/:id`.
        

---

# ⭐ 8. System-Wide Sequence Diagrams (in Text)

### 8.1 Login + Verification (Citizen)

`Citizen → Web App: opens /login/citizen Citizen → Web App: submits credentials Web App → API: POST /auth/login API → DB: validate user & password DB → API: ok, return user role + verification_status API → Web App: token + user info Web App: store token & context Citizen → Web App: visits /citizen/report Web App: checks verification_status IF not verified:    Web App → show modal "Verify FAYDA"    Citizen → Web App: clicks "Verify"    Web App → API: POST /citizen/verification/fayda/start    API → FAYDA Service: validate ID    FAYDA Service → API: verified    API → DB: update users.verification_status='verified'    API → Web App: success    Web App: update context & redirect /citizen/report`

---

### 8.2 Citizen → Report → AI → Operator → Dispatcher → Response

`Citizen → Web App: fills report & submits Web App → API: POST /citizen/incidents API → DB: INSERT incident (status=submitted) API → AI Service: POST /ai/classify AI Service → API: category + severity + confidence API → DB: INSERT ai_outputs + UPDATE incident (status=pending_verification) API → Web App: success response Web App → Citizen: show "Submitted" + redirect /citizen/incidents/:id  Operator → Web App: opens /agency/incidents Web App → API: GET /agency/incidents?status=pending_verification API → DB: SELECT incidents by jurisdiction & status API → Web App: list Operator → Web App: opens incident detail Web App → API: GET /agency/incidents/{id} API → DB: join incidents + ai_outputs + user info API → Web App: detail  Operator → Web App: clicks "Verify" Web App → API: PATCH /agency/incidents/{id}/verify API → DB: UPDATE incident.status='verified', category_final, severity_final API → DB: INSERT incident_status_history API → Notifications: create event for dispatcher Dispatcher → Web App: sees updated queue, assigns, sets "in_response" Responder → marks "resolved" Citizen → sees status updates in My Incidents`

---

### 8.3 Agency Application → Admin Approval → Onboarding

`Agency Applicant → Web App: /agency/request-access Web App → API: POST /agency/request-access API → DB: INSERT agency_applications (status=pending)  Admin → Web App: /admin/agency-requests Web App → API: GET /admin/agency-requests Admin → Web App: clicks "Approve" Web App → API: POST /admin/agency-requests/{id}/approve API → DB:     - UPDATE application.status='approved'     - INSERT agencies row     - INSERT users row as agency_admin API → Email Service: send login instructions Agency Admin → logs in → /agency/dashboard`

---

# ⭐ 9. Data Migration & Demo Mode

For the senior project defense, you want a **demo-friendly setup**.

### 9.1 Preloading Data

- Citizens:
    
    - 2–3 demo citizens (verified via mock FAYDA)
        
- Agencies:
    
    - Police, Fire, Medical for Addis Ababa
        
- Incidents:
    
    - 20–30 seeded incidents with realistic locations
        

### 9.2 Mocking AI

- For defense, you don’t need serious ML.
    
- Implement `/ai/classify` like:
    
    - If `text` contains “fire” → category = fire, severity = 4
        
    - If `text` contains “accident, crash” → category = accident, severity = 3
        
    - Else → generic category, severity = 2
        

You can keep the architecture but the logic simple.

### 9.3 Mocking FAYDA

- `/citizen/verification/fayda/start`:
    
    - If `fayda_id` starts with “99” → treat as valid
        
    - Else fail
        
- This shows the flow without requiring real integration.
    

---

# ⭐ 10. Final Deliverable

You now have:

- ✅ Master user flows
    
- ✅ High-level architecture
    
- ✅ Screen & routing map
    
- ✅ Component library
    
- ✅ API–UI integration mapping
    
- ✅ Database schema & ERD
    
- ✅ Detailed incident lifecycle
    
- ✅ FAYDA verification architecture
    
- ✅ GIS & AI designs
    
- ✅ Backend + frontend implementation roadmaps
    
- ✅ Sequence diagrams
    
- ✅ Demo mode strategy
    

This is **more than enough** for:

- Your **project proposal** deep technical sections
    
- Your **system design & implementation chapters**
    
- A real, buildable MVP