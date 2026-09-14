# MED-X PHASE 1B — SOURCE BASELINE MANIFEST

**Document ID**: `MED-X_PHASE_1B_SOURCE_BASELINE_MANIFEST.md`  
**Phase**: Phase 1B — Controlled Source Capture & Structural Baseline  
**Capture Timestamp**: `2026-09-15T02:14:00+05:30`  
**Target Root**: `/mnt/data/GY/Study/Projects and Development/MedX Integration/medx-unified/`  
**Source Baseline Directory**: `medx-unified/source_baselines/`  
**Modification Status**: 100% Unmodified / Exact Source Capture

---

## 1. Executive Summary

In strict adherence to the Phase 1B execution constraints, controlled source baseline copies of all four independent Med-X implementations have been captured into isolated subdirectories under `medx-unified/source_baselines/`. 

No application code was rewritten, merged, or refactored. No dependencies were installed. All environment-specific and generated artifacts (`node_modules`, Python virtual environments `.venv`, build outputs `dist`/`build`, compiler caches `__pycache__`/`*.pyc`, and local `.env` secret files) were strictly excluded.

---

## 2. Baseline Repositories Manifest

### Baseline 1: Login & Landing Page (`login`)
* **Repository Name**: `Login Page/Med-X`
* **Original Filesystem Path**: `/mnt/data/GY/Study/Projects and Development/MedX Integration/Login Page/Med-X`
* **Original Branch**: `feature/medx-ui`
* **Original HEAD Commit**: `33e520d7bccb80dbf292543bb8fa1db46600278b`
* **Remote URL**: `https://github.com/gulshankyy2007/Med-X.git`
* **Captured Source Location**: `medx-unified/source_baselines/login/`
* **Captured File Count**: 57 files
* **Reproducibility Identifier (SHA-256 Tree Hash)**: `48aea101dafbc7d0a277856c625cbcb336c371f598b234e4d5d22a3ab48e6103`
* **Excluded Material**: `.git/`, `node_modules/`, `.env`, `.DS_Store`
* **Preserved Configuration Templates**: `.env.example` (sanitized placeholders)
* **Source Content Modified During Capture**: **NO (Preserved verbatim)**

---

### Baseline 2: Patient Portal & ML Microservice (`patient`)
* **Repository Name**: `Patient Page/Medx-jankoti`
* **Original Filesystem Path**: `/mnt/data/GY/Study/Projects and Development/MedX Integration/Patient Page/Medx-jankoti`
* **Original Branch**: `main`
* **Original HEAD Commit**: `eb01240f72f29f5a3021116ee603f3385ed49a18`
* **Remote URL**: `https://github.com/Mayurkhalse/Medx-jankoti.git`
* **Captured Source Location**: `medx-unified/source_baselines/patient/`
* **Captured File Count**: 84 files (Frontend, Backend, and Python ML service)
* **Reproducibility Identifier (SHA-256 Tree Hash)**: `e11083006e3aeeb39738e3e5586ee5504972b367e23a113da3c61499b6172c9f`
* **Excluded Material**: `.git/`, `node_modules/`, `ml_service/.venv/`, `__pycache__/`, `*.pyc`, `.env`, `.DS_Store`
* **Preserved Artifacts**: `ml_service/models/disease_model.joblib` (trained model artifact), `requirements.txt`
* **Source Content Modified During Capture**: **NO (Preserved verbatim)**

---

### Baseline 3: Doctor Clinical Workstation (`doctor`)
* **Repository Name**: `Doctor Page/DoctorPage3`
* **Original Filesystem Path**: `/mnt/data/GY/Study/Projects and Development/MedX Integration/Doctor Page/DoctorPage3`
* **Original Branch**: `main`
* **Original HEAD Commit**: `5f94336717be80925c2129ebad6545290d4d9cb6`
* **Remote URL**: `https://github.com/sonalikodag24/DoctorPage3.git`
* **Captured Source Location**: `medx-unified/source_baselines/doctor/`
* **Captured File Count**: 59 files
* **Reproducibility Identifier (SHA-256 Tree Hash)**: `a3fb0d6041a79e40974d49c551499195b0c884015cb6236203c72e211292f709`
* **Excluded Material**: `.git/`, `node_modules/` (including tracked Windows binaries from original repo), `dist/`, `.env`, `.DS_Store`
* **Preserved Audio Assets**: `public/sos-alarm.mp3`
* **Source Content Modified During Capture**: **NO (Preserved verbatim)**

---

### Baseline 4: Hospital Operations System (`hospital`)
* **Repository Name**: `Hospital Page/hospital-page`
* **Original Filesystem Path**: `/mnt/data/GY/Study/Projects and Development/MedX Integration/Hospital Page/hospital-page`
* **Original Branch**: `main`
* **Original HEAD Commit**: `186152a5cc624fa4945c60278d5c3466354f62d9`
* **Remote URL**: `https://github.com/S-tech519/hospital-page.git`
* **Captured Source Location**: `medx-unified/source_baselines/hospital/`
* **Captured File Count**: 73 files (Separate `frontend/` and `backend/` directories)
* **Reproducibility Identifier (SHA-256 Tree Hash)**: `8fa20682923c87cae94205bb029f3fa2ea8aed7f09446d9a76692b99ec16d8bd`
* **Excluded Material**: `.git/`, `frontend/node_modules/`, `backend/node_modules/`, `.env`, `.DS_Store`
* **Preserved Configuration & Seeds**: `backend/seeds/seed.js`
* **Source Content Modified During Capture**: **NO (Preserved verbatim)**

---

## 3. Exclusion Matrix & Verification

| Category | Filter Rule | Excluded Files / Directories | Rationale |
| :--- | :--- | :--- | :--- |
| **Dependencies** | `--exclude='node_modules'` | `node_modules/` across all 4 repos | Non-portable, platform-specific binaries; to be installed uniformly in later phase |
| **Virtual Environments** | `--exclude='.venv' --exclude='venv'` | `Patient Page/ml_service/.venv/` | Isolated local Python environment containing binary site-packages |
| **Build Outputs** | `--exclude='dist' --exclude='build'` | `Doctor Page/dist/` | Ephemeral build bundles |
| **Python Caches** | `--exclude='__pycache__' --exclude='*.pyc'` | `.cpython-314.pyc` bytecode files | Generated bytecode caches |
| **Secrets & Env** | `--exclude='.env'` | `Login Page/.env`, `Login Page/backend/.env` | Local credentials; must not be committed to Git |
| **Git Metadata** | `--exclude='.git'` | `.git/` in all 4 source repos | Prevents nested Git submodules; integration workspace maintains single top-level Git tracking |

---

## 4. Verification Check

A post-capture scan across `medx-unified/source_baselines/` confirms:
- Total Files Captured: **273 source files**
- Total Excluded Directories Present: **0**
- Total `.env` Credential Files Present: **0**
- Total Bytecode `.pyc` Files Present: **0**
- Original Source Repositories Status: **100% untouched and clean**
