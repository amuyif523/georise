# ⭐ **SECTION 2: FULL UI WIREFRAMES (TEXT-BASED)**

---

# **2.1 PUBLIC PAGES WIREFRAMES**

---

## **2.1.1 Landing Page (`/`)**

### **Desktop Wireframe**

`+--------------------------------------------------------------------------------+ |                               TOP NAVIGATION                                   | |  [GEORISE Logo]   How It Works  Value  Features  Technology   [Request Access] | |                                                                   [Login]      | +--------------------------------------------------------------------------------+  +--------------------------------------------------------------------------------+ |                                   HERO AREA                                    | |                                                                                | |       "Real-Time Emergency Intelligence for Ethiopian Cities."                 | |       "Powered by AI & GIS."                                                   | |                                                                                | |       [ Report Incident (Citizen) ]   [ Open Agency Portal ]                   | |                                                                                | +--------------------------------------------------------------------------------+  +------------------------------- HOW IT WORKS (4 Steps) -------------------------+ |  [01] Report     [02] Analyze     [03] Assign       [04] Respond               | |  Phone Icon      Brain Icon       Route Icon        HardHat Icon               | +--------------------------------------------------------------------------------+  +----------------------------- CORE VALUE (4 Cards) -----------------------------+ | Dream Outcome | Likelihood of Success | Time Delay | Effort/ Sacrifice         | +--------------------------------------------------------------------------------+  +------------------------------ FEATURES BY ROLE --------------------------------+ |  Citizens        |  Emergency Agencies    | Municipal Government               | +--------------------------------------------------------------------------------+  +------------------------------ AI + GIS SECTION --------------------------------+ |  Cards: AI Classification | Severity Scoring | Map Engine | Heatmaps           | +--------------------------------------------------------------------------------+  +------------------------------ CALL TO ACTION ----------------------------------+ |     [ Get Started as Citizen ]     [ Request Agency Partnership ]              | +--------------------------------------------------------------------------------+  +------------------------------------ FOOTER ------------------------------------+ |  Logos | About | Portals | Contact | Privacy                                   | +--------------------------------------------------------------------------------+`

---

### **Mobile Wireframe**

`[Hamburger Menu]     GEORISE Logo     [Login]  HERO: "Real-Time Emergency Intelligence" [ Report Incident ] [ Agency Portal ]  Section collapses into accordion format.  CTA at bottom fixed: [Citizen]  [Agency Access]`

---

### **States**

|State|Behavior|
|---|---|
|Loading|Skeleton placeholders for sections|
|Offline|Display banner: "You’re offline — map features disabled."|
|Error|Fallback: “Content couldn’t load, retry?”|
|Mobile|Collapsed feature groups and vertical stacking|

---

### **Accessibility Notes**

- All icons labeled via ARIA
    
- High-contrast theme
    
- Focus-visible outlines enabled
    
- Tab-index ordering maintained
    

---

---

# **2.1.2 Login Page (All Roles)**

### **Wireframe**

`+-----------------------------+ |         LOGIN CARD          | +-----------------------------+ |  Login to GEORISE           | |  <role-specific subtitle>   | |                             | |  Email / Phone  [________]  | |  Password       [________]  | |                             | |  [ LOG IN ]                 | |                             | |  "Forgot Password?"         | |  "New Citizen? Sign Up"     | +-----------------------------+`

---

### **Error/Loading States**

- Incorrect password → red text under field
    
- Backend down → banner: “Service unavailable”
    
- Loading → login button disabled, spinner shown
    

---

---

# **2.1.3 Citizen Signup Page**

### **Wireframe**

`+----------------------------+ |       CITIZEN SIGNUP       | +----------------------------+ | Full Name    [__________]  | | Phone        [__________]  | | Email (opt)  [__________]  | | Password     [__________]  | | Confirm Pw   [__________]  | |                            | | [ CREATE ACCOUNT ]         | | "Already have an account?" | +----------------------------+`

---

### **Empty / Loading / Error States**

- Invalid phone format → inline validation
    
- Password strength meter optional
    

---

---

# **2.1.4 Agency Access Request Page**

### **Wireframe**

