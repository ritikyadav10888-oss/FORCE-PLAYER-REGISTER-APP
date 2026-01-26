# Sentinel's Journal

## 2026-01-26 - [Missing Authentication on Critical Admin Endpoints]
**Vulnerability:** Critical admin endpoints (`verify`, `block`, `payout`) were completely exposed to unauthenticated users. Any user could verify themselves or block others by guessing the user ID.
**Learning:** The project lacked a centralized authentication middleware strategy, leading to ad-hoc or missing checks. Developers likely assumed some endpoints were internal or forgot to add checks because there was no "default secure" router.
**Prevention:** Implement a global "secure by default" strategy or ensure all sensitive routes are wrapped in a higher-order function/middleware that enforces auth. Regular security scanning of route definitions is recommended.
