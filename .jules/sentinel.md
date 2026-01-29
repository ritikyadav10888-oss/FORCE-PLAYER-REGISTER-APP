## 2024-05-22 - [Missing Authentication Middleware]
**Vulnerability:** The backend had JWT generation logic but lacked any middleware to verify tokens on incoming requests, leaving critical endpoints (like creating tournaments) completely exposed.
**Learning:** Presence of auth-related code (like `jwt.sign`) can create a false sense of security. Explicit middleware application is required.
**Prevention:** Implement global authentication middleware or use a framework that enforces auth by default. Include negative test cases that assert "401 Unauthorized" for protected routes.
