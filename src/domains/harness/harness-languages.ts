import type { ProjectLanguage } from "@/types/harness.types";

export interface LanguageDefinition {
  code: ProjectLanguage;
  name: string;
  nativeName: string;
  instruction: string;
  onboardingPromptTitle: string;
  onboardingPrompt: string;
  updatePromptTitle: string;
  updatePrompt: string;
}

export const SUPPORTED_LANGUAGES: Record<ProjectLanguage, LanguageDefinition> = {
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    instruction: "Todos los mensajes, validaciones, errores, CTAs y comunicaciones con el usuario deben redactarse estrictamente en Español. El tono debe ser empático, amable, persuasivo y profesional.",
    onboardingPromptTitle: "Prompt de inicialización para tu Agente IA (Copia y pega en el chat):",
    onboardingPrompt: "Hola. Acabo de configurar GrooveSkills Harness en este proyecto. Por favor lee `.grooveskills/memory/tasks/00-onboarding.md`, `.grooveskills/memory/context.md` y las skills instaladas en `.agents/skills/`. Hazme preguntas interactivas paso a paso para detectar vacíos de arquitectura, aclarar objetivos y dejar listo el onboarding del proyecto.",
    updatePromptTitle: "Prompt de actualización para tu Agente IA (Copia y pega en el chat):",
    updatePrompt: "Hola. Se acaba de actualizar GrooveSkills en este proyecto. Por favor lee `.grooveskills/VERSIONS.md` (donde están documentados los cambios de las versiones recientes), `.grooveskills/memory/context.md` y las skills actualizadas en `.agents/skills/`. Compara el estado actual del proyecto contra la lista de últimos cambios y nuevas directivas, realiza un diagnóstico claro y proponme una lista priorizada de ajustes sugeridos para adaptar el proyecto, sin modificar ningún archivo hasta que yo apruebe el plan.",
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    instruction: "All user-facing messages, form validations, errors, CTAs, and notifications must be written strictly in English. Tone must be empathetic, friendly, persuasive, and professional.",
    onboardingPromptTitle: "Initialization prompt for your AI Agent (Copy and paste into your chat):",
    onboardingPrompt: "Hello. I just configured GrooveSkills Harness in this project. Please review `.grooveskills/memory/tasks/00-onboarding.md`, `.grooveskills/memory/context.md`, and the skills installed in `.agents/skills/`. Ask me step-by-step interactive questions to identify architectural gaps, clarify priorities, and complete the project onboarding.",
    updatePromptTitle: "Update prompt for your AI Agent (Copy and paste into your chat):",
    updatePrompt: "Hello. GrooveSkills was just updated in this project. Please review `.grooveskills/VERSIONS.md` (which lists all recent version changes), `.grooveskills/memory/context.md`, and the updated skills in `.agents/skills/`. Compare the current state of the project against the list of latest changes and updated rules, provide a clear diagnosis, and propose a prioritized list of suggested adjustments, without editing any files until I approve the plan.",
  },
  pt: {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    instruction: "Todas as mensagens, validações, erros, CTAs e comunicações voltadas para o usuário devem ser redigidas estritamente em Português. O tom deve ser empático, amigável, persuasivo e profissional.",
    onboardingPromptTitle: "Prompt de inicialização para o seu Agente de IA (Copie e cole no chat):",
    onboardingPrompt: "Olá. Acabei de configurar o GrooveSkills Harness neste projeto. Por favor leia `.grooveskills/memory/tasks/00-onboarding.md`, `.grooveskills/memory/context.md` e as skills instaladas em `.agents/skills/`. Faça-me perguntas interativas passo a passo para mapear lacunas de arquitetura, alinhar prioridades e concluir o onboarding do projeto.",
    updatePromptTitle: "Prompt de atualização para o seu Agente de IA (Copie e cole no chat):",
    updatePrompt: "Olá. O GrooveSkills acabou de ser atualizado neste projeto. Por favor leia `.grooveskills/VERSIONS.md` (onde estão documentadas as mudanças das versões recentes), `.grooveskills/memory/context.md` e as skills atualizadas em `.agents/skills/`. Compare o estado atual do projeto com a lista de mudanças recentes e novas diretrizes, elabore um diagnóstico claro e proponha uma lista priorizada de ajustes sugeridos para adaptar o projeto, sem modificar nenhum arquivo até que eu aprove o plano.",
  },
  it: {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    instruction: "Tutti i messaggi, le convalide, gli errori, i pulsanti/CTA e le comunicazioni rivolte all'utente devono essere scritti rigorosamente in Italiano. Il tono deve ser empatico, cordiale, persuasivo e professionale.",
    onboardingPromptTitle: "Prompt di inizializzazione per il tuo Agente AI (Copia e incolla nella chat):",
    onboardingPrompt: "Ciao. Ho appena configurato GrooveSkills Harness in questo progetto. Ti prego di leggere `.grooveskills/memory/tasks/00-onboarding.md`, `.grooveskills/memory/context.md` e le skills installate in `.agents/skills/`. Fammi domande interattive passo dopo passo per identificare lacune architetturali, allineare le priorità e completare l'onboarding del proyecto.",
    updatePromptTitle: "Prompt di aggiornamento per il tuo Agente AI (Copia e incolla nella chat):",
    updatePrompt: "Ciao. GrooveSkills è stato appena aggiornato in questo progetto. Ti prego di leggere `.grooveskills/VERSIONS.md` (dove sono documentate le modifiche delle versioni recenti), `.grooveskills/memory/context.md` e le skills aggiornate in `.agents/skills/`. Confronta lo stato attuale del progetto con l'elenco delle ultime modifiche e delle nuove direttive, fornisci una diagnosi chiara e proponimi un elenco prioritario di modifiche suggerite per adattare il progetto, senza modificare alcun file finché non avrò approvato il piano.",
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    instruction: "Tous les messages, validations, erreurs, boutons d'appel à l'action (CTA) et notifications destinés à l'utilisateur doivent être rédigés strictement en Français. Le ton doit être empathique, courtois, persuasif et professionnel.",
    onboardingPromptTitle: "Prompt d'initialisation pour votre Agent IA (Copiez et collez dans le chat) :",
    onboardingPrompt: "Bonjour. Je viens de configurer GrooveSkills Harness sur ce projet. Veuillez consulter `.grooveskills/memory/tasks/00-onboarding.md`, `.grooveskills/memory/context.md` et les skills installées dans `.agents/skills/`. Posez-moi des questions interactives étape par étape pour identifier les lacunes d'architecture, préciser les priorités et finaliser l'onboarding du projet.",
    updatePromptTitle: "Prompt de mise à jour pour votre Agent IA (Copiez et collez dans le chat) :",
    updatePrompt: "Bonjour. GrooveSkills vient d'être mis à jour sur ce projet. Veuillez consulter `.grooveskills/VERSIONS.md` (où sont documentés les changements des versions récentes), `.grooveskills/memory/context.md` et les skills mises à jour dans `.agents/skills/`. Comparez l'état actuel du projet avec la liste des derniers changements et des nouvelles directives, fournissez un diagnostic clair et proposez-moi une liste priorisée d'ajustements suggérés pour adapter le projet, sans modifier aucun fichier tant que je n'ai pas approuvé le plan.",
  },
};
