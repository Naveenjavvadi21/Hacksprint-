# CareFlow AI — Full-Stack Healthcare Workflow & Care Coordination Platform

> **AI-Powered MVP/POC for Hackathon Demo**

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Router |
| Backend | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database | PostgreSQL 18 (`careflow_ai` database) |
| Auth | JWT (JJWT), BCrypt password hashing |
| AI Engine | MockAIService (plug-in real LLM when ready) |
| API Docs | SpringDoc OpenAPI / Swagger |

---

## 🚀 How to Run

### 1. Start PostgreSQL
Ensure PostgreSQL is running on `localhost:5432` with the `careflow_ai` database created.

```sql
CREATE DATABASE careflow_ai;
```

### 2. Start the Backend

```cmd
cd backend
C:\...\maven\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests
java -jar target\careflow-backend-0.0.1-SNAPSHOT.jar
```

Backend starts on **http://localhost:8080**

### 3. Start the Frontend

```cmd
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 👤 Demo Accounts (All use password: `password123`)

| Role | Email |
|---|---|
| Doctor | `doctor@careflow.ai` |
| Nurse | `nurse@careflow.ai` |
| Admin | `admin@careflow.ai` |
| Coordinator | `coordinator@careflow.ai` |

---

## 🎯 Judge Hero Demo Workflow

1. Open **http://localhost:5173** and click **Dr. Rao (Doctor)** 1-click login
2. Navigate to **Patients** → Open **Ravi Kumar (P-1001)**
3. Switch to **Documents** tab → click **✨ Analyze with AI**
4. View the **AI Summary** tab — see extracted summary and 3 actions
5. Click **[ Create Tasks ]** — tasks saved to PostgreSQL
6. Open **Tasks** page — see CBC Test, Review CBC Report, Schedule Follow-up
7. Change task statuses: **Pending → In Progress → Completed**
8. Open **Follow-ups** — see Ravi's scheduled consultation
9. Return to Patient → **Timeline** tab — full audit trail
10. Return to **Dashboard** — metrics update in real time

---

## 🌐 REST API Endpoints

### Authentication
```
POST /api/auth/login      — Login and receive JWT
POST /api/auth/register   — Register new user
```

### Patients
```
GET    /api/patients          — All patients
GET    /api/patients/{id}     — Patient by ID
POST   /api/patients          — Create patient
PUT    /api/patients/{id}     — Update patient
GET    /api/patients/{id}/timeline — Patient timeline
```

### Documents
```
POST   /api/documents/upload/{patientId}   — Upload document
GET    /api/documents/patient/{patientId}  — Patient documents
GET    /api/documents/{id}                 — Document by ID
GET    /api/documents                      — All documents
```

### AI Analysis
```
POST   /api/ai/analyze/{documentId}    — Run AI analysis on document
GET    /api/ai/document/{documentId}   — Get existing analysis
POST   /api/ai/direct-analyze          — Analyze raw text
```

### Tasks
```
GET    /api/tasks                  — All tasks
GET    /api/tasks/patient/{id}     — Patient tasks
POST   /api/tasks                  — Create single task
POST   /api/tasks/batch-create     — Create batch tasks from AI actions
PUT    /api/tasks/{id}/status      — Update task status
PUT    /api/tasks/{id}/assign      — Update task assignee/department
```

### Follow-Ups
```
GET    /api/followups                   — All follow-ups
GET    /api/followups/patient/{id}      — Patient follow-ups
POST   /api/followups                   — Schedule follow-up
PUT    /api/followups/{id}/status       — Update follow-up status
```

### Dashboard
```
GET    /api/dashboard       — Live metrics from PostgreSQL
```

---

## 🤖 AI Architecture

```text
AIService (interface)
      ↓
MockAIService (@Primary)
   - Parses keywords like CBC, Ravi, discharge, cardiac
   - Returns structured summary, key info, action list
   - Each action has: title, department, assignedTo, priority, dueInDays

Future:
AIService (interface)
      ↓
GroqAIService / GeminiAIService / OpenAIService
   - Replace MockAIService @Primary annotation with real LLM
   - Add AI_API_KEY environment variable
```

---

## 🗄️ Database Schema

```sql
users          (id, name, email, password, role, created_at)
patients       (id, patient_code, name, age, gender, phone, doctor, workflow_status, created_at)
documents      (id, patient_id, file_name, document_type, content, uploaded_by, uploaded_at, ai_processed)
ai_analyses    (id, document_id, summary, key_information, extracted_actions_json, created_at)
tasks          (id, patient_id, analysis_id, title, description, department, assigned_to, priority, status, due_date, created_at)
follow_ups     (id, patient_id, doctor, type, scheduled_date, status, notes, created_at)
```

---

## 🔧 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/careflow_ai` | PostgreSQL connection URL |
| `DATABASE_USERNAME` | `postgres` | DB username |
| `DATABASE_PASSWORD` | `root123` | DB password |
| `JWT_SECRET` | Bundled default | JWT signing key (change for production!) |
| `AI_API_KEY` | None required | Future LLM integration key |

---

## 📖 Swagger / OpenAPI

Swagger UI is available at:  
**http://localhost:8080/swagger-ui.html**

API JSON spec:  
**http://localhost:8080/api-docs**

---

## 🏥 Demo Patients

| Patient Code | Name | Age | Doctor | Status |
|---|---|---|---|---|
| P-1001 | **Ravi Kumar** (Hero Demo) | 35 | Dr. Rao | Active |
| P-1002 | Sarah Williams | 42 | Dr. Rao | Active |
| P-1003 | Robert Brown | 58 | Dr. Patel | Active |
| P-1004 | Anita Sharma | 29 | Dr. Rao | Active |
| P-1005 | David Johnson | 64 | Dr. Patel | Discharged |
