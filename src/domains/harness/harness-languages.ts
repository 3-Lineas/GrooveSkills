import type { ProjectLanguage } from "@/types/harness.types";

export interface LanguageDefinition {
  code: ProjectLanguage;
  name: string;
  nativeName: string;
  instruction: string;
}

export const SUPPORTED_LANGUAGES: Record<ProjectLanguage, LanguageDefinition> = {
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    instruction: "Todos los mensajes, validaciones, errores, CTAs y comunicaciones con el usuario deben redactarse estrictamente en Español. El tono debe ser empático, amable, persuasivo y profesional.",
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    instruction: "All user-facing messages, form validations, errors, CTAs, and notifications must be written strictly in English. Tone must be empathetic, friendly, persuasive, and professional.",
  },
  pt: {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    instruction: "Todas as mensagens, validações, erros, CTAs e comunicações voltadas para o usuário devem ser redigidas estritamente em Português. O tom deve ser empático, amigável, persuasivo e profissional.",
  },
  it: {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    instruction: "Tutti i messaggi, le convalide, gli errori, i pulsanti/CTA e le comunicazioni rivolte all'utente devono essere scritti rigorosamente in Italiano. Il tono deve essere empatico, cordiale, persuasivo e professionale.",
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    instruction: "Tous les messages, validations, erreurs, boutons d'appel à l'action (CTA) et notifications destinés à l'utilisateur doivent être rédigés strictement en Français. Le ton doit être empathique, courtois, persuasif et professionnel.",
  },
};
