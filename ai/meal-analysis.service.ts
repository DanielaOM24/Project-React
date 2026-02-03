/**
 * Servicio de IA para análisis detallado de comidas
 * Analiza imágenes o audios y devuelve información estructurada sobre alimentos detectados
 */

import { AI_CONFIG, isAPIKeyConfigured } from './config';
import { UserContext } from './prompts';

type TextPart = { text: string };
type ImagePart = { inlineData: { mimeType: string; data: string } };
type Part = TextPart | ImagePart;

// Interfaz para un alimento detectado
export interface DetectedFood {
  name: string;
  icon: string; // Nombre del ícono de Ionicons
  portion: string; // Ej: "≈ 1 taza de arroz cocido"
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Resultado del análisis detallado
export interface DetailedMealAnalysis {
  message: string; // Mensaje de NutriLens con feedback
  foods: DetectedFood[]; // Lista de alimentos detectados
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

/**
 * Analiza una imagen de comida y devuelve información detallada estructurada
 */
export async function analyzeMealImage(
  imageBase64: string,
  userContext: UserContext
): Promise<DetailedMealAnalysis> {
  const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

  if (!isAPIKeyConfigured()) {
    return getDetailedAnalysisMock();
  }

  try {
    const systemPrompt = buildDetailedAnalysisSystemPrompt(userContext);
    const parts: Part[] = [
      { inlineData: { mimeType, data: base64 } },
      {
        text: `Analiza esta imagen de comida y responde SOLO con un JSON válido (nada antes ni después).

"message" (texto que verá el usuario):
- Empieza con un elogio breve y variado (ej: "¡Muy bien! Esta comida se ve nutritiva.", "¡Qué buena elección! Se ve equilibrada.", "¡Excelente! Has combinado bien los grupos.").
- Di qué alimentos ves en la imagen, de forma natural: "He visto arroz, pollo y ensalada verde." o "Identifiqué: pasta, tomate y albahaca."
- Opcional: una oración de consejo práctico (ej: "Así mantienes buena energía para el día."). Máximo 2-3 oraciones en total. 1-2 emojis. Tono cercano, en español.

"foods": Lista todos los alimentos visibles. Cada uno: "name" (español), "icon" (restaurant, fish, egg, leaf, cafe, nutrition...), "portion" (ej: "≈ 1 taza"), "calories", "protein", "carbs", "fats" (números).

Ejemplo de estructura (adapta el mensaje a lo que veas):
{
  "message": "¡Muy bien! Esta comida se ve nutritiva. He visto arroz, pollo y ensalada. Buen balance de proteína y verduras. 🍽️",
  "foods": [ { "name": "Arroz", "icon": "restaurant", "portion": "≈ 1 taza", "calories": 200, "protein": 4, "carbs": 44, "fats": 0 }, ... ]
}`,
      },
    ];

    const raw = await callGeminiWithImage(systemPrompt, parts);
    return parseDetailedAnalysisResponse(raw);
  } catch (e: any) {
    console.error('Error analizando imagen:', e);
    // Si es un error de reconocimiento, relanzarlo
    if (e.message === 'FOOD_NOT_RECOGNIZED') {
      throw e;
    }
    // Para otros errores, verificar el mensaje
    const errorText = e.message?.toLowerCase() || '';
    if (errorText.includes('no se pudo') || errorText.includes('no se detectó') || 
        errorText.includes('no hay comida') || errorText.includes('no es comida')) {
      throw new Error('FOOD_NOT_RECOGNIZED');
    }
    return getDetailedAnalysisMock();
  }
}

/**
 * Analiza una descripción hablada de comida y devuelve información detallada
 */
export async function analyzeMealAudio(
  transcript: string,
  userContext: UserContext
): Promise<DetailedMealAnalysis> {
  if (!isAPIKeyConfigured()) {
    return getDetailedAnalysisMock();
  }

  try {
    const systemPrompt = buildDetailedAnalysisSystemPrompt(userContext);
    const contents: { role: 'user' | 'model'; parts: TextPart[] }[] = [
      {
        role: 'user',
        parts: [
          {
            text: `El usuario describió su comida: "${transcript}"

Responde SOLO con un JSON válido (nada antes ni después).

"message":
- Apertura positiva y variada (ej: "¡Muy bien!", "¡Qué buena descripción!", "¡Excelente!").
- Di qué alimentos identificaste en su descripción: "He identificado: [lista]." o "Has mencionado: [lista]."
- Opcional: una oración corta de consejo o motivación. 2-3 oraciones en total. 1-2 emojis. Tono cercano, en español.

"foods": Todos los alimentos que haya mencionado. Cada uno: name (español), icon (restaurant, fish, egg, leaf, cafe...), portion (ej: "≈ 1 taza"), calories, protein, carbs, fats (números).

Ejemplo:
{
  "message": "¡Qué buena descripción! He identificado: huevos, pan y café. Un desayuno que te da energía para arrancar el día. ☀️",
  "foods": [ { "name": "Huevos", "icon": "egg", "portion": "≈ 2 unidades", "calories": 140, "protein": 12, "carbs": 1, "fats": 10 }, ... ]
}`,
          },
        ],
      },
    ];

    const raw = await callGeminiText(systemPrompt, contents);
    return parseDetailedAnalysisResponse(raw);
  } catch (e: any) {
    console.error('Error analizando audio:', e);
    // Si es un error de reconocimiento, relanzarlo
    if (e.message === 'FOOD_NOT_RECOGNIZED') {
      throw e;
    }
    // Para otros errores, verificar el mensaje
    const errorText = e.message?.toLowerCase() || '';
    if (errorText.includes('no se pudo') || errorText.includes('no se detectó') || 
        errorText.includes('no hay comida') || errorText.includes('no es comida')) {
      throw new Error('FOOD_NOT_RECOGNIZED');
    }
    return getDetailedAnalysisMock();
  }
}

// Función helper para llamar a Gemini con imagen
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
          maxOutputTokens: AI_CONFIG.MAX_TOKENS_IMAGE * 3, // Más tokens para respuesta estructurada
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
    throw new Error(`Error en análisis de IA: ${res.status} ${data?.error?.status || ''}: ${msg}`);
  }
  if (data?.error?.message) {
    throw new Error(`Error en análisis de IA: ${data.error.message}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text === 'string' && text.trim()) return text;
  const reason = data?.candidates?.[0]?.finishReason;
  if (reason === 'SAFETY' || reason === 'BLOCKED') {
    throw new Error('La imagen fue filtrada. Usa una foto clara de comida.');
  }
  throw new Error('No se pudo generar respuesta del análisis. Intenta de nuevo.');
}

// Función helper para llamar a Gemini con texto
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
    throw new Error(`Error en análisis de IA: ${res.status} ${data?.error?.status || ''}: ${msg}`);
  }
  if (data?.error?.message) {
    throw new Error(`Error en análisis de IA: ${data.error.message}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text === 'string' && text.trim()) return text;
  const reason = data?.candidates?.[0]?.finishReason;
  if (reason === 'SAFETY' || reason === 'BLOCKED') {
    throw new Error('La respuesta fue filtrada. Intenta con otra descripción.');
  }
  throw new Error('No se pudo generar respuesta del análisis. Intenta de nuevo.');
}

// Construir el system prompt para análisis detallado
function buildDetailedAnalysisSystemPrompt(userContext: UserContext): string {
  const objetivo = userContext.objetivo || 'mantener un estilo de vida saludable';
  const dieta = userContext.dieta || 'normal';

  return `Eres un nutricionista cercano y positivo. Analizas comidas y respondes SIEMPRE con un único JSON válido. Todo en español.

Contexto: El usuario quiere ${objetivo}. Su dieta es ${dieta}.

Tono del "message":
- Cálido y motivador, como un amigo que sabe de nutrición.
- Varía la apertura: no uses siempre la misma frase (ej: "¡Excelente!", "¡Muy bien!", "¡Qué buena elección!", "¡Se ve genial!", "¡Buen trabajo!").
- En la primera o segunda oración di qué alimentos identificaste, de forma natural: "He visto arroz, pollo y ensalada" o "Identifiqué: pasta, brócoli y queso."
- Si quieres, añade UNA oración de consejo breve y práctico (relacionado con su objetivo si tiene sentido). No des sermones.
- Longitud: 2-3 oraciones. 1-2 emojis de comida o bienestar (🍽️ 💪 🥗 ✨).
- Evita sonar robótico o repetitivo.

"foods": Array con cada alimento: name (español), icon (restaurant, fish, egg, leaf, cafe, nutrition, etc.), portion (ej: "≈ 1 taza"), calories, protein, carbs, fats (números realistas).

Responde solo con el JSON, sin texto extra ni markdown.`;
}

// Parsear la respuesta de la IA
function parseDetailedAnalysisResponse(raw: string): DetailedMealAnalysis {
  try {
    // Limpiar el texto para extraer solo el JSON
    let jsonText = raw.trim();
    
    // Buscar el JSON en el texto (puede venir con markdown o texto adicional)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonText);
    
    // Validar y calcular totales
    const foods: DetectedFood[] = Array.isArray(parsed.foods) ? parsed.foods : [];
    
    // Si no hay alimentos detectados, lanzar error
    if (foods.length === 0) {
      throw new Error('FOOD_NOT_RECOGNIZED');
    }
    
    const totalCalories = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
    const totalProtein = foods.reduce((sum, f) => sum + (f.protein || 0), 0);
    const totalCarbs = foods.reduce((sum, f) => sum + (f.carbs || 0), 0);
    const totalFats = foods.reduce((sum, f) => sum + (f.fats || 0), 0);
    
    return {
      message: parsed.message || 'Comida analizada exitosamente',
      foods,
      totalCalories: Math.round(totalCalories),
      totalProtein: parseFloat(totalProtein.toFixed(1)),
      totalCarbs: parseFloat(totalCarbs.toFixed(1)),
      totalFats: parseFloat(totalFats.toFixed(1)),
    };
  } catch (e: any) {
    console.error('Error parseando respuesta de IA:', e);
    // Si es un error de reconocimiento, relanzarlo
    if (e.message === 'FOOD_NOT_RECOGNIZED') {
      throw e;
    }
    // Para otros errores, verificar si el mensaje indica que no se reconoció comida
    const errorText = e.message?.toLowerCase() || '';
    if (errorText.includes('no se pudo') || errorText.includes('no se detectó') || 
        errorText.includes('no hay comida') || errorText.includes('no es comida')) {
      throw new Error('FOOD_NOT_RECOGNIZED');
    }
    return getDetailedAnalysisMock();
  }
}

// Mock para desarrollo/testing
function getDetailedAnalysisMock(): DetailedMealAnalysis {
  return {
    message: '¡Esta comida te aporta buena energía! Excelente balance de proteína y carbohidratos 💪',
    foods: [
      {
        name: 'Arroz blanco',
        icon: 'restaurant',
        portion: '≈ 1 taza de arroz cocido',
        calories: 195,
        protein: 4,
        carbs: 45,
        fats: 0,
      },
      {
        name: 'Pollo a la plancha',
        icon: 'restaurant',
        portion: '≈ El tamaño de tu palma',
        calories: 165,
        protein: 31,
        carbs: 0,
        fats: 4,
      },
      {
        name: 'Ensalada verde',
        icon: 'leaf',
        portion: '≈ 2 puños de hojas',
        calories: 20,
        protein: 2,
        carbs: 3,
        fats: 0,
      },
    ],
    totalCalories: 380,
    totalProtein: 37,
    totalCarbs: 48,
    totalFats: 4,
  };
}

