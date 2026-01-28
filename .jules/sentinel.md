## 2026-01-28 - Broken Access Control: Missing Token Verification
**Vulnerability:** The backend generated JWTs but never verified them. Critical endpoints like `PUT /api/users/:id` and `POST /api/tournaments` were effectively public, allowing full unauthorized access to modify data.
**Learning:** The presence of `jwt.sign` in code can create a false sense of security. Verification (`jwt.verify`) is the other half of the key. Always audit for the *usage* of the verification mechanism.
**Prevention:** Establish a default-deny policy where all routes require authentication unless explicitly exempted, or strictly enforce middleware usage on all API routes via linter rules or tests.
