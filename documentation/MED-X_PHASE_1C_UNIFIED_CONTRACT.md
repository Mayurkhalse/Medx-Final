# MED-X PHASE 1C — UNIFIED INTEGRATION CONTRACT & ARCHITECTURAL BASELINE

**Document ID**: `MED-X_PHASE_1C_UNIFIED_CONTRACT.md`  
**Phase**: Phase 1C — Contract Reconciliation & Integration Decision Freeze  
**Status**: FROZEN ARCHITECTURAL CONTRACT  
**Authority Hierarchy**:
1. Approved Project Tracker PDF (Product Scope)
2. Approved Phase 0B Unified Integration Contract (Integration Direction)
3. Phase 1B Structural Inventory (Observed Implementation Evidence)
4. Phase 1B Conflict Register (Observed Conflict Catalog)
5. `medx-unified/source_baselines/*` (Verifiable Source Code)

---

## 1. System Boundary

The Med-X unified healthcare system consolidates four independently developed subsystems into a single, cohesive, production-grade healthcare platform. The system boundary encompasses:
* **Public Portal**: Brand introduction, 5 core healthcare problems, public navigation.
* **Authentication & Identity**: Single multi-role authentication boundary serving 4 approved roles (`patient`, `doctor`, `hospital_admin`, `lab_admin`) via Local JWT and Google OAuth.
* **Patient Workspace**: Diagnostic report upload (PDF/manual), continuous biomarker monitoring, trend visualization via Recharts, AI simulation assistant, clinical history review, and emergency SOS triggering.
* **Doctor Workspace**: Clinical workstation, patient triage queue, appointment calendar management, interactive prescription slip generation, emergency SOS alerts with audio alarms, and Leaflet GPS ambulance dispatch.
* **Hospital Workspace**: Macro institutional dashboard, bed and ICU occupancy management, doctor roster assignment, departmental coordination, 6-stage operational care queue, and inpatient diagnostic report audits.
* **Laboratory Workspace**: Diagnostic test upload, biomarker parameter verification, authenticity sign-off, and lab report auditing.
* **Preserved Machine Learning Microservice**: Standalone Python FastAPI microservice providing reference-range biomarker flagging, Random Forest disease risk probability scoring, composite 0-100 risk calculation, and risk tier stratification (`Low`, `Moderate`, `High`, `Critical`).

All components run within a single unified deployment topology: **One React 18 frontend build, one Express 4.21 API server, one shared MongoDB database instance, and one preserved FastAPI microservice**.

---

## 2. Architectural Principles

1. **Modular Monolith**: The unified system is structured as a modular monolith with clear domain boundaries rather than premature, fragmented microservices.
2. **Preservation Over Rewrite**: Verifiable, working logic and assets from source implementations are preserved and adapted, not redesigned or rebuilt.
3. **Single Source of Persistence**: All clinical, institutional, and identity records reside in one shared MongoDB database. Mock data arrays and in-memory caches are eliminated.
4. **Strict Real Persistence**: Development and production runtimes strictly mandate a live, persistent MongoDB connection. Automatic silent fallback to in-memory databases is prohibited; connection failures must halt the service clearly and loudly.
5. **Clear Separation of Concerns**: Shared infrastructure (auth, db, logging, config) is isolated from domain business logic (reports, triage, clinical workflows).
6. **Zero Feature Creep**: Incomplete or mock functionality in source repositories does not grant license to invent speculative features.

---

## 3. Scalability & Extensibility Principles

Med-X is engineered to scale across future clinical specialties, facilities, and regional jurisdictions. To support long-term extensibility without requiring repeated core rewrites, the architecture adheres to:
1. **Domain Modularity**: Business logic is organized into self-contained domains. Adding a new specialty or clinical module requires adding a domain package without modifying unrelated domains.
2. **Shared Platform vs. Domain Logic**: Cross-cutting concerns (token verification, RBAC guards, database pooling, configuration validation, UI design tokens) are maintained as shared platform services. Domains consume shared services through stable, non-leaking contracts.
3. **Open-Closed Data Schema**: Clinical document models (specifically `MedicalReport`) decouple immutable document metadata from dynamic observations/parameters, allowing new diagnostic metrics to be recorded without schema migrations.
4. **Stable Relational Keys**: Entities relate via explicit, indexed references (`ObjectId`) while preserving backward-compatible identifiers (`legacyId`) for external human-readable indexing.
5. **Centralized Pluggable Authorization**: Route access boundaries are defined centrally via role-capability policies, allowing future sub-roles to be introduced without rewriting controller guards.

