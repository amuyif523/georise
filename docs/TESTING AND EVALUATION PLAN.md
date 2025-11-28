# ⭐ **SECTION 4 — TESTING AND EVALUATION PLAN**

**GEORISE: Geospatial Real-Time Incident System Enhanced by AI**

---

## **4.1 Introduction**

Testing is a critical component of the GEORISE platform to ensure its functional correctness, reliability, performance, and security. Since GEORISE is an emergency-management system operating in high-stakes environments, the testing approach must be rigorous, structured, and multi-layered.

This chapter presents the complete testing and evaluation plan, detailing the strategies and methodologies used to assess:

- Unit correctness
    
- Integration consistency
    
- System-level behavior
    
- GIS accuracy
    
- AI classification performance
    
- Verification workflow correctness (FAYDA ID)
    
- Real-time subsystem behavior
    
- Security and penetration resistance
    
- Load and stress thresholds
    
- User acceptance and usability
    

The chapter concludes with detailed test cases, evaluation metrics, and tools to support automated and manual testing.

---

# ⭐ **4.2 Testing Methodology Overview**

The project employs a **hybrid testing methodology** combining:

- **Bottom-up testing** (for backend and AI microservices)
    
- **Top-down testing** (for UI flows and RBAC states)
    
- **Iterative testing within Agile sprints**
    
- **OOSE model-based testing** (derived from use cases, sequence diagrams, and flows)
    

Testing begins at the unit level and expands outward toward integration, system testing, and final user acceptance testing.

---

# ⭐ **4.3 Unit Testing Strategy**

Unit testing evaluates individual functions and modules to verify correctness at the smallest testable level.

### **4.3.1 Backend Unit Tests**

Focus areas:

- Authentication & token verification
    
- Input validation
    
- FAYDA ID validation logic (mocked)
    
- OTP generation & rate limiting
    
- AI microservice client
    
- GIS spatial queries (unit-level via mock PostGIS)
    
- Incident creation validators
    
- Agency assignment logic (routing rules)
    

Tools:

- **Jest**
    
- **Supertest** (for Express endpoints)
    
- **MockServiceWorker (MSW)** for API mocking
    
- **Sinon.js** for stubs/spies
    

### **4.3.2 AI Microservice Unit Tests**

Focus areas:

- Text preprocessing functions
    
- Classification model wrapper
    
- Severity scoring model
    
- Confidence scoring
    
- Error/fallback handling
    

Tools:

- **PyTest**
    
- **FastAPI TestClient**
    

### **4.3.3 GIS Unit Tests**

Focus areas:

- Geometry creation
    
- Spatial calculations
    
- Spatial filters
    
- Coordinate parsing
    
- Buffer calculations
    

Tools:

- **PostGIS test database**
    
- **SQL scripts** + **pgTap**
    

---

# ⭐ **4.4 Integration Testing Strategy**

Integration testing validates interactions between components.

### Key integrations tested:

### **4.4.1 Backend + Database**

- Incident creation + spatial storage
    
- Incident → AI classification → DB update
    
- FAYDA verification → citizen status update
    
- Agency staff assignment
    
- Incident lifecycle updates
    

### **4.4.2 Frontend + Backend**

- Login → JWT workflow
    
- Fetch incidents → transform → render
    
- FAYDA verification frontend flow with OTP
    
- Form submission validation
    
- Dashboard data retrieval
    

### **4.4.3 Backend + External Services**

- AI microservice communication
    
- SMS/OTP provider (mocked)
    
- GIS libraries
    

Tools:

- Postman (automated test collections)
    
- Newman
    
- Supertest
    
- Docker Compose integration environment
    

---

# ⭐ **4.5 System Testing**

System testing evaluates the entire GEORISE platform as a unified system.

### System tests include:

- Complete incident lifecycle test
    
- Full multi-agency workflow test
    
- Citizen verification → reporting test
    
- Real-time updates on dashboards
    
- Map rendering and interaction tests
    
- Administrative user management
    
- Notification flows
    
- Role-based access enforcement
    
- Error recovery scenarios
    

Tools:

- **Selenium** (UI automation)
    
- **Cypress** (end-to-end testing)
    
- **BrowserStack** (device testing)
    

---

# ⭐ **4.6 GIS Accuracy Testing**

GIS functionality is mission-critical for GEORISE. Testing covers:

### **4.6.1 Coordinate Accuracy**

- Incident POINT storage vs. reported coordinates
    
- Edge-case coordinates (boundary points)
    
- Distance calculations (Haversine checks)
    

### **4.6.2 Jurisdiction Overlays**

- Incident assigned to correct agency polygon
    
- Boundary incident classification
    

### **4.6.3 Spatial Queries**

- ST_DWithin accuracy
    
- Buffer zones
    
- Heatmap generation correctness
    

### **4.6.4 Clustering Algorithms**

- Validation of DBSCAN clustering outputs
    
- Threshold sensitivity testing
    

Tools:

- QGIS
    
- PostGIS spatial comparison queries
    
- Manual coordinate verification
    

Evaluation metrics:

- Spatial accuracy within ±5 meters (acceptable for urban reporting)
    

---

# ⭐ **4.7 AI Model Evaluation & Validation**

AI evaluation uses standard ML performance metrics.

### **4.7.1 Classification Metrics**

- Accuracy
    
- Precision
    
- Recall
    
- F1-score
    
- Confusion matrix
    

### **4.7.2 Severity Scoring Metrics**

- MSE (Mean Squared Error)
    
- MAE (Mean Absolute Error)
    
- Error distribution bucketing
    

