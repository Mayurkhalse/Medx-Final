# MED-X PHASE 1C — UNRESOLVED CONTRACT QUESTIONS

**Document ID**: `MED-X_PHASE_1C_UNRESOLVED_CONTRACT_QUESTIONS.md`  
**Phase**: Phase 1C — Contract Reconciliation & Integration Decision Freeze  
**Standard**: Real, Evidence-Grounded Ambiguities Only (No Manufactured Questions)  
**Location**: `medx-unified/documentation/`

---

## 1. Overview

This document catalogs strictly those architectural and operational ambiguities that cannot be definitively resolved from the Project Tracker PDF, the Phase 0B Contract, the Phase 1B Structural Inventory, or the captured source code in `source_baselines/*`.

None of these items block the commencement of implementation. For each item, an operational baseline has been frozen, and a verification method is defined for empirical validation during subsequent phases.

---

## 2. Unresolved Contract Questions Register

### UQ-01: Inpatient Care Task Generation for Non-Admitted Patients
* **Evidence Examined**:
  - `source_baselines/patient/backend/routes/reports.js`: `checkAndEnqueueCare(patientId, report)` checks:
    `if (['High', 'Critical'].includes(risk_tier) && user.hospitalId) { ... }`
  - `source_baselines/hospital/backend/models/CareTask.js`: `CareTask` requires `departmentId`, `patientId`, `hospitalId`, and tracks 6 institutional stages (`Pre-Triage` to `Discharge`).
* **Ambiguity**: When an outpatient (who has no `hospitalId` assigned) uploads a high-risk CBC report, does the system synthesize an inpatient `CareTask` in a default hospital, or does it remain strictly flagged in the outpatient's personal report history and attending doctor's queue?
* **Affected Domain**: Care Queue & Triage Domain / Hospital Operations Domain.
* **Consequence**: Enqueuing outpatients without an admission relationship would corrupt hospital bed occupancy and departmental tracking; ignoring high risk leaves hospital emergency staff unalerted.
* **Frozen Baseline Decision**: Strictly preserve the code rule from `reports.js`: `CareTask` creation in the Hospital Kanban occurs **only** when `user.hospitalId` is populated. High-risk reports for outpatients trigger visual risk badges on the Doctor workstation (`DoctorHome.jsx`), but do not create institutional hospital care tasks.
* **Future Verification Method**: Validate during Phase 1 empirical testing by executing Test 08 with both admitted inpatients and unassigned outpatients.
* **Blocks Implementation**: **NO**

---

### UQ-02: Doctor Emergency Alert Polling Latency vs. Real-Time Transport
* **Evidence Examined**:
  - `source_baselines/doctor/src/components/EmergencyView.jsx`: Uses active polling effect via `setInterval(fetchAlerts, 5000)`.
  - `source_baselines/doctor/public/sos-alarm.mp3`: Audio asset loaded into HTML5 `<audio>` element.
  - `source_baselines/doctor/dist/sw.js`: Service worker with notification event listeners.
* **Ambiguity**: Is the production expectation for the emergency alarm strictly a 5-second REST polling cycle, or was a real-time WebSocket / SSE connection intended?
* **Affected Domain**: Emergency / SOS Domain / Doctor Workstation.
* **Consequence**: 5-second polling introduces an operational latency of up to 5 seconds before the doctor's audio alarm sounds.
* **Frozen Baseline Decision**: Implement 5-second REST polling (`GET /api/triage/sos/active`) as the frozen integration baseline. It is 100% supported by existing source code and eliminates stateful WebSocket cluster management complexity.
* **Future Verification Method**: Benchmark end-to-end trigger-to-alarm latency during live cross-role acceptance testing.
* **Blocks Implementation**: **NO**

---

### UQ-03: Doctor Schedule Authority: Personal Hours vs. Hospital Roster
* **Evidence Examined**:
  - `source_baselines/doctor/src/components/AvailabilityView.jsx`: Doctor edits personal working days (`['Mon', 'Tue', 'Wed', 'Thu', 'Fri']`) and working hours (`09:00 AM - 05:00 PM`) stored in component state.
  - `source_baselines/hospital/backend/models/DoctorAssignment.js`: Hospital admin assigns doctor shifts, departments, and on-duty status.
* **Ambiguity**: When a patient books an appointment, which schedule governs slot availability: the doctor's personal profile preferences or the hospital's institutional shift roster?
* **Affected Domain**: Appointment Scheduling Domain / Doctor Domain.
* **Consequence**: Potential scheduling conflicts if a patient books an appointment during personal hours when the clinician is rostered for surgery or hospital duty.
* **Frozen Baseline Decision**: Appointment booking queries the Doctor's personal `workingDays` and `startTime`/`endTime` as the default schedule. If the appointment is booked within a specific hospital facility (`hospitalId` selected), the system verifies the clinician is on-duty in that facility.
* **Future Verification Method**: Test appointment slot generation during cross-role integration testing.
* **Blocks Implementation**: **NO**

---

### UQ-04: Laboratory Direct Report Ingestion Target Resolution
* **Evidence Examined**:
  - `source_baselines/patient/backend/routes/reports.js`: `/api/reports/upload` uses `req.user.id` as the report owner.
  - `source_baselines/hospital/frontend/src/pages/hospital/HospitalReports.jsx`: Displays reports for all inpatients and provides review actions.
* **Ambiguity**: When a `lab_admin` uploads a diagnostic report directly, how is the patient identified (e.g. `patientId` form field, national ID, or hospital admission number)?
* **Affected Domain**: Laboratory Workspace / Diagnostic Report Ingestion.
* **Consequence**: If `lab_admin` uploads a report, the upload controller cannot assume `patientId = req.user.id` (which would attribute the report to the laboratory technician).
* **Frozen Baseline Decision**: Enhance `/api/reports/upload` to check `req.user.role`:
  - If `role === 'patient'`: Target patient is automatically `req.user.patientId`.
  - If `role === 'lab_admin'`: Controller requires a `patientId` field in the multipart FormData, linking the report to that patient and recording `labId = req.user.id`.
* **Future Verification Method**: Execute laboratory upload workflow test in Phase 1.
* **Blocks Implementation**: **NO**
