# Med-X Unified Healthcare Integration Workspace

This repository represents the consolidated, unified Med-X healthcare platform, integrating four previously independent subsystems into a unified, full-stack monorepo:

1. **Login & Public Portal** (Source: `Login Page/Med-X`)
2. **Patient Diagnostics & Biomarker Tracking** (Source: `Patient Page/Medx-jankoti`)
3. **Doctor Clinical Workstation** (Source: `Doctor Page/DoctorPage3`)
4. **Hospital Administrative & Operations System** (Source: `Hospital Page/hospital-page`)
5. **Preserved ML Microservice** (Source: `Patient Page/Medx-jankoti/ml_service`)

---

## Architecture Contract Reference
All development and integration is strictly bound by:
- `MED-X_UNIFIED_INTEGRATION_CONTRACT_PHASE_0B.md`
- `MED-X Project Tracker.pdf`

## Persistence Architecture
- **Development & Runtime Persistence**: Real MongoDB database (default `mongodb://localhost:27017/medx_unified`).
- **No Silent Fallback**: The system must fail clearly if the real MongoDB connection fails.
- **In-Memory Database**: Reserved strictly for explicitly isolated automated test suites.

## Status: Phase 1D Foundation Implemented & Verified
- Shared technical foundation established across frontend and backend.
- Real MongoDB persistence active with strict fail-fast error handling.
- Canonical User identity and 4 profile models (`Patient`, `Doctor`, `Hospital`, `Lab`) operational.
- JWT authentication (`7d` expiry, `medx_token` storage) and centralized RBAC active.
- Shared Axios API client with automatic Bearer token injection and centralized AuthContext state.
- React Router v6 public and protected route skeletons operational.
- Preserved FastAPI ML microservice boundary configured at `http://127.0.0.1:8000`.
- 15/15 automated foundation tests passing.

## Running the Foundation
- **Install Dependencies**: `npm install` (workspaces: `client`, `server`)
- **Run Backend**: `npm run dev:server` (runs Express on port 5000)
- **Run Frontend**: `npm run dev:client` (runs Vite on port 5173)
- **Run Tests**: `npm test` (runs 15 automated foundation verification tests)
- **Build Frontend**: `npm run build` (builds production client bundle)

