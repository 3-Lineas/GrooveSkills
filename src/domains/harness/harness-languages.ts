import type { ProjectLanguage } from "@/types/harness.types";

export interface LanguageDefinition {
  code: ProjectLanguage;
  name: string;
  nativeName: string;
  instruction: string;
  onboardingPromptTitle: string;
  onboardingPrompt: string;
}

export const SUPPORTED_LANGUAGES: Record<ProjectLanguage, LanguageDefinition> = {
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    instruction: "Todos los mensajes, validaciones, errores, CTAs y comunicaciones con el usuario deben redactarse estrictamente en Español. El tono debe ser empático, amable, persuasivo y profesional.",
    onboardingPromptTitle: "Prompt de inicialización para tu Agente IA (Copia y pega en el chat):",
    onboardingPrompt: "Hola. Acabo de configurar GrooveSkills Harness en este proyecto. Por favor lee `.grooveskills/memory/tasks/00-onboarding.md`, `.grooveskills/memory/context.md` y las skills instaladas en `.agents/skills/`. Hazme preguntas interactivas paso a paso para detectar vacíos de arquitectura, aclarar objetivos y adaptar el proyecto a mis necesidades antes de continuar.",
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    instruction: "All user-facing messages, form validations, errors, CTAs, and notifications must be written strictly in English. Tone must be empathetic, friendly, persuasive, and professional.",
    onboardingPromptTitle: "Initialization prompt for your AI Agent (Copy and paste into your chat):",
    onboardingPrompt: "Hello. I just configured GrooveSkills Harness in this project. Please review `.grooveskills/memory/tasks/00-onboarding.md`, `.grooveskills/memory/context.md`, and the skills installed in `.agents/skills/`. Ask me step-by-step interactive questions to identify architectural gaps, clarify priorities, and adapt the project to my needs before continuing.",
  },
  pt: {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    instruction: "Todas as mensagens, validações, erros, CTAs e comunicações voltadas para o usuário devem ser redigidas estritamente em Português. O tom deve ser empático, amigável, persuasivo e profissional.",
    onboardingPromptTitle: "Prompt de inicialização para o seu Agente de IA (Copie e cole no chat):",
    onboardingPrompt: "Olá. Acabei de configurar o GrooveSkills Harness neste projeto. Por favor leia `.grooveskills/memory/tasks/00-onboarding.md`, `.grooveskills/memory/context.md` e as skills instaladas em `.agents/skills/`. Faça-me perguntas interativas passo a passo para mapear lacunas de arquitetura, alinhar prioridades e adaptar o projeto às minhas necessidades antes de prosseguir.",
  },
  it: {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    instruction: "Tutti i messaggi, le convalide, gli errori, i pulsanti/CTA e le comunicazioni rivolte all'utente devono essere scritti rigorosamente in Italiano. Il tono deve essere empatico, cordiale, persuasivo e professionale.",
    onboardingPromptTitle: "Prompt di inizializzazione per il tuo Agente AI (Copia e incolla nella chat):",
    onboardingPrompt: "Ciao. Ho appena configurato GrooveSkills Harness in questo progetto. Ti prego di leggere `.grooveskills/memory/tasks/00-onboarding.md`, `.grooveskills/memory/context.md` e le skills installate in `.agents/skills/`. Fammi domande interattive passo dopo passo per identificare lacune architetturali, allineare le priorità e adattare il progetto alle mie esigenze prima di continuare.",
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    instruction: "Tous les messages, validations, erreurs, boutons d'appel à l'action (CTA) et notifications destinés à l'utilisateur doivent être rédigés strictement en Français. Le ton doit être empathique, courtois, persuasif et professionnel.",
    onboardingPromptTitle: "Prompt d'initialisation pour votre Agent IA (Copiez et collez dans le chat) :",
    onboardingPrompt: "Bonjour. Je viens de configurer GrooveSkills Harness sur ce projet. Veuillez consulter `.grooveskills/memory/tasks/00-onboarding.md`, `.grooveskills/memory/context.md` et les skills installées dans `.agents/skills/`. Posez-moi des questions interactives étape par étape pour identifier les lacunes d'architecture, préciser les priorités et adapter le projet à mes besoins avant de continuer.",
  },
};
