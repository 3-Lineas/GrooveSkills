# Implementation Reference: Python Workers RPC & Precision Math

Complete helpers and handlers for high-precision arithmetic, JS proxy conversion, and timezone calculations on Cloudflare Workers.

---

## 1. Pure Decimal Arithmetic Actions (1 Function per File)

```python
# src/actions/finance/to_decimal.py
from decimal import Decimal

def to_decimal(val) -> Decimal:
    return Decimal(str(val))
```

```python
# src/actions/finance/round_currency.py
from decimal import Decimal, ROUND_HALF_UP

def round_currency(amount: Decimal, decimals: int = 2) -> Decimal:
    exponent = Decimal("10") ** -decimals
    return amount.quantize(exponent, rounding=ROUND_HALF_UP)
```

```python
# src/actions/finance/compute_item_total.py
from decimal import Decimal
from actions.finance.round_currency import round_currency

def compute_item_total(unit_price: Decimal, quantity: int, discount_pct: Decimal = Decimal(0)) -> Decimal:
    subtotal = unit_price * quantity
    discount = subtotal * (discount_pct / Decimal(100))
    return round_currency(subtotal - discount)
```

```python
# src/actions/finance/compute_tax.py
from decimal import Decimal
from actions.finance.round_currency import round_currency

def compute_tax(amount: Decimal, tax_rate_pct: Decimal) -> Decimal:
    return round_currency(amount * (tax_rate_pct / Decimal(100)))
```

---

## 2. Safe Pyodide JS Proxy Handler (`src/actions/finance/calculate_totals.py`)

```python
import json
from decimal import Decimal
from typing import Any
from actions.finance.to_decimal import to_decimal
from actions.finance.compute_item_total import compute_item_total
from actions.finance.compute_tax import compute_tax
from actions.finance.round_currency import round_currency

try:
    from js import JSON  # type: ignore
except ImportError:
    JSON = None

def handle_calculate_totals(raw_data: Any) -> Any:
    # Safely convert Pyodide JS Proxy or dict
    if hasattr(raw_data, "to_py"):
        data = raw_data.to_py()
    elif isinstance(raw_data, dict):
        data = raw_data
    elif JSON is not None:
        data = json.loads(JSON.stringify(raw_data))
    else:
        data = dict(raw_data)

    items = data.get("items", [])
    tax_rate = to_decimal(data.get("taxRatePct", 0))
    subtotal = Decimal("0")
    processed_items = []

    for item in items:
        unit_price = to_decimal(item.get("unitPrice", 0))
        quantity = int(item.get("quantity", 1))
        discount_pct = to_decimal(item.get("discountPct", 0))
        item_total = compute_item_total(unit_price, quantity, discount_pct)
        subtotal += item_total
        processed_items.append({"id": item.get("id"), "itemTotal": str(item_total)})

    tax = compute_tax(subtotal, tax_rate)
    total = round_currency(subtotal + tax)

    result = {
        "items": processed_items,
        "subtotal": str(subtotal),
        "tax": str(tax),
        "total": str(total),
    }

    if JSON is not None:
        return JSON.parse(json.dumps(result))
    return result
```

---

## 3. Wrangler Service Binding Configuration

```jsonc
// apps/backend/wrangler.jsonc
{
  "name": "my-backend",
  "services": [
    {
      "binding": "CALCULATOR",
      "service": "my-py-worker",
      "entrypoint": "CalculatorRpcService"
    }
  ]
}
```
