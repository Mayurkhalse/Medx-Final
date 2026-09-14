# Med-X

**Med-X** is a medical blood-report analysis platform under development.

The project is being developed as a structured platform for handling blood-report information and presenting medically meaningful information to patients and healthcare professionals.

> **Current status:** The repository currently contains the working web foundation, authentication flow, role-oriented UI, and mock Med-X data. Blood-report extraction, persistent medical data storage, and AI/ML analysis are planned future layers and are not yet implemented.

---

## Overview

Med-X is being developed around a research-driven understanding of blood-report components and their medical interpretation.

The current application provides the web foundation required for the platform, including:

- Patient-oriented dashboard
- Healthcare-professional dashboard
- Blood-report UI
- Health information UI
- Monitoring UI
- Alerts UI
- Medicines UI
- Devices UI
- Ask Med-X UI
- Profile UI
- Google OAuth authentication
- Role-oriented navigation
- Mock data for current frontend development

The medical research and blood-report scope are maintained separately from the current implementation layer.

---

## Current Status

| Area | Status |
|---|---|
| React web application | Implemented |
| Patient-oriented UI | Implemented |
| Professional-oriented UI | Implemented |
| Google OAuth | Implemented |
| JWT/session authentication foundation | Implemented |
| Blood-report UI | Implemented with mock data |
| Health / monitoring / alerts UI | Implemented with current mock data |
| Medical report extraction | Planned |
| Persistent medical database | Planned |
| Longitudinal report history | Planned |
| AI/ML analysis | Planned |
| Dedicated AI service | Planned |

The current repository should therefore be understood as the **web foundation of Med-X**, not as the completed medical-analysis system.

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | Web application |
| React Router 6 | Application routing |
| Axios | HTTP communication |
| Create React App | Frontend development/build |
| `react-scripts` | Development tooling |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express | API/server framework |
| Passport | Authentication framework |
| Google OAuth 2.0 | Google authentication |
| JWT | Authentication foundation |
| Express Session | Session handling |
| CORS | Cross-origin configuration |
| dotenv | Environment configuration |

### Planned Future Layers

The broader Med-X development plan includes:

- Persistent medical data storage
- Blood-report data extraction
- Longitudinal report handling
- Python-based AI services
- FastAPI
- AI/ML analysis

These layers are **not currently part of the implemented application**.

---

## Repository Structure

```text
Med-X/
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── server.js
│
├── public/
│   ├── index.html
│   └── logo.png
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── features/
│   │   ├── ai/
│   │   ├── alerts/
│   │   ├── dashboard/
│   │   ├── devices/
│   │   ├── health/
│   │   ├── medicines/
│   │   ├── monitoring/
│   │   ├── professional/
│   │   ├── profile/
│   │   └── reports/
│   │
│   ├── mock/
│   │   └── medxData.js
│   │
│   └── pages/
│       ├── AuthCallback.js
│       ├── Login.js
│       └── Register.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## Getting Started

Follow the steps below to run the current Med-X application locally.

### 1. Prerequisites

Install:

- Node.js 24.x
- npm
- Git
- A Google account for OAuth testing

Verify the installed versions:

```bash
node --version
npm --version
git --version
```

---

### 2. Clone the Repository

```bash
git clone https://github.com/gulshankyy2007/Med-X.git
cd Med-X
```

The current implementation is maintained on the `feature/medx-ui` branch.

```bash
git checkout feature/medx-ui
```

---

### 3. Install Frontend Dependencies

From the project root:

```bash
npm install
```

---

### 4. Install Backend Dependencies

Move into the backend directory:

```bash
cd backend
npm install
cd ..
```

---

### 5. Configure Environment Variables

The frontend uses a local environment file for development configuration.

Create:

```text
.env
```

with the required local configuration.

The backend uses:

```text
backend/.env
```

Use:

```text
backend/.env.example
```

as the shareable configuration template.

The local backend environment contains authentication and OAuth secrets and **must not be committed to Git**.

---

## Google OAuth Configuration

The current authentication foundation uses **Google OAuth 2.0**.

Create/configure an OAuth 2.0 Web application in the Google Cloud Console.

### Authorized JavaScript origin

```text
http://localhost:3000
```

### Authorized redirect URI

```text
http://localhost:5000/auth/google/callback
```

The redirect URI configured in Google Cloud must exactly match the callback URI used by the backend.

If the OAuth consent screen is in testing mode, add the Google accounts that need to test the application as test users.

---

## Running the Application

Med-X currently consists of a React frontend and a Node/Express backend.

Run them in **two separate terminals**.

### Terminal 1 — Backend

From:

```text
Med-X/backend
```

run:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

The health endpoint is:

```text
http://localhost:5000/health
```

Expected response:

```json
{"ok":true}
```

### Terminal 2 — Frontend

From the project root:

```bash
npm start
```

The frontend runs on:

```text
http://localhost:3000
```

---

## Authentication Flow

The current Google authentication flow is structured as:

```text
React Frontend
      │
      │ Google login request
      ▼
