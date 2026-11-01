---
name: ux-writing
description: Opinionated user-facing microcopy standards (error messages, form validation, button CTAs, empty states, toasts, notifications, and tooltips). Bilingual adaptive (Spanish priority, English fallback), empathetic, solution-oriented, persuasive, and professional. TRIGGER when authoring or reviewing user-visible messages, form field errors, confirmation dialogs, toasts, or landing/CTA copy.
---

# UX Writing & Microcopy Standards

Guidelines for crafting persuasive, polite, empathetic, and solution-oriented microcopy for web and mobile interfaces.

---

## 1. Golden Rules (Non-negotiable)

1. **Solution-Oriented Feedback (Never Dead-End the User)**:
   - Never say just "Error" or "Invalid format". State clearly what happened and provide the exact next step to resolve it.
   - ❌ *"Error 500: Failed request"*
   - ✅ *"No pudimos guardar tus cambios. Por favor, revisa tu conexión e inténtalo de nuevo."*

2. **Adaptive Bilingual First (Spanish Priority, Fluent English)**:
   - Support Spanish (neutral Latin American / modern Spanish) and English natively.
   - When default locale is Spanish: use warm, respectful tone (tuteo profesional: "tu cuenta", "introduce tu contraseña").
   - When default locale is English: crisp, engaging, modern SaaS voice.
   - Keep terminology consistent across locales. See `references/copy-patterns-es-en.md`.

3. **Active, Benefit-Driven CTAs (Call To Action)**:
   - Button labels must start with an action verb reflecting the outcome, not the mechanism.
   - ❌ *"Enviar"* / *"Submit"*
   - ✅ *"Crear mi cuenta gratis"* / *"Create free account"*, *"Guardar cambios"* / *"Save changes"*

4. **Persuasive and Empathetic Tone**:
   - Acknowledge effort and eliminate friction.
   - Celebrate milestones and progress (e.g. *"¡Todo listo! Tu perfil ya está actualizado"*).
   - Never blame the user (avoid *"Cometiste un error"* or *"You did not provide"*).

5. **Clarity Over Cleverness**:
   - Avoid technical jargon, system stack traces, HTTP codes, or database column names in user-facing UI.
   - Keep messages under 2 short sentences whenever possible.

6. **Predictable Placement & Semantics**:
   - Inline form errors: specific to the input field, positioned right under it.
   - Toast notifications: brief confirmations or non-blocking warnings.
   - Dialogs / Modals: critical actions requiring explicit confirmation with clear consequences.

---

## 2. Microcopy Decision Matrix

| Context | Tone | ❌ Avoid | ✅ Recommended (ES / EN) |
| :--- | :--- | :--- | :--- |
| **Required Field** | Direct, polite | *"Campo obligatorio"* | *"Ingresa tu correo para continuar"* / *"Enter your email to continue"* |
| **Invalid Format** | Instructive | *"Email incorrecto"* | *"Usa un formato como nombre@ejemplo.com"* / *"Use a format like name@example.com"* |
| **Password Weak** | Actionable guide | *"Clave insegura"* | *"Usa al menos 8 caracteres con números y letras"* / *"Use at least 8 characters with letters and numbers"* |
| **Server Timeout** | Empathetic retry | *"Error de red 504"* | *"El servidor tardó en responder. Reintenta en unos segundos."* / *"Server took too long. Please retry in a few seconds."* |
| **Delete Confirm** | Clear impact | *"¿Seguro?"* | *"¿Eliminar este proyecto? Esta acción no se puede deshacer."* / *"Delete this project? This action cannot be undone."* |
| **Empty State** | Inspiring action | *"No hay datos"* | *"Aún no tienes tareas creadas. ¡Comienza agregando la primera!"* / *"No tasks created yet. Start by adding your first one!"* |
| **Success Toast** | Encouraging | *"Operación exitosa"* | *"¡Cambios guardados con éxito!"* / *"Changes saved successfully!"* |

---

## 3. Form Validation Copy Pattern (Valibot Integration)

```ts
import * as v from "valibot";

export const signupSchema = v.object({
  fullName: v.pipe(
    v.string("Ingresa tu nombre completo."),
    v.minLength(2, "Tu nombre debe tener al menos 2 caracteres.")
  ),
  email: v.pipe(
    v.string("Ingresa tu correo electrónico."),
    v.email("Por favor, ingresa un correo válido (ejemplo: tú@empresa.com).")
  ),
  password: v.pipe(
    v.string("Crea una contraseña segura."),
    v.minLength(8, "Tu contraseña debe tener al menos 8 caracteres.")
  ),
});
```

---

## 4. Toast Notification Pattern (Sonner & Actions)

```tsx
import { toast } from "sonner";

toast.promise(saveUserData(payload), {
  loading: "Guardando tu información...",
  success: "¡Listo! Tu información ha sido actualizada.",
  error: (err: unknown) =>
    err instanceof Error ? err.message : "No pudimos guardar los cambios. Inténtalo de nuevo.",
});
```

---

## 5. Sibling Skills

- **`best-practices`**: Universal clean code standards and strict typing.
- **`valibot-validation`**: Schema-level validation and error messages.
- **`error-handling-logging`**: Backend error mapping to user-safe error responses.
- Reference guide: `references/copy-patterns-es-en.md`.
