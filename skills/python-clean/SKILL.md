---
name: python-clean
description: Modern Python clean code standards, uv environment management, Ruff linting/formatting, Pyright strict type checking, guard clauses (no nested ifs), Pydantic v2 boundaries, zero barrel files (__init__.py re-exports), and hard 200-line limit per file. TRIGGER when writing or modifying Python files (*.py), pyproject.toml, or designing Python services and APIs.
---

# Python Clean Code Standards (Python 3.12+ / uv / Ruff)

Guidelines for writing safe, performant, and maintainable Python code with flat control flow, strict static typing, and decoupled domain architectures.

---

## 1. Golden Rules (Non-negotiable)

1. **Zero Nested `if` Statements — Guard Clauses & Early Returns**:
   - Never nest `if` conditions ("Pyramid of Doom").
   - Validate preconditions, permissions, and edge cases at the top of the function and return or raise immediately.
   - The primary happy path must remain flat and unindented.

2. **Strict Static Typing Everywhere (Zero `Any`)**:
   - Type all function parameters, return types, and class attributes.
   - Use modern union syntax (`str | None`, never `Optional[str]` or `Union`).
   - Use PEP 695 generics (`def first[T](items: list[T]) -> T | None:`).
   - Use `typing.Protocol` for structural typing and dependency inversion instead of heavy abstract base classes.

3. **Strict Boundaries with Pydantic v2**:
   - Never pass loose dictionaries (`dict[str, Any]`) across application layers.
   - Validate external inputs (APIs, CLI arguments, environment configs) using frozen Pydantic models (`ConfigDict(frozen=True)`).

4. **Zero Barrel Files (`__init__.py` Re-exports)**:
   - `__init__.py` files must remain empty or contain only module docstrings.
   - Do not re-export functions or classes via `__all__` or `from .module import *`.
   - Always use explicit, absolute imports from the project package root.

5. **Single Responsibility & 200-Line Limit**:
   - Every file must do exactly one thing. Isolate business actions into single-purpose modules (`app/actions/<domain>/<action>.py`).
   - Strictly adhere to the <200 lines limit per file. Split helpers into atomic modules.

6. **Friendly & Persuasive User Copy**:
   - Error messages, validations, and logs intended for users must be empathetic, clear, and solution-focused.

---

## 2. Guard Clauses vs Nested Ifs

```python
# ❌ FORBIDDEN: Deeply nested if statements
def activate_subscription(customer_id: str | None, plan: Plan | None) -> Invoice:
    if customer_id is not None:
        if plan is not None:
            if plan.is_active:
                return execute_activation(customer_id, plan)
    raise ValueError("Invalid parameters")

# ✅ CLEAN: Guard clauses with early returns and clear errors
def activate_subscription(customer_id: str | None, plan: Plan | None) -> Invoice:
    if customer_id is None or not customer_id.strip():
        raise AppError(
            message="El identificador de cliente es requerido para continuar.",
            status_code=400,
        )

    if plan is None or not plan.is_active:
        raise AppError(
            message="El plan seleccionado no está disponible actualmente. ¿Deseas elegir otro?",
            status_code=422,
        )

    return execute_activation(customer_id, plan)
```

---

## 3. Atomic Action Blueprint

```python
from dataclasses import dataclass
from app.domains.billing.models import Invoice, SubscriptionPlan
from app.errors.app_error import AppError
from app.types.response import ActionResponse

@dataclass(frozen=True, slots=True)
class ChargeSubscriptionInput:
    customer_id: str
    plan_id: str
    amount_cents: int

def charge_subscription_action(
    input_data: ChargeSubscriptionInput,
    payment_gateway: PaymentGatewayProtocol,
) -> ActionResponse[Invoice]:
    if not input_data.customer_id.strip():
        raise AppError(
            message="El cliente es requerido para procesar el pago.",
            status_code=400,
        )

    if input_data.amount_cents <= 0:
        raise AppError(
            message="El monto de la suscripción debe ser superior a cero.",
            status_code=422,
        )

    invoice = payment_gateway.charge(input_data.customer_id, input_data.amount_cents)
    return ActionResponse(success=True, data=invoice)
```

---

## 4. Sibling Skills & References

- **`best-practices`**: Universal clean architecture rules.
- **`ux-writing`**: Persuasive and courteous microcopy guidelines.
- Tooling setup & Pydantic templates: `references/python-tooling-and-types.md`.
