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

## Status: Phase 1A Complete
- Target integration workspace initialized.
- All four source repositories preserved intact.
- Baseline configuration established.
