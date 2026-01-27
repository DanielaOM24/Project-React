/**
 * Prompts base para los servicios de IA de Nutrilens
 * 
 * Este archivo define los 3 casos de uso principales:
 * 1. Chat nutricional
 * 2. Análisis de imagen de comida
 * 3. Análisis de audio (descripción hablada)
 */

/**
 * Contexto del usuario obtenido del onboarding
 * Estos datos serán proporcionados por Aleja
 */
export interface UserContext {
  /** Objetivo principal del usuario (ej: "perder peso", "ganar masa muscular", "mantener peso") */
  objetivo: string;
  /** Tipo de dieta que sigue (ej: "vegetariana", "vegana", "keto", "sin restricciones") */
  dieta: string;
  /** Comidas preferidas o que consume regularmente */
  comidasPreferidas?: string[];
  /** Restricciones alimentarias o alergias */
  restricciones?: string[];
  /** Información adicional relevante */
  infoAdicional?: string;
}

/**
 * Construye el contexto del usuario en formato legible para la IA
 */
function buildUserContext(context: UserContext): string {
  let contextText = `Mi objetivo es: ${context.objetivo}. `;
  contextText += `Sigo una dieta ${context.dieta}.`;
  
  if (context.comidasPreferidas && context.comidasPreferidas.length > 0) {
    contextText += ` Me gusta comer: ${context.comidasPreferidas.join(', ')}.`;
  }
  
  if (context.restricciones && context.restricciones.length > 0) {
    contextText += ` Tengo estas restricciones: ${context.restricciones.join(', ')}.`;
  }
  
  if (context.infoAdicional) {
    contextText += ` ${context.infoAdicional}`;
  }
  
  return contextText;
}

// ============================================================================
// CASO 1: CHAT NUTRICIONAL
// ============================================================================

/**
 * Genera el prompt base para el chat nutricional
 * 
 * @param userContext - Contexto del usuario del onboarding
 * @param userMessage - Mensaje del usuario en la conversación
 * @returns Prompt completo para enviar a la IA
 */
export function buildNutritionChatPrompt(
  userContext: UserContext,
  userMessage: string
): string {
  const context = buildUserContext(userContext);
  
  return `Eres un asistente nutricional amigable y experto. Tu trabajo es ayudar a las personas a alcanzar sus objetivos de salud de manera clara y práctica.

CONTEXTO DEL USUARIO:
${context}

INSTRUCCIONES:
- Responde de forma natural y conversacional, como si fueras un nutricionista amigable
- Usa lenguaje simple y evita términos técnicos complicados
- Mantén tus respuestas cortas y directas (máximo 3-4 párrafos)
- Sé específico y práctico con tus consejos
- Si no sabes algo, admítelo honestamente
- Enfócate en ayudar al usuario a alcanzar su objetivo: ${userContext.objetivo}

MENSAJE DEL USUARIO:
${userMessage}

RESPUESTA:`;
}

// ============================================================================
// CASO 2: ANÁLISIS DE IMAGEN DE COMIDA
// ============================================================================

/**
 * Genera el prompt base para analizar una imagen de comida
 * 
 * @param userContext - Contexto del usuario del onboarding
 * @param imageDescription - Descripción de la imagen (si está disponible) o null
 * @returns Prompt completo para enviar a la IA
 */
export function buildFoodImageAnalysisPrompt(
  userContext: UserContext,
  imageDescription?: string | null
): string {
  const context = buildUserContext(userContext);
  
  let prompt = `Eres un experto en análisis nutricional de alimentos. Analiza la imagen de comida que se te proporciona y da información útil al usuario.

CONTEXTO DEL USUARIO:
${context}

INSTRUCCIONES:
- Identifica los alimentos principales en la imagen
- Estima las porciones de manera aproximada
- Proporciona información nutricional básica (calorías aproximadas, macronutrientes principales)
- Evalúa si esta comida se alinea con el objetivo del usuario: ${userContext.objetivo}
- Sugiere mejoras o alternativas si es necesario
- Usa lenguaje simple y directo
- Mantén la respuesta concisa (máximo 4-5 párrafos)
- Si no puedes identificar algo claramente, dilo con honestidad

`;

  if (imageDescription) {
    prompt += `DESCRIPCIÓN DE LA IMAGEN:\n${imageDescription}\n\n`;
  }
  
  prompt += `ANÁLISIS:`;
  
  return prompt;
}

// ============================================================================
// CASO 3: ANÁLISIS DE AUDIO (DESCRIPCIÓN HABLADA)
// ============================================================================

/**
 * Genera el prompt base para analizar una descripción hablada de comida
 * 
 * @param userContext - Contexto del usuario del onboarding
 * @param audioTranscript - Transcripción del audio del usuario
 * @returns Prompt completo para enviar a la IA
 */
export function buildAudioDescriptionPrompt(
  userContext: UserContext,
  audioTranscript: string
): string {
  const context = buildUserContext(userContext);
  
  return `Eres un asistente nutricional que analiza descripciones habladas de comidas. El usuario te está describiendo lo que comió o va a comer.

CONTEXTO DEL USUARIO:
${context}

INSTRUCCIONES:
- Analiza la descripción hablada del usuario
- Identifica los alimentos mencionados
- Estima las porciones basándote en las descripciones del usuario
- Proporciona información nutricional aproximada (calorías, macronutrientes)
- Evalúa si esta comida se alinea con el objetivo: ${userContext.objetivo}
- Ofrece consejos prácticos y específicos
- Usa lenguaje natural y conversacional
- Mantén la respuesta breve y útil (máximo 4-5 párrafos)
- Si falta información importante, haz preguntas claras

DESCRIPCIÓN DEL USUARIO:
${audioTranscript}

ANÁLISIS Y RECOMENDACIONES:`;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Tipo para identificar el caso de uso de IA
 */
export type AIUseCase = 'chat' | 'image' | 'audio';

/**
 * Función helper que construye el prompt según el caso de uso
 */
export function buildPrompt(
  useCase: AIUseCase,
  userContext: UserContext,
  input: string,
  imageDescription?: string | null
): string {
  switch (useCase) {
    case 'chat':
      return buildNutritionChatPrompt(userContext, input);
    case 'image':
      return buildFoodImageAnalysisPrompt(userContext, imageDescription);
    case 'audio':
      return buildAudioDescriptionPrompt(userContext, input);
    default:
      throw new Error(`Caso de uso no válido: ${useCase}`);
  }
}
