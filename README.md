# PromptoCode ⚡

> Describe a UI component in plain English — get production-ready code instantly.

Built with a full-stack TypeScript monorepo: React frontend, Express backend, Google Gemini AI, MongoDB, and Zod validation.

---
## 📸 Screenshots

![App Screenshot](<img width="782" height="404" alt="screenshot" src="https://github.com/user-attachments/assets/8cc4bc2d-34bb-4213-9715-ace6025ea8f6" />
)

## ✨ Features

- 🎨 **5 UI Styles** — Minimal, Glassmorphism, Neumorphic, Brutalist, Material
- ⚛️ **3 Frameworks** — React (TSX), HTML, Vue 3
- 🌗 **Theme Support** — Light, Dark, Auto
- 👁️ **Live Preview** — Render generated UI in an iframe instantly
- 📋 **One-click Copy** — Copy code to clipboard
- 🕓 **Generation History** — Paginated history with favorites
- 🔐 **Auth** — JWT-based register/login

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| AI | Google Gemini API (`gemini-3.5-flash`) |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Validation | Zod (runtime) + TypeScript (compile-time) |
| Monorepo | npm workspaces (`client`, `server`, `shared`) |

---

## 🏗️ Architecture

```
Frontend (React + TypeScript)
        ↓
API Layer (Shared DTOs — single source of truth)
        ↓
Backend (Node + Express + TypeScript)
        ↓
AI Service Layer (Gemini + Prompt Builder)
        ↓
Schema Validation (Zod)
        ↓
Database (MongoDB — users, generation history)
```

---

## 🚀 Run Locally

**Prerequisites:** Node.js 20+, MongoDB running locally or Atlas URI

**1. Clone the repo**
```bash
git clone https://github.com/ShikharMishra9161/PromptoCode.git
cd PromptoCode
```

**2. Install dependencies**
```bash
npm install
```

**3. Setup environment**
```bash
cp server/.env.example server/.env
```

Fill in `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/promptocode
JWT_SECRET=your_32_plus_char_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Get Gemini API key free → [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

**4. Start dev servers**
```bash
npm run dev
```

- Frontend → http://localhost:5173
- Backend → http://localhost:5000
- Health check → http://localhost:5000/api/health

---

## 📁 Project Structure

```
PromptoCode/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── pages/           # Login, Register, Generate, History
│       ├── components/      # Layout, CodePreview, ProtectedRoute
│       ├── hooks/           # useGenerate, useHistory
│       ├── services/        # Typed Axios API client
│       └── context/         # AuthContext
│
├── server/                  # Express backend
│   └── src/
│       ├── routes/          # auth, generate, history
│       ├── controllers/     # auth, generate, history
│       ├── services/        # gemini.service.ts
│       ├── models/          # User, History (Mongoose)
│       ├── middleware/       # auth (JWT), validate (Zod), errorHandler
│       ├── validators/      # Zod schemas
│       └── config/          # env.ts (Zod-validated), database.ts
│
└── shared/                  # Shared TypeScript types
    └── src/types/           # DTOs used by both client and server
```

---

## 🔑 Key Design Decisions

**Monorepo with shared types** — `@aiuix/shared` package imported by both client and server. One change to a DTO breaks both sides at compile time — no silent drift.

**Zod + TypeScript together** — TypeScript catches errors at compile time, Zod validates at runtime (request bodies, env variables). Both are needed.

**Env validation at startup** — `server/src/config/env.ts` validates all environment variables with Zod on boot. Bad config = immediate crash with a clear message, not a mystery error at runtime.

**Prompt engineering** — Gemini isn't just passed the user's text. A prompt builder maps style + framework + theme into detailed instructions, enforces JSON response format, and strips markdown fences from the output.

---

## 📡 API Endpoints

```
POST   /api/auth/register        Register new user
POST   /api/auth/login           Login
GET    /api/auth/me              Get current user (protected)

POST   /api/generate/ui          Generate UI component (protected)

GET    /api/history              List generation history (protected)
DELETE /api/history/:id          Delete a generation (protected)
PATCH  /api/history/:id/favorite Toggle favorite (protected)
```

---

## 🌱 Roadmap

- [ ] Streaming response (show code as Gemini generates)
- [ ] Export to CodeSandbox
- [ ] Redis caching for identical prompts
- [ ] Usage limits per user
- [ ] Dark/light theme toggle in preview

---

## 👤 Author

**Shikhar Mishra**  
B.Tech CSE @ AKGEC, Ghaziabad (2023–2027)  
[GitHub](https://github.com/ShikharMishra9161) · [LinkedIn](https://linkedin.com/in/shikhar-mishra-480171294/)

---

<p align="center">Built with ☕ and way too many Gemini API calls</p>
