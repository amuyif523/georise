Yesss, this is exactly the right mindset – don’t just “have a system”, know **every click, every screen, every role**. Let’s treat GEORISE like a real product.

I’ll walk you through it in **painfully clear detail**, starting from:

1. Landing page
    
2. CTAs → login / signup
    
3. Citizen signup flow
    
4. Agency signup + approval flow
    
5. Admin panel: how everything is managed
    

We’ll design **flows + pages + roles + logic**.

---

## 0. First: Who are the main user types?

Let’s fix the cast of characters:

1. **Visitor (not logged in)** – sees landing page.
    
2. **Citizen User** – can report incidents, view own reports, maybe public map.
    
3. **Agency Staff** – belongs to an agency (Police, Fire, Medical, Traffic, Disaster, etc.).
    
    - Within this, we have:
        
    - **Agency Admin** (for that organization)
        
    - **Operator / Dispatcher / Analyst** (normal staff)
        
4. **System Admin (GEORISE Admin)** – top-level, manages agencies, users, categories, system config, etc.
    

Everything we design will revolve around these.

---

## 1. Landing Page – Purpose and Structure

### 1.1 Main Purpose of the Landing Page

The landing page is **not** for “everyone to use the system directly”. It has three main roles:

1. Explain **what GEORISE is**
    
2. Direct people to the correct **portal** (Citizen / Agency / Admin login)
    
3. Provide a way for **new agencies to request access**
    
4. OPTIONAL: show a **read-only demo map** (for wow effect)
    

### 1.2 Top-level layout

**Header (top navigation):**

- Logo: `GEORISE`
    
- Menu items:
    
    - Home
        
    - How It Works
        
    - For Citizens
        
    - For Agencies
        
    - About / Contact
        
- Right side:
    
    - `Login` button (opens role selection)
        
    - `Request Agency Access` button (for agencies that want to join)
        

**Hero section:**

- Headline:  
    _“Real-Time AI-Driven Geospatial Incident Intelligence for Ethiopian Cities”_
    
- Subtext:  
    Short 2–3 lines explaining that GEORISE helps citizens report incidents and agencies coordinate responses.
    
- Two main CTAs:
    
    - `Report an Incident` → Citizen signup/login
        
    - `Open Agency Portal` → Agency login (or info if not registered)
        

**Below Hero: Core Sections**

1. **How It Works (3 steps)**
    
    - Citizen reports
        
    - AI + GIS analyze
        
    - Agencies respond
        
2. **For Citizens**
    
    - Short explanation, “Stay safe, report emergencies quickly.”
        
    - Button: `Start as a Citizen`
        
3. **For Agencies**
    
    - Short explanation: “Unified operational picture for emergency services.”
        
    - Button: `Learn About Agency Portal` → more detail + `Request Access`
        
4. **Preview Map (optional)**
    
    - Read-only mock map with demo incidents
        
5. **Footer**
    
    - Version info, contact, disclaimers (demo system, academic project, etc.)
        

---

## 2. Login / Signup Entry: CTAs from the Landing Page

When user clicks:

### 2.1 `Login` (top-right)

Opens a simple modal:

> **“Choose how you want to log in”**
> 
> - `Citizen Login`
>     
> - `Agency Staff Login`
>     
> - `System Admin Login`
>     

Each button routes to a specific login page:

- `/login/citizen`
    
- `/login/agency`
    
- `/login/admin`
    

### 2.2 `Report an Incident` (hero CTA)

- If **not logged in as citizen** → redirect to `/login/citizen` with **“You must log in to report”**, plus `Create new citizen account`.
    
- If **logged in as citizen** → goes to `/citizen/report`.
    

### 2.3 `Open Agency Portal`

- If not logged in → `/login/agency`.
    
- If logged in as agency staff → main dashboard `/agency/dashboard`.
    

### 2.4 `Request Agency Access`

This links to `/agency/request-access` where an agency can submit an application (we’ll detail it).

---

## 3. Auth & Account Model (how login/signup technically works)

We’ll have a **single `users` table** with a `role` and possibly `agency_id`:

- `users`:
    
    - id
        
    - name
        
    - email
        
    - phone
        
    - password_hash
        
    - role: `citizen`, `agency_admin`, `agency_staff`, `system_admin`
        
    - agency_id (nullable; null for citizens and system admins)
        
    - status: `active`, `pending`, `suspended`
        

