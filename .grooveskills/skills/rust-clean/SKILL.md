---
name: rust-clean
description: Modern Rust clean code standards, let-else guard clauses, no nested ifs/matches, explicit typed error handling with thiserror, Clippy strictness, zero unwrap in production, Newtype pattern, zero barrel files (mod.rs), and hard 200-line limit per file. TRIGGER when writing or modifying Rust files (*.rs), Cargo.toml, or designing Rust domain modules and traits.
---

# Rust Clean Code Standards (Rust 2024 / 1.80+)

Engineering guidelines for writing idiomatic, highly performant, and maintainable Rust code with flat control flow, strict error boundaries, and zero runtime panics.

---

## 1. Golden Rules (Non-negotiable)

1. **Zero Nested `if` / `match` — Guard Clauses with `let-else`**:
   - Never nest `if let` or deep `match` pyramids.
   - Use `let-else` statements at function entry points to bind irrefutable patterns and exit immediately via divergence (`return`, `break`).
   - The primary happy path must always stay flat and left-aligned.

2. **Zero `.unwrap()` or `.expect()` in Production Code**:
   - Production logic must never panic on dynamic runtime data.
   - Propagate errors explicitly with the `?` operator or handle `None`/`Err` via `let-else`.

3. **Explicit Domain Errors with `thiserror`**:
   - Model all domain and infrastructure failures as strongly typed enums derived with `thiserror::Error`.
   - Distinguish technical context for logging (`tracing`) from courteous, solution-oriented error messages presented to end users.

4. **Make Illegal States Unrepresentable (Newtypes & ADTs)**:
   - Use the **Newtype pattern** (`pub struct UserId(pub String);`) to prevent passing arbitrary primitives interchangeably.
   - Replace boolean flag combinations with algebraic state enums.

5. **Zero Barrel Files (`mod.rs`) & Explicit Absolute Imports (`crate::...`)**:
   - Do not use old-style `mod.rs` files filled with wildcard re-exports (`pub use something::*`).
   - Use the modern file hierarchy (`domain.rs` and `domain/module.rs`).
   - Always import symbols directly from `crate::...` path roots. Avoid deep relative paths (`super::super::`).

6. **Isolated Actions & 200-Line Limit**:
   - Isolate each business use case into its own atomic action file (`src/actions/<domain>/<action>.rs`).
   - Keep all source files strictly under 200 lines. Split large modules into atomic domain helpers.

7. **Zero Allocation Waste**:
   - Prefer borrowed views (`&str`, `&[T]`) over cloning (`.clone()`) unless transfer of ownership is explicitly required.

---

## 2. Canonical Guard Clause Pattern (`let-else`)

```rust
// ❌ FORBIDDEN: Nested match / if-let pyramid
pub fn process_order(order: Option<OrderInput>) -> Result<Order, AppError> {
    if let Some(input) = order {
        if input.is_valid() {
            if input.items.len() > 0 {
                return Ok(execute(input));
            }
        }
    }
    Err(AppError::bad_request("Invalid order payload"))
}

// ✅ CLEAN: Flat guard clauses with let-else
pub fn process_order(order: Option<OrderInput>) -> Result<Order, AppError> {
    let Some(input) = order else {
        return Err(AppError::validation(
            "Por favor, ingresa los datos de tu orden para continuar.",
        ));
    };

    if !input.is_valid() || input.items.is_empty() {
        return Err(AppError::validation(
            "Tu orden debe contener al menos un producto válido.",
        ));
    }

    Ok(execute(input))
}
```

---

## 3. Atomic Action Blueprint

```rust
use crate::domains::billing::models::{Customer, Invoice};
use crate::errors::AppError;

pub struct ChargeSubscriptionInput {
    pub customer_id: String,
    pub plan_id: String,
    pub amount_cents: u64,
}

pub fn charge_subscription_action(
    input: &ChargeSubscriptionInput,
    payment_client: &impl PaymentGateway,
) -> Result<Invoice, AppError> {
    if input.customer_id.trim().is_empty() {
        return Err(AppError::validation(
            "El identificador de cliente es obligatorio.",
        ));
    }

    if input.amount_cents == 0 {
        return Err(AppError::validation(
            "El monto de suscripción debe ser superior a cero.",
        ));
    }

    let receipt = payment_client.process_charge(&input.customer_id, input.amount_cents)?;
    Ok(Invoice::from_receipt(receipt))
}
```

---

## 4. Sibling Skills & References

- **`best-practices`**: Universal clean code principles.
- **`ux-writing`**: Guidelines for friendly, persuasive user copy.
- Detailed config and error templates: `references/rust-error-and-clippy.md`.