### **4.7.3 Confidence Scoring Reliability**

Evaluate with:

- Reliability curves
    
- Calibration plots
    

### **4.7.4 Human-AI Comparison**

Evaluate:

- Operator reclassifications
    
- Disagreement rates
    
- Correction patterns
    

Tools:

- Scikit-learn metrics
    
- TensorBoard
    
- Python notebooks
    

---

# ⭐ **4.8 Verification Workflow Testing (FAYDA)**

Since real FAYDA integration cannot be used, the project implements:

### **Mocked Verification API Testing**

- ID format validation
    
- OTP lifecycle
    
- Expired OTPs
    
- Multiple attempts
    
- Fraud attempt detection
    
- Rate limiting behavior
    

Acceptance criteria:

- All verification logic must match official FAYDA verification behavior
    
- No unverified citizen can submit incidents
    
- Verified citizens continue smoothly into reporting flow
    

---

# ⭐ **4.9 Load & Performance Testing**

Emergency systems must remain stable under load.

### Scenarios tested:

### **4.9.1 Incident Load Simulation**

- 100–1,000 simultaneous incident submissions
    

### **4.9.2 Map Rendering Load**

- 1,000+ markers
    
- 10 heatmap layers
    
- 5 agency jurisdiction overlays
    

### **4.9.3 Real-Time Updates**

- 100 concurrent WebSocket connections
    
- 10–20 updates/sec
    

Tools:

- **JMeter**
    
- **Locust**
    
- **k6**
    
- **ArtilleryJS**
    

Metrics:

- Response time: <300ms average
    
- Map render time: <2 seconds
    
- WebSocket latency: <100ms
    

---

# ⭐ **4.10 Security & Penetration Testing**

Emergency systems require strong security.

### Areas tested:

### **4.10.1 Authentication & Authorization**

- JWT tampering
    
- Session hijacking
    
- Token expiration checks
    

### **4.10.2 API Security**

- SQL injection
    
- NoSQL injection
    
- Header attacks
    
- Rate limit bypass attempts
    

### **4.10.3 Data Privacy**

- Verify no FAYDA data leaks
    
- Masking implemented correctly
    

### **4.10.4 Real-Time Security**

- Socket connection validation
    
- Unauthorized channel subscription prevention
    

Tools:

- OWASP ZAP
    
- Burp Suite
    
- Nmap
    
- Custom scripts
    

---

# ⭐ **4.11 User Acceptance Testing (UAT)**

Performed with:

- Students simulating citizens
    
- Testers acting as agency staff
    
- Test administrators acting as system admins
    

### UAT Objectives:

- Validate user flows
    
- Evaluate usability
    
- Ensure system matches user expectations
    
- Confirm clarity of map interactions
    
- Confirm responsiveness and accessibility
    

Feedback will be incorporated into final iteration.

---

# ⭐ **4.12 Test Cases (Sample Tables)**

Below are example test cases. The final report will include the full list.

### **4.12.1 Citizen Registration Test Case**

|Test ID|Description|Steps|Expected Result|
|---|---|---|---|
|CIT-REG-01|Register new citizen|Fill form → submit|Account created, email/OTP sent|
|CIT-REG-02|Invalid email|Enter invalid email|Error message|
|CIT-VER-03|FAYDA verification|Enter ID + OTP|Status = Verified|

---

### **4.12.2 Incident Reporting Test Case**

|Test ID|Description|Steps|Expected Result|
|---|---|---|---|
|INC-REP-01|Submit valid incident|Fill fields → submit|Incident recorded + AI classification|
|INC-REP-02|Unverified user attempts|Try reporting|Error: “Verification required”|
|INC-REP-03|AI fallback|Remove internet|System uses fallback classifier|

---

### **4.12.3 Agency Response Test Case**

|Test ID|Description|Steps|Expected Result|
|---|---|---|---|
|AG-DASH-01|Staff sees assigned incidents|Login → Dashboard|Incident appears with correct jurisdiction|
|AG-RES-02|Mark incident resolved|Click “resolve”|Status = resolved|

---

### **4.12.4 GIS Test Case**

|Test ID|Description|Expected Result|
|---|---|---|
|GIS-01|Verify location point accuracy|<5m deviation|
|GIS-02|Heatmap layer|Correct cluster visualization|
|GIS-03|Jurisdiction overlay|Correct agency assignment|

---

### **4.12.5 AI Test Case**

|Test ID|Description|Expected Result|
|---|---|---|
|AI-01|Category classification|≥85% accuracy|
|AI-02|Severity ranking|MSE < 0.25|
|AI-03|Low-confidence fallback|Human review triggered|

---

### **4.12.6 Security Test Case**

|Test ID|Description|Expected Result|
|---|---|---|
|SEC-01|SQL injection attempt|Rejected|
|SEC-02|JWT tampering|Rejected|
|SEC-03|Rate limit attack|Blocked|

---

# ⭐ **4.13 Tools Used**

|Tool|Purpose|
|---|---|
|Postman|API testing|
|JMeter / Locust / k6|Performance tests|
|Selenium / Cypress|UI automation|
|OWASP ZAP|Security tests|
|pgTap|Database unit tests|
|PyTest|AI service tests|
|QGIS|Spatial accuracy checks|

---

# ⭐ **4.14 Evaluation Metrics**

### **System Quality Metrics**

| Metric                 | Target |
| ---------------------- | ------ |
| Availability           | 99%    |
| Avg. response time     | <300ms |
| Map load time          | <2s    |
| AI accuracy            | ≥85%   |
| Severity scoring error | <0.25  |
| GIS spatial error      | <5m    |