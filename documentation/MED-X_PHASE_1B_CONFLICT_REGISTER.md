# MED-X PHASE 1B — CONFLICT REGISTER

**Document ID**: `MED-X_PHASE_1B_CONFLICT_REGISTER.md`  
**Phase**: Phase 1B — Controlled Source Capture & Structural Baseline  
**Nature**: Static Source Code Conflict Inventory (Directly observable from captured sources)  
**Location**: `medx-unified/documentation/`  
**Rule**: No conflicts are fixed during Phase 1B.

---

## 1. Summary of Conflict Classifications

| Severity Level | Definition | Count |
| :---: | :--- | :---: |
| **P0** | **Blocker**: Directly blocks safe integration, causes process crashes, or corrupts data | **5** |
| **P1** | **High**: Significant architectural, functional, or structural mismatch requiring reconciliation | **8** |
| **P2** | **Medium**: Manageable configuration, asset, or routing migration task | **5** |
| **INFO** | **Observation**: Operational or architectural characteristic noted for runtime awareness | **1** |
| **TOTAL** | | **19** |

---

## 2. Observable Conflicts Register

### [P0 — BLOCKERS]

#### 1. CR-01: React 19 vs React 18 Incompatibility
* **Observable Source**:
  - `source_baselines/doctor/package.json`: `"react": "^19.2.8"`, `"react-dom": "^19.2.8"`
  - `source_baselines/patient/package.json`: `"react": "^18.3.1"`, `"react-dom": "^18.3.1"`
  - `source_baselines/hospital/frontend/package.json`: `"react": "^18.3.1"`, `"react-dom": "^18.3.1"`
  - `source_baselines/login/package.json`: `"react": "^18.3.1"`, `"react-dom": "^18.3.1"`
* **Direct Impact**: Ant Design `5.23.0` and Recharts `2.15.0` have peer dependency conflicts and render lifecycle crashes under React 19.
* **Classification**: **P0 (Blocker)**

#### 2. CR-02: Backend Port 5000 Collision Across All Four Servers
* **Observable Source**:
  - `source_baselines/login/backend/server.js`: `PORT = 5000`
  - `source_baselines/patient/backend/server.js`: `PORT = 5000`
  - `source_baselines/doctor/backend/server.js`: `PORT = 5000`
  - `source_baselines/hospital/backend/server.js`: `PORT = 5000`
* **Direct Impact**: All four standalone backend servers bind to `0.0.0.0:5000`. Running more than one results in `EADDRINUSE` failure.
* **Classification**: **P0 (Blocker)**

#### 3. CR-03: Primary Key Type Incompatibility (String IDs vs Mongo ObjectIds)
* **Observable Source**:
  - `source_baselines/doctor/backend/models/Patient.js`: `id: { type: String, required: true }` (e.g. `'P001'`, `'P002'`)
  - `source_baselines/doctor/backend/models/Appointment.js`: `patientId: String`, `doctorId: String` (`'DOC-101'`)
  - `source_baselines/hospital/backend/models/Patient.js`: Uses default MongoDB `_id` (`ObjectId`)
  - `source_baselines/hospital/backend/models/Appointment.js`: `patientId: { type: ObjectId, ref: 'Patient' }`
* **Direct Impact**: Relational joins (`populate('patientId')`) and cross-referencing between Doctor and Hospital models fail if IDs are mixed between String and ObjectId.
* **Classification**: **P0 (Blocker)**

#### 4. CR-04: Destructive Startup Database Seeding in Hospital Backend
* **Observable Source**:
  - `source_baselines/hospital/backend/seeds/seed.js`:
    ```javascript
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await MedicalReport.deleteMany({});
    ```
* **Direct Impact**: Invoking the hospital backend seeder unconditionally purges all existing database collections, wiping real patient, doctor, and user accounts.
* **Classification**: **P0 (Blocker)**

#### 5. CR-05: Completely Unauthenticated Clinical Endpoints in Doctor Backend
* **Observable Source**:
  - `source_baselines/doctor/backend/server.js` & `backend/routes/*`: Endpoints (`/api/patients`, `/api/appointments`, `/api/emergency`) mount without any JWT or session verification middleware.
  - In contrast, `Hospital Page` and `Patient Page` enforce Bearer token verification.
* **Direct Impact**: Patient health information and triage alerts can be fetched and manipulated anonymously without credentials.
* **Classification**: **P0 (Blocker)**

---

### [P1 — HIGH SEVERITY CONFLICTS]

#### 6. CR-06: Build System Fragmentation (Create React App vs Vite)
* **Observable Source**: `source_baselines/login` uses `react-scripts` 5.0.1 (Webpack/CRA). `patient`, `doctor`, and `hospital` use Vite.
* **Direct Impact**: CRA cannot be combined into a modern Vite monorepo without migrating JSX, static assets, and environment variables (`REACT_APP_` vs `VITE_`).
* **Classification**: **P1 (High)**

#### 7. CR-07: CSS & UI Framework Collisions (Ant Design vs Tailwind CSS)
* **Observable Source**: `hospital` uses Ant Design 5.23 (`antd`). `patient` and `doctor` use Tailwind CSS v3/v4.
* **Direct Impact**: Ant Design's global reset CSS stylesheet overrides Tailwind's base typography, table borders, and button padding unless strictly encapsulated in a scoped DOM container.
* **Classification**: **P1 (High)**

#### 8. CR-08: Incompatible Routing Architectures
* **Observable Source**:
  - `patient` & `hospital`: Declarative `react-router-dom` v6 `<Routes>` and `<Route>`.
  - `doctor`: Component-level state tabs (`useState('home')`) switching views in `App.jsx`.
  - `login`: State-level navigation tabs inside `App.js`.
* **Direct Impact**: Doctor and Login views cannot participate in browser URL deep linking, history navigation, or route protection guards without declarative refactoring.
* **Classification**: **P1 (High)**

#### 9. CR-09: Express & Mongoose Dependency Mismatches
* **Observable Source**:
  - `doctor`: Express `5.2.1` & Mongoose `9.9.4`
  - `hospital`: Express `4.21.2` & Mongoose `8.9.5`
  - `patient`: Express `4.19.2` & Mongoose `8.4.1`
* **Direct Impact**: Express 5 routing and Mongoose 9 promise handling differences introduce subtle runtime mismatches across controllers.
* **Classification**: **P1 (High)**

#### 10. CR-10: Inconsistent Role Naming Conventions
* **Observable Source**:
  - `login`: `candidate`, `organization`
  - `patient`: `patient`, `doctor`, `hospital_admin`
  - `hospital`: `patient`, `doctor`, `hospital_admin`, `lab_admin`
* **Direct Impact**: Inability to authorize users across boundaries without translating role strings. Tracker requires: `patient`, `doctor`, `hospital_admin`, `lab_admin`.
* **Classification**: **P1 (High)**

#### 11. CR-11: Disparate Diagnostic Report Schema Shapes
* **Observable Source**:
  - `patient/backend/models/Report.js`: Uses flat `parameters` object and embedded ML prediction maps.
  - `hospital/backend/models/MedicalReport.js`: Relational schema referencing `patientId`, `hospitalId`, `labId`, with institutional review fields.
* **Direct Impact**: Reports uploaded in the Patient portal cannot be viewed or audited in the Hospital portal without field reconciliation.
* **Classification**: **P1 (High)**

#### 12. CR-12: Unverified Cross-Role Emergency SOS Flow
* **Observable Source**:
  - `patient`: Triggers SOS to `/api/emergency/sos`.
  - `doctor`: Polls `/api/emergency` expecting simulated local mock array.
  - `hospital`: Queries `/api/hospital/alerts`.
* **Direct Impact**: The emergency flow is fragmented across three repositories; no verified end-to-end communication currently exists.
* **Classification**: **P1 (High)**

#### 13. CR-13: Silent In-Memory Database Fallback in Hospital Database Configuration
* **Observable Source**:
  - `source_baselines/hospital/backend/config/db.js`:
    ```javascript
    try {
      await mongoose.connect(process.env.MONGODB_URI);
    } catch (err) {
      console.warn('Falling back to MongoMemoryServer');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    }
    ```
* **Direct Impact**: Violates the mandatory database requirement. If real MongoDB fails to connect, the server silently creates an ephemeral memory database, causing silent data loss on restart.
* **Classification**: **P1 (High)**

---

### [P2 — MEDIUM SEVERITY MIGRATION ISSUES]

#### 14. CR-14: Hardcoded `localhost:5000` URLs in Frontend Fetch Calls
* **Observable Source**: Multiple frontend components in `patient`, `doctor`, and `login` directly invoke `fetch('http://localhost:5000/api/...')`.
* **Direct Impact**: Prevents staging/production deployment and breaks when ports are altered or proxied.
* **Classification**: **P2 (Medium)**

#### 15. CR-15: Token Storage Key Inconsistency
* **Observable Source**: `patient` uses `localStorage.getItem('token')`; `hospital` uses `localStorage.getItem('token')`; `login` uses URL parameters on redirect.
* **Direct Impact**: Potential collision with generic keys; requires standardizing on `medx_token`.
* **Classification**: **P2 (Medium)**

#### 16. CR-16: Duplicate and Erroneous Asset Files
* **Observable Source**:
  - `source_baselines/doctor/public/sos-alarm.mp3.mp3`: Duplicate file with accidental double extension.
  - `logo.png` duplicated in `login/public`, `patient/public`, and `doctor/public`.
* **Direct Impact**: Redundant repository bloat.
* **Classification**: **P2 (Medium)**

#### 17. CR-17: Inconsistent Environment Variable Naming
* **Observable Source**:
  - `patient` expects `MONGO_URI`
  - `hospital`, `login`, and `doctor` expect `MONGODB_URI`
* **Direct Impact**: Database connection fails depending on which controller initializes first.
* **Classification**: **P2 (Medium)**

#### 18. CR-18: Permissive CORS Configuration on ML Service
* **Observable Source**: `source_baselines/patient/ml_service/main.py` configures `allow_origins=["*"]`.
* **Direct Impact**: Allows unrestricted cross-origin requests directly to the ML microservice from any web client.
* **Classification**: **P2 (Medium)**

---

### [INFO — ARCHITECTURAL OBSERVATIONS]

#### 19. CR-19: ML Microservice Standalone Architecture
* **Observable Source**: `source_baselines/patient/ml_service/main.py` is a self-contained FastAPI Python microservice running on port `8000`.
* **Direct Impact**: It operates cleanly as an independent process and can be wired directly into the consolidated Express backend via HTTP without architectural redesign.
* **Classification**: **INFO**
