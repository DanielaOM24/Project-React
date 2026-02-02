/**
 * Servicio de IA para NutriLens
 * - Chat nutricional: respuestas cortas, directas, amigables.
 * - Análisis de imagen de comida: analyzeFoodImage(imageBase64, userContext).
 */

import { AI_CONFIG, isAPIKeyConfigured } from './config';
import {
    buildAudioDescriptionSystemPrompt,
    buildFoodImageAnalysisSystemPrompt,
    buildNutritionChatSystemPrompt,
    UserContext,
} from './prompts';

type TextPart = { text: string };
type ImagePart = { inlineData: { mimeType: string; data: string } };
type Part = TextPart | ImagePart;

async function callGeminiText(
  systemPrompt: string,
  contents: { role: 'user' | 'model'; parts: TextPart[] }[]
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.MODEL}:generateContent?key=${AI_CONFIG.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: AI_CONFIG.TEMPERATURE,
          maxOutputTokens: AI_CONFIG.MAX_TOKENS,
        },
      }),
    }
  );

  const data = (await res.json()) as {
    error?: { code?: number; message?: string; status?: string };
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
  };

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        'Has superado la cuota gratuita de Gemini. Espera 1–2 minutos o crea una nueva API key en aistudio.google.com/app/apikey'
      );
    }
    const msg = data?.error?.message || `Error ${res.status}`;
    throw new Error(`Error en IA: ${res.status} ${data?.error?.status || ''}: ${msg}`);
  }
  if (data?.error?.message) {
    throw new Error(`Error en IA: ${data.error.message}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text === 'string' && text.trim()) return text;
  const reason = data?.candidates?.[0]?.finishReason;
  if (reason === 'SAFETY' || reason === 'BLOCKED') {
    throw new Error('La respuesta fue filtrada por seguridad. Intenta reformular tu mensaje.');
  }
  throw new Error('No se pudo generar respuesta. Intenta de nuevo.');
}

async function callGeminiWithImage(
  systemPrompt: string,
  parts: Part[]
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.MODEL}:generateContent?key=${AI_CONFIG.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user' as const, parts }],
        generationConfig: {
          temperature: AI_CONFIG.TEMPERATURE,
          maxOutputTokens: AI_CONFIG.MAX_TOKENS_IMAGE,
        },
      }),
    }
  );

  const data = (await res.json()) as {
    error?: { code?: number; message?: string; status?: string };
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
  };

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        'Has superado la cuota gratuita de Gemini. Espera 1–2 minutos o crea una nueva API key en aistudio.google.com/app/apikey'
      );
    }
    const msg = data?.error?.message || `Error ${res.status}`;
    throw new Error(`Error en IA: ${res.status} ${data?.error?.status || ''}: ${msg}`);
  }
  if (data?.error?.message) {
    throw new Error(`Error en IA: ${data.error.message}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text === 'string' && text.trim()) return text;
  const reason = data?.candidates?.[0]?.finishReason;
  if (reason === 'SAFETY' || reason === 'BLOCKED') {
    throw new Error('La imagen fue filtrada. Usa una foto clara de comida.');
  }
  throw new Error('No se pudo analizar la imagen. Intenta de nuevo.');
}

// --- CHAT ---