Node / Express Backend
      │
      │ OAuth request
      ▼
Google OAuth 2.0
      │
      │ Authentication result
      ▼
OAuth Callback
      │
      ▼
Med-X Frontend
```

### Current authentication endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Backend health check |
| GET | `/auth/google` | Start Google OAuth |
| GET | `/auth/google/callback` | Google OAuth callback |
| GET | `/auth/me` | Current authentication state |
| POST | `/auth/logout` | Logout |
| POST | `/auth/login` | Login endpoint foundation |
| POST | `/auth/register` | Registration endpoint foundation |
| PUT | `/auth/updateprofile` | Profile update endpoint foundation |

The database-dependent authentication endpoints are currently incomplete placeholders.

---

## Application Areas

### Patient

The current patient-oriented interface includes:

- Dashboard
- Health
- Reports
- Monitoring
- Alerts
- Medicines
- Devices
- Ask Med-X
- Profile

### Healthcare Professional

The current professional-oriented interface includes:

- Professional Dashboard
- Patients
- Reports
- Monitoring
- Alerts
- Ask Med-X

---

## Medical Research Foundation

The implementation is being developed against a separate research foundation covering blood-report information.

The research defines:

- Blood-report components
- Biological meaning
- Component relationships
- Reported value representations
- Reference information
- Derived and calculated observations
- Interpretation boundaries
- Information that must be preserved for future analysis

This research foundation is intentionally kept separate from the implementation so that future software layers can be developed against defined medical requirements rather than independently inventing medical behavior.

---

## Current Data Model Status

The current frontend uses mock data for application development.

Persistent medical-data functionality is **not yet implemented**.

### Current

- Mock patient data
- Mock blood-report data
- Mock monitoring information
- Mock alerts
- Mock medicines
- Mock devices
- Mock professional/patient views

### Future

- Persistent medical records
- Structured blood-report observations
- Longitudinal report history
- Cross-report comparison
- Medical analysis
- AI/ML-based pattern analysis

---

## Development Principles

Med-X development follows these principles:

1. **Research before implementation**  
   Medical requirements are established before implementing interpretation behavior.

2. **Preserve source information**  
   Blood-report information should retain the meaning and context supplied by the original report.

3. **Separate extraction from interpretation**  
   Extracting report information and interpreting medical significance are distinct concerns.

4. **Do not invent medical meaning**  
   The application should not infer unsupported medical conclusions from incomplete information.

5. **Use synthetic or non-sensitive data during development**  
   Real patient records should not be used for ordinary development or testing.

6. **Keep secrets out of Git**  
   Environment files containing credentials must remain local.

---

## Security

Never commit:

```text
.env
backend/.env
```

or any file containing:

- Google Client Secrets
- JWT secrets
- Session secrets
- API keys
- Passwords
- Private credentials
- Patient records
- Other sensitive healthcare information

Only sanitized configuration templates such as:

```text
.env.example
backend/.env.example
```

should be version controlled.

---

## Development Workflow

The recommended development workflow is:

1. Pull the latest repository changes.
2. Create or switch to a feature branch.
3. Open the Med-X workspace in the IDE.
4. Start only the services required for the current task.
5. Use synthetic/non-sensitive healthcare data.
6. Test the affected functionality locally.
7. Review the changes before committing.
8. Commit focused changes with a clear message.
9. Push the feature branch.
10. Keep secrets and local data out of Git.

---

## Project Roadmap

The current web foundation is intended to evolve through the following major layers:

```text
Web Foundation
      │
      ▼
Medical Data Handling
      │
      ▼
Blood-Report Extraction
      │
      ▼
Structured Longitudinal Data
      │
      ▼
Medical Analysis
      │
      ▼
AI/ML Services
```

The exact implementation of future layers will follow the project's research and technical specifications as they are finalized.

---

## Documentation

Project documentation includes research and development material covering:

- Blood-report component research
- Blood-report scope and classification
- Component information and interpretation requirements
- Blood-report extraction requirements
- System architecture
- UI/UX specifications
- Developer environment setup
- Technology learning resources
- Project development records

Implementation documentation should be updated whenever the repository architecture or development workflow changes.

---

## Repository

**GitHub:**  
https://github.com/gulshankyy2007/Med-X

**Active development branch:**  
`feature/medx-ui`

---

## License

This project is currently under development.

License information will be added when the project's licensing decision is finalized.
