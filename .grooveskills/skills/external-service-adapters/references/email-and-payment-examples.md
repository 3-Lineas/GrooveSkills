# Implementation Reference: Email & Payment Adapters

Reference implementations illustrating the Wrapper + Adapter pattern across email providers and payment gateways with strict typing and guard clauses.

---

## 1. Transactional Email System

### 1.1 Pure Domain Port (`src/domains/email/email-sender.port.ts`)
```ts
export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailInput {
  to: EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  from?: EmailRecipient;
  replyTo?: string;
}

export interface SendEmailResult {
  messageId: string;
  provider: "smtp" | "resend" | "aws-ses" | "cloudflare";
  sentAt: Date;
}

export interface EmailSenderPort {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
```

### 1.2 SMTP Adapter (`nodemailer`)
```ts
// src/infrastructure/adapters/email/smtp-email.adapter.ts
import type { EmailSenderPort, SendEmailInput, SendEmailResult } from "@/domains/email/email-sender.port";
import type { SmtpWrapper } from "@/infrastructure/wrappers/smtp/smtp.wrapper";
import { AppError } from "@/errors/app-error";

export class SmtpEmailAdapter implements EmailSenderPort {
  constructor(private wrapper: SmtpWrapper, private defaultSender: string) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    try {
      const from = input.from ? `${input.from.name ?? ""} <${input.from.email}>`.trim() : this.defaultSender;
      const info = await this.wrapper.sendMail({
        from,
        to: input.to.map((r) => r.email).join(", "),
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      return { messageId: info.messageId, provider: "smtp", sentAt: new Date() };
    } catch (err) {
      throw new AppError({ message: "Fallo al enviar correo SMTP.", statusCode: 502, cause: err });
    }
  }
}
```

### 1.3 AWS SES Adapter (`@aws-sdk/client-ses`)
```ts
// src/infrastructure/adapters/email/ses-email.adapter.ts
import type { EmailSenderPort, SendEmailInput, SendEmailResult } from "@/domains/email/email-sender.port";
import type { SesWrapper } from "@/infrastructure/wrappers/aws/ses.wrapper";
import { AppError } from "@/errors/app-error";

export class SesEmailAdapter implements EmailSenderPort {
  constructor(private wrapper: SesWrapper, private defaultSource: string) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const res = await this.wrapper.send({
      Source: input.from?.email ?? this.defaultSource,
      Destination: { ToAddresses: input.to.map((t) => t.email) },
      Message: {
        Subject: { Data: input.subject, Charset: "UTF-8" },
        Body: { Html: { Data: input.html, Charset: "UTF-8" } },
      },
    });

    if (!res.MessageId) {
      throw new AppError({ message: "Fallo al enviar correo con AWS SES.", statusCode: 502 });
    }
    return { messageId: res.MessageId, provider: "aws-ses", sentAt: new Date() };
  }
}
```

### 1.4 Cloudflare Email Routing Adapter
```ts
// src/infrastructure/adapters/email/cloudflare-email.adapter.ts
import type { EmailSenderPort, SendEmailInput, SendEmailResult } from "@/domains/email/email-sender.port";
import type { CloudflareEmailWrapper } from "@/infrastructure/wrappers/cloudflare/cloudflare-email.wrapper";
import { AppError } from "@/errors/app-error";

export class CloudflareEmailAdapter implements EmailSenderPort {
  constructor(private wrapper: CloudflareEmailWrapper, private defaultSender: string) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const res = await this.wrapper.postEmail({
      from: input.from?.email ?? this.defaultSender,
      to: input.to.map((t) => t.email),
      subject: input.subject,
      content: input.html,
    });
    if (!res.ok) {
      throw new AppError({ message: "Error al enviar correo con Cloudflare Email.", statusCode: 502 });
    }
    const data = await res.json() as { result?: { id?: string } };
    return { messageId: data.result?.id ?? `cf_${Date.now()}`, provider: "cloudflare", sentAt: new Date() };
  }
}
```

---

## 2. Payment Gateways (Stripe & MercadoPago)

### 2.1 Domain Port (`src/domains/billing/payment-gateway.port.ts`)
```ts
export interface ChargeInput {
  amountInCents: number;
  currency: "usd" | "clp" | "mxn" | "eur";
  customerId: string;
  sourceToken?: string;
  idempotencyKey: string;
}

export interface ChargeResult {
  transactionId: string;
  status: "succeeded" | "pending" | "failed";
  provider: "stripe" | "mercadopago";
}

export interface PaymentGatewayPort {
  createCharge(input: ChargeInput): Promise<ChargeResult>;
}
```

### 2.2 Stripe & MercadoPago Adapters
```ts
// src/infrastructure/adapters/payment/stripe-payment.adapter.ts
import type { PaymentGatewayPort, ChargeInput, ChargeResult } from "@/domains/billing/payment-gateway.port";
import type Stripe from "stripe";
import { AppError } from "@/errors/app-error";

export class StripePaymentAdapter implements PaymentGatewayPort {
  constructor(private stripe: Stripe) {}

  async createCharge(input: ChargeInput): Promise<ChargeResult> {
    try {
      const intent = await this.stripe.paymentIntents.create(
        { amount: input.amountInCents, currency: input.currency, customer: input.customerId, confirm: true },
        { idempotencyKey: input.idempotencyKey }
      );
      return {
        transactionId: intent.id,
        status: intent.status === "succeeded" ? "succeeded" : "pending",
        provider: "stripe",
      };
    } catch (err) {
      throw new AppError({ message: "Fallo en Stripe.", statusCode: 402, cause: err });
    }
  }
}
```
```ts
// src/infrastructure/adapters/payment/mercadopago-payment.adapter.ts
import type { PaymentGatewayPort, ChargeInput, ChargeResult } from "@/domains/billing/payment-gateway.port";
import { Payment, type MercadoPagoConfig } from "mercadopago";
import { AppError } from "@/errors/app-error";

export class MercadoPagoPaymentAdapter implements PaymentGatewayPort {
  private client: Payment;
  constructor(cfg: MercadoPagoConfig) {
    this.client = new Payment(cfg);
  }

  async createCharge(input: ChargeInput): Promise<ChargeResult> {
    try {
      const res = await this.client.create({
        body: { transaction_amount: input.amountInCents / 100, token: input.sourceToken, payer: { id: input.customerId } },
        requestOptions: { idempotencyKey: input.idempotencyKey },
      });
      return {
        transactionId: String(res.id),
        status: res.status === "approved" ? "succeeded" : "pending",
        provider: "mercadopago",
      };
    } catch (err) {
      throw new AppError({ message: "Fallo en MercadoPago.", statusCode: 402, cause: err });
    }
  }
}
```
