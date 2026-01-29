/**
 * Configuración de Gemini (Google AI)
 */
export const AI_CONFIG = {

  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',

  MODEL: 'gemini-2.0-flash',

  /**
   * Temperatura para las respuestas (0-2)
   * - 0: Respuestas más deterministas y consistentes
   * - 1: Balance entre creatividad y consistencia
   * - 2: Respuestas más creativas y variadas
   */
  TEMPERATURE: 0.7,

  /** Máximo de tokens en la respuesta del chat */
  MAX_TOKENS: 500,

  /** Máximo de tokens en análisis de imagen */
  MAX_TOKENS_IMAGE: 200,
};

/**
 * Verifica si la API key está configurada
 */
export function isAPIKeyConfigured(): boolean {
  return AI_CONFIG.GEMINI_API_KEY.length > 0;
}
