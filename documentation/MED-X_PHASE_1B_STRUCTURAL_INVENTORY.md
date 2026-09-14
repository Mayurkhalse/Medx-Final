# MED-X PHASE 1B — STRUCTURAL INVENTORY

**Document ID**: `MED-X_PHASE_1B_STRUCTURAL_INVENTORY.md`  
**Phase**: Phase 1B — Controlled Source Capture & Structural Baseline  
**Nature**: Static Source Code Inventory (No redesign, no replacements, no altered contracts)  
**Location**: `medx-unified/documentation/`

---

## 1. Scope & Purpose

This document catalogs strictly **what currently exists** in the four captured source implementations within `medx-unified/source_baselines/`. It defines the observable frontend components, backend APIs, ML capabilities, persistence configurations, and integration contracts without altering any design or picking winners.

---

## 2. Implementation Inventory: Login & Landing (`source_baselines/login`)

### A. Frontend
* **Build System & Entrypoint**: Create React App (`react-scripts` 5.0.1, webpack-based). Entrypoint: `src/index.js`, `public/index.html`.
* **Routing**: Minimal routing inside `src/App.js` with simulated state tabs (`landing`, `dashboard`, `devices`).
* **Major Components**:
  - `src/features/landing/LandingPage.js`: Public homepage hero, mission, and problem statements.
  - `src/features/landing/HeroCarousel.js`: 6 rotating visual healthcare slides with controls.
  - `src/features/landing/slides/*`: Content for 5 identified healthcare problems.
  - `src/features/landing/FeaturesSection.js`, `CoverageSection.js`, `ContactSection.js`.
  - `src/components/Navbar.js`, `Footer.js`: Navigation header with logo and role sign-in modal triggers.
* **Styling System**: Pure CSS using BEM conventions (`src/features/landing/landing.css`, `src/index.css`).
* **UI & Charting Libraries**: None. Custom vanilla CSS elements and modals.
* **Assets**: 4 hero JPGs (~850 KB) in `src/assets/`, brand logo in `public/logo.png`.

### B. Backend
* **Entrypoint**: `backend/server.js` (CommonJS Express server).
* **Routes & Endpoints**:
  - `GET /auth/google`: Initiates Google OAuth (`passport.authenticate('google')`).
  - `GET /auth/google/callback`: Handles Google redirect, creates/finds user in MongoDB, signs JWT.
  - `POST /api/auth/register`: Local registration with password hashing (bcrypt).
  - `POST /api/auth/login`: Local login returning JWT.
  - `GET /api/user`: Protected profile fetch.
* **Middleware**: `passport.initialize()`, `passport.session()`, custom JWT Bearer token validator.
* **Authentication Mechanisms**: Passport GoogleStrategy + Local JWT (`jsonwebtoken` v9).
* **Configuration**: Reads from `process.env.JWT_SECRET`, `PORT=5000`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

### C. ML
* None present in this repository.

### D. Persistence
* **Database Configuration**: Mongoose (`mongoose.connect(process.env.MONGODB_URI)`).
* **Models**: `User` defined inline in `backend/server.js` (`name`, `email`, `password`, `googleId`, `role` enum `['candidate', 'organization']` mapped to patient/doctor).

### E. Integration-Relevant Contracts
* **Port**: `5000`
* **Token Header**: `Authorization: Bearer <token>`
* **Cookie / Session**: Express-session with key `connect.sid` used during Google OAuth handshake.
* **Supported Local Roles**: `candidate`, `organization` (login UI prompts patient/doctor).

---

## 3. Implementation Inventory: Patient Portal & ML (`source_baselines/patient`)

### A. Frontend
* **Build System & Entrypoint**: Vite `6.0.7` + React `18.3.1`. Entrypoint: `src/main.jsx`, `index.html`.
* **Routing**: React Router DOM `6.28.0` (`src/App.jsx`).
* **Major Components**:
  - `src/pages/patient/Dashboard.jsx`: Comprehensive biomarker overview, risk tier badges, top-5 off-mark parameters, lifestyle recommendations, Recharts trendlines.
  - `src/pages/patient/ReportEntry.jsx`: Dual-mode diagnostic ingestion (PDF file upload with regex extraction + manual biomarker input form).
  - `src/pages/patient/WhatIfAssistant.jsx`: Interactive biomarker simulation assistant with conversational chat bubbles and rule-based fallbacks.
  - `src/layouts/PatientLayout.jsx`: Navigation sidebar, header with notification bell, breadcrumbs.
* **Styling System**: Tailwind CSS (`src/index.css`) with Jankoti design variables.
* **UI & Charting Libraries**: `recharts` (`2.15.0`) for biomarker trendlines; `lucide-react` for icons.
* **Assets**: Brand icons, Jankoti logo in `public/logo.png`.