---

## 4. Domain Boundaries

The application comprises 8 explicit business domains:
1. **Identity & Access Management (IAM)**: Registration, login, credential verification, token issuance, session lifecycle.
2. **Patient Domain**: Patient demographics, personal medical history, allergy registry, vital sign tracking, prescription viewer.
3. **Diagnostic Report Domain**: Document ingestion (PDF regex parsing, manual entry), biomarker map extraction, report history, laboratory sign-off.
4. **Clinical Workstation Domain**: Attending physician profiles, triage priorities, outpatient consultations, digital prescription authoring.
5. **Hospital Operations Domain**: Institutional capacity, bed and ICU occupancy, departmental structure, doctor roster assignments.
6. **Care Queue & Triage Domain**: Operational task tracking through hospital clinical stages, pending report audits.
7. **Emergency & Dispatch Domain**: SOS alert broadcasting, GPS coordinate tracking, ambulance dispatch status, audio alerts.
8. **Machine Learning Intelligence Domain**: Reference range evaluation, Random Forest inference, composite risk scoring.

---

## 5. Shared Platform Boundaries

Shared platform infrastructure resides strictly outside domain business logic:
* `server/config/db.js`: Mongoose connection manager with strict retry limits and error propagation.
* `server/config/passport.js`: Passport.js Google OAuth 2.0 strategy configuration.
* `server/middleware/auth.js`: JWT Bearer token parser (`requireAuth`).
* `server/middleware/roleGuard.js`: Centralized role-based access controller (`requireRole`).
* `server/middleware/errorHandler.js`: Centralized RFC-7807 compliant error handler.
* `client/src/context/AuthContext.jsx`: Single client-side authentication and session provider.
* `client/src/services/api.js`: Unified Axios HTTP client with automatic Bearer token injection and error interceptors.
* `client/src/styles/tokens.css`: Core Jankoti brand CSS custom properties.

---

## 6. Roles

The unified system recognizes exactly **4 authoritative roles** dictated by the Project Tracker:
1. **`patient`**: Individual healthcare consumer; can upload/view personal reports, view trends, book appointments, view assigned doctor, and trigger emergency SOS.
2. **`doctor`**: Licensed attending clinician; can view assigned patients, conduct triage, author prescriptions, manage appointment availability, receive emergency SOS alarms, and dispatch ambulances.
3. **`hospital_admin`**: Institutional administrator; manages bed capacity, ICU occupancy, hospital departments, staff rosters, inpatient admission workflows, and reviews institutional clinical reports.
4. **`lab_admin`**: Diagnostic laboratory specialist; responsible for laboratory report ingestion, biomarker parameter validation, and signing off on test result authenticity.

*Legacy Role Translations*:
* `Login Page` role `'candidate'` maps to `'patient'`.
* `Login Page` role `'organization'` maps to `'doctor'`.

---

## 7. Identity

Every operational entity is anchored by a persistent canonical identity:
* **`User`**: Master identity document in MongoDB (`_id: ObjectId`). Holds authentication credentials (`email`, `password` hash, `googleId`, `authProvider`), global contact info (`name`, `phone`), and the assigned `role`.
* **Profile Documents**: 1-to-1 extension documents referenced from `User`:
  - `Patient`: Linked via `userId` (`ObjectId`). Holds clinical data (`vitalSigns`, `medicalHistory`, `prescriptions`).
  - `Doctor`: Linked via `userId` (`ObjectId`). Holds clinical credentials (`specialty`, `qualification`, `hospitalId`).
  - `Hospital`: Institutional entity holding facility details, beds, and departments.
  - `Lab`: Diagnostic facility entity holding laboratory license and accreditation.

*Dual-Key Strategy Validation*:
* To reconcile `Doctor Page`'s existing string IDs (`P001`, `DOC-101`, `APT-201`) with MongoDB `ObjectId` references, models maintain a dual-key architecture:
  - Primary Key: Native `_id` (`mongoose.Schema.Types.ObjectId`) for internal relational joins.
  - Secondary Key: `legacyId` (`String`, unique, indexed) for human-readable codes, UI display badges, and backwards compatibility with Doctor Page UI components.

---

## 8. Authentication

