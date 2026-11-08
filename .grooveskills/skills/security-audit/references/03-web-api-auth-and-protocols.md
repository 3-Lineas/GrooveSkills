# Web, API, Auth & Protocol Security

Domain audit checklist covering OWASP API Security Top 10, HTTP framing, authentication, and webhooks.

---

## 1. OWASP API Top 10 Checklist

### API1: Broken Object Level Authorization (BOLA / IDOR)
- Verify every endpoint accepting an object ID (`userId`, `invoiceId`, `docId`) verifies that the authenticated user owns or has explicit permission to access the target entity.
- Disallow fetching records by ID alone; database queries must always join or filter by `tenant_id` or `user_id`.

### API2: Broken Authentication
- Session tokens, JWTs, and API keys must be validated via constant-time comparison.
- Assert tokens cannot be forged via weak secrets, `none` algorithm, or lack of expiration (`exp`) check.
- Protect refresh token endpoints against replay attacks and token reuse.

### API3: Broken Object Property Level Authorization (BOPLA / Mass Assignment)
- Strict boundary validation: use Valibot schemas with exact properties. Disallow pass-through of raw `req.body` into database inserts or updates.
- Verify sensitive fields (`role`, `is_admin`, `balance`, `tenant_id`, `verified`) cannot be overwritten by client payloads.

### API4: Unrestricted Resource Consumption
- All public endpoints, auth routes, and expensive query endpoints must have rate limiting (IP-based or token-bucket).
- Assert pagination constraints exist (maximum `limit` clamped, e.g., max 100 items).
- Enforce request payload size limits (`bodyLimit`) to prevent memory exhaustion.

### API5: Broken Function Level Authorization (BFLA)
- Verify administrative routes (`/admin/*`, `/internal/*`) require explicit role policies, not just standard logged-in user tokens.
- Check HTTP method tampering (e.g., bypassing a GET guard by sending a POST or PUT).

---

## 2. Protocol & Boundary Security

### HTTP Framing, CORS & Headers
- Enforce strict CORS policies: avoid `Access-Control-Allow-Origin: *` on endpoints sending credentials or sensitive user data.
- Verify security headers: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`.
- Guard against HTTP Request Smuggling by ensuring proxy and application server agree on `Transfer-Encoding` / `Content-Length`.

### Webhook Verification
- Incoming webhooks (Stripe, MercadoPago, GitHub) must verify HMAC signatures using raw byte bodies before parsing JSON.
- Verify timestamp tolerance (typically 300s) to prevent replay attacks.
- Store processed webhook IDs in persistent storage for atomic idempotency guards.

### SSRF (Server-Side Request Forgery)
- Validate and sanitize all user-supplied URLs before issuing outbound requests.
- Block loopback (`127.0.0.1`, `::1`), private ranges (`10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`), and cloud metadata (`169.254.169.254`).
