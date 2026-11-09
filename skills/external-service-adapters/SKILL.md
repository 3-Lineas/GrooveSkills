---
name: external-service-adapters
description: Standardized wrapper & adapter architecture for external third-party services (payment gateways, transactional email, SMS, storage, AI providers). Enforces pure domain ports, isolated vendor SDK wrappers, unified input/output contracts, and interchangeable adapters. TRIGGER when integrating or refactoring any external API, payment provider (Stripe, MercadoPago), email service (Resend, SES, SMTP, Cloudflare), webhook, or cloud provider.
---

# External Service Adapters & Wrappers

Architectural pattern for standardizing third-party integrations (payments, emails, SMS, cloud storage, AI models) using the **Adapter Pattern** and **SDK Wrappers** to prevent vendor lock-in and keep business actions decoupled.

---

## 1. Architectural Distinction: Wrapper vs. Adapter

| Component | Responsibility | Location | Dependencies |
| :--- | :--- | :--- | :--- |
| **Domain Port (Interface)** | Defines the contract needed by our business domain (pure domain types). | `src/types/<domain>/` | Zero external SDKs |
| **Vendor Wrapper (Client)** | Encapsulates vendor SDK initialization, raw authentication, and direct API calls. | `src/infrastructure/wrappers/<vendor>/` | Vendor SDK / HTTP client |
| **Service Adapter** | Implements the Domain Port by calling the Vendor Wrapper and translating inputs/outputs. | `src/infrastructure/adapters/` | Port + Vendor Wrapper |
| **Business Action** | Executes use case logic depending ONLY on the Domain Port. | `src/actions/<domain>/` | Domain Port only |

---

## 2. The 4 Non-Negotiable Rules

1. **Actions Depend on Ports, Never Vendors**:
   - Business actions must type-hint the domain port interface (`EmailSenderPort`, `PaymentGatewayPort`), never `Stripe`, `Resend`, or `aws-sdk`.
2. **Standardized Domain Contracts**:
   - Input payloads and return values must use application domain types (e.g., `SendEmailPayload`, `SendEmailOutput`, `PaymentChargeResult`).
   - Third-party SDK response shapes must never leak into actions or domain modules.
3. **Isolate SDK Quirks in Wrappers**:
   - HTTP errors, retries, header formatting, and API keys stay inside the vendor wrapper.
   - Exceptions are converted into standardized application errors (`AppError`) or `ActionResponse` failures.
4. **Interchangeability via Factory or Dependency Injection**:
   - Swapping from `Resend` to `AWS SES` or `SMTP` requires only injecting a different adapter without altering a single line of business logic.

---

## 3. Directory Layout

```text
src/
├── actions/
│   └── billing/
│       └── process-payment.action.ts       # Consumes PaymentGateway port (<80 lines)
├── types/
│   ├── billing/
│   │   ├── payment-gateway-port.type.ts    # Domain interface contract (<40 lines)
│   │   ├── charge-input.type.ts            # ChargeInput (<30 lines)
│   │   └── charge-result.type.ts           # ChargeResult (<30 lines)
│   └── email/
│       ├── email-sender-port.type.ts       # Domain interface contract (<40 lines)
│       ├── send-email-payload.type.ts      # SendEmailPayload (<30 lines)
│       └── send-email-output.type.ts       # SendEmailOutput (<30 lines)
└── infrastructure/
    ├── adapters/
    │   ├── email/
    │   │   ├── resend-email.adapter.ts     # Implements EmailSenderPort (<80 lines)
    │   │   ├── ses-email.adapter.ts        # Implements EmailSenderPort (<80 lines)
    │   │   └── smtp-email.adapter.ts       # Implements EmailSenderPort (<80 lines)
    │   └── payment/
    │       ├── stripe-payment.adapter.ts   # Implements PaymentGatewayPort (<90 lines)
    │       └── mercadopago-payment.adapter.ts # Implements PaymentGatewayPort (<90 lines)
    └── wrappers/
        ├── aws/
        │   └── ses-client.wrapper.ts       # Raw AWS SES client wrapper (<70 lines)
        ├── resend/
        │   └── resend-client.wrapper.ts    # Raw Resend SDK wrapper (<60 lines)
        └── stripe/
            └── stripe-client.wrapper.ts    # Raw Stripe SDK wrapper (<60 lines)
```

---

## 4. Implementation Blueprint (Email Example)

### Step 1: Pure Domain Port (`src/types/email/email-sender-port.type.ts`)
```ts
// src/types/email/email-sender-port.type.ts
import type { SendEmailPayload } from "@/types/email/send-email-payload.type";
import type { SendEmailOutput } from "@/types/email/send-email-output.type";

export interface EmailSenderPort {
  sendEmail(payload: SendEmailPayload): Promise<SendEmailOutput>;
}
```

### Step 2: Vendor Wrapper (`src/infrastructure/wrappers/resend/resend.wrapper.ts`)
```ts
import { Resend } from "resend";

export class ResendWrapper {
  private readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(params: { from: string; to: string[]; subject: string; html: string }) {
    return this.client.emails.send(params);
  }
}
```

### Step 3: Domain Adapter (`src/infrastructure/adapters/email/resend-email.adapter.ts`)
```ts
import type { EmailSenderPort } from "@/types/email/email-sender-port.type";
import type { SendEmailPayload } from "@/types/email/send-email-payload.type";
import type { SendEmailOutput } from "@/types/email/send-email-output.type";
import type { ResendWrapper } from "@/infrastructure/wrappers/resend/resend.wrapper";
import { AppError } from "@/errors/app-error";

export class ResendEmailAdapter implements EmailSenderPort {
  constructor(
    private readonly wrapper: ResendWrapper,
    private readonly defaultFrom: string
  ) {}

  async sendEmail(payload: SendEmailPayload): Promise<SendEmailOutput> {
    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
    const { data, error } = await this.wrapper.send({
      from: payload.from ?? this.defaultFrom,
      to: recipients,
      subject: payload.subject,
      html: payload.htmlContent,
    });

    if (error || !data) {
      throw new AppError({
        message: `Error al enviar correo vía Resend: ${error?.message ?? "desconocido"}`,
        statusCode: 502,
      });
    }

    return { id: data.id, delivered: true, timestamp: new Date() };
  }
}
```

---

## 5. Reference Guides
- Detailed concrete implementations for **Email** (SMTP, Resend, AWS SES, Cloudflare Email) and **Payment Gateways** (Stripe, MercadoPago) can be found in `references/email-and-payment-examples.md`.