### B. Backend
* **Entrypoint**: `backend/server.js` (CommonJS Express server).
* **Routes & Endpoints**:
  - `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - `POST /api/reports/upload`: Multer PDF upload, regex biomarker parser, calls ML service `/analyze`.
  - `POST /api/reports/manual`: Manual biomarker input submission, calls ML service `/analyze`.
  - `GET /api/reports`: Fetches patient report history.
  - `GET /api/reports/trends/analytics`: Aggregates continuous parameter metrics for Recharts.
  - `POST /api/reports/:id/care-queue`: Enqueues patient into `CareQueueItem` if risk tier is High/Critical.
  - `POST /api/whatif/ask`: Biomarker simulation query.
  - `POST /api/emergency/sos`: SOS trigger writing to `EmergencySOS`.
* **Middleware**: `authMiddleware.js` (JWT Bearer token verification), `multer` (in-memory PDF buffer handling).
* **Models**: `User.js`, `Report.js`, `Appointment.js`, `CareQueueItem.js`, `ChatHistory.js`, `Department.js`, `Doctor.js`, `EmergencySOS.js`, `Hospital.js`, `Message.js`.

### C. ML Microservice (`ml_service/`)
* **Entrypoint**: `ml_service/main.py` (FastAPI ASGI application running on port `8000`).
* **Available Endpoints**:
  - `GET /health`: Returns service health status and model version.
  - `POST /analyze`: Full diagnostic inference: flags parameters, computes Random Forest disease risk probabilities, computes composite 0-100 risk score, and assigns risk tier (`Low`, `Moderate`, `High`, `Critical`).
  - `POST /predict`: Disease risk predictor only.
  - `GET /model-info`: Metadata regarding the trained Random Forest classifier.
* **Core Modules**:
  - `core/flagging.py`: Clinical reference range evaluation.
  - `core/predictor.py`: Scikit-learn inference pipeline loading `models/disease_model.joblib`.
  - `core/risk_scorer.py`: Weighted risk algorithm generating composite score.
  - `schemas/report_schema.py`: Pydantic validation models (`ReportAnalysisRequest`, `ReportAnalysisResponse`).
* **Dependencies**: `fastapi==0.115.6`, `uvicorn==0.34.0`, `scikit-learn==1.6.1`, `joblib==1.4.2`, `pydantic==2.10.4`, `numpy==2.2.1`.
* **Relationship to Patient Implementation**: Direct synchronous HTTP caller: `backend/routes/reports.js` posts parsed parameters to `http://localhost:8000/analyze`.

### D. Persistence
* **Database Configuration**: Mongoose (`mongoose.connect(process.env.MONGODB_URI)`).
* **Seed Mechanisms**: `backend/seed.js` (Populates demo users, doctors, hospitals, sample CBC reports, and simulated trends).

### E. Integration-Relevant Contracts
* **Backend Port**: `5000`
* **ML Port**: `8000`
* **Token Storage**: `localStorage.getItem('token')`
* **Token Header**: `Authorization: Bearer <token>`
* **Role Names**: `patient`, `doctor`, `hospital_admin`
* **Biomarker Parameters Map**: Structured key-value pairs (e.g. `glucose_fasting`, `hemoglobin`, `wbc_count`, `creatinine`, `platelets`).

---

## 4. Implementation Inventory: Doctor Workstation (`source_baselines/doctor`)

### A. Frontend
* **Build System & Entrypoint**: Vite `6.0.7` + **React `19.2.8`**. Entrypoint: `src/main.jsx`, `index.html`.
* **Routing**: State-driven navigation inside `src/App.jsx` switching between views (`home`, `patients`, `appointments`, `emergency`, `messages`, `availability`, `profile`).
* **Major Components**:
  - `src/components/DoctorHome.jsx`: Triage queue, pending patient consults, quick metrics.
  - `src/components/MyPatients.jsx`: Patient roster, filter by triage priority, medical history drawer.
  - `src/components/AppointmentsView.jsx`: Calendar and slot manager for daily patient visits.
  - `src/components/EmergencyView.jsx`: Live emergency SOS dispatcher, audio alarm trigger, Leaflet map renderer.
  - `src/components/PrescriptionSlipModal.jsx`: Interactive prescription writer generating digital Rx items.
  - `src/components/RealGpsMapModal.jsx`: OpenStreetMap/Leaflet modal showing patient coordinates and dispatch buttons.
  - `src/components/PhoneConsultationModal.jsx`: Simulated VoIP dialer modal.
* **Styling System**: Tailwind CSS (`tailwind.config.js`, `src/index.css`, `src/App.css`).
* **UI & Charting Libraries**: `lucide-react`, Leaflet (`leaflet` 1.9.4).
* **Assets**: Audio alarm asset in `public/sos-alarm.mp3`, branding in `public/jankotilogo1.png`.

### B. Backend
* **Entrypoint**: `backend/server.js` (ES Module Express server using Express 5.2.1).
* **Routes & Endpoints**:
  - `GET /api/patients`, `GET /api/patients/:id`, `POST /api/patients`
  - `GET /api/appointments`, `POST /api/appointments`, `PATCH /api/appointments/:id`
  - `GET /api/emergency`, `POST /api/emergency`, `PATCH /api/emergency/:id/dispatch`
  - `GET /api/doctor/profile`, `PUT /api/doctor/profile`
