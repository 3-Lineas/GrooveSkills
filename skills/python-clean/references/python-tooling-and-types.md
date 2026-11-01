# Python Tooling & Architecture Reference

## 1. Modern Tooling Baseline (`pyproject.toml`)

Modern Python projects standardize on **uv**, **Ruff**, and **Pyright**:

```toml
[project]
name = "my-service"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "pydantic>=2.7.0",
]

[tool.ruff]
line-length = 88
target-version = "py312"

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "F",   # pyflakes
    "I",   # isort imports
    "UP",  # pyupgrade modern syntax
    "B",   # bugbear
    "SIM", # simplify (detects nested ifs & unnecessary else)
    "RET", # return early checks
]

[tool.pyright]
typeCheckingMode = "strict"
reportMissingTypeStubs = false
pythonVersion = "3.12"
```

---

## 2. Structured AppError & Response Pattern

```python
from dataclasses import dataclass

class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400, code: str = "BAD_REQUEST") -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code

@dataclass(frozen=True, slots=True)
class ActionResponse[T]:
    success: bool
    data: T | None = None
    error: str | None = None
```

---

## 3. Directory Layout (No `__init__.py` Barrels)

```text
src/
└── app/
    ├── errors/
    │   └── app_error.py
    ├── actions/
    │   └── billing/
    │       ├── charge_subscription.py # One action per file (<100 lines)
    │       └── cancel_subscription.py
    ├── domains/
    │   └── billing/
    │       ├── models.py              # Pure frozen dataclasses
    │       └── tax_calculator.py      # Pure function
    └── infrastructure/
        └── stripe/
            └── client.py
```
