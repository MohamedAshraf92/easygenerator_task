# EasyGenerator Auth

Full-stack authentication module built with NestJS and React.

---

## Features

### Backend
- **JWT authentication** stored in an HttpOnly cookie (never exposed to JavaScript)
- **Signup / Signin / Logout / Me** endpoints under a versioned API (`/v1/auth/*`)
- **Password validation** — min 8 chars, at least one letter, one number, one special character
- **Unique email enforcement** with a clear 409 conflict response
- **Global exception filter** — unified error response shape with SNAKE_UPPER_CASE message codes and a human-readable `errors` array
- **Structured logging** via Pino (pretty in development, JSON in production)
- **Helmet + CORS** — hardened HTTP headers and configurable allowed origins
- **Rate limiting** via `@nestjs/throttler` — separate `global` and `auth` named throttlers; login/signup endpoints are protected, `/me` and `/logout` are exempt
- **Environment validation** — all env vars validated at startup with `class-validator`; the app refuses to boot on misconfiguration
- **Swagger UI** at `/api/docs` (development only)
- **E2E tests** with `mongodb-memory-server` — 25 tests covering auth flows and rate limiting, fully isolated from the real database

### Frontend
- **Signup and Signin pages** with full client-side validation (react-hook-form + Zod)
- **Protected app page** — calls `/v1/auth/me` on load and displays the authenticated user's name
- **Axios instance** with automatic 401 redirect and versioned base URL
- **AuthContext** — persists user to `localStorage`, clears on logout
- **Password show/hide toggle** on all password inputs

---

## Stack

| Layer | Technologies |
|-------|-------------|
| Backend | NestJS, MongoDB (Mongoose), Passport JWT, bcrypt, class-validator, Pino, Helmet, @nestjs/throttler, @nestjs/swagger |
| Frontend | React 19, TypeScript, Vite, React Router, Axios, react-hook-form, Zod |
| Testing | Jest, Supertest, mongodb-memory-server |
| CI | GitHub Actions |

---

## Prerequisites

- Node.js 22+
- Docker (for MongoDB)

---

## Setup

### 1. Clone and configure environment files

```bash
git clone <repo-url>
cd easygenerator
```

Copy the example env files and edit them as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Start MongoDB

```bash
docker compose up -d
```

### 3. Start the backend

```bash
cd backend
npm install
npm run start:dev
```

API is available at `http://localhost:3001`.  
Swagger UI is available at `http://localhost:3001/api/docs`.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

App is available at `http://localhost:5173`.

---

## Environment variables

### Backend — `backend/.env`

```env
# Application
NODE_ENV=development
PORT=3001

# MongoDB
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DB=easygenerator
MONGODB_USER=root
MONGODB_PASSWORD=root

# JWT
JWT_SECRET=change-me-in-production-use-a-long-random-string

# CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
CORS_METHODS=GET,POST,PUT,PATCH,DELETE
CORS_CREDENTIALS=true

# Cookie
COOKIE_NAME=access_token
COOKIE_MAX_AGE_MS=604800000   # 7 days
COOKIE_SECURE=false            # set to true in production (requires HTTPS)
COOKIE_SAME_SITE=lax           # strict | lax | none
# COOKIE_DOMAIN=               # leave unset for localhost

# Rate limiting
THROTTLE_TTL_MS=60000          # window size in ms
THROTTLE_GLOBAL_LIMIT=100      # max requests per window for all routes
THROTTLE_AUTH_LIMIT=5          # max requests per window for auth endpoints
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:3001
```

---

## API reference

All endpoints are versioned under `/v1`.

| Method | Path | Protected | Description |
|--------|------|-----------|-------------|
| `POST` | `/v1/auth/signup` | No | Register a new account |
| `POST` | `/v1/auth/signin` | No | Sign in and receive a cookie |
| `POST` | `/v1/auth/logout` | No | Clear the auth cookie |
| `GET` | `/v1/auth/me` | Yes (cookie) | Return the current user's profile |

### Request bodies

**POST /v1/auth/signup**
```json
{
  "email": "user@example.com",
  "name": "Jane Doe",
  "password": "Secret1!"
}
```

**POST /v1/auth/signin**
```json
{
  "email": "user@example.com",
  "password": "Secret1!"
}
```

### Error response shape

```json
{
  "statusCode": 400,
  "message": "VALIDATION_FAILED",
  "errors": ["email must be an email", "password is too short"],
  "timestamp": "2026-06-24T00:00:00.000Z",
  "path": "/v1/auth/signup"
}
```

---

## Running tests

```bash
cd backend
npm run test:e2e
```

25 tests across two suites:
- `auth.e2e-spec.ts` — signup, signin, me, logout flows
- `throttle.e2e-spec.ts` — rate limiting behavior

No real database or external services required — `mongodb-memory-server` is used for full isolation.

---

## CI

GitHub Actions runs on every push and pull request to `main`:

- **Backend** — lint → build → E2E tests
- **Frontend** — lint → build