**Agencies** live in another table:

- `agencies`:
    
    - id
        
    - name
        
    - type: `police`, `fire`, `medical`, `traffic`, `disaster_other`
        
    - city / region
        
    - jurisdiction_geom (PostGIS polygon or multipolygon)
        
    - status: `pending`, `approved`, `rejected`, `inactive`
        

This gives us clean RBAC and structure.

---

## 4. Citizen Signup Flow – In Detail

### 4.1 Entry point

User clicks:

- `Report an Incident`, or
    
- `Citizen Login` → then “Create new account”
    

They land on `/signup/citizen`.

### 4.2 Citizen signup form (fields)

Form fields:

- Full Name
    
- Phone number (important in Ethiopian context)
    
- Email (optional or required; your choice)
    
- Password
    
- Confirm password
    
- City (dropdown)
    
- Agreement checkbox: “I agree to responsible use and false-report policy.”
    

**UX details:**

- Basic validation: phone format, minimum password length
    
- Show brief warning: “Reporting false incidents may result in account deactivation.”
    

### 4.3 Citizenship verification (lightweight)

Because this is a student project, don’t overcomplicate:

**Simple version:**

- No KYC. Only phone/email verification.
    

**If you want:**

- OTP by SMS (you can simulate this in the demo, no need for real SMS).
    

So the flow:

1. User fills form
    
2. Backend:
    
    - Creates `users` record with role=`citizen`, status=`active`
        
3. Optionally send email/SMS verification token (for demo, just show “verified”)
    

### 4.4 After signup

- Redirect to `/citizen/dashboard` with an onboarding message:
    
    > “Welcome to GEORISE. You can now report incidents and view your submissions.”
    

**Citizen Dashboard basic sections:**

- `Report New Incident`
    
- `My Incidents`
    
- `Profile`
    

We can detail these later if you want.

---

## 5. Agency Signup & Onboarding – In Detail

Important: **Agencies must NOT be able to auto-create official accounts.**  
We want an **application + approval** system controlled by the **System Admin**.

### 5.1 Entry point

From landing page:

- `For Agencies` → `Request Access`
    
- Direct CTA: `Request Agency Access` (header button)
    

Route: `/agency/request-access`

### 5.2 `Request Agency Access` form (Organization-level application)

Fields:

- Agency Name  
    (e.g., “Addis Ababa Fire and Emergency Services Commission”)
    
- Agency Type  
    (dropdown: Police, Fire, Medical, Traffic, Disaster, Other)
    
- City / Region
    
- Official contact person name
    
- Official email
    
- Official phone
    
- Optional: An uploaded document or ID number (for realism, but can be omitted in implementation)
    

Back-end behavior:

- Save into `agency_applications` table or directly into `agencies` with `status=pending`.
    
- Notify System Admin (in real life via email; for demo, show in admin dashboard).
    

### 5.3 Admin reviews agency request

System Admin logs into **Admin Panel**:

- Menu: `Pending Agency Requests`
    
- For each: view details → `Approve` or `Reject`
    

When approved:

1. Admin changes `agencies.status` to `approved`.
    
2. System creates an **Agency Admin user**:
    
    - An invitation token
        
    - Or an initial random password
        
    - Role = `agency_admin`
        
    - Linked to `agency_id`.
        

### 5.4 Agency Admin First-Time Setup Flow

Agency Admin receives link (for project we can just simulate it):

- They go to `/agency/activate` with token or to `/login/agency` with provided credentials.
    

First login:

- Force them to:
    
    - Set new password
        
    - Confirm their details
        
    - Set **jurisdiction** (if not preset)
        

**Agency Admin Dashboard tasks:**

- Create staff accounts
    
- Set internal roles (e.g., Operator, Dispatcher, Analyst)
    
- Configure their preferred notification options
    

---

## 6. Agency Staff Management – Inside the Agency

Once Agency Admin is in:

### 6.1 `Manage Staff` page

Agency Admin can:

- Add new staff:
    
    - Name
        
    - Email
        
    - Phone
        
    - Role: `operator`, `field_officer`, `analyst`
        
- System sends credentials or activation links.
    

These become `users` with:

- `role = agency_staff`
    
- `agency_id = <this agency>`
    

