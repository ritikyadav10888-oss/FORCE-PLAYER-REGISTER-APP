## 2026-01-21 - Mass Assignment in User Registration
**Vulnerability:** The `/api/auth/register` and `/api/users/:id` endpoints blindly accepted `req.body` and passed it to MongoDB/Mongoose models. This allowed attackers to inject privileged fields like `isVerified`, `points`, `isBlocked`, and `totalPaidOut` by simply including them in the JSON payload.
**Learning:** Using `new Model(req.body)` or `findByIdAndUpdate(id, req.body)` without whitelisting fields is a common and dangerous pattern in Node.js/Mongoose apps. Even if the schema defines defaults, explicitly provided values override them.
**Prevention:** Always use a whitelist of allowed fields (e.g., `pick` function or manual object construction) before passing user input to database methods. Never trust `req.body` entirely.
