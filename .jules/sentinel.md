## 2024-05-22 - [Critical Auth Bypass on Sensitive Endpoints]
**Vulnerability:** Found that sensitive endpoints like `POST /api/tournaments`, `PUT /api/users/:id`, and `POST /api/users/:id/payout` were completely unprotected, allowing any unauthenticated user to create tournaments, modify user profiles, and trigger payouts.
**Learning:** Middleware files were missing entirely despite documentation or memory suggestions. Always verify file existence and content rather than relying on assumptions or outdated docs.
**Prevention:** Implemented strict `verifyToken`, `verifyOwner`, and `verifyOrganizer` middleware in `backend/middleware/auth.js` and applied it to all state-changing routes in `backend/server.js`. Added checks to ensure users can only modify their own data.
