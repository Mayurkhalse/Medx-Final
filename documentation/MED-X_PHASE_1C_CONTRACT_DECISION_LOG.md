# MED-X PHASE 1C — CONTRACT DECISION LOG

**Document ID**: `MED-X_PHASE_1C_CONTRACT_DECISION_LOG.md`  
**Phase**: Phase 1C — Contract Reconciliation & Integration Decision Freeze  
**Evaluation Standard**: 8-Point Decision Quality Rule  
**Location**: `medx-unified/documentation/`

---

## 1. The 8-Point Decision Quality Evaluation Criteria

Every decision in this log has been systematically evaluated against these non-negotiable architectural criteria:
1. **Scope Alignment**: Is it required by the approved Med-X scope?
2. **Evidence-Based**: Is it supported by direct source repository evidence?
3. **Preservation**: Does it preserve existing functional code, algorithms, and assets?
4. **Decoupling**: Does it eliminate cross-repository code clashing and fragmentation?
5. **Extensibility**: Does it provide a clean extension boundary for future Med-X growth?
6. **Simplicity**: Does it avoid premature enterprise abstractions and unnecessary complexity?
7. **Incrementality**: Can it be migrated and verified in controlled, sequential steps?
8. **Anti-Lock-in**: Does it avoid locking the system into prototype-specific limitations?

---

## 2. Frozen Architectural Decisions

### DECISION 01: System Topology — Modular Monolith over Microservices
* **Context**: Source code was split across 4 independent repositories with 4 separate Express backends and 4 frontend build setups.
* **Decision**: Consolidate into a single **Modular Monolith** comprising:
  - One React 18 + Vite unified frontend
  - One Node.js Express 4.21 API server
  - One shared MongoDB database
  - One preserved standalone Python FastAPI ML microservice (Port 8000)
* **8-Point Quality Evaluation**:
  1. *Scope*: Matches the requirement for ONE unified application.
  2. *Evidence*: All 4 backends are Express applications; 3 of 4 frontends are Vite applications.
  3. *Preservation*: Preserves 100% of controllers, routes, and UI components in domain modules.
  4. *Decoupling*: Eliminates port collisions (`5000`) and distributed auth complexity.
  5. *Extensibility*: Modular domain architecture allows future domain extraction if scale demands it.
  6. *Simplicity*: Avoids Docker compose orchestration overhead and service-mesh complexity.
  7. *Incrementality*: Domains can be migrated one at a time into the unified monorepo.
  8. *Anti-Lock-in*: Avoids tying system to prototype microservice silos.
* **Status**: **FROZEN**

---

### DECISION 02: Platform vs. Domain Separation
* **Context**: Authentication, database connection, and configuration logic were duplicated and scattered throughout each repository.
* **Decision**: Strictly separate **Shared Platform Infrastructure** (`server/config/*`, `server/middleware/*`, `client/src/context/*`, `client/src/styles/tokens.css`) from **Domain Business Logic** (`patient`, `doctor`, `hospital`, `lab`, `reports`, `triage`).
* **8-Point Quality Evaluation**: Meets all 8 criteria. Guarantees that future clinical domains reuse existing auth, database, and UI tokens without reimplementing infrastructure.
* **Status**: **FROZEN**

---

### DECISION 03: Identity Architecture — User Model + Linked Profile Documents
* **Context**: Each repository had different notions of user identity (e.g. DoctorPage3 used string IDs; Hospital Page used `profileId`; Patient Page used embedded user fields).
* **Decision**: Adopt a centralized `User` document storing credentials (`email`, `password`, `googleId`, `role`) linked 1:1 via ObjectIds to role-specific profile documents (`Patient`, `Doctor`, `Hospital`, `Lab`). To guarantee backwards compatibility with `Doctor Page` components, profiles maintain a dual-key structure (`_id` + unique indexed `legacyId`).
* **8-Point Quality Evaluation**: Meets all 8 criteria. Prevents bloating `User` with specialty-specific medical fields while seamlessly supporting Doctor Page's `'DOC-101'` and `'P001'` string IDs.
* **Status**: **FROZEN**

---

### DECISION 04: Role Normalization
* **Context**: `Login Page` used `'candidate'` and `'organization'`, whereas `Hospital Page` used `'patient'`, `'doctor'`, `'hospital_admin'`, `'lab_admin'`.
* **Decision**: Standardize on the **4 authoritative Project Tracker roles**: `patient`, `doctor`, `hospital_admin`, and `lab_admin`. `candidate` is mapped to `patient`; `organization` is mapped to `doctor`.
* **8-Point Quality Evaluation**: Meets all 8 criteria. Preserves Tracker requirements and eliminates terminology divergence.
* **Status**: **FROZEN**

