/**
 * Configuración de IA para Nutrilens
 * 
 * IMPORTANTE: Nunca subas tu API key al repositorio.
 * Usa variables de entorno en producción.
 */

/**
 * Configuración de OpenAI
 */
export const AI_CONFIG = {
  /**
   * API Key de OpenAI
   * 
   * Para desarrollo: Puedes poner tu key aquí temporalmente
   * Para producción: Usa variables de entorno
   * 
   * Obtén tu API key en: https://platform.openai.com/api-keys
   */
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',

  /**
   * Modelo de OpenAI a utilizar
   * Opciones: 'gpt-4o-mini' (más barato), 'gpt-4o' (más inteligente), 'gpt-3.5-turbo' (legacy)
   */
  MODEL: 'gpt-4o-mini',

  /**
   * Temperatura para las respuestas (0-2)
   * - 0: Respuestas más deterministas y consistentes
   * - 1: Balance entre creatividad y consistencia
   * - 2: Respuestas más creativas y variadas
   */
  TEMPERATURE: 0.7,

  /**
   * Máximo de tokens en la respuesta
   */
  MAX_TOKENS: 1000,
};

/**
 * Verifica si la API key está configurada
 */
export function isAPIKeyConfigured(): boolean {
  return AI_CONFIG.OPENAI_API_KEY.length > 0;
}
