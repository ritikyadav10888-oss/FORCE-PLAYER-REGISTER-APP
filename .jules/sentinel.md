## 2024-05-22 - [Authorization Bypass via Query Parameter]
**Vulnerability:** The `/api/tournaments` endpoint trusted `req.query.role` to determine the user's role, allowing any user to pass `?role=OWNER` and bypass filtering logic.
**Learning:** Never trust client-side input for authorization decisions. Even if the frontend code is "safe", an attacker can manipulate the request.
**Prevention:** Always verify the JWT token on the backend and derive the user's role/identity from the decoded token payload.