export interface ChatResponse {
  message: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Obtiene una respuesta corta y directa del chat nutricional.
 */
export async function getChatResponse(
  message: string,
  userContext: UserContext,
  conversationHistory: ConversationMessage[] = []
): Promise<ChatResponse> {
  if (!isAPIKeyConfigured()) {
    return getChatResponseMock(message, userContext);
  }

  try {
    const systemPrompt = buildNutritionChatSystemPrompt(userContext);
    const contents: { role: 'user' | 'model'; parts: TextPart[] }[] = [];

    for (const msg of conversationHistory) {
      if (msg.role === 'system') continue;
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const raw = await callGeminiText(systemPrompt, contents);
    return { message: raw.trim() };
  } catch (e) {
    console.error('Error en chat:', e);
    return {
      message:
        'No pude procesar tu mensaje. Revisa la conexión e inténtalo de nuevo.',
    };
  }
}

export function getChatResponseMock(
  message: string,
  userContext: UserContext
): ChatResponse {
  const m = message.toLowerCase();
  if (m.includes('cena') || m.includes('cenar')) {
    return {
      message: `🥗 Para cenar, con tu objetivo de ${userContext.objetivo}, prueba una ensalada con proteína (pollo o pescado) y vegetales. Evita carbohidratos pesados y cena 2–3 h antes de dormir. ¡Tu cuerpo te lo agradecerá! 💪`,
    };
  }
  if (m.includes('desayuno') || m.includes('desayunar')) {
    return {
      message: `🍳 El desayuno es clave para arrancar bien el día. Incluye proteína y fibra: huevos con vegetales, avena con fruta o un smoothie. Evita cereales azucarados y verás la diferencia. ✨`,
    };
  }
  if (m.includes('proteína') || m.includes('proteina')) {
    return {
      message: `💪 La proteína te ayuda con ${userContext.objetivo}. Apunta a 1.6–2 g/kg, repartida en las comidas. Pollo, pescado, huevos y legumbres son excelentes opciones. 🥑`,
    };
  }
  if (m.includes('snack') || m.includes('merienda') || m.includes('antojo')) {
    return {
      message: `🥜 Snacks inteligentes: fruta con nueces, yogur griego o vegetales con hummus. Combina proteína y fibra para saciedad y más energía. ¡Pruébalos! ✨`,
    };
  }
  if (m.includes('agua') || m.includes('hidrat')) {
    return {
      message: `💧 La hidratación es básica para ${userContext.objetivo}. Intenta 2–3 L al día. Un vaso al despertar y antes de cada comida hace una gran diferencia. 🩺`,
    };
  }
  return {
    message: `✨ Con tu objetivo (${userContext.objetivo}) y dieta ${userContext.dieta}, la clave es constancia. ¿Sobre qué quieres que hablemos? 🥗 Cena, desayuno, proteína o snacks — ¡tú eliges!`,
  };
}

// --- ANÁLISIS DE IMAGEN DE COMIDA ---

export interface FoodImageAnalysisResult {
  /** Qué parece ser la comida (con estimación simple si aplica) */
  foodDescription: string;
  /** Sugerencia nutricional breve */
  suggestion: string;
  /** Texto completo para mostrar (p. ej. en UI) */
  message: string;
}

/**
 * Analiza una foto de comida y devuelve qué parece, estimación simple y sugerencia.
 *
 * @param imageBase64 - Imagen en base64 (con o sin prefijo data:image/...;base64,)
 * @param userContext - Contexto del usuario (objetivo, dieta, etc.)
 */
export async function analyzeFoodImage(
  imageBase64: string,
  userContext: UserContext
): Promise<FoodImageAnalysisResult> {
  const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

  if (!isAPIKeyConfigured()) {
    return getFoodImageAnalysisMock(userContext);
  }

  try {
    const systemPrompt = buildFoodImageAnalysisSystemPrompt(userContext);
    const parts: Part[] = [
      { inlineData: { mimeType, data: base64 } },
      {
        text: 'Analiza la imagen. Responde solo con:\nCOMIDA: [qué parece y estimación simple]\nSUGERENCIA: [una frase práctica]',
      },
    ];

    const raw = await callGeminiWithImage(systemPrompt, parts);
    return parseFoodImageResponse(raw);
  } catch (e) {
    console.error('Error analizando imagen:', e);
    return {
      foodDescription: '',
      suggestion: 'No pude analizar la imagen. Revisa la conexión e inténtalo de nuevo.',
      message: 'No pude analizar la imagen. Revisa la conexión e inténtalo de nuevo.',
    };
  }
}

function parseFoodImageResponse(raw: string): FoodImageAnalysisResult {
  const t = raw.trim();
  const comidaMatch = t.match(/COMIDA:\s*(.+?)(?=SUGERENCIA:|$)/s);
  const sugrMatch = t.match(/SUGERENCIA:\s*(.+)$/s);

  if (comidaMatch && sugrMatch) {
    const foodDescription = comidaMatch[1].trim();
    const suggestion = sugrMatch[1].trim();
    const message = `${foodDescription} ${suggestion}`;
    return { foodDescription, suggestion, message };
  }

  return { foodDescription: '', suggestion: t, message: t };
}

function getFoodImageAnalysisMock(_userContext: UserContext): FoodImageAnalysisResult {
  return {
    foodDescription: '🍗 Parece pollo con arroz. Buena fuente de proteína.',
    suggestion: 'Puedes acompañarlo con verduras para más fibra. 🥗',
    message:
      '🍗 Parece pollo con arroz. Buena fuente de proteína. Puedes acompañarlo con verduras para más fibra. 🥗',
  };
}

// --- ANÁLISIS DE AUDIO (DESCRIPCIÓN HABLADA) ---

export interface AudioAnalysisResult {
  message: string;
}

/**
 * Analiza una descripción hablada de comida (transcripción) y devuelve un consejo nutricional.
 *
 * @param transcript - Transcripción del audio del usuario (lo que comió o va a comer).
 * @param userContext - Contexto del usuario.
 */
export async function analyzeAudioDescription(
  transcript: string,
  userContext: UserContext
): Promise<AudioAnalysisResult> {
  if (!isAPIKeyConfigured()) {
    return getAudioAnalysisMock(userContext);
  }

  try {
    const systemPrompt = buildAudioDescriptionSystemPrompt(userContext);
    const contents: { role: 'user' | 'model'; parts: TextPart[] }[] = [
      { role: 'user', parts: [{ text: `El usuario dijo: "${transcript}"` }] },
    ];
    const raw = await callGeminiText(systemPrompt, contents);
    return { message: raw.trim() };
  } catch (e) {
    console.error('Error analizando audio:', e);
    return {
      message: 'No pude analizar lo que dijiste. Revisa la conexión e inténtalo de nuevo.',
    };
  }
}

function getAudioAnalysisMock(_userContext: UserContext): AudioAnalysisResult {
  return {
    message:
      '🎤 Por lo que comentas, suena a una comida equilibrada. Si puedes, añade algo de verde 🥗 y mantén buenas porciones. ¡Sigue así! 💪',
  };
}

