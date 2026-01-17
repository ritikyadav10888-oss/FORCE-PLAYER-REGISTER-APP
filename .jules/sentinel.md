# Sentinel Journal

## 2024-05-22 - Critical Auth Bypass on API Endpoints
**Vulnerability:** Sensitive API endpoints (user profiles, tournament creation, payouts) were completely unprotected, allowing any user (or unauthenticated attacker) to read/modify data.
**Learning:** The application relied on "security by obscurity" or frontend logic, assuming users wouldn't find or call these endpoints directly. Missing middleware on specific routes is a common oversight when routes are added ad-hoc.
**Prevention:** Implement a "secure by default" router where all routes require authentication unless explicitly whitelisted. Use automated security testing (like the repro script) to verify access controls on all new endpoints.
