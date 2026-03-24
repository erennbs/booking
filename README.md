# Booking App

Full-stack booking system built with:

- `apps/web`: Next.js (App Router) frontend
- `apps/api`: NestJS backend (JWT auth + bookings)
- `packages/shared`: shared Zod schemas and TypeScript types
- PostgreSQL + Drizzle ORM

## Project Structure

```text
booking/
  apps/
    web/          # Next.js app
    api/          # NestJS API
  packages/
    shared/       # Shared schemas/types/constants
  docker-compose.yml
  docker-compose-test.yml
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (for PostgreSQL)

## Setup Instructions

1. Install dependencies at repo root:

```bash
npm install
```

2. Create environment files:

- `apps/api/.env.development.local`
- `apps/web/.env.development.local`

Use the examples in the Environment Variables section below.

3. Start PostgreSQL:

```bash
docker compose up -d
```

4. Build shared package (first run / after shared changes):

```bash
npm run build --workspace=packages/shared
```

5. Apply schema:

```bash
npm run db:push
```

6. Start apps:

```bash
npm run dev:api
npm run dev:web
```

Default local URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:3001`

## Environment Variables

### API (`apps/api/.env.development.local`)

```env
PORT=3001
DATABASE_URL=postgres://booking:booking_secret@localhost:5431/booking_db
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRY=1d
```

### Web (`apps/web/.env.development.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Test API (optional, for e2e)

Create `apps/api/.env.test.local`:

```env
PORT=3001
DATABASE_URL=postgres://booking:booking_secret@localhost:5431/booking_db_test
JWT_SECRET=test-secret
JWT_EXPIRY=1d
```

Use `docker-compose-test.yml` if you want isolated test DB setup.

## Database Setup Guide

### 1) Start DB

```bash
docker compose up -d
```

Postgres container settings from `docker-compose.yml`:

- host: `localhost`
- port: `5431`
- user: `booking`
- password: `booking_secret`
- database: `booking_db`

### 2) Apply schema


```bash
npm run db:push
```

### 4) Stop DB

```bash
docker compose down
```

To remove DB volume data as well:

```bash
docker compose down -v
```

## API Documentation

Base URL: `http://localhost:3001`

### Auth

#### `POST /auth/register`

Register user and return JWT.

**Body**

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123"
}
```

Validation:

- `name`: required, max 100
- `email`: valid email
- `password`: min 6 chars

**Response**

```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "sara@example.com",
    "name": "Sara Ahmed",
    "createdAt": "2026-03-24T10:00:00.000Z"
  }
}
```

#### `POST /auth/login`

Authenticate user and return JWT.

**Body**

```json
{
  "email": "sara@example.com",
  "password": "secret123"
}
```

**Response**

Same shape as `POST /auth/register`.

### Bookings

#### `GET /bookings/available?date=YYYY-MM-DD`

Return available hourly slots for a date.

**Query params**

- `date` (required): format `YYYY-MM-DD`

**Response**

```json
{
  "date": "2026-03-25",
  "availableSlots": [
    { "startTime": "09:00", "endTime": "10:00", "duration": 60 },
    { "startTime": "10:00", "endTime": "11:00", "duration": 60 }
  ]
}
```

Predefined slot range is hourly from `09:00` to `16:00` (60 min sessions).

#### `POST /bookings`

Create booking for authenticated user.

**Headers**

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Body**

```json
{
  "date": "2026-03-25",
  "startTime": "09:00"
}
```

Validation:

- `date`: format `YYYY-MM-DD`
- `startTime`: format `HH:mm` and must match predefined slot

**Response**

```json
{
  "booking": {
    "id": "uuid",
    "userId": "uuid",
    "date": "2026-03-25",
    "startTime": "09:00",
    "status": "confirmed",
    "createdAt": "2026-03-24T10:30:00.000Z",
    "updatedAt": "2026-03-24T10:30:00.000Z"
  }
}
```

## Error Response Format

Errors are returned in a consistent JSON shape:

```json
{
  "statusCode": 400,
  "timestamp": "2026-03-24T10:31:00.000Z",
  "path": "/bookings",
  "message": "Validation error"
}
```

## Useful Scripts

From repo root:

- `npm run dev:api` - start API only
- `npm run dev:web` - start web only
- `npm run prod:api` - start API build
- `npm run prod:web` - start web build
- `npm run build` - build all workspaces
- `npm run test` - run tests across workspaces
- `npm run lint` - lint all workspaces
- `npm run db:migrate` - run API DB migrations
- `npm run db:push` - push schema directly