### 6.2 Agency Staff Login

Staff goes to:

- `/login/agency`
    
- Logs in with email/phone + password
    

After login:

- Routed to `/agency/dashboard`.
    

---

## 7. Admin Panel – How We Manage the Whole System

System Admin is the **god-mode user**.

### 7.1 Admin Login

From Landing Page:

- Click `Login` → `System Admin Login` → `/login/admin`
    

Form fields:

- Email
    
- Password
    

On success: `/admin/dashboard`.

---

### 7.2 Admin Dashboard – Main Sections

Think of these menu items:

1. **Overview**
    
    - Total incidents, users, agencies
        
    - Basic statistics
        
2. **Agencies**
    
    - Pending requests
        
    - Approved/rejected list
        
    - Edit agency info (name, type, jurisdiction)
        
3. **Users**
    
    - List all users
        
    - Filter by role
        
    - Suspend / activate accounts
        
4. **Incident Categories & Severity Rules**
    
    - Manage labels like: Fire, Crime, Medical, etc.
        
    - Set color coding
        
    - Configure severity rules:
        
        - Ex: “If category=Fire and keywords include ‘explosion’, set default severity at least 4.”
            
5. **System Settings**
    
    - Default map center (city)
        
    - Default language (Amharic/English)
        
    - Default time zone
        
6. **Audit Logs**
    
    - Track admin changes (optional but nice).
        

---

## 8. Routing & Access Controls (How pages are protected)

### 8.1 Routes overview

- Public:
    
    - `/` → Landing page
        
    - `/login/citizen`, `/login/agency`, `/login/admin`
        
    - `/signup/citizen`
        
    - `/agency/request-access`
        
- Citizen:
    
    - `/citizen/dashboard`
        
    - `/citizen/report`
        
    - `/citizen/incidents/:id`
        
- Agency:
    
    - `/agency/dashboard`
        
    - `/agency/incidents`
        
    - `/agency/incidents/:id`
        
    - `/agency/analytics`
        
    - `/agency/staff` (only agency admin)
        
- Admin:
    
    - `/admin/dashboard`
        
    - `/admin/agencies`
        
    - `/admin/agency-requests`
        
    - `/admin/users`
        
    - `/admin/settings`
        

### 8.2 Middleware logic on backend

Pseudo-middleware:

`function requireAuth(req, res, next) { ... } function requireRole(roleOrRoles) { ... } // e.g. ['agency_admin', 'agency_staff']`

Applied like:

- `/citizen/*` → requireAuth + role == citizen
    
- `/agency/*` → requireAuth + role in [agency_staff, agency_admin]
    
- `/admin/*` → requireAuth + role == system_admin
    

---

## 9. How This All Ties Into “What We Build and How”

What you now have is:

- A clear **entry experience**:
    
    - Landing page → role-based CTAs
        
- Clear **account types**:
    
    - Citizens sign themselves up
        
    - Agencies apply → admin approves → agency admin creates staff
        
    - System admin is special, pre-seeded
        
- Clear **admin control**:
    
    - Nothing official (agencies, categories) enters the system without admin approval
        
- Clear **URL design** and **RBAC**:
    
    - Makes backend + frontend structure much easier
        
- Clear mapping to your **proposal**:
    
    - Everything we described fits under your System Overview, Methodology, and RBAC parts.
- If you like this, next we can go deeper into either:

1. **Citizen user flow in full detail** (exact fields, database, every screen)
    
2. **Agency dashboard design** (what columns, filters, map filters)
    
3. **Admin panel UX** (how to make it logical and not messy)
    
4. **Authentication & security details** (password storage, tokens, sessions)
    

Tell me which one you want to zoom into next.



# 1. Overview

**Platform:** GEORISE – Geospatial Real-Time Incident System Enhanced by AI  
**Core idea:** Citizens report incidents → AI + GIS classify + place them → Agencies coordinate response via multi-agency dashboards → System Admin governs everything.

**User types:**

1. Visitor (not logged in)
    
2. Citizen
    
3. Agency Applicant
    
4. Agency Admin
    
5. Agency Staff (Operator / Dispatcher / Analyst)
    
6. System Admin
    

We’ll document:

- User flows (per role)
    
- Cross-role interaction flows
    
- Incident lifecycle
    
- GIS & AI flows
    
- Admin & technical notes
    
- State diagrams (in text)
    

---

# 2. Role-by-Role User Flows

---

## 2.1 Visitor (Not Logged In)

### 2.1.1 Landing Page Flow

**Entry points:**

- Direct URL (e.g., `georise.et`)
    
- Referral link
    
- Search result
    
- Deep link to `/login/...` that redirects back to `/` if not auth’d
    

**Screens:**

- `LandingPage` (we already implemented)
    
- Optional: `/about`, `/help`
    

**Flow:**

`[Visitor]   ↓ open / [Landing Page]   ↓ can:     - Scroll sections     - Click CTAs:       - "Start as a Citizen"       - "Open Agency Portal"       - "Request Agency Access"       - "Login" (role modal)       - "Learn more" links`

**Actions:**

- Click “Login” → role selection modal
    
- Click “Start as Citizen” → `/login/citizen`
    
- Click “Open Agency Portal” → `/login/agency`
    
- Click “Request Agency Access” → `/agency/request-access`
    

**Psychology:**

- **Clarity (Krug):** Single sentence explaining GEORISE. Context in 3–5 seconds.
    
- **Safety (Sutherland):** Microcopy about privacy, “your report is secure”.
    
- **Choice Architecture:** Only a few main choices (Citizen vs Agency vs Admin) to avoid decision fatigue.
    

---

### 2.1.2 Login Entry Flow (Generic)

**Screens:**

- `LoginRoleModal`
    
- `/login/citizen`
    
- `/login/agency`
    
- `/login/admin`
    

**Flow:**

`[Landing Page]   → click Login [Role Modal]   → select role:      - Citizen → /login/citizen      - Agency Staff → /login/agency      - System Admin → /login/admin`

**Behavioral aspect:** Role modal pre-frames the mental model: “This system has distinct portals” → feels professional, gov-tech grade.

---

## 2.2 Citizen Flows

### 2.2.1 Citizen Signup Flow

**Entry points:**

- From `/login/citizen` (“Create account”)
    
- From “Start as a Citizen” CTA
    

**Screens:**

- `/signup/citizen` (form)
    
- `/citizen/welcome` (optional)
    
- `/citizen/dashboard`
    

**Flow:**

`[Landing Page] → CTA "Start as Citizen"    ↓ [/login/citizen]    ↓ click "Create account" [/signup/citizen]    ↓ submit (success) [/citizen/dashboard] (or /citizen/welcome)`

**Form fields & validations:**

- `full_name` (required, string, 2–60 chars)
    
- `phone` (required, pattern + unique)
    
- `email` (optional or required; must be unique if provided)
    
- `password` / `confirm_password` (min length, match)
    
- Checkbox: “I agree to responsible reporting policy”
    

**Business logic:**

- Create `users` record:
    
    - `role = 'citizen'`
        
    - `status = 'active'`
        
- Optionally create `contact_preferences` row
    
- Auto-login (JWT) and redirect to dashboard
    

**UX / psychology:**

- Only essential fields → minimal friction.
    
- Hint near phone number: “Used only for verification or follow-up in emergencies.”
    
- Checkbox with clear, short policy (no long terms wall).
    

---

### 2.2.2 Citizen Login Flow

**Screens:**

- `/login/citizen`
    
- `/citizen/dashboard`
    

**Flow:**

`[/login/citizen]   - enters phone/email + password   - clicks Login     ↓   Backend:     - validate creds     - check role === citizen     - check status === active     - issue JWT     ↓ success [/citizen/dashboard]`

**Error paths:**

- Wrong password → inline error “Phone or password incorrect.”
    
- Inactive / suspended user → “Your account is temporarily restricted. Contact support.”
    

**Security:**

- Rate-limiting on login
    
- Lockout after N attempts (soft-lock with password reset option)
    

---

### 2.2.3 First-Time Citizen Onboarding (Optional but nice)

**Goal:** Reduce confusion & explain “what happens after you report”.

**Flow:**

`[/citizen/dashboard] on first login   ↓ show onboarding overlay:      Slide 1: What GEORISE does      Slide 2: How to submit a report      Slide 3: How to see your report status   ↓ CTA "Got it" [/citizen/dashboard] normal view`

This massively reduces future “I don’t understand what happened to my report” anxiety.

---

### 2.2.4 Citizen Incident Reporting Flow