* **Primary Transport**: HTTP Authorization header: `Authorization: Bearer <medx_token>`.
* **Token Storage**: `localStorage.setItem('medx_token', token)`.
* **Expiration**: 7 days (`expiresIn: '7d'`).
* **JWT Claims Payload**:
  ```json
  {
    "id": "ObjectId",
    "email": "string",
    "role": "patient | doctor | hospital_admin | lab_admin",
    "name": "string",
    "hospitalId": "ObjectId | null",
    "doctorId": "ObjectId | null",
    "patientId": "ObjectId | null"
  }
  ```
* **Local Registration**: Supported for all 4 roles. Automatically generates the corresponding linked clinical profile document.
* **Google OAuth**: Supported strictly for `patient` and `doctor`. When a Google account already exists, its pre-assigned database role is preserved and cannot be overwritten by query parameters. Google OAuth registration is **NOT** supported for institutional administrative roles (`hospital_admin`, `lab_admin`).
* **Session Lifecycle**: Stateless JWT verification. Logout destroys the client token and invalidates client session state.

---

## 9. Authorization

Access control is enforced at the controller boundary via centralized `roleGuard(allowedRoles)`:

| Domain / Resource Path | `patient` | `doctor` | `hospital_admin` | `lab_admin` |
| :--- | :---: | :---: | :---: | :---: |
| Public Routes (`/`, `/login`, `/register`) | ALLOW | ALLOW | ALLOW | ALLOW |
| `/api/patient/me`, `/api/patient/reports` | ALLOW (Own data) | DENY | DENY | DENY |
| `/api/patient/report/upload` | ALLOW | DENY | DENY | ALLOW |
| `/api/doctor/*` (Workstation, Prescriptions) | DENY | ALLOW | DENY | DENY |
| `/api/hospital/*` (Beds, Rosters, Operations)| DENY | DENY | ALLOW | DENY |
| `/api/hospital/reports` (Institutional Review)| DENY | ALLOW (Assigned) | ALLOW (Inpatients)| DENY |
| `/api/lab/*` (Diagnostic Upload, Verification)| DENY | DENY | DENY | ALLOW |
| `/api/triage/sos/trigger` | ALLOW | DENY | DENY | DENY |
| `/api/triage/sos/active`, `/dispatch` | DENY | ALLOW | ALLOW (View only) | DENY |

---

## 10. MongoDB Strategy

* **Runtime Database**: Dedicated persistent MongoDB instance (e.g. `mongodb://localhost:27017/medx_unified`).
* **No Silent Fallback Rule**: If the persistent database connection fails, the server logs an immediate fatal error and halts (`process.exit(1)`). Silent switching to `MongoMemoryServer` during development or production is strictly forbidden.
* **Testing Isolation**: `MongoMemoryServer` is permitted exclusively within automated test suites (`vitest` / `jest` runners) in ephemeral test environments.
* **Shared Acceptance Persistence**: All acceptance tests (Tests 01 through 10) execute against the same persistent database instance to verify cross-role relational visibility.

---

## 11. MedicalReport Contract

The canonical `MedicalReport` model synthesizes the biomarker analysis from `Patient Page` with the institutional review workflow from `Hospital Page`:

```javascript
{
  _id: ObjectId,
  reportId: String,               // e.g. RPT-XXXXXX (Human-readable legacyId)
  patientId: ObjectId,            // Reference to Patient
  userId: ObjectId,               // Reference to User
  hospitalId: ObjectId | null,    // Reference to Hospital (if inpatient)
  labId: ObjectId | null,         // Reference to Lab (if lab uploaded)
  reportName: String,             // Default: 'Complete Blood Biomarker Analysis'
  reportType: String,             // Default: 'Complete Blood Count (CBC)'
  sourceType: 'upload' | 'manual' | 'lab_direct',
  reportDate: Date,
  fileUrl: String,
  parameters: Map<String, {
    value: Mixed,
    unit: String,
    ref_range: String,
    status: 'Normal' | 'High' | 'Low' | 'Critical'
  }>,
  mlResult: {
    flags: Map<String, String>,
    diseaseRisks: Map<String, Number>,
    overallRiskScore: Number,
    riskTier: 'Low' | 'Moderate' | 'High' | 'Critical',
    modelVersion: String
  },
  reviewStatus: 'Pending Review' | 'Requires Review' | 'Reviewed',
  reviewedByDoctorId: ObjectId | null,
  reviewNotes: String,
  reviewedAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 12. Biomarker Contract

To preserve clinical fidelity and support Recharts trendline analytics, the biomarker data structure decouples four distinct data layers:
1. **Report-Supplied Source Values**: The raw extracted metric (e.g. `glucose_fasting: 145.0 mg/dL`).
2. **Clinical Reference Intervals**: Standard ranges evaluated by the reference evaluator (e.g. `70-100 mg/dL`).
3. **Biomarker Clinical Flags**: Output of reference comparison (`normal`, `high`, `low`, `critical`).
4. **Predictive ML Inferences**: Multivariable disease probabilities (`diabetes: 0.78`) and composite risk score (`72`).

Standardized parameter keys:
* `glucose_fasting`, `hemoglobin`, `wbc_count`, `rbc_count`, `platelets`, `creatinine`, `urea`, `total_cholesterol`, `triglycerides`, `hdl_cholesterol`, `ldl_cholesterol`.

---

## 13. Patient-Doctor-Hospital-Lab Relationships

* **Patient <-> Hospital**: Many-to-One (`Patient.hospitalId -> Hospital._id`). Designates inpatient admission or primary facility.
* **Doctor <-> Hospital**: Many-to-One (`Doctor.hospitalId -> Hospital._id`). Designates hospital staff affiliation.
* **Patient <-> Doctor**: Many-to-One (`Patient.primaryDoctorId -> Doctor._id`). Established via direct consultation or hospital admin assignment (`DoctorAssignmentModal`).
* **Report <-> Lab**: Many-to-One (`MedicalReport.labId -> Lab._id`). Designates diagnostic facility of origin.
* **Rule**: Relationships are governed by persistent MongoDB ObjectIds, eliminating duplicated profile caches.

---

## 14. Care Queue

* **Semantics**: Preserves the 6-stage clinical pipeline from `Hospital Page`:
  1. `Pre-Triage` -> 2. `Triage` -> 3. `Physician Review` -> 4. `Diagnostics` -> 5. `Treatment` -> 6. `Discharge`.
* **Trigger Reconciliation Rule**:
  - In `Patient Page`, `checkAndEnqueueCare` conditionally writes a `CareQueueItem` only when `risk_tier` is `'High'` or `'Critical'` **AND** `user.hospitalId` is populated.
  - The unified contract will map high-risk admitted patient reports into the Hospital Care Queue under stage `Pre-Triage`.
  - Reports for non-admitted outpatients remain in the Patient's personal report history and are visible to their attending physician, but do **NOT** generate artificial inpatient hospital care tasks.

---

## 15. Appointments

Harmonizes appointment scheduling across Patient, Doctor, and Hospital modules into a single `Appointment` collection:
* `_id: ObjectId`
* `legacyId: String` (e.g. `APT-101`)
* `patientId: ObjectId` (ref `Patient`)
* `doctorId: ObjectId` (ref `Doctor`)
* `hospitalId: ObjectId | null` (ref `Hospital`)
* `appointmentDate: Date`
* `timeSlot: String` (e.g. `'10:00 AM'`)
* `status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled'`
* `type: 'In-Person' | 'Video' | 'Follow-up'`
* `reason: String`
* `notes: String`

---

## 16. Emergency / SOS

* **Flow Architecture**:
  1. **Trigger**: Patient clicks "Emergency SOS" on `/patient/dashboard`. Client transmits geolocation coordinates.
  2. **Persistence**: Express creates an `EmergencyAlert` record (`status: 'ACTIVE'`, `coords: { lat, lng }`).
  3. **Broadcasting**: Doctor Workstation receives active alerts via polling `/api/triage/sos/active` (5-second cadence).
  4. **Alarm Trigger**: Doctor Workstation plays `sos-alarm.mp3` and displays persistent red emergency banner.
  5. **Map Dispatch**: Attending physician opens `RealGpsMapModal`, reviews Leaflet map, and clicks "Dispatch Ambulance".
  6. **Status Update**: Endpoint `PATCH /api/triage/sos/:id/dispatch` updates database state to `IN_PROGRESS` with `isAmbulanceDispatched: true`.
  7. **Hospital Oversight**: Live status displays on `/hospital/alerts`.
* **Verification Status**: Individual UI and backend components exist. Cross-role communication will be marked **VERIFIED** only after live multi-client testing during implementation.

---

## 17. API Ownership

