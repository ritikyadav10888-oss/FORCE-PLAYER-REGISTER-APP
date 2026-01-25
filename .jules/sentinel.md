## 2024-05-22 - [Missing Authentication Middleware]
**Vulnerability:** Critical tournament management endpoints (`POST /api/tournaments`, etc.) were completely unauthenticated, allowing any user to create/edit/delete tournaments.
**Learning:** The codebase relies on `backend/server.js` for all routes but lacked a centralized auth middleware application. Documentation/Memory suggested auth existed, but code audit proved otherwise.
**Prevention:** Enforce a "secure by default" router wrapper or apply middleware globally to `/api/*` except whitelist. Always verify "auth exists" claims by auditing the actual code usage.
