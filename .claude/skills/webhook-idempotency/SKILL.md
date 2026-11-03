---
name: webhook-idempotency
description: Standardized architectural pattern for incoming webhook verification and idempotency guards. Decouples vendor cryptographic signature checks (Stripe, MercadoPago, Svix, GitHub) into isolated adapters, and guarantees single execution via an IdempotencyGuard wrapper backed by persistent storage. TRIGGER when building webhook endpoints, handling payment callbacks, verifying HMAC signatures, or ensuring at-most-once processing.
---

# Webhook Verifiers & Idempotency Guards — Skill Reference

Canonical skill specification stored in `.grooveskills/`.

- **Specification**: [`.grooveskills/skills/webhook-idempotency/SKILL.md`](../../../.grooveskills/skills/webhook-idempotency/SKILL.md)
- **References & Templates**: `.grooveskills/skills/webhook-idempotency/`

> **Instruction**: Read `.grooveskills/skills/webhook-idempotency/SKILL.md` before executing tasks matching this skill.