The API namespace is strictly partitioned by domain:
* `/api/auth/*`: IAM domain (`login`, `register`, `me`, `google`, `logout`).
* `/api/patient/*`: Patient personal records, biomarker trends, simulation assistant.
* `/api/reports/*`: Diagnostic report upload, regex ingestion, PDF storage.
* `/api/doctor/*`: Clinical workstation, assigned patient roster, prescription generation.
* `/api/hospital/*`: Institutional operations, bed management, care queue, doctor balancing.
* `/api/lab/*`: Laboratory diagnostic ingestion and sign-off.
* `/api/appointments/*`: Scheduling, booking, cancellation.
* `/api/triage/*`: Emergency SOS alerts and ambulance dispatching.

---

## 18. Frontend Route Ownership

Single React Router v6 tree with encapsulated workspace shells:
* `/`: Public Landing Page (`PublicLayout`)
* `/login`, `/register`: Public Authentication Pages (`PublicLayout`)
* `/auth/callback`: OAuth token redirect handler
* `/patient/*`: Patient Workspace (`PatientLayout` with Jankoti tokens + Tailwind)
* `/doctor/*`: Doctor Workstation (`DoctorLayout` with Tailwind + Leaflet)
* `/hospital/*`: Hospital Operations (`HospitalLayout` with scoped Ant Design theme)
* `/lab/*`: Laboratory Diagnostic Workspace (`HospitalLayout` scoped for `lab_admin`)

---

## 19. ML Service Boundary

* **Host & Port**: `http://127.0.0.1:8000` (FastAPI ASGI process).
* **Communication Protocol**: Synchronous HTTP JSON from Express report controller.
* **Frozen API Surface**:
  - `GET /health`: Microservice liveness and model metadata.
  - `POST /analyze`: Primary diagnostic inference endpoint.
  - `POST /predict`: Disease risk predictor only.
  - `GET /model-info`: Random Forest feature importances and classes.
* **Preservation Rule**: Existing algorithms (`flagging.py`, `predictor.py`, `risk_scorer.py`) and model artifacts (`disease_model.joblib`) are preserved intact.

---

## 20. Configuration Contract

Single centralized environment schema validated at startup:
* `NODE_ENV`: `'development' | 'production' | 'test'`
* `PORT`: `5000` (Unified Express server)
* `MONGODB_URI`: `mongodb://localhost:27017/medx_unified`
* `JWT_SECRET`: Mandatory secret key for JWT signing.
* `JWT_EXPIRES_IN`: `'7d'`
* `ML_SERVICE_URL`: `http://127.0.0.1:8000`
* `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth credentials.
* `CLIENT_URL`: `http://localhost:5173` (Vite dev server)

---

## 21. Cross-Role Visibility Matrix

| Data Domain | Patient | Doctor | Hospital Admin | Lab Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Personal Health Records** | ALLOW (Self) | ALLOW (Assigned) | ALLOW (Inpatients) | DENY |
| **Blood Biomarker Reports** | ALLOW (Self) | ALLOW (Assigned) | ALLOW (Inpatients) | ALLOW (Lab Uploads) |
| **Prescription History** | ALLOW (View) | ALLOW (Author/Edit)| ALLOW (View) | DENY |
| **Doctor Availability Roster** | ALLOW (View slots)| ALLOW (Manage own) | ALLOW (Full Roster)| DENY |
| **Hospital Bed Occupancy** | DENY | DENY | ALLOW | DENY |
| **Hospital Care Queue** | DENY | DENY | ALLOW | DENY |
| **Emergency SOS Dispatch** | ALLOW (Trigger) | ALLOW (Respond/GPS)| ALLOW (Monitor) | DENY |
| **Lab Quality Sign-off** | DENY | DENY | DENY | ALLOW |

---

## 22. Source Authority Allocation

| Domain | Primary Authority | Secondary Authority | Reference Only |
| :--- | :--- | :--- | :--- |
| **Public Landing Page** | `Login Page/Med-X` | — | `Patient Page` |
| **Google OAuth Flow** | `Login Page/Med-X` | `Hospital Page` | `Patient Page` |
| **Biomarker Engine & Trends** | `Patient Page/Medx-jankoti` | — | `Hospital Page` |
| **Machine Learning Service** | `Patient Page/ml_service` | — | — |
| **Doctor Clinical Workstation** | `Doctor Page/DoctorPage3` | — | `Patient Page` stubs |
| **Prescription Generator** | `Doctor Page/DoctorPage3` | `Hospital Page` | — |
| **Emergency SOS & GPS Dispatch**| `Doctor Page/DoctorPage3` | `Patient Page` | `Hospital Page` |
| **Hospital Operations & Beds** | `Hospital Page/hospital-page`| — | `Patient Page` stubs |
| **Institutional Care Queue** | `Hospital Page/hospital-page`| `Patient Page` | — |
| **Laboratory Workspace** | `Hospital Page/hospital-page`| — | — |

