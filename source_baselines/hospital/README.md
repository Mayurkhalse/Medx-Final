# Med-X – AI-Powered Healthcare Ecosystem
## Hospital Admin Dashboard & Clinical Coordination Module

A full-stack modern MERN healthcare dashboard designed for institutional patient care coordination, laboratory parameter extraction, critical health alert surveillance, doctor workload balancing, and clinical analytics.

---

## 🌟 Key Modules

1. **Hospital Dashboard (`/hospital`)**: Real-time patient volume trends (Recharts Area), health report triage distributions, critical alert feed with direct triage actions, recent laboratory reports, and doctor workload counters.
2. **Patient Management (`/hospital/patients`)**: Searchable and filterable directory by ID, department, doctor, and alert status with pagination and direct assignment triggers.
3. **Patient Details (`/hospital/patients/:patientId`)**: 6 comprehensive clinical tabs:
   - **Overview**: Real-time physiological vitals and care team status.
   - **Medical History**: Documented conditions, allergies, and family history.
   - **Reports**: Historical laboratory panels with extraction and review statuses.
   - **Health Trends**: Recharts line trends for blood glucose, blood pressure, and hemoglobin.
   - **Appointments**: Consultation history and scheduled slots.
   - **Care Timeline**: Chronological care event progression.
4. **Critical Health Alerts (`/hospital/alerts`)**: Categorized severity triage (Critical, High, Medium, Resolved) comparing observed parameters against laboratory-configured reference ranges.
5. **Doctor Assignment Workflow**: Integrated Ant Design modal to assign patients/alerts to specialist doctors based on real-time availability and workload.
6. **Care Queue Pipeline (`/hospital/care-queue`)**: Kanban board and tabular views across 6 stages:
   - *New Patients*
   - *Reports Pending Review*
   - *Critical Alerts*
   - *Doctor Assignment Pending*
   - *Follow-up Required*
   - *Completed*
7. **Lab Report Management & Details (`/hospital/reports` & `/hospital/reports/:id`)**: Parameter extraction breakdown with clinical reference ranges, physician sign-off, and **non-diagnostic AI decision support summaries**.
8. **Hospital Appointments (`/hospital/appointments`)**: Schedule overview across Today, Upcoming, Completed, and Cancelled with reschedule modal.
9. **Doctor Management (`/hospital/doctors`)**: Attending physician directory with active consultation counts and availability statuses.
10. **Department Management (`/hospital/departments`)**: Database-driven registry of clinical divisions and department-level stats.
11. **Institutional Analytics (`/hospital/analytics`)**: 8 core KPI cards and 6 Recharts visualization charts.
12. **Hospital Profile (`/hospital/profile`)**: Institutional accreditation, emergency hotlines, and facility operating parameters.

---

## 🛡️ Medical Safety Architecture

- **Decision-Support Only**: The system strictly avoids generating autonomous clinical diagnoses.
- **Controlled Terminology**: Standardized clinical safety phrasing is used throughout:
  - *"Requires Medical Review"* (instead of claiming disease presence)
  - *"Abnormal parameter detected"* (instead of definitive pathology)
- **Prominent Disclaimers**: Every AI-assisted summary prominently features:
  > *"AI-generated information for clinical decision support. Not a medical diagnosis. Final medical decisions remain strictly with qualified doctors."*

---

## 🔑 Demo Credentials

A **1-Click Demo Login Selector** is built directly into the login screen (`/login`).

| Role | Email | Password | Target Route |
| :--- | :--- | :--- | :--- |
| **Hospital Admin** | `admin@medx.com` | `admin123` | `/hospital` |
| **Doctor** | `dr.sonali@medx.com` | `doctor123` | `/doctor` |
| **Patient** | `mayur@medx.com` | `patient123` | `/patient` |
| **Lab Admin** | `lab@medx.com` | `lab123` | `/hospital/reports` |

---

## 🚀 Quick Start Guide

### 1. Run the Backend API
```bash
cd backend
npm install
node server.js
```
*Note: The backend automatically spins up an in-memory MongoDB instance with pre-seeded synthetic clinical data if local MongoDB is not running on port 27017.*

### 2. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser.