`+----------------------------------------+ |          AGENCY ACCESS REQUEST         | +----------------------------------------+ | Agency Name:        [________________] | | Agency Type:        [Police ▼]         | | City:               [Addis Ababa ▼]    | | Contact Person:     [________________] | | Email:              [________________] | | Phone:              [________________] | | Additional Notes:   [________________] | |                                        | | [ SUBMIT REQUEST ]                      | +----------------------------------------+  Success State: ------------------------------------------ Your request has been submitted. We will contact you upon review. ------------------------------------------`

---

# ⭐ **2.2 CITIZEN PORTAL WIREFRAMES**

---

## **2.2.1 Citizen Dashboard (`/citizen/dashboard`)**

### **Wireframe**

`+------------------------ CITIZEN NAVBAR ------------------------+ | GEORISE | Dashboard | My Reports | Profile | Notifications(●)  | +----------------------------------------------------------------+  +----------------------- VERIFICATION BANNER --------------------+ | ✖ You are not verified. Verify your National ID to report.     | | [Verify Now]                                                   | +----------------------------------------------------------------+  +--------------------------- ALERT FEED --------------------------+ |  Nearby Incidents:                                             | |  - Accident near Megenagna (1km) [View]                        | |  - Fire reported at Stadium Area (3km) [View]                  | +----------------------------------------------------------------+  +----------------------------- QUICK LINKS -----------------------+ |  [ Report New Incident ] (disabled if unverified)              | |  [ My Reports ]                                                | +----------------------------------------------------------------+`

### **States**

|State|Behavior|
|---|---|
|Unverified|“Report Incident” disabled|
|Verified|Banner removed|
|Empty Alerts|“No nearby incidents”|

---

## **2.2.2 FAYDA Verification Page (`/citizen/verify`)**

### **Wireframe**

`+----------------------------- NATIONAL ID VERIFICATION --------------------------+ | Why Verification is Needed:                                                     | | - Prevent fake reports                                                          | | - Ensure safety and accountability                                              | |                                                                                | | National ID Number:       [______________]                                     | | Full Name:                [______________]                                     | | Date of Birth:            [______/______/______]                               | | Phone (for OTP):          [______________]                                     | |                                                                                | | [ VERIFY ID ]                                                                   | +---------------------------------------------------------------------------------+  After clicking VERIFY:  +----------------------------- ENTER OTP ----------------------------------------+ | OTP Sent to your phone:                                                        | | OTP:                        [ _ _ _ _ _ _ ]                                    | | [ CONFIRM ]                                                                    | +---------------------------------------------------------------------------------+`

---

## **2.2.3 Report Incident (`/citizen/report`)**

### **Multi-Step Wireframe**

#### **Step 1: Describe**

`+--------------------- INCIDENT DETAILS ---------------------+ | Category (optional)   [Dropdown]                           | | Description           [Multiline Textarea]                 | | Add Image (optional)  [Upload Button]                      | |                                                            | | [ NEXT: Set Location ]                                     | +------------------------------------------------------------+`

#### **Step 2: Map**

`+----------------------- SELECT LOCATION ---------------------+ |                  [   INTERACTIVE MAP   ]                    | |               Draggable marker at user location             | |                                                            | | [ BACK ]                                  [ NEXT: Review ] | +------------------------------------------------------------+`

#### **Step 3: Review**

`+---------------------------- REVIEW & SUBMIT ----------------------------+ | Category: Accident                                                       | | Description: "A crash near..."                                          | | Location: Lat/Lng 9.02, 38.75                                            | |                                                                          | | [ SUBMIT INCIDENT ]                                                      | +--------------------------------------------------------------------------+`

---

## **2.2.4 My Reports (`/citizen/incidents`)**

### **Wireframe**

`+----------------------- MY INCIDENT REPORTS ------------------------------+ | Filter: [All] [Pending] [Verified] [Assigned] [Resolved]                 | +--------------------------------------------------------------------------+ | • Accident near Bole (Pending)      [View]                              | | • Fire near Stadium (Assigned)      [View]                              | | • Crime report (Resolved)           [View]                              | +--------------------------------------------------------------------------+  Empty: "No reports submitted yet."`

---

## **2.2.5 Report Details (`/citizen/incidents/:id`)**

### **Wireframe**