**Entry points:**

- `Report New Incident` button on `/citizen/dashboard`
    
- Floating “+ Report” button
    

**Screens:**

- `/citizen/report`
    
- `/citizen/report/confirm` or redirect to `/citizen/incidents/:id`
    

**Steps:**

1. **Open form**
    
    - Show: “When to use GEORISE / emergency numbers” note
        
    - Incident type (optional / pre-suggested)
        
    - Description
        
    - Location (auto & manual)
        
    - Media upload
        
2. **User fills form**
    
3. **Submit → Backend:**
    
    - Create `incidents` row with status = `submitted`
        
    - Trigger AI service:
        
        - POST `/ai/classify`
            
        - Payload: `{description, optional media metadata, language, location}`
            
    - Store AI output in `ai_outputs`:
        
        - `category`, `severity`, `confidence`, `summary`
            
4. **System response:**
    
    - Show “Report submitted” page with:
        
        - Incident ID
            
        - “Currently under verification”
            
        - Link: `View Incident`
            
5. **Redirect to My Incidents or incident detail view**
    

**Error states:**

- Location fails → prompt: “We couldn’t detect your location. Please tap the map to drop a pin.”
    
- Submission failure → store locally (in browser localStorage) → retry mechanism.
    

**Psychology:**

- Use a progress bar (Step 1 → Step 2 → Submit).
    
- Autofocusing fields, helpful placeholder text.
    
- Make user feel: “This is fast and serious, not complicated.”
    

---

### 2.2.5 Citizen “My Incidents” & Tracking Flow

**Screens:**

- `/citizen/incidents`
    
- `/citizen/incidents/:id`
    

**List view:**

- Show cards with:
    
    - Category
        
    - Status (Pending, Verified, Assigned, Responding, Resolved)
        
    - Severity badge
        
    - Short summary
        
    - Time & location
        

**Detail view:**

- Full description
    
- Timeline of status changes
    
- Which agency is currently responsible
    
- Map location
    

**Empty-state flow:**

- If no incidents:
    
    - Show illustration + text:
        
        - “You haven’t reported any incidents yet.”
            
        - CTA: `Report your first incident`
            

**Behavioral principle:** Positive reinforcement and clarity instead of blank screen.

---

### 2.2.6 Citizen Notification Flow

**Types:**

- Status updated
    
- Incident resolved
    
- Request for more info (operator asks follow-up question)
    

**Flow:**

`System changes incident.status   → create notification record (citizen_id, type, incident_id)   → if push or email configured, send [/citizen/dashboard]   - Bell icon shows unread count   - Clicking shows dropdown with notices`

**Recovery:** If user misses push, they still see status change in “My Incidents”.

---

### 2.2.7 Password Reset & Logout

**Password reset:**

- `/forgot-password` → ask for phone/email
    
- Backend sends code or link (for demo, just simulate)
    
- `/reset-password?token=...` → new password
    
- Validate, update hash, redirect `/login/...`.
    

**Logout:**

- Clear token (localStorage/cookies)
    
- Redirect `/` or `/login/citizen`
    
- Show toast “Logged out.”
    

---

## 2.3 Agency Applicant Flows

### 2.3.1 Agency Access Request

**Entry:** `Request Agency Access` from landing or footer.

**Screens:**

- `/agency/request-access`
    
- `/agency/request-access/submitted`
    

**Form fields:**

- Agency name
    
- Agency type
    
- City / Region
    
- Official Contact Name
    
- Official Email
    
- Official Phone
    
- Additional info textarea
    

**Flow:**

`[/agency/request-access]   - fill form   - submit   → backend:       - create agency_application (status=pending_review)       - optionally create agencies row with status='pending' [/agency/request-access/submitted]   - "Thank you. We will contact you after verification."`

**Psychology:**

- Feels formal and official.
    
- Reduces risk of random people pretending to be agencies.
    

---

## 2.4 Agency Admin Flows

### 2.4.1 Agency Approval + Admin Creation (cross-role with System Admin; details later)

Once approved, System Admin:

- Creates `agencies` record with `status='approved'`
    
- Creates `users` record:
    
    - role = `agency_admin`
        
    - `agency_id`
        
    - sends credentials or activation link
        

### 2.4.2 First-Time Login Flow (Agency Admin)

**Screens:**

- `/login/agency`
    
