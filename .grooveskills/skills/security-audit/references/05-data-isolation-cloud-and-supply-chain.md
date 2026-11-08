# Data Isolation, Cloud & Supply Chain Security

Domain audit checklist covering multi-tenancy, database RLS, payment gateways, Cloudflare Workers, and CI/CD supply chain.

---

## 1. Multi-Tenancy & Database Isolation

### PostgreSQL & Supabase Row Level Security (RLS)
- Verify that **every single public table** has Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- Audit RLS policies:
  - Assert policies check `auth.uid()` or session tenant claims: `USING (tenant_id = auth.jwt() ->> 'tenant_id')`.
  - Disallow permissive policies like `USING (true)` or `WITH CHECK (true)` unless public read is explicitly documented and intended.
- Ensure the backend client does not needlessly use the `service_role` key when querying on behalf of users; reserve `service_role` strictly for administrative background workers.

### Database Query Scoping
- In direct SQL or ORM queries (Drizzle, Prisma, Kysely), verify every query contains an explicit `WHERE tenant_id = ?` clause.
- Avoid passing raw unfiltered IDs from query parameters into `.delete()`, `.update()`, or `.select()` calls.

---

## 2. Payment Gateways (Stripe, MercadoPago)

- **Amount & Currency Tampering**: Never trust client-supplied prices, totals, or currencies. Prices must be retrieved directly from database product tables or pre-configured Stripe Price IDs.
- **Negative & Zero Values**: Validate that item quantities and amounts are strictly positive integers (`> 0`).
- **Webhook State Reconciliation**: Fulfill orders only upon receiving and cryptographically verifying the provider's signed webhook; never mark orders paid based on client redirect URLs.
- **Race Conditions**: In payment callbacks and balance adjustments, use database transactions with row-level locks (`SELECT ... FOR UPDATE`) or atomic balance increments to prevent double-spending.

---

## 3. Cloudflare Workers & Cloud Bindings

- **Service Bindings & RPC**: Verify Worker RPC methods validate the caller context. Do not expose internal methods that perform unauthenticated mutations.
- **D1 Database Batching**: Ensure transactions running via `db.batch([...])` maintain atomicity; verify rollback behavior on failure.
- **KV & R2 Storage**: Verify presigned URL generation enforces expiration times (<15 minutes) and restricts HTTP verbs. Ensure public bucket read access is disabled unless intentional.

---

## 4. Supply Chain & CI/CD Security

- **Pinned Dependencies**: Verify `package.json`, `Cargo.toml`, and `pyproject.toml` use exact or restricted versions; avoid wildcards (`*`) or unconstrained ranges.
- **Lockfile Integrity**: Assert lockfiles (`pnpm-lock.yaml`, `Cargo.lock`) are checked into git and verified with frozen lockfile checks (`pnpm install --frozen-lockfile`) in CI.
- **Secrets Management**: Check that no `.env` files, production credentials, or private keys are tracked in git. Audit `.gitignore` patterns.
