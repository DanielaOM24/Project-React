/**
 * Prompts para NutriLens — cortos, directos, amigables.
 * Casos: chat nutricional, análisis de imagen de comida, audio (descripción hablada).
 */

export interface UserContext {
  objetivo: string;
  dieta: string;
  comidasPreferidas?: string[];
  restricciones?: string[];
  infoAdicional?: string;
}

function buildUserContext(context: UserContext): string {
  let s = `Objetivo: ${context.objetivo}. Dieta: ${context.dieta}.`;
  if (context.comidasPreferidas?.length)
    s += ` Gusta: ${context.comidasPreferidas.join(', ')}.`;
  if (context.restricciones?.length)
    s += ` Restricciones: ${context.restricciones.join(', ')}.`;
  if (context.infoAdicional) s += ` ${context.infoAdicional}`;
  return s;
}

// --- CHAT NUTRICIONAL ---

/**
 * System prompt para el chat. El mensaje del usuario va en contents (no aquí).
 */
export function buildNutritionChatSystemPrompt(userContext: UserContext): string {
  const ctx = buildUserContext(userContext);
  return `Eres un nutricionista amigable, cercano y profesional. Tu tono es cálido y alentador.

Usuario: ${ctx}

Reglas:
- Usa emojis de comida, salud o bienestar (🍎🥗🥑💪✨🩺 etc.) de forma natural en tus respuestas. No abuses; 1-3 emojis por mensaje suelen bastar.
- Respuestas de 3-5 oraciones: útiles, concretas y fáciles de leer. Ni demasiado cortas ni párrafos largos.
- Lenguaje simple, cercano y profesional. Evita tecnicismos.
- Enfócate en el objetivo del usuario (${userContext.objetivo}).
- Si no sabes algo, dilo con honestidad y cercanía.`;
}

// --- ANÁLISIS DE IMAGEN DE COMIDA ---

/**
 * System prompt para analizar una foto de comida.
 * Ejemplo: "🍗 Parece pollo con arroz. Buena fuente de proteína. Puedes acompañarlo con verduras."
 */
export function buildFoodImageAnalysisSystemPrompt(userContext: UserContext): string {
  const ctx = buildUserContext(userContext);
  return `Analizas fotos de comida y das una sugerencia nutricional breve y amigable.

Usuario: ${ctx}

Responde en 1-3 oraciones:
1) Qué parece ser la comida (estimación simple, no exacta).
2) Una sugerencia nutricional útil y breve.

Usa 1-2 emojis de comida o salud (🍗🥗🥑🍚 etc.) de forma natural. Sé directo, amigable y profesional.`;
}

// --- AUDIO (DESCRIPCIÓN HABLADA) ---

export function buildAudioDescriptionSystemPrompt(userContext: UserContext): string {
  const ctx = buildUserContext(userContext);
  return `Analizas descripciones habladas de comidas. Usuario: ${ctx}.

Responde en 2-4 oraciones: qué comió o comerá, estimación simple y un consejo práctico. Usa 1-2 emojis de comida o salud de forma natural. Sé directo, amigable y cercano.`;
}

// --- HELPERS ---

export type AIUseCase = 'chat' | 'image' | 'audio';

export function buildPrompt(
  useCase: AIUseCase,
  userContext: UserContext,
  input: string,
  imageDescription?: string | null
): string {
  switch (useCase) {
    case 'chat':
      return buildNutritionChatSystemPrompt(userContext);
    case 'image':
      return buildFoodImageAnalysisSystemPrompt(userContext);
    case 'audio':
      return buildAudioDescriptionSystemPrompt(userContext);
    default:
      throw new Error(`Caso no válido: ${useCase}`);
  }
}