- `/agency/setup` (first-time wizard)
    
- `/agency/dashboard`
    

**Flow:**

`[/login/agency]   - agency admin logs in   - system checks: is_first_login     ↓ yes [/agency/setup]   Step 1: Confirm agency info   Step 2: Define jurisdiction (draw or confirm polygon)   Step 3: Configure categories & notification preferences   ↓ complete [/agency/dashboard]`

**UX:** Use a 3-step wizard; reduces overwhelm.

---

### 2.4.3 Agency Staff Onboarding Flow

**Screens:**

- `/agency/staff`
    
- `/agency/staff/new`
    
- Optional: `/agency/staff/:id`
    

**Flow:**

`[Agency Admin Dashboard] → "Manage Staff" [/agency/staff]   ↓ click "Add Staff" [/agency/staff/new]   - Enter:       name, email, phone, role (operator, dispatcher, analyst)   - Submit   ↓ backend:      - create user (role='agency_staff', agency_id, status='pending_activation')      - send invite or temp password [/agency/staff]   - show staff list & statuses`

**Branch:** Staff activation

- Staff visits `/login/agency`
    
- If `status='pending_activation'`, force set password & confirm profile.
    

---

## 2.5 Agency Staff (Operator / Dispatcher / Analyst) Flows

We’ll focus on primary flows used by agency staff.

### 2.5.1 Login Flow

Same as agency admin, but role = `agency_staff`.

---

### 2.5.2 Multi-Agency Dashboard Flow (Per Agency)

**Screens:**

- `/agency/dashboard` (map + incident list)
    
- Filters panel
    
- Incident detail view `/agency/incidents/:id`
    

**Features:**

- Map with real-time incident markers
    
- List with sorting & filtering:
    
    - Status, severity, category, recency
        
- For each incident, staff can:
    
    - View details
        
    - Change status (depending on role)
        
    - Assign internal units or mark as “Responding” / “Resolved”
        

**Flow:**

`[/agency/dashboard]   ↓ default view:     - filter = "Active" incidents within agency jurisdiction   ↓ user interacts:     - Click marker → open incident detail side panel     - Click list item → open detail page`

**Incident detail actions (Operator):**

- Verify incident (if status=submitted)
    
- Add internal notes
    
- Request more info from citizen
    
- Assign to internal unit
    
- Update status to `dispatched`, `responding`, `resolved`.
    

**Behavioral design:**

- Clear color coding by severity/status
    
- Reduce cognitive overload by good defaults (e.g., show “high severity first”).
    

---

### 2.5.3 Incident Verification Flow (Operator)

This is critical.

**Entry:** From `/agency/incidents` list with `status='submitted'`.

**Steps:**

1. Open incident detail
    
2. See:
    
    - Citizen report
        
    - AI classification
        
    - AI severity & confidence
        
    - Map position
        
    - Previous similar incidents nearby
        
3. Operator chooses:
    

- A) Accept & Verify
    
- B) Reject as spam / invalid
    
- C) Request more information
    

**Branches:**

- **A – Verify:**
    
    - `incident.status` → `verified`
        
    - `verified_by = operator_id`
        
    - Auto-suggest route to relevant department (e.g., fire vs police)
        
    - Allow operator to confirm assignment → move to `assigned`
        
- **B – Reject:**
    
    - `status = rejected`
        
    - A notification to citizen explaining reason.
        
- **C – Request more info:**
    
    - Create message to citizen
        
    - `status = pending_citizen_response`
        
    - If citizen doesn’t respond within timeout → escalate or close as stale.
        

---

## 2.6 System Admin Flows (high-level here, more later in Admin section)

System Admin manages:

- Agencies
    
- Users
    
- System config
    
- AI & GIS configurations
    
- High-level analytics
    

We’ll detail in section 7 & 8.

---

# 3. Cross-System Interaction Flows

Now we connect roles together.

---

## 3.1 Citizen → AI → Operator → Agency → Response Flow

**High-level diagram:**

`[Citizen]   ↓ submit report [Backend]   ↓ call AI classify [AI Service]   ↓ returns category + severity [Incident = submitted + ai_metadata]   ↓ Operator reviews [Operator]   - verifies / rejects / requests info   ↓ verified + assigned [Agency Staff / Dispatcher]   - accepts incident   - assigns resources   - updates status→responding→resolved [Citizen]   - sees all status updates [System]   - archives data for analytics`

