## 2026-01-18 - [Fixing NoSQL Injection with Incompatible Middleware]
**Vulnerability:** NoSQL Injection in Authentication Routes
**Learning:** The `express-mongo-sanitize` middleware can cause server crashes (`TypeError: Cannot set property query of #<IncomingMessage>`) if `req.query` is immutable or read-only (likely due to specific Express/Node version interactions or other middleware).
**Prevention:** When middleware-based sanitization fails or causes conflicts, implement strict type checking (e.g., `typeof email !== 'string'`) on sensitive inputs at the controller level to prevent object injection.
