## 2024-05-23 - Fix Sensitive Data Logging and Hardcoded Secrets
**Vulnerability:** The application was logging the entire request body during user registration, including the plaintext password. Additionally, the JWT_SECRET defaulted to a hardcoded string if the environment variable was missing.
**Learning:** excessive debug logging ('console.log(req.body)') is a common source of data leaks. Convenience fallbacks for secrets ('|| default_key') create silent security holes.
**Prevention:** Always sanitize data before logging (e.g., remove passwords, PII). Fail fast and loud if critical security configuration is missing.
