# CareFlow AI — Full-Stack Healthcare Workflow & Care Coordination Platform

> **AI-Powered Healthcare Care Coordination Platform (Production & Cloud Ready)**

---

## 🏗️ Deployment Architecture

```text
[ React 18 + Vite Frontend ] (Vercel / Netlify / Cloud)
          ↓ (HTTPS REST API Requests with JWT)
[ Spring Boot 3.2.3 Backend ] (Render / Railway / Cloud)
    ├── Spring Security + JJWT (Stateless RBAC)
    ├── Groq AI Clinical Engine (Qwen / Llama 3 via Groq)
    ├── Local File-Based H2 Database (./data/careflow_ai)
    └── Swagger / OpenAPI Documentation (/swagger-ui/index.html)
```

---

## 🚀 Quick Local Development

### 1. Backend (Port 9090)
```powershell
cd careflow-ai/backend
.\run_backend.ps1
```
*Or double-click `run_backend.bat`.*  
The backend will run on **http://localhost:9090**.

### 2. Frontend (Port 5173)
```bash
cd careflow-ai/frontend
npm install
npm run dev
```
The frontend will run on **http://localhost:5173** and proxy `/api` requests to `http://localhost:9090`.

---

## 📦 Production Deployment Guide

### Option 1: Backend on Render (Web Service) & Frontend on Vercel

#### Step 1: Deploy Backend to Render
1. Push your project to GitHub.
2. Log into [Render.com](https://render.com) and click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Root Directory:** `careflow-ai/backend`
   - **Environment:** `Docker` (Render will detect `careflow-ai/backend/Dockerfile`)
   - **Instance Type:** Free or Starter
5. Under **Environment Variables**, add:
   - `PORT`: `9090` (or leave Render to assign `$PORT`)
   - `FRONTEND_URL`: `https://your-frontend-deployment.vercel.app`
   - `JWT_SECRET`: `your_secure_random_32_character_string_here`
   - `GROQ_API_KEY`: `your_groq_api_key_here`
   - `GROQ_MODEL`: `qwen/qwen3.8-27b`
   - `H2_CONSOLE_ENABLED`: `false`
6. Click **Deploy Web Service**.
7. Note down your backend URL (e.g., `https://careflow-backend.onrender.com`).
8. Test the health check endpoint: `https://careflow-backend.onrender.com/api/health`

> [!WARNING]
> **H2 Database Ephemeral Disk Note on Free Cloud Platforms**: Free tiers on Render/Railway use ephemeral storage. Any new data created during sessions will be reset if the container is redeployed or put to sleep. If data persistence between cold restarts is needed for judges, attach a persistent disk mount to `/app/data` or use Render's managed database.

---

#### Step 2: Deploy Frontend to Vercel
1. Log into [Vercel.com](https://vercel.com) and click **Add New** → **Project**.
2. Select your repository.
3. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `careflow-ai/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://careflow-backend.onrender.com` (Your Render backend URL from Step 1)
5. Click **Deploy**.
6. Once deployed, copy your production Vercel URL (e.g., `https://careflow-frontend.vercel.app`).
7. Update the `FRONTEND_URL` on Render with this URL so CORS allows requests.

---

## 🔑 Environment Variables Reference

### Backend (`careflow-ai/backend/.env.example`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Yes | `9090` | Server listening port |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Allowed frontend origins for CORS (comma-separated) |
| `JWT_SECRET` | Yes | Default fallback | Secret key for signing JWTs (min 32 bytes) |
| `GROQ_API_KEY` | Optional | Empty | Groq API Key for clinical note extraction |
| `GROQ_MODEL` | Optional | `qwen/qwen3.8-27b` | Model used for document analysis |
| `H2_CONSOLE_ENABLED` | Optional | `false` | Enable/disable H2 console in production |
| `H2_DB_PATH` | Optional | `./data/careflow_ai` | File storage path for H2 database |

### Frontend (`careflow-ai/frontend/.env.example`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | In Production | Empty (uses `/api`) | Public HTTPS backend URL (e.g. `https://api.careflow.com`) |

---

## 🏥 Demo User Credentials

All accounts are pre-seeded on startup with password: **`password123`**

| Role | Email | Capabilities |
|---|---|---|
| **Doctor** | `doctor@careflow.ai` | Create/view patients, upload documents, trigger AI analysis, order tasks |
| **Nurse** | `nurse@careflow.ai` | View assigned patients, execute bedside task queue (`Start` / `Complete`), check timeline |
| **Admin** | `admin@careflow.ai` | System-wide statistics, audit logs, configuration |
| **Coordinator** | `coordinator@careflow.ai` | Cross-department coordination and follow-up tracking |

---

## 🩺 Endpoints Reference

- **Public Health Check:** `GET /api/health`
- **Swagger Documentation:** `GET /swagger-ui/index.html`
- **OpenAPI Spec:** `GET /api-docs`
- **Authentication:**
  - `POST /api/auth/login`
  - `POST /api/auth/register`
- **Patients:** `GET /api/patients`, `GET /api/patients/{id}`, `POST /api/patients`, `GET /api/patients/{id}/timeline`
- **Documents & AI:** `POST /api/documents/upload/{id}`, `POST /api/ai/analyze/{id}`
- **Tasks:** `GET /api/tasks`, `PUT /api/tasks/{id}/status`, `PUT /api/tasks/{id}/assign`
- **Follow-ups:** `GET /api/followups`, `PUT /api/followups/{id}/status`
- **Dashboards:** `GET /api/dashboard/doctor`, `GET /api/dashboard/nurse`, `GET /api/dashboard/admin`
