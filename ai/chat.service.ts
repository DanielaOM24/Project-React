/**
 * Servicio de Chat de IA para Nutrilens
 * 
 * Este servicio maneja las conversaciones con la IA nutricional,
 * generando respuestas consistentes y útiles.
 */

import { buildNutritionChatPrompt, UserContext } from './prompts';

/**
 * Respuesta estructurada del chat
 */
export interface ChatResponse {
  /** Respuesta principal de la IA */
  message: string;
  /** Recomendaciones específicas para el usuario */
  recomendaciones?: string[];
  /** Tips rápidos y prácticos */
  tips?: string[];
  /** Preguntas de seguimiento para continuar la conversación */
  preguntasSeguimiento?: string[];
}

/**
 * Obtiene una respuesta del chat de IA nutricional
 * 
 * @param message - Mensaje del usuario
 * @param userContext - Contexto del usuario (objetivo, dieta, etc.)
 * @returns Respuesta estructurada con mensaje, recomendaciones, tips y preguntas
 * 
 * @example
 * const respuesta = await getChatResponse(
 *   "¿Qué puedo comer para cenar?",
 *   { objetivo: "perder peso", dieta: "vegetariana" }
 * );
 */
export async function getChatResponse(
  message: string,
  userContext: UserContext
): Promise<ChatResponse> {
  // Construir el prompt mejorado que pide respuestas estructuradas
  const prompt = buildEnhancedChatPrompt(userContext, message);
  
  // Aquí Diego conectará con la API de IA (OpenAI, Anthropic, etc.)
  // Por ahora retornamos una estructura que Diego puede usar
  const aiResponse = await callAI(prompt);
  
  // Procesar y estructurar la respuesta
  return parseAIResponse(aiResponse);
}

/**
 * Construye un prompt mejorado que solicita respuestas estructuradas
 */
function buildEnhancedChatPrompt(
  userContext: UserContext,
  message: string
): string {
  const basePrompt = buildNutritionChatPrompt(userContext, message);
  
  return `${basePrompt}

IMPORTANTE: Tu respuesta debe incluir:
1. Una respuesta principal clara y útil (2-3 párrafos)
2. 2-3 recomendaciones específicas para el usuario
3. 2-3 tips rápidos y prácticos
4. 1-2 preguntas de seguimiento para ayudar al usuario

Formato de respuesta (usa estos marcadores):
RESPUESTA: [tu respuesta principal aquí]

RECOMENDACIONES:
- [recomendación 1]
- [recomendación 2]
- [recomendación 3]

TIPS:
- [tip 1]
- [tip 2]
- [tip 3]

PREGUNTAS:
- [pregunta 1]
- [pregunta 2]`;
}

/**
 * Llama a la API de IA (placeholder - Diego implementará esto)
 * 
 * TODO: Diego debe implementar la llamada real a la API de IA
 * Ejemplo con OpenAI:
 * ```typescript
 * const response = await openai.chat.completions.create({
 *   model: "gpt-4",
 *   messages: [{ role: "user", content: prompt }],
 * });
 * return response.choices[0].message.content;
 * ```
 */
async function callAI(prompt: string): Promise<string> {
  // Placeholder - Diego implementará la conexión real
  // Por ahora retorna un ejemplo para desarrollo
  throw new Error(
    'callAI debe ser implementado por Diego. ' +
    'Conecta con la API de IA (OpenAI, Anthropic, etc.) y retorna la respuesta.'
  );
}

/**
 * Parsea la respuesta de la IA y la estructura en un objeto ChatResponse
 */
function parseAIResponse(aiResponse: string): ChatResponse {
  const response: ChatResponse = {
    message: '',
    recomendaciones: [],
    tips: [],
    preguntasSeguimiento: [],
  };

  // Extraer respuesta principal
  const respuestaMatch = aiResponse.match(/RESPUESTA:\s*(.+?)(?=RECOMENDACIONES:|TIPS:|PREGUNTAS:|$)/s);
  if (respuestaMatch) {
    response.message = respuestaMatch[1].trim();
  } else {
    // Si no hay formato estructurado, usar toda la respuesta como mensaje
    response.message = aiResponse.trim();
  }

  // Extraer recomendaciones
  const recomendacionesMatch = aiResponse.match(/RECOMENDACIONES:\s*([\s\S]+?)(?=TIPS:|PREGUNTAS:|$)/);
  if (recomendacionesMatch) {
    response.recomendaciones = recomendacionesMatch[1]
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  // Extraer tips
  const tipsMatch = aiResponse.match(/TIPS:\s*([\s\S]+?)(?=PREGUNTAS:|$)/);
  if (tipsMatch) {
    response.tips = tipsMatch[1]
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  // Extraer preguntas de seguimiento
  const preguntasMatch = aiResponse.match(/PREGUNTAS:\s*([\s\S]+?)$/);
  if (preguntasMatch) {
    response.preguntasSeguimiento = preguntasMatch[1]
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  return response;
}

/**
 * Versión simplificada para desarrollo/testing
 * Retorna una respuesta de ejemplo sin llamar a la IA
 */
export function getChatResponseMock(
  message: string,
  userContext: UserContext
): ChatResponse {
  return {
    message: `Hola! Veo que tu objetivo es ${userContext.objetivo} y sigues una dieta ${userContext.dieta}. ` +
      `Para responder a tu pregunta "${message}", te recomiendo enfocarte en alimentos que te ayuden a alcanzar tu meta.`,
    recomendaciones: [
      `Incluye más proteínas en tu dieta ${userContext.dieta}`,
      `Mantén un déficit calórico moderado para ${userContext.objetivo}`,
      'Bebe suficiente agua durante el día',
    ],
    tips: [
      'Planifica tus comidas con anticipación',
      'Come despacio y mastica bien',
      'Escucha las señales de hambre de tu cuerpo',
    ],
    preguntasSeguimiento: [
      '¿Cuál es tu comida favorita que te ayuda con tu objetivo?',
      '¿Hay algún momento del día en que te cuesta más mantener tu dieta?',
    ],
  };
}