We’ll formalize this as the incident lifecycle in section 4.

---

## 3.2 Agency Request → Admin Approval → Agency Admin → Staff Creation

`[Agency Applicant]   ↓ submit access request [System Admin]   ↓ reviews + approves   ↓ creates Agency + Agency Admin user [Agency Admin]   ↓ logs in   ↓ configures agency + creates staff users [Agency Staff]   ↓ logs in   ↓ uses dashboard`

---

## 3.3 Admin Updates System Settings → User Experience Changes

Examples:

- Admin disables a category = it disappears from citizen incident type dropdown.
    
- Admin modifies severity thresholds = AI output mapping to severity badges changes.
    

---

# 4. Incident Lifecycle Flow

We define **incident.status** states + transitions.

---

## 4.1 States

- `submitted`
    
- `ai_classified` (optional explicit state, or metadata)
    
- `pending_verification` (implicit: after AI result)
    
- `verified`
    
- `assigned`
    
- `dispatched`
    
- `responding`
    
- `resolved`
    
- `rejected`
    
- `archived`
    

---

## 4.2 Transitions (simplified graph)

`submitted   → ai_classified   → pending_verification       → verified           → assigned               → dispatched                   → responding                       → resolved                           → archived       → rejected`

You can combine ai_classified + pending_verification if you like, for implementation.

---

## 4.3 Detailed Steps

1. **Citizen submits report**
    
    - `status = submitted`
        
    - AI called.
        
2. **AI classifies**
    
    - AI stores metadata (`category`, `severity`, `confidence`)
        
    - `status` remains `submitted` or changed to `pending_verification`
        
3. **Operator verifies**
    
    - If legitimate → `status = verified`
        
    - Else → `status = rejected`
        
4. **Assignment**
    
    - Based on AI category + GIS proximity: recommended agency(s)
        
    - Operator assigns:
        
        - `status = assigned`
            
        - Creates `agency_assignment` record(s)
            
5. **Agency acceptance**
    
    - Agency staff sees assigned incidents
        
    - Clicks “Accept” → `status = dispatched`
        
6. **Response**
    
    - Field units dispatched → `status = responding`
        
    - Map may show responding units (if modeled)
        
7. **Resolution**
    
    - Staff marks incident as resolved:
        
        - `status = resolved`
            
        - Required: resolution_notes, time_to_resolve
            
8. **Archiving**
    
    - After a period, incident becomes `archived`
        
    - Still available for analytics.
        

---

# 5. GIS-Focused Flows

## 5.1 Map Interaction Flow (Agency)

**Use case:** Operator monitors incidents on map.

`[/agency/dashboard]   - Map centered at city   - Layer controls: incidents, boundaries, facilities   - Filters: status, severity, category, time range User:   - Clicks a marker → open incident summary   - Zoom/pan → load incidents in viewport via bounding box query`

**GIS operations:**

- `SELECT ... WHERE ST_Intersects(geom, view_bbox)`
    
- Clustering: make clusters at low zoom levels.
    
- Jurisdiction filter: show only points inside agency polygon.
    

---

## 5.2 Spatial Filtering Flow

User sets:

- Filter: “Show incidents within last 24 hours with severity ≥ 3 inside our jurisdiction.”
    

Backend:

- Query `incidents` with `timestamp >= now() - 1 day`
    
- `severity >= 3`
    
- `ST_Within(incidents.geom, agencies.jurisdiction_geom)`
    

Gives correct visibility.

---

## 5.3 Heatmap and Hotspot Exploration

Analyst chooses:

- Time range (e.g., last 30 days)
    
- Incident type (e.g., accidents)
    

System:

- Aggregates incidents into heatmap
    
- Displays gradient overlay on map
    
- Provides summary stats: top 5 high-risk areas.
    

---

## 5.4 Spatial Query–Triggered Response

Example:  
“Any high severity incident within 200m of a hospital triggers auto-alert to hospital admin.”

Implementation:

- After incident verified:
    
    - Run `ST_DWithin(incident.geom, hospital.geom, 200)`
        
    - If true → generate notification to hospital agency.
        

---

# 6. AI-Focused Flows

## 6.1 AI Classification Flow

