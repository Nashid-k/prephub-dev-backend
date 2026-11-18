# PrepHub — Backend, Realtime Services & Code Runner

The PrepHub backend is a multi-component Node.js system for a coding-practice and learning application. It combines an Express API with realtime collaboration services, background jobs, vector-search integration and a separately packaged code-runner service.

## API surface

The main Express application mounts these route groups:

| Base path | Responsibility |
| --- | --- |
| `/api/ai` | AI-assisted learning workflows |
| `/api/compiler` | Compiler and code-execution workflows |
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
- **Realtime services:** Socket.IO and Yjs-related services in separately packaged service directories
- **Background processing:** BullMQ and Redis integration
- **Vector search:** Qdrant client integration
- **Code runner:** separate service with its own package and Docker configuration
- **AI integrations:** Google Generative AI and Groq SDK dependencies

## Stack

Node.js, Express 4, MongoDB/Mongoose, Socket.IO, Yjs, Redis, BullMQ, Qdrant, Docker, Google Generative AI and Groq.

## Run the main API locally

```bash
git clone https://github.com/Nashid-k/prephub-dev-backend.git
cd prephub-dev-backend
npm install
```

Create a local `.env` file with the variables required by your deployment. At minimum, configure the database, server port and credentials for any external services enabled in your environment. Keep all real credentials out of Git.

```bash
npm run dev
```

The main API defaults to port `5000`. The repository also contains separate packages for realtime and code-runner services; consult their individual README files and Dockerfiles when running the complete system.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the main API with nodemon |
| `npm start` | Start the main API |
| `npm run seed` | Run the main seed script |

## Security

Code execution and collaborative services should be deployed with isolated runtime permissions, restricted network access, resource limits and validated inputs. Do not expose runner containers directly to untrusted clients.
