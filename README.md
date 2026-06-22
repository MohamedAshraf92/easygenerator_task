# EasyGenerator Auth

Full-stack authentication module — NestJS backend + React frontend.

## Stack

- **Backend:** NestJS, MongoDB (Mongoose), JWT (passport-jwt), bcrypt, class-validator
- **Frontend:** React 19, TypeScript, Vite, React Router, Axios

## Prerequisites

- Node.js 20+
- Docker (for MongoDB) — or a local MongoDB instance

## Getting started

### 1. Start MongoDB

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # edit values as needed
npm install
npm run start:dev
```

The API listens on `http://localhost:3001`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | — | Register a new user |
| POST | `/auth/signin` | — | Sign in, receive JWT |
| GET | `/auth/me` | Bearer JWT | Protected — return current user |

### Sign-up payload

```json
{
  "email": "user@example.com",
  "name": "Jane Doe",
  "password": "Secret1!"
}
```

Password rules: min 8 chars, at least one letter, one number, one special character.

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `PORT` | Port the API listens on (default `3001`) |
| `FRONTEND_URL` | Allowed CORS origin |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL |
