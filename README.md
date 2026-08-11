<!-- ══════════════════════════════════════════════════════════════════ -->
<!--                     NASHID K  —  PREPHUB BACKEND                   -->
<!-- ══════════════════════════════════════════════════════════════════ -->

# 📡 PrepHub Backend — Real-Time Collaborative API Engine

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-green?style=flat-square&logo=nodedotjs" alt="Node" />
  &nbsp;
  <img src="https://img.shields.io/badge/Express-4.x-lightgrey?style=flat-square&logo=express" alt="Express" />
  &nbsp;
  <img src="https://img.shields.io/badge/Yjs-Collab-blue?style=flat-square" alt="Yjs" />
  &nbsp;
  <img src="https://img.shields.io/badge/WebSockets-WS-orange?style=flat-square" alt="WebSockets" />
  &nbsp;
  <img src="https://img.shields.io/badge/Docker-Containers-blue?style=flat-square&logo=docker" alt="Docker" />
</p>

<p align="center">
  <strong>The high-performance API server powering PrepHub, managing real-time collaborative coding, sandbox compilation runners, and Gemini-based reviews.</strong>
</p>

---

## 📌 Project Overview
The backend server coordinates secure operations for the PrepHub ecosystem, providing real-time document sync, isolated code execution, and database modeling for developers practicing interview questions.

### ✨ Core Capabilities
*   **Real-time Synchronization:** Built-in WebSocket server integrated with Yjs CRDTs for lag-free collaborative code editing.
*   **Secure Code Sandbox:** Runs compiler containers using isolated Docker scripts to run user code safely.
*   **AI Reviewer Engine:** Orchestrates Gemini Pro models to inspect user answers, analyze time complexity (Big O), and suggest optimizations.
*   **Structured Schemas:** MongoDB models built with Mongoose validation for user session, test suite, and task metrics tracking.

---

## 📂 Repository Structure

```text
├── code-runner/  # Isolated execution environments
├── ws-server/    # WebSockets and Yjs collaboration servers
├── src/          # API controller directories, schemas, and routes
├── docker-compose.yml # Container orchestrations
└── server.js     # Express app entry point
```

---

## ⚙️ Development Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Nashid-k/prephub-dev-backend.git
   cd prephub-dev-backend
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Create a `.env` file in the root based on `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/prephub
   GEMINI_API_KEY=your_gemini_key
   ```
4. **Boot Server:**
   ```bash
   npm run start
   ```