`+------------------------- INCIDENT STATUS TIMELINE ------------------------------+ | ● Submitted   →  ○ AI Classified  →  ○ Verified  → ○ Assigned → ○ Resolved     | +--------------------------------------------------------------------------------+ | Description: "Car accident near Bole..."                                        | | Category: Accident (AI)                                                         | | Severity: Medium                                                                | | Location: [Map Preview]                                                         | | Agency Assigned: Addis Traffic Police                                           | | Status Messages:                                                                | | - Operator verified your report.                                                | | - Dispatcher assigned a response unit.                                          | +--------------------------------------------------------------------------------+`

---

# ⭐ **2.3 AGENCY PORTAL WIREFRAMES**

---

## **2.3.1 Agency Dashboard (`/agency/dashboard`)**

### **Wireframe**

`+--------------------- AGENCY NAVBAR ---------------------+ | GEORISE | Dashboard | Incidents | Analytics | Staff     | +---------------------------------------------------------+  +----------------------- MAIN DASHBOARD -------------------+ | [MAP PANEL - Left Half]                                  | |   - Markers for incidents                                | |                                                         | | [INCIDENT LIST PANEL - Right Half]                       | |   Columns: ID | Type | Severity | Status | Time          | +----------------------------------------------------------+  Filters: [Severity ▼] [Status ▼] [Type ▼] [Date ▼]`

---

## **2.3.2 Incident List (`/agency/incidents`)**

`+------------------------ INCIDENT LIST -----------------------------+ | Search: [___________]                                             | | Filters: [Severity] [Type] [Status] [Date Range]                  | +-------------------------------------------------------------------+ | #12  Accident   Severity:3   Pending Verification   [View]        | | #09  Fire       Severity:5   Assigned               [View]        | | #07  Crime      Severity:2   Resolved               [View]        | +-------------------------------------------------------------------+  Empty: "No incidents match your filters."`

---

## **2.3.3 Incident Detail (`/agency/incidents/:id`)**

### **Wireframe**

`+------------------- INCIDENT DETAIL --------------------+ | Status: Pending Verification | Severity: High          | +--------------------------------------------------------+  Tabs: [ Details ] [ Timeline ] [ Map ]  Details: - Report Description - Citizen Info (Verified) - AI Output (Category + Severity + Explanation)  Actions (Operator): [ VERIFY ]   [ REQUEST MORE INFO ]   [ REJECT ]  Actions (Dispatcher after verified): [ ASSIGN UNIT ]  [ MARK AS RESPONDING ]  [ RESOLVE ]`

---

## **2.3.4 Agency Analytics**

`+------------------------ ANALYTICS ------------------------+ | Incident Trend Over Time  (Line Chart)                   | | Incident Types Distribution (Pie Chart)                  | | Severity Heatmap (Map)                                   | +-----------------------------------------------------------+`

---

## **2.3.5 Staff Management**

`+----------------------- STAFF LIST ------------------------+ | Name   | Role       | Status   | Actions                  | | Elias    Operator     Active     [Edit] [Disable]         | | Hana     Dispatcher   Active     [Edit] [Disable]         | +------------------------------------------------------------+ | [ ADD NEW STAFF ]                                          |`

---

# ⭐ **2.4 ADMIN PORTAL WIREFRAMES**

---

## **Admin Dashboard**

`+----------------------- ADMIN DASHBOARD -------------------------+ | Total Agencies | Total Citizens | Total Incidents               | +-----------------------------------------------------------------+ | Critical Incidents (Map Preview)                               | +-----------------------------------------------------------------+`

---

## **Agency Requests**

`+-------------------- AGENCY REQUESTS ------------------------+ | Agency Name | Type | City | Status | Actions               | | Add Police   Police Addis Pending [View] [Approve] [Reject]| +-------------------------------------------------------------+`

---

## **Admin User Management**

`+------------------------ ALL USERS ----------------------------+ | Name   | Role        | Verification | Status | Actions        | | Abebe    Citizen       Verified        Active   [Suspend]     | | Sara     Agency Admin  N/A             Active   [View]        | +---------------------------------------------------------------+`

---

## **System Logs**

`+------------------------ SYSTEM LOGS -------------------------+ | Timestamp    | Actor     | Action             | Target       | | 10:32 AM     Admin      Approved Agency       Add Police     | | 10:34 AM     Operator   Verified Incident #12               | +--------------------------------------------------------------+`