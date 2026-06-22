# AI Usage

This project was built with Claude (claude-sonnet-4-6) as the primary coding assistant.

## What was AI-assisted

### Scaffolding & boilerplate
All initial project scaffolding used AI — the NestJS module/controller/service structure, the React context and routing wiring, and the CSS module styling. These are high-volume, low-ambiguity patterns where AI moves fastest.

### Validation logic
The password regex in both `signup.dto.ts` (backend) and `SignUp.tsx` (frontend) were AI-generated and matched to the spec. The pattern was verified against the requirements manually.

### Type fixes
After the initial generation, `tsc --noEmit` caught two real errors: `user.id` not existing on `UserDocument` (Mongoose attaches `_id`, not `id` directly), and `configService.get()` returning `string | undefined` where `string` was required. Both were diagnosed and fixed with targeted edits — not re-generated wholesale.

## What was corrected or done differently

- **`user.id` → `user._id.toString()`**: The AI initially used `.id` which is not typed on `UserDocument`. Fixed by importing `UserDocument` and casting properly.
- **`configService.getOrThrow()`**: Changed from `.get()` to fail fast if `JWT_SECRET` is missing in the environment, rather than silently passing `undefined` to passport.
- **No UI library**: The AI suggested using a component library (e.g. shadcn/ui). Decided against it to keep the bundle lean and the submission self-contained — plain CSS modules cover the requirements cleanly.
- **Monorepo without a workspace manager**: Kept `backend/` and `frontend/` as independent npm projects rather than a turborepo/nx monorepo. The task scope doesn't warrant the overhead.

## What worked well

Generating the full auth flow (DTO → service → controller → strategy → guard) in a single pass was efficient. The structure was correct on the first attempt; only TypeScript strictness surfaced the two issues above.