* **Middleware**: Minimal. Unauthenticated endpoints in source repository.
* **Models**: `Patient.js`, `Appointment.js`, `DoctorProfile.js`, `EmergencyAlert.js`, `EmergencyWorkflow.js`, `Message.js`. (Built with Mongoose 9.9.4).

### C. ML
* None present in this repository.

### D. Persistence
* **Database Configuration**: Mongoose (`mongoose.connect(process.env.MONGODB_URI)`).
* **Identifier Style**: String-based IDs (`id: 'P001'`, `id: 'DOC-101'`).
* **Seed Mechanisms**: `src/data/mockData.js` and `backend/seed.js`.

### E. Integration-Relevant Contracts
* **Backend Port**: `5000` (Defaults to port 5000, creating port collision with other backends).
* **API Prefix**: `/api`
* **Doctor ID Schema**: String identifier (`DOC-101`) rather than ObjectId.
* **Audio Element**: HTML5 `<audio>` element playing `/sos-alarm.mp3` upon receiving active emergency status.

---

## 5. Implementation Inventory: Hospital Operations (`source_baselines/hospital`)

### A. Frontend
* **Build System & Entrypoint**: Vite `5.4.11` + React `18.3.1`. Entrypoint: `frontend/src/main.jsx`, `frontend/index.html`.
* **Routing**: React Router DOM `6.28.0` (`frontend/src/App.jsx`).
* **Major Components (12 Full Administrative Views)**:
  - `HospitalDashboard.jsx`: Bed occupancy counters, ICU capacity, active emergency alerts ticker.
  - `HospitalPatients.jsx` & `HospitalPatientDetails.jsx`: Inpatient admission registry, bed allocation, clinical chart.
  - `HospitalReports.jsx` & `HospitalReportDetails.jsx`: Diagnostic report audit, physician sign-off.
  - `HospitalAlerts.jsx`: Real-time emergency alerts queue with severity level filtering.
  - `HospitalCareQueue.jsx`: 6-stage clinical Kanban board (`Pre-Triage` -> `Triage` -> `Physician Review` -> `Diagnostics` -> `Treatment` -> `Discharge`).
  - `HospitalAppointments.jsx`: Institutional outpatient scheduling coordinator.
  - `HospitalDoctors.jsx`: Medical staff registry, departmental assignment, on-duty toggle.
  - `HospitalDepartments.jsx`: Clinical division registry (Cardiology, Neurology, Emergency, Pediatrics).
  - `HospitalAnalytics.jsx`: Occupancy trends, length of stay, operational KPI graphs.
  - `HospitalProfile.jsx`: Institutional facility metadata and emergency contact details.
  - `DoctorAssignmentModal.jsx`: Modal for assigning attending physicians to inpatients.
* **Styling System**: Ant Design `5.23.0` (`antd`) with centralized ConfigProvider design tokens (`frontend/src/styles/theme.js`).
* **UI & Charting Libraries**: Ant Design components, `@ant-design/icons`, `recharts` `2.15.0`.

### B. Backend
* **Entrypoint**: `backend/server.js` (ES Module Express server using Express 4.21.2).
* **Routes & Endpoints**:
  - `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - `GET /api/hospital/dashboard`: Macro operational statistics.
  - `GET /api/hospital/patients`, `POST /api/hospital/patients`
  - `GET /api/hospital/reports`, `PATCH /api/hospital/reports/:id/review`
  - `GET /api/hospital/care-queue`, `PATCH /api/hospital/care-queue/:id`
  - `GET /api/hospital/doctors`, `POST /api/hospital/assign-doctor`
  - `GET /api/hospital/departments`, `GET /api/hospital/analytics`
* **Middleware**: `authMiddleware.js` (JWT Bearer token verification), `roleGuard.js` (`['hospital_admin', 'doctor', 'lab_admin']`).
* **Controllers**: Clean modular controller architecture (`hospitalController.js`, `authController.js`, `doctorController.js`, `patientController.js`).
* **Models**: `User.js`, `Patient.js`, `Doctor.js`, `Hospital.js`, `Department.js`, `MedicalReport.js`, `CareTask.js`, `Appointment.js`, `HealthAlert.js`, `Lab.js`, `Notification.js`, `DoctorAssignment.js`.

### C. ML
* None directly implemented in this repository.

### D. Persistence
* **Database Configuration**: Mongoose 8.9.5 (`backend/config/db.js`) with MongoDB connection and MongoMemoryServer fallback.
* **Seed Mechanisms**: `backend/seeds/seed.js` (Contains destructive `deleteMany({})` operation on startup).

### E. Integration-Relevant Contracts
* **Backend Port**: `5000`
* **Token Storage**: `localStorage.getItem('token')`
* **Token Header**: `Authorization: Bearer <token>`
* **Role Names**: `hospital_admin`, `doctor`, `patient`, `lab_admin`
* **CareTask Stages**: `Pre-Triage`, `Triage`, `Physician Review`, `Diagnostics`, `Treatment`, `Discharge`.
