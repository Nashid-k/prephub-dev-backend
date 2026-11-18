# PrepHub — Backend API & Learning Services

PrepHub's backend is a multi-component Node.js system for a coding-practice and learning application. The main Express API serves authentication, curriculum, progress, AI and learning workflows. Realtime collaboration and code execution are implemented through separate integrations.

## Main API

The Express application mounts these route groups:

| Base path | Responsibility |
| --- | --- |
| `/api/ai` | AI-assisted learning workflows |
| `/api/compiler` | Code execution through the external Piston API |
| `/api/curriculum` | Curriculum and learning content |
| `/api/category` | Category data |
| `/api/progress` | Learner progress |
| `/api/test-cases` | Test-case workflows |
| `/api` | Search endpoints |
| `/api/auth` | Authentication |
| `/api/bookmarks` | Saved learning items |
| `/api/recommendations` | Recommendations |
| `/api/activity` | Learner activity |
| `/api/onboarding` | Onboarding |
| `/api/health` | Health check |

## System components

- **Express API:** application routes, validation, security middleware and database access
- **Code execution:** the main compiler service calls the Piston API; compiler requests have dedicated rate limiting and input validation
- **Realtime collaboration:** Socket.IO and Yjs-related services in separately packaged service directories
- **Background processing:** BullMQ and Redis integration
- **Vector search:** Qdrant client integration
- **AI integrations:** Google Generative AI and Groq SDK dependencies

### Experimental code runner

The `code-runner/` directory is a separate proof of concept. Its Docker runner currently supports only a JavaScript demo path, and its in-memory fallback simulates execution. It is **not the production compiler path and must not be treated as a hardened code-execution sandbox**. A production runner needs a dedicated isolation boundary, non-root execution, read-only filesystem, seccomp/capability restrictions, process and memory limits, network isolation, queue controls and abuse protection.

## Stack

Node.js, Express 4, MongoDB/Mongoose, Socket.IO, Yjs, Redis, BullMQ, Qdrant, Docker, Google Generative AI, Groq and Piston API integration.

## Run the main API locally

```bash
git clone https://github.com/Nashid-k/prephub-dev-backend.git
cd prephub-dev-backend
npm install
```

Create a local `.env` file with the database, authentication and external-service variables required by the modules you enable. Never commit real credentials.

```bash
npm run dev
```

The main API defaults to port `5000`. The repository also contains separately packaged realtime and code-runner services; consult their local README files and Dockerfiles before starting them.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the main API with Nodemon |
| `npm start` | Start the main API |
| `npm run seed` | Run the main seed script |

## Security

Code execution and collaborative services process untrusted user input. Keep execution isolated from the API host, enforce resource and request limits, restrict network access and validate every request. Do not expose the experimental `code-runner/` service directly to untrusted clients.
