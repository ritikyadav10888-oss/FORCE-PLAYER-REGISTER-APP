## 2024-05-22 - Missing Authentication Middleware Pattern
**Vulnerability:** The backend generated JWTs on login but never validated them on subsequent requests. All API endpoints were effectively public, allowing full unauthorized access (IDOR, etc.).
**Learning:** The presence of JWT generation code does not imply the presence of validation middleware. Always verify the `app.use` or route specific middleware application.
**Prevention:** Establish a default "deny all" policy where all routes are protected by default, and public routes are explicitly whitelisted, rather than manually adding protection to each route.