**Input:** description, language, optional image tags  
**Output:** category, severity_score, confidence, summary

Flow:

`[Backend] → POST /ai/classify   body: { text, lang, location, timestamp } [AI Service]   - preprocess text   - vectorize   - predict class + severity   - generate short summary   - compute confidence   → return JSON [Backend]   - store result in ai_outputs   - attach metadata to incident`

---

## 6.2 AI Reclassification (After Manual Correction)

If operator changes category or severity:

- System logs:
    
    - `ai_original_category`, `final_category`
        
    - Same for severity
        

Optionally:

- Save as training sample for future model update.
    

---

## 6.3 Edge Cases: AI Fails or Low Confidence

If:

- AI is unavailable (network error) → mark `ai_status='failed'`
    
- If `confidence < threshold` → flag as `needs_manual_focus=true`
    

Operator UI:

- Shows: “AI unsure — please review carefully.”
    
- This **increases trust** because we admit uncertainty.
    

---

# 7. Admin Flows (System Admin)

## 7.1 Admin Login

- `/login/admin`
    
- Email + password
    
- Strong password enforced.
    

---

## 7.2 Agency Management Flow

**Screens:**

- `/admin/agencies`
    
- `/admin/agency-requests`
    
- `/admin/agencies/:id`
    

**Flow:**

`[/admin/agency-requests]   - List pending applications   - Click one → see detail   - Buttons: Approve / Reject Approve:   - Create or update agencies record (status=approved)   - Create agency_admin user or send invite Reject:   - agencies.status = rejected   - optional email to applicant`

---

## 7.3 User Management Flow

Admin can:

- View all users
    
- Filter by role / status
    
- Suspend/reactivate
    

Suspension:

- `users.status = 'suspended'`
    
- Login blocked; reason field.
    

---

## 7.4 System Configuration Flow

Admin configures:

- Incident categories
    
- Severity ranges
    
- Default city map center
    
- Language defaults
    

Changes propagate:

- To frontend lists (citizen select options)
    
- To AI mapping logic from raw score → severity label.
    

---

# 8. Technical Flow Notes (Global)

### DB Tables (core)

- `users` (id, name, phone, email, role, status, agency_id, password_hash)
    
- `agencies` (id, name, type, city, status, jurisdiction_geom)
    
- `agency_applications`
    
- `incidents` (id, citizen_id, geom, description, status, created_at, updated_at, verified_by, resolved_by, resolution_notes, severity_final, category_final)
    
- `ai_outputs` (incident_id, category_pred, severity_pred, confidence, summary, model_version)
    
- `incident_status_history` (incident_id, from_status, to_status, changed_by, at)
    
- `notifications`
    
- `system_settings`
    

### Key API Endpoint Families

- `/auth/*` – login, logout, register, reset
    
- `/citizen/incidents/*`
    
- `/agency/incidents/*`
    
- `/admin/agencies/*`
    
- `/admin/users/*`
    
- `/ai/classify`
    
- `/gis/tiles` or `/incidents/map`
    

### RBAC

- `citizen` – only own incidents
    
- `agency_staff` – only incidents within agency jurisdiction & assigned categories
    
- `agency_admin` – plus staff management
    
- `system_admin` – everything
    

---

# 9. State Diagrams (Text)

## 9.1 User State

- `registered` → `active`
    
- `active` → `suspended`
    
- `active` → `deleted`
    

For agency users:

- `pending_activation` → `active` → `suspended`
    

---

## 9.2 Agency State

- `pending` → `approved` → `active`
    
- `pending` → `rejected`
    
- `active` → `inactive`
    

---

## 9.3 Incident State

(We already described; you can paste as UML in your doc.)

`submitted   → pending_verification       → verified           → assigned               → dispatched                   → responding                       → resolved                           → archived       → rejected`

---

# 10. Summary

You now have:

- ✅ Full role-by-role user flows
    
- ✅ Cross-system flows
    
- ✅ Incident lifecycle state machine
    
- ✅ GIS & AI interaction flows
    
- ✅ Admin management flows
    
- ✅ Technical notes (DB, APIs, RBAC)
    
- ✅ State diagrams in text
    

This is enough to:

- Design your **UML diagrams**
    
- Write **System Design** & **Methodology** chapters
    
- Plan the **frontend & backend architecture**
    
- Implement the **MVP** without confusion