## 2024-05-22 - Broken Access Control in Moderation Endpoints
**Vulnerability:** The `/api/users/:id/verify` and `/api/users/:id/block` endpoints were publicly accessible without any authentication or authorization checks, allowing any user (or unauthenticated actor) to verify or block any user account.
**Learning:** Access control must be explicitly enforced at the route level. Relying on "obscurity" (assuming only admins know the URL) or client-side checks is insufficient. Express middleware is an effective pattern for applying consistent security policies.
**Prevention:** Implemented reusable `verifyToken` and `isOwner` middleware and applied them to critical moderation routes. Ensure all future administrative endpoints utilize these middleware functions.
