# Sentinel Journal

## 2024-05-22 - Missing Authentication Middleware on Critical Routes

**Vulnerability:** Critical sensitive endpoints like `PUT /api/users/:id` were completely unprotected. Any unauthenticated user could modify any user profile, including changing names, emails, and potentially other sensitive data.

**Learning:** The application implemented authentication (login/register) but failed to enforce authorization on resource modification endpoints. The expected `middleware/auth.js` file was missing, leading to unprotected routes in `server.js`.

**Prevention:** Implement a "secure by default" router architecture where all API routes require authentication unless explicitly whitelisted. Use automated tests to verify that sensitive routes return 401/403 for unauthenticated requests.
