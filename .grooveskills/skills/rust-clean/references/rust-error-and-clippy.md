# Rust Error Handling & Clippy Reference

## 1. Domain Error Pattern with `thiserror`

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Validación: {message}")]
    Validation { message: String },

    #[error("No encontrado: {resource} con id {id}")]
    NotFound { resource: &'static str, id: String },

    #[error("Error de pasarela de pago: {0}")]
    PaymentGateway(String),

    #[error("Error de base de datos")]
    Database(#[from] sqlx::Error),
}

impl AppError {
    pub fn validation(msg: impl Into<String>) -> Self {
        Self::Validation { message: msg.into() }
    }

    pub fn not_found(resource: &'static str, id: impl Into<String>) -> Self {
        Self::NotFound { resource, id: id.into() }
    }

    /// User-friendly message for UI responses
    pub fn user_message(&self) -> String {
        match self {
            Self::Validation { message } => message.clone(),
            Self::NotFound { resource, .. } => {
                format!("No pudimos encontrar el recurso solicitado ({resource}).")
            }
            Self::PaymentGateway(_) => {
                "Hubo un inconveniente al procesar tu pago. Por favor, verifica tus datos.".into()
            }
            Self::Database(_) => {
                "Ocurrió un error inesperado al guardar la información. Intenta de nuevo en unos momentos.".into()
            }
        }
    }
}
```

---

## 2. Clippy & Linter Baseline (`Cargo.toml`)

Modern Rust codebases configure compiler warnings and Clippy directly in `Cargo.toml`:

```toml
[lints.rust]
unsafe_code = "deny"
missing_debug_implementations = "warn"

[lints.clippy]
all = "warn"
pedantic = "warn"
unwrap_used = "deny"
expect_used = "warn"
panic = "deny"
manual_let_else = "warn"
needless_pass_by_value = "warn"
```

---

## 3. Directory Layout (No `mod.rs` Barrels)

```text
src/
├── main.rs (or lib.rs)
├── errors.rs                     # AppError definition
├── actions/
│   ├── billing/
│   │   ├── charge_subscription.rs # One action per file
│   │   └── cancel_subscription.rs
│   └── billing.rs                # Module entry (no mod.rs)
├── domains/
│   ├── billing/
│   │   └── models.rs             # Invoices, plans, pure structs
│   └── billing.rs
└── infrastructure/
    ├── stripe/
    │   └── client.rs
    └── stripe.rs
```
