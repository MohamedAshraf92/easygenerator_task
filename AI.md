# AI Usage

This project was built with the assistance of **Claude (claude-sonnet-4-6)** as a pair-programming tool. This document explains how AI was used, what decisions were made collaboratively vs. independently, and where I identified and corrected mistakes in the AI's output.

---

## How I used AI

I used Claude as an interactive assistant throughout the build — not as a code generator that I blindly accepted, but as a fast collaborator that I directed, questioned, and corrected. The workflow was:

1. I described what I wanted and why
2. Claude generated code
3. I ran it, reviewed it, and either accepted it, redirected it, or fixed it myself

---

## Representative prompts from this session

These are real prompts from the conversation, showing how I drove the decisions:

> *"in signup DTO, I don't like regex, can we use class validators instead?"*

Led to exploring `@IsAlpha`, `@IsNumeric` etc. as separate decorators. After seeing the result I decided it was more verbose than useful and redirected:

> *"okay, revert to the original Matches"*

This shows deliberate decision-making — I evaluated both approaches and chose based on readability and maintainability.

---

> *"discuss, I need to make custom global error handler, integrated with pino logger"*

Rather than just asking Claude to implement it, I asked for a discussion first. Claude explained the options (NestJS exception filters, middleware, interceptors) and I chose `APP_FILTER` with a `GlobalExceptionFilter` — registered at the module level so it integrates with the DI system and has access to the Pino logger.

---

> *"discuss, use jwt in cookies or keep in localstorage"*

Again, I opened a discussion before committing. The tradeoffs were laid out (XSS risk with localStorage vs. CSRF considerations with cookies) and I made the call to switch to HttpOnly cookies, with all cookie options (`COOKIE_SECURE`, `COOKIE_SAME_SITE`, `COOKIE_DOMAIN`, `COOKIE_MAX_AGE_MS`) exposed as env vars.

---

> *"separate the registered modules from the AppModule, add them in another folder. make the project well structured"*
> *"make them under common folder is better?"*

I wasn't satisfied with the initial structure and drove the reorganisation into `src/common/{database,logger,filters,throttler,cors,cookies}`. The second prompt shows me refining the decision mid-conversation.

---

> *"make methods and allowedOrigins and credentials in cors setup as env vars. also, can it be splitted in common?"*

I consistently pushed for configuration to live in env vars — not hardcoded. This applied to CORS, cookies, throttling, and MongoDB credentials.

---

> *"unify the global error handler response, it should have errors array across all app. and for the message property make it in snake uppercase"*

I defined the exact error response contract I wanted: `{ statusCode, message: "SNAKE_UPPER_CASE", errors: string[], timestamp, path }`. Claude implemented it but I had to follow up:

> *"the message is in snakecase, but the errors array have normal message to send as user feedback"*

Catching this distinction — that `message` is a machine-readable code and `errors` contains human-readable strings — was my correction.

---

## Mistakes I caught and corrected

### 1. `@SkipThrottle()` with no arguments skips nothing in v6

Claude used `@SkipThrottle()` on the `logout` and `me` endpoints, assuming it would skip all throttlers. The E2E tests I wrote exposed this — `/auth/me` was returning 429 after a few calls.

I diagnosed it: in `@nestjs/throttler` v6, `@SkipThrottle()` with no args passes `{}` (an empty map), which skips nothing. You must explicitly name every throttler: `@SkipThrottle({ global: true, auth: true })`.

**Fix:** Updated both endpoints in the controller with the explicit map.

---

### 2. `ConfigModule.forRoot` validates env vars at import time, not at compile time

The E2E tests were failing with "MONGODB_HOST must be a string" even though `process.env` was set in `beforeAll`. Claude's first fix (`ignoreEnvFile: process.env.NODE_ENV === 'test'`) didn't solve it.

I identified the root cause: `ConfigModule.forRoot()` is called synchronously when `AppModule` is first `import`ed — before `beforeAll` runs. So the env vars weren't set yet when validation fired.

**Fix:** I moved `AppModule` from a static `import` at the top of the test file to a dynamic `require()` inside `beforeAll`, after all env vars were set:

```ts
// AppModule must be loaded AFTER env vars are set because ConfigModule.forRoot
// calls validate() synchronously during module construction.
const { AppModule } = require('../src/app.module') as typeof import('../src/app.module');
```

---

### 3. Rate limit tests: second describe block timed out

When I added rate-limiting tests in a second `describe` block within the same file, the `beforeAll` timed out. Claude suggested `jest.resetModules()` but that caused `MongooseCoreModule` dependency resolution errors.

I identified the real cause: `ConfigModule` bakes env vars at first `require()` — reusing the cached `AppModule` in the same process meant the second app always connected to the first MongoMemoryServer's port.

**Fix:** I moved the rate-limiting tests to a **separate file** (`throttle.e2e-spec.ts`). Jest isolates module registries per file, so each file gets a fresh `require()` with its own env vars and MongoMemoryServer instance.

---

### 4. Password validator approach — three iterations

Claude generated a single `@Matches()` regex. I asked to switch to individual class-validator decorators (`@IsAlpha`, `@IsNumeric`). After seeing the result I found it over-engineered and reverted:

> *"okay, revert to the original Matches"*

The lesson: sometimes the first approach is the right one. I evaluated the alternative before deciding.

---

### 5. Cookie domain misconfiguration

The backend `.env` had `COOKIE_DOMAIN=yourdomain.com` set as a placeholder. In development this caused the browser to reject the cookie (domain mismatch with `localhost`), making `/auth/me` return 401 even after a successful signin.

I identified the issue from the browser logs and removed the `COOKIE_DOMAIN` env var for local development. The fix: only set `COOKIE_DOMAIN` in production where a real domain exists.

---

### 6. `signup` and `signin` do not share a throttle bucket

I initially assumed exhausting the signin throttle bucket would also block signup (same `auth` throttler). The tests showed signup returned 201 after signin was throttled.

I corrected the mental model: `@nestjs/throttler` keys the bucket per throttler name + IP + **controller class + method name**, so each endpoint has its own counter within a named throttler. The tests were updated to reflect this.

---

## What I decided independently

- **HttpOnly cookie over localStorage** — evaluated the security tradeoff myself before asking Claude to implement it
- **`common/` folder structure** — pushed for this organisation; Claude's first suggestion was less structured
- **Separate E2E test helpers** (`test/helpers/`) — I proposed extracting env setup and app bootstrap into shared helpers; Claude implemented what I described
- **Swagger in development only** — my decision to gate it behind `NODE_ENV === 'development'`
- **API versioning via URI** (`/v1/`) — my decision; I chose URI versioning over header versioning for visibility and simplicity
- **Version in axios `baseURL`** — I proposed moving `/v1` from individual API calls into the axios instance so it's managed in one place

---

## Summary

AI was used as a force multiplier for implementation speed — generating boilerplate, wiring modules, and writing test scaffolding. Every architectural decision, security choice, and structural convention was mine. The most valuable skill in working with AI on a production codebase is knowing when the output is wrong and being able to diagnose why — which happened multiple times in this project.
