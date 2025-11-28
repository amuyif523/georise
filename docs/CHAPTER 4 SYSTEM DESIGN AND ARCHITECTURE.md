# ⭐ **CHAPTER 4: SYSTEM DESIGN AND ARCHITECTURE**

_(Formatted as a complete academic chapter for the GEORISE Senior Project Report)_

---

# **4.1 Introduction**

The System Design and Architecture chapter presents the technical foundation of the GEORISE platform, an AI-enhanced, GIS-driven emergency incident management system tailored for Ethiopian urban environments. This chapter translates the conceptual requirements and user needs gathered in earlier phases into concrete architectural structures, subsystem designs, data models, and internal interactions.

The design focuses on achieving:

1. **Scalability** for large-scale urban environments,
    
2. **Reliability** for time-critical operations,
    
3. **Security** for sensitive identity and incident information,
    
4. **Usability** for citizens, agencies, and administrators, and
    
5. **Extensibility** for future integration with government systems (e.g., real FAYDA, National ID systems, or 112 hotlines).
    

The architecture employs a modular service-oriented approach that supports separation of concerns, high maintainability, and clear data governance. Each subsystem—Authentication, Incident Management, GIS Engine, AI Classification Engine, Verification, and Administrative Control—is designed to address specific responsibilities while interacting harmoniously through well-defined APIs.

---

# **4.2 Architectural Overview**

The GEORISE system follows a **modular microservice-inspired architecture** deployed behind a unified API gateway. The platform comprises six major subsystems:

1. **Frontend Web Application**
    
2. **API Gateway / Backend Core Service**
    
3. **Authentication & RBAC Service**
    
4. **Incident Management & Workflow Service**
    
5. **GIS Engine (PostGIS-based Spatial Processing)**
    
6. **AI Classification & Severity Scoring Service**
    
7. **Verification Service (FAYDA-ID Mock Integration)**
    
8. **Notification & Real-Time Event Service**
    
9. **Database Cluster (Postgres + PostGIS)**
    

A high-level text diagram of the complete architecture:

`┌────────────────────────────────────────────────────────────────┐ │                       FRONTEND (React)                         │ │   Citizens • Agency Staff • Agency Admin • System Admin        │ └───────────────▲───────────────────────────────▲────────────────┘                 │                               │ WebSocket                 │ HTTP/HTTPS                    │                 ▼                               ▼ ┌────────────────────────────────────────────────────────────────┐ │                       API GATEWAY / CORE                       │ │ Authentication • RBAC • Rate Limiting • Routing • Validation   │ └───────────────┬───────────────────────────────┬────────────────┘                 │                               │                 │                               │      ┌──────────▼──────────┐         ┌──────────▼──────────┐      │ Incident Management  │         │ Authentication/RBAC │      │ Verification Workflow │         │ Verification Engine │      └──────────▲──────────┘         └──────────▲──────────┘                 │                               │ ┌───────────────┼───────────────────────────────┼────────────────────────┐ │               │                               │                        │ │     ┌─────────▼─────────┐         ┌───────────▼──────────┐   ┌────────▼────────┐ │     │   GIS ENGINE       │         │ AI CLASSIFICATION     │   │ NOTIFICATION    │ │     │ PostGIS • Spatial  │         │ NLP • Severity Score  │   │ Email • Alerts  │ │     └─────────▲─────────┘         └───────────▲──────────┘   └────────▲────────┘ │               │                               │                        │ └───────────────┼───────────────────────────────┼────────────────────────┘                 ▼                               ▼            ┌────────────────────────────────────────────┐            │       DATABASE (Postgres + PostGIS)        │            │ Users • Incidents • Geometry • Logs • AI   │            └────────────────────────────────────────────┘`

---

# **4.3 Detailed Subsystem Designs**

Below is a breakdown of each module, its internal responsibilities, major functions, and interactions.

---

# **4.3.1 Frontend Web Application**

### **Responsibilities**

- Render user interfaces for all roles
    
- Manage state (authentication, permissions, GIS layers)
    
