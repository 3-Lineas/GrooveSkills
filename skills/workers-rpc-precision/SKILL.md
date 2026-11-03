---
name: workers-rpc-precision
description: Cloudflare Workers Native RPC (WorkerEntrypoint & Service<T>) and high-precision financial/date calculation standards in Python or TypeScript. TRIGGER when implementing Cloudflare Service Bindings, Workers RPC, decimal financial math (taxes, discounts, totals), billing cycles with timezones, or apps/py-worker.
---

# Cloudflare Workers RPC & High-Precision Calculations

Architectural standard for zero-overhead, in-memory **Cloudflare Workers RPC** via `WorkerEntrypoint` and `Service<T>`, combined with high-precision financial calculations (`Decimal`) and timezone-aware dates.

---

## 1. Golden Rules (Non-negotiable)

1. **Native Workers RPC (No `fetch()` or Fake HTTP URLs)**:
   - **NEVER** use `fetch()`, fake URLs (`http://calculator-internal`), or HTTP headers to communicate between bound workers.
   - Invoke RPC methods directly: `await env.CALCULATOR.calculate_order_totals(payload);`.

2. **Clean Boundary Separation**:
   - High-precision math and domain calculations live in the specialized worker (`apps/py-worker` or `apps/calculator-worker`).
   - Business orchestration and API routing live in the primary backend (`apps/backend` or `apps/api`).

3. **High-Precision Arithmetic (Zero Floating-Point for Money)**:
   - Never use JavaScript `number` or Python `float` for currency, taxes, discounts, or subtotals.
   - In Python, use `Decimal` from the standard library with explicit quantization (`ROUND_HALF_UP`).
   - Safely extract data from Pyodide JS proxies using `to_py()` or JSON normalization.

4. **Timezone-Aware Date Computations**:
   - Compute billing cycles, deadlines, and fiscal periods using explicit timezones (`zoneinfo.ZoneInfo`) and ISO 8601 formatting.

5. **End-to-End TypeScript RPC Contract**:
   - Define exact RPC parameter and return types in `@/types/services/{service}.type.ts`.
   - Bind `SERVICE_NAME: Service<YourRpcInterface>` in `@/types/context/env.type.ts`.

6. **Caller Action Isolation**:
   - Wrap RPC invocations inside dedicated, atomic Actions (`@/actions/{domain}/{name}.action.ts`).

7. **Hard Size Limit: <200 Lines**:
   - Keep entrypoints, pure arithmetic helpers, and domain handlers under 200 lines (target: 20-80 lines).

---

## 2. Directory Taxonomy

```text
apps/py-worker/ (or specialized worker)
├── wrangler.jsonc                       # flags: ["python_workers"] or Service Bindings
├── requirements.txt                     # Dependencies
└── src/
    ├── entry.py                         # WorkerEntrypoint exposing RPC methods (<60 lines)
    ├── core/
    │   ├── money.py                     # Pure Decimal math & rounding (<50 lines)
    │   └── dates.py                     # Pure timezone & datetime logic (<50 lines)
    └── domains/
        └── finance/
            └── calculate_totals.py      # Domain handler (<70 lines)

apps/backend/src/
├── types/services/
│   └── calculator-service.type.ts       # TypeScript RPC interface (<50 lines)
└── actions/finance/
    └── calculate-totals.action.ts       # Action wrapping RPC call (<40 lines)
```

---

## 3. End-to-End RPC Blueprint

### Python Worker Entrypoint (`src/entry.py`):
```python
from workers import WorkerEntrypoint
from domains.finance.calculate_totals import handle_calculate_totals

class CalculatorRpcService(WorkerEntrypoint):
    async def calculate_order_totals(self, data: dict) -> dict:
        return handle_calculate_totals(data)
```

### TypeScript RPC Contract (`@/types/services/calculator-service.type.ts`):
```ts
export interface OrderItemInput {
  id?: string;
  unitPrice: string | number;
  quantity: number;
  discountPct?: string | number;
}

export interface CalculateTotalsPayload {
  items: OrderItemInput[];
  taxRatePct: string | number;
}

export interface CalculateTotalsResult {
  items: Array<{ id?: string; itemTotal: string }>;
  subtotal: string;
  tax: string;
  total: string;
}

export interface CalculatorRpcService {
  calculate_order_totals(data: CalculateTotalsPayload): Promise<CalculateTotalsResult>;
}
```

### Caller Action in TypeScript (`@/actions/finance/calculate-totals.action.ts`):
```ts
import type { Service } from "@cloudflare/workers-types";
import type {
  CalculatorRpcService,
  CalculateTotalsPayload,
  CalculateTotalsResult,
} from "@/types/services/calculator-service.type";

export interface CalculateTotalsActionInput {
  calculator: Service<CalculatorRpcService>;
  payload: CalculateTotalsPayload;
}

export async function calculateTotalsAction(
  input: CalculateTotalsActionInput
): Promise<CalculateTotalsResult> {
  return await input.calculator.calculate_order_totals(input.payload);
}
```

---

## 4. Deep References

- `./references/python-worker-rpc-examples.md`: Complete implementations of `money.py`, Pyodide proxy conversion, and billing cycle handlers.