---

### DECISION 05: Authentication Transport & Storage Standard
* **Context**: Token keys diverged (`token` vs `authToken`), and Google OAuth returned tokens via query params while local login returned JSON.
* **Decision**: Standardize on stateless JWT with Bearer header (`Authorization: Bearer <medx_token>`), stored in `localStorage` under `medx_token`, with a 7-day expiration window. Google OAuth redirects to `/auth/callback?token=<JWT>`.
* **8-Point Quality Evaluation**: Meets all 8 criteria. Eliminates conflicting keys and supports SPA routing cleanly.
* **Status**: **FROZEN**

---

### DECISION 06: Centralized Role-Based Access Control (RBAC)
* **Context**: Doctor backend had zero authentication or authorization middleware; Hospital Page had an inline array guard; Patient Page had route-level checks.
* **Decision**: Establish a centralized middleware `roleGuard(allowedRoles)` in `server/middleware/roleGuard.js` applied across all private route definitions.
* **8-Point Quality Evaluation**: Meets all 8 criteria. Eliminates security vulnerabilities (CR-05) without altering controller logic.
* **Status**: **FROZEN**

---

### DECISION 07: Strict Real MongoDB Persistence (No Silent Fallback)
* **Context**: `Hospital Page/backend/config/db.js` silently created an ephemeral `MongoMemoryServer` instance if connection to real MongoDB failed, risking silent data loss.
* **Decision**: Mandate real MongoDB for all development and runtime persistence. If the configured MongoDB URI fails to connect, the server must log a fatal error and exit. `MongoMemoryServer` is permitted strictly in isolated automated unit/integration test runners.
* **8-Point Quality Evaluation**: Meets all 8 criteria. Guarantees cross-role acceptance tests verify durable data persistence.
* **Status**: **FROZEN**

---

### DECISION 08: Unified MedicalReport Specification
* **Context**: `Patient Page` stored blood test data in a flat report document with embedded ML results; `Hospital Page` used an institutional schema with review statuses and doctor references.
* **Decision**: Synthesize both models into a canonical `MedicalReport` featuring:
  - Document metadata (`reportId`, `reportDate`, `fileUrl`, `sourceType`)
  - Continuous biomarker parameter Map (`parameters`)
  - Preserved ML outputs (`mlResult`: flags, disease risks, composite score, risk tier)
  - Institutional review fields (`reviewStatus`, `reviewedByDoctorId`, `reviewNotes`)
* **8-Point Quality Evaluation**: Meets all 8 criteria. Preserves Recharts trending capabilities while supporting hospital clinical audit workflows.
* **Status**: **FROZEN**

---

### DECISION 09: 4-Layer Biomarker Representation
* **Context**: Code mingled raw extracted metrics with calculated reference flags and ML predictions.
* **Decision**: Structurally decouple:
  1. Source observation values
  2. Clinical reference intervals
  3. Reference range flags (`Normal`, `High`, `Low`, `Critical`)
  4. Machine learning predictions & composite scores
* **8-Point Quality Evaluation**: Meets all 8 criteria. Enables future laboratory panels to be added without changing ML or database structures.
* **Status**: **FROZEN**

---

### DECISION 10: Relational Topology over Embedded Duplication
* **Context**: Prototype seeds copied patient names, doctor specialties, and report summaries redundantly into multiple collections.
* **Decision**: Enforce clean relational references (`ObjectId` with Mongoose `populate`) across Patient, Doctor, Hospital, Lab, Appointment, and Report entities.
* **8-Point Quality Evaluation**: Meets all 8 criteria. Prevents data divergence and synchronization bugs.
* **Status**: **FROZEN**

---

### DECISION 11: Care Queue Trigger Grounding & Semantics
* **Context**: Early integration notes assumed any high-risk ML report automatically generated an inpatient hospital care task.
* **Decision**: Preserve existing `Hospital Page` 6-stage operational pipeline (`Pre-Triage` to `Discharge`). Wire high-risk reports into the queue **only** when the patient has an institutional admission relationship (`hospitalId` present), as implemented in `Patient Page/backend/routes/reports.js` (`checkAndEnqueueCare`). Do not invent artificial escalation rules for outpatients.
* **8-Point Quality Evaluation**: Meets all 8 criteria. Grounded in actual source code evidence.
* **Status**: **FROZEN**

---

### DECISION 12: Appointment Model Harmonization
* **Context**: Three different appointment schemas existed across Patient, Doctor, and Hospital repos.
* **Decision**: Unify into a single `Appointment` schema referencing `patientId`, `doctorId`, and optional `hospitalId`, with explicit statuses (`Scheduled`, `Confirmed`, `Completed`, `Cancelled`).
* **8-Point Quality Evaluation**: Meets all 8 criteria.
* **Status**: **FROZEN**

---

### DECISION 13: Emergency SOS Protocol & Polling Cadence
* **Context**: Patient repo triggered SOS; Doctor repo polled `/api/emergency` with hardcoded mock alarms; Hospital repo had an alerts monitor.
* **Decision**: Unify emergency workflow around persistent `EmergencyAlert` records in MongoDB. Patient creates alert with GPS coordinates; Doctor workstation polls active alerts every 5 seconds, triggers audio alarm (`sos-alarm.mp3`), renders Leaflet GPS modal, and patches dispatch status. Hospital monitors live alerts at `/hospital/alerts`.
* **8-Point Quality Evaluation**: Meets all 8 criteria. Preserves Doctor Page audio alarm and Leaflet map while establishing real database persistence.
* **Status**: **FROZEN**

---

### DECISION 14: Domain-Owned API Partitioning
* **Context**: Backends used overlapping `/api/*` prefixes without clear ownership.
* **Decision**: Partition Express routes into strict domain namespaces: `/api/auth/*`, `/api/patient/*`, `/api/reports/*`, `/api/doctor/*`, `/api/hospital/*`, `/api/lab/*`, `/api/appointments/*`, `/api/triage/*`.
* **8-Point Quality Evaluation**: Meets all 8 criteria. Clean extension boundary for future APIs.
* **Status**: **FROZEN**

---

### DECISION 15: Frontend Framework Baseline — React 18.3.1 + Vite 6
* **Context**: `Doctor Page` used React 19, which crashes Ant Design 5 and Recharts; `Login Page` used Webpack CRA.
* **Decision**: Adopt the **Approved Integration Baseline**: React `18.3.1` + Vite `6.x`. Down-level Doctor Page components from React 19 to 18.3.1. Migrate Login Page JSX/CSS to Vite. Encapsulate Ant Design under `.hospital-workspace-container` to prevent style leaks into Tailwind.
* **8-Point Quality Evaluation**: Meets all 8 criteria. Eliminates the P0 blocker (CR-01) while preserving all UI visual styling.
* **Status**: **FROZEN**

---

### DECISION 16: ML Microservice Preservation & CORS Hardening
* **Context**: Python FastAPI service was running on port 8000 with `allow_origins=["*"]`.
* **Decision**: Preserve existing ML algorithms (`flagging.py`, `predictor.py`, `risk_scorer.py`) and model artifact (`disease_model.joblib`) 100% intact. Restrict CORS to `http://localhost:5000` (backend caller). Express acts as the single authenticated gateway to ML inference.
* **8-Point Quality Evaluation**: Meets all 8 criteria. Fulfills ML preservation principle.
* **Status**: **FROZEN**

---

### DECISION 17: Centralized Configuration Management
* **Context**: Variable names diverged (`MONGO_URI` vs `MONGODB_URI`).
* **Decision**: Centralize environment configuration into a validated schema using `MONGODB_URI`, `PORT=5000`, `JWT_SECRET`, `ML_SERVICE_URL=http://127.0.0.1:8000`, and provide sanitized `.env.example`.
* **8-Point Quality Evaluation**: Meets all 8 criteria.
* **Status**: **FROZEN**

---

### DECISION 18: Source Authority Allocations
* **Context**: Different source repos possessed varying degrees of maturity for different domains.
* **Decision**: Assign authoritative domain baselines:
  - Landing & OAuth: `Login Page/Med-X`
  - Biomarkers & ML: `Patient Page/Medx-jankoti`
  - Doctor Workstation & Emergency: `Doctor Page/DoctorPage3`
  - Hospital Operations & Care Queue: `Hospital Page/hospital-page`
* **8-Point Quality Evaluation**: Meets all 8 criteria. Leverages the best, most complete implementations without picking an arbitrary universal baseline.
* **Status**: **FROZEN**