- Communicate with backend via REST + WebSocket
    
- Enforce RBAC client-side
    
- Provide offline support (partial)
    
- Render map visualizations
    

### **Key Modules**

- `AuthModule`
    
- `CitizenModule`
    
- `AgencyModule`
    
- `AdminModule`
    
- `IncidentModule`
    
- `MapModule`
    
- `NotificationModule`
    

### **Frameworks & Tools**

- React
    
- React Router
    
- Zustand or React Query
    
- TailwindCSS
    
- Mapbox GL JS or Leaflet
    
- Axios
    

---

# **4.3.2 Backend Core Service**

### **Responsibilities**

- Route all requests
    
- Validate and authenticate incoming requests
    
- Coordinate workflows between subsystems
    
- Apply rate limiting (especially for reporting)
    
- Expose REST APIs for frontend
    
- Interface with database
    
- Manage session tokens
    

### **Primary Modules**

- `AuthController`
    
- `IncidentController`
    
- `AgencyController`
    
- `AdminController`
    
- `GISController`
    
- `AIController`
    
- `VerificationController`
    

---

# **4.3.3 Authentication & RBAC Service**

### **Purpose**

Enforces secure access control across user roles:

- Citizen (unverified → verified)
    
- Agency Applicant
    
- Agency Staff
    
- Agency Admin
    
- System Admin
    

### **RBAC Matrix**

|Action|Citizen|Verified Citizen|Agency Staff|Agency Admin|System Admin|
|---|---|---|---|---|---|
|Report Incident|❌|✔️|❌|❌|❌|
|View Public Incidents|✔️|✔️|✔️|✔️|✔️|
|Verify Incidents|❌|❌|✔️|❌|✔️|
|Assign Incidents|❌|❌|✔️|✔️|✔️|
|Manage Users|❌|❌|❌|Partial|✔️|
|Manage Agencies|❌|❌|❌|✔️|✔️|

### **Authentication Flow**

- JWT-based access tokens (short-lived)
    
- Refresh tokens (server-stored)
    
- Session validation on each request
    
- Permission check per route
    

---

# **4.3.4 Incident Management Subsystem**

### **Responsibilities**

- Create, store, classify, verify, assign, and track incidents
    
- Maintain incident lifecycles and history logs
    
- Trigger notifications for agency staff
    
- Expose filtered GIS-aware queries for maps
    

### **Incident States**

`RECEIVED → AI_CLASSIFIED → OPERATOR_VERIFIED → ASSIGNED → IN_RESPONSE → RESOLVED → ARCHIVED`

### **Core Modules**

- `IncidentService`
    
- `AIServiceConnector`
    
- `GISRoutingModule`
    
- `AssignmentService`
    
- `IncidentStatusHistoryService`
    
- `IncidentLogService`
    

---

# **4.3.5 GIS Engine (PostGIS)**

### **Capabilities**

- Spatial indexing
    
- Heatmap generation
    
- Clustering (DBSCAN / KMeans optional)
    
- Spatial filters (radius, polygon)
    
- Jurisdiction mapping
    
- Nearest-agency routing
    
- Buffering (safe zones, hazard radius)
    
- Real-time map updates
    

### **Key Spatial Queries**

- `ST_DWithin`
    
- `ST_Contains`
    
- `ST_Intersects`
    
- `ST_ClusterDBSCAN`
    
- `ST_AsGeoJSON`
    

### **Geometry Types**

- Incident location → `POINT`
    
- Agency jurisdiction → `MULTIPOLYGON`
    
- Road segments (optional) → `LINESTRING`
    

---

# **4.3.6 AI Classification Service**

### **Responsibilities**

- Classify incident type (accident, fire, crime, medical emergency, hazard)
    
- Predict severity score (1–5)
    
- Provide confidence levels
    
- Provide text explanation (keyword-based for demo)
    
- Support human override
    

### **Pipeline**

`raw_text  → cleanup  → tokenization  → NLP classification (DistilBERT or stub model)  → severity scoring  → response payload`

### **Output**

`{   "category": "Accident",   "severity": 3,   "confidence": 0.84,   "explanation": "Detected keywords: 'crash', 'injury'" }`

---

# **4.3.7 Verification Subsystem (FAYDA National ID)**

### **Purpose**

Prevent fake reports by requiring Ethiopian National ID verification.

### **Workflow**

1. Citizen enters National ID, full name, DOB
    
2. Mock FAYDA API checks pattern, format, name similarity
    
3. OTP is sent to provided phone
    
4. User enters OTP
    
5. Verification is stored in `citizen_verifications` table
    
6. User now obtains permission to report incidents
    

### **Security Considerations**

- Masked ID display
    
- No storage of sensitive PII
    
- Fraud monitoring (repeated failed attempts)
    

---

# **4.3.8 Notification Subsystem**

### **Channels**

- Real-time (WebSockets)
    
- Email (optional)
    
- In-app notifications
    

### **Triggered By**

- Incident classification
    
- Operator verification
    
- Dispatcher assignment
    
- Status transitions
    
- Admin approval actions
    

---

# **4.4 Database Schema (Postgres + PostGIS)**

Below is the complete schema.

---

## **4.4.1 Tables Overview**

|Table|Description|
|---|---|
|`users`|All user accounts (citizen, staff, admin)|
|`citizen_verifications`|FAYDA verification results|
|`agencies`|Registered agencies|
|`agency_staff`|Staff linked to agencies|
|`agency_applications`|Onboarding requests|
|`incidents`|Primary incident records|
|`incident_ai_outputs`|AI classification results|
|`incident_status_history`|Audit of state transitions|
|`notifications`|System notifications|
|`logs`|System-wide audit logs|

---

## **4.4.2 ERD (Text Diagram)**

`users (id PK)  ├──< citizen_verifications.user_id  ├──< incidents.reporter_id  ├──< incident_status_history.changed_by  └──< agency_staff.user_id  agencies (id PK)  ├──< agency_staff.agency_id  └──< incidents.assigned_agency_id  incidents (id PK)  ├── incident_ai_outputs.incident_id  └── incident_status_history.incident_id  agency_applications (id PK)  └──> agencies.id (created after approval)`

---

# **4.5 Sequence Diagrams**

### **4.5.1 Citizen Reporting Flow**

`Citizen → WebApp: Submit incident WebApp → API: POST /citizen/incidents API → DB: INSERT incident API → AI: classify() AI → API: return classification API → DB: UPDATE incident API → NotificationService: notify agencies DB → WebApp: success response`

---

### **4.5.2 Agency Verification Flow**

`Operator → WebApp: Verify incident WebApp → API: PATCH /agency/incidents/{id}/verify API → DB: Update status → VERIFIED DB → NotificationService: notify dispatchers`

---

# **4.6 System Constraints**

- Designed for **urban Ethiopian infrastructure** (variable bandwidth).
    
- Limited access to real government APIs → uses mock FAYDA integration.
    
- Must operate efficiently with **PostGIS spatial operations**.
    
- Must guarantee secure identity handling.
    

---

# **4.7 Design Considerations & Tradeoffs**

|Alternative|Chosen Approach|Reason|
|---|---|---|
|Monolith vs Microservices|Hybrid Modular Architecture|Easier academic implementation, still scalable|
|Complex ML vs Simple NLP|Lightweight DistilBERT or keyword-based|Faster inference, easier deployment|
|Real FAYDA Integration|Mock verification|No external access required|
|Full real-time map syncing|Selective WebSocket channels|Reduces resource usage|

---

# **4.8 Non-Functional Requirements**

### **Performance**

- Map queries return < 300ms
    
- AI classification < 500ms
    
- API responses < 1s
    

### **Security**

- JWT authentication
    
- Strict RBAC
    
- ID verification
    
- All sensitive fields masked
    

### **Reliability**

- Retry logic for AI service
    
- DB transaction integrity
    
- Automatic error logging
    

### **Usability**

- Clean UI
    
- Low cognitive load
    
- Mobile-first design