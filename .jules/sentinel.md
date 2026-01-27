## 2026-01-27 - [Critical: Missing Auth Middleware on Sensitive Endpoints]
**Vulnerability:**
The core API routes `POST /api/tournaments` (Create Tournament) and `PUT /api/users/:id` (Update User) were exposed without any authentication middleware. Any user (or even unauthenticated attacker) could potentially create tournaments or modify user profiles.

**Learning:**
The codebase had role checks in logic (e.g., `if (role === 'ORGANIZER')`) but these relied on the `role` being present in `req.user`, which was NOT populated because the `verifyToken` middleware was missing entirely from `server.js`. This highlights a dangerous assumption: "code checks role" != "code enforces role if auth is bypassed".

**Prevention:**
1.  Implement a robust `verifyToken` middleware that validates JWT signatures.
2.  Apply `verifyToken` explicitly to all sensitive routes.
3.  Add negative test cases (`backend/test-auth.js`) that specifically attempt to access protected resources *without* a token and *with* an invalid role, ensuring 401/403 responses.