---

## 23. Migration Requirements

1. **Doctor Page Down-leveling**: Down-level `Doctor Page` components from React 19 to React 18.3.1 to maintain compatibility with Ant Design and Recharts.
2. **Login Page Build Migration**: Migrate Create React App JSX, CSS, and asset loaders into Vite 6.
3. **Doctor Backend Authentication**: Wrap all `/api/clinical/*` routes with `requireAuth` and `roleGuard(['doctor'])`.
4. **Dual-Key Schema Adaptation**: Implement Mongoose virtual getters (`id`) mapping to `legacyId` so Doctor components continue operating seamlessly with string IDs.
5. **Ant Design Scoping**: Encapsulate all Ant Design components within `<div className="hospital-workspace-container">` and configure Tailwind CSS layer boundaries.

---

## 24. VERIFY Items

* **VERIFY-01**: Equivalence between Patient `CareQueueItem` and Hospital `CareTask`. Must be validated against clinical admission context during Phase 1.
* **VERIFY-02**: Live multi-client response time of the Emergency SOS polling loop under network latency.
* **VERIFY-03**: PDF regex extraction accuracy against varied third-party diagnostic laboratory formats.

---

## 25. DEFERRED Items

* **DEFERRED-01**: Camera-based patient recognition and facial identification (explicitly excluded per tracker boundary).
* **DEFERRED-02**: Hardware IoT drivers, physical stethoscope integration, Arduino sketches (no hardware dependencies).
* **DEFERRED-03**: Radiological X-Ray AI models, DICOM image viewers, CNN classifiers (out of current scope).

---

## 26. Non-Goals

* Autonomous diagnosis or clinical treatment recommendation without clinician oversight.
* Replacement or redesign of the existing trained Random Forest disease prediction model.
* Construction of speculative billing, pharmacy supply chain, or insurance claims modules.

---

## 27. Extensibility & Future Integration Boundary

This section establishes how the Med-X platform safely scales as new healthcare domains, clinical specialties, and institutional capabilities are introduced:

### A. Shared Infrastructure vs. Domain-Owned Logic
* **Shared Platform**: Authentication, authorization token validation, database pooling, configuration loading, global UI design tokens, and error handling are centralized. Domain packages **never** reimplement auth or database connection logic.
* **Domain Ownership**: Each domain (Patient, Doctor, Hospital, Lab, etc.) encapsulates its own Mongoose models, controllers, business rules, and UI page components.

### B. Stable Architectural Contracts
* The core identity standard (`User._id` linking to specialized profile documents) remains permanent. Introducing a future healthcare role (e.g. `radiologist` or `pharmacist`) requires adding a new profile model and linking it via `User.userId`, leaving existing `Patient` and `Doctor` schemas completely unchanged.
* The API routing structure (`/api/<domain>/*`) ensures new domains register dedicated routers without mutating existing route trees.

### C. Evolution of Medical Data
* The `MedicalReport` contract separates report metadata from observations using a dynamic `parameters` Map. Future diagnostic panels (e.g. urinalysis, lipid subfractions, genetic markers) can be ingested immediately as key-value observation maps without executing database schema migrations or altering existing blood biomarker records.

### D. Evolution of Machine Learning Services
* The Express backend communicates with ML intelligence via HTTP JSON contracts. If future ML capabilities (such as specialty-specific risk engines) are added, they can be deployed as independent microservice endpoints and registered in `ml_service/main.py` or alongside it, without altering the Express clinical report ingestion pipeline.

### E. Frontend Workspace Pluggability
* The frontend architecture uses modular route shells (`PatientLayout`, `DoctorLayout`, `HospitalLayout`). Introducing a new clinical workspace entails creating a dedicated workspace shell and registering it under `<Route path="/<new-domain>">` inside `App.jsx`, completely isolated from existing workspace DOM trees.
