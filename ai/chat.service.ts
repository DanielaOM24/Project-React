/**
 * Servicio de Chat de IA para Nutrilens
 * 
 * Este servicio maneja las conversaciones con la IA nutricional,
 * utilizando OpenAI para generar respuestas inteligentes.
 */

import OpenAI from 'openai';
import { buildNutritionChatPrompt, UserContext } from './prompts';
import { AI_CONFIG, isAPIKeyConfigured } from './config';

// Inicializar cliente de OpenAI
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!isAPIKeyConfigured()) {
      throw new Error(
        'API Key de OpenAI no configurada. ' +
        'Por favor, configura tu API key en ai/config.ts o en la variable de entorno EXPO_PUBLIC_OPENAI_API_KEY'
      );
    }
    openaiClient = new OpenAI({
      apiKey: AI_CONFIG.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Necesario para React Native/Expo
    });
  }
  return openaiClient;
}

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
 * Mensaje en el historial de conversación
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Obtiene una respuesta del chat de IA nutricional
 * 
 * @param message - Mensaje del usuario
 * @param userContext - Contexto del usuario (objetivo, dieta, etc.)
 * @param conversationHistory - Historial de la conversación (opcional)
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
  userContext: UserContext,
  conversationHistory: ConversationMessage[] = []
): Promise<ChatResponse> {
  // Verificar si la API está configurada
  if (!isAPIKeyConfigured()) {
    console.warn('API Key no configurada, usando respuesta mock');
    return getChatResponseMock(message, userContext);
  }

  try {
    const client = getOpenAIClient();
    
    // Construir el prompt del sistema
    const systemPrompt = buildEnhancedSystemPrompt(userContext);
    
    // Construir mensajes para la API
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Llamar a OpenAI
    const response = await client.chat.completions.create({
      model: AI_CONFIG.MODEL,
      messages,
      temperature: AI_CONFIG.TEMPERATURE,
      max_tokens: AI_CONFIG.MAX_TOKENS,
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    
    // Parsear y estructurar la respuesta
    return parseAIResponse(aiResponse);
  } catch (error) {
    console.error('Error al llamar a OpenAI:', error);
    
    // Si hay error, devolver respuesta de fallback
    return {
      message: 'Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta de nuevo.',
      recomendaciones: [],
      tips: ['Verifica tu conexión a internet'],
      preguntasSeguimiento: ['¿Puedes reformular tu pregunta?'],
    };
  }
}

/**
 * Construye el prompt del sistema mejorado
 */
function buildEnhancedSystemPrompt(userContext: UserContext): string {
  const basePrompt = buildNutritionChatPrompt(userContext, '');
  
  return `${basePrompt}

FORMATO DE RESPUESTA (usa estos marcadores exactos):
RESPUESTA: [tu respuesta principal aquí - 2-3 párrafos máximo]

RECOMENDACIONES:
- [recomendación 1]
- [recomendación 2]
- [recomendación 3]

TIPS:
- [tip 1]
- [tip 2]

PREGUNTAS:
- [pregunta de seguimiento 1]
- [pregunta de seguimiento 2]

IMPORTANTE: 
- Siempre usa el formato con los marcadores RESPUESTA:, RECOMENDACIONES:, TIPS: y PREGUNTAS:
- Sé conciso y práctico
- Adapta tus consejos al objetivo del usuario: ${userContext.objetivo}`;
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
 * Versión mock para desarrollo/testing sin API key
 * Genera respuestas variadas basadas en palabras clave
 */
export function getChatResponseMock(
  message: string,
  userContext: UserContext
): ChatResponse {
  const lowerMessage = message.toLowerCase();
  
  // Respuestas basadas en palabras clave
  if (lowerMessage.includes('cena') || lowerMessage.includes('cenar')) {
    return {
      message: `Para tu cena, considerando que tu objetivo es ${userContext.objetivo}, te recomiendo opciones ligeras pero nutritivas. Una buena opción sería una ensalada con proteína magra como pollo a la plancha o pescado, acompañada de vegetales variados.`,
      recomendaciones: [
        'Evita carbohidratos pesados en la noche',
        'Incluye vegetales de hoja verde',
        'Cena al menos 2-3 horas antes de dormir',
      ],
      tips: [
        'Prepara tus cenas con anticipación los domingos',
        'Ten siempre vegetales pre-cortados en la nevera',
      ],
      preguntasSeguimiento: [
        '¿Prefieres cenas calientes o frías?',
        '¿Cuánto tiempo tienes para cocinar en las noches?',
      ],
    };
  }
  
  if (lowerMessage.includes('desayuno') || lowerMessage.includes('desayunar')) {
    return {
      message: `El desayuno es clave para ${userContext.objetivo}. Te recomiendo empezar el día con proteína y fibra para mantenerte satisfecho. Opciones como huevos revueltos con vegetales, avena con frutas, o un smoothie nutritivo son excelentes.`,
      recomendaciones: [
        'Incluye al menos 20g de proteína en tu desayuno',
        'Agrega fibra con frutas o avena',
        'Evita cereales azucarados',
      ],
      tips: [
        'Prepara overnight oats la noche anterior',
        'Ten huevos duros listos en la nevera',
      ],
      preguntasSeguimiento: [
        '¿Tienes tiempo para cocinar en las mañanas?',
        '¿Prefieres desayunos dulces o salados?',
      ],
    };
  }
  
  if (lowerMessage.includes('proteína') || lowerMessage.includes('proteina')) {
    return {
      message: `La proteína es esencial para ${userContext.objetivo}. Te ayuda a mantener la masa muscular y te mantiene satisfecho por más tiempo. Para una dieta ${userContext.dieta}, hay muchas opciones deliciosas.`,
      recomendaciones: [
        'Consume 1.6-2g de proteína por kg de peso corporal',
        'Distribuye la proteína en todas tus comidas',
        'Combina diferentes fuentes de proteína',
      ],
      tips: [
        'El pollo y pescado son opciones magras excelentes',
        'Los huevos son económicos y versátiles',
        'Las legumbres aportan proteína y fibra',
      ],
      preguntasSeguimiento: [
        '¿Cuánta proteína consumes actualmente?',
        '¿Hay alguna fuente de proteína que no te guste?',
      ],
    };
  }
  
  if (lowerMessage.includes('snack') || lowerMessage.includes('merienda') || lowerMessage.includes('antojo')) {
    return {
      message: `Los snacks inteligentes pueden ayudarte con ${userContext.objetivo}. La clave es elegir opciones que te satisfagan sin exceder tus calorías. Combina proteína con fibra para mayor saciedad.`,
      recomendaciones: [
        'Frutas con mantequilla de maní o almendras',
        'Yogur griego con nueces',
        'Vegetales con hummus',
      ],
      tips: [
        'Prepara porciones individuales con anticipación',
        'Mantén snacks saludables visibles y accesibles',
      ],
      preguntasSeguimiento: [
        '¿A qué hora sueles tener más antojos?',
        '¿Prefieres snacks dulces o salados?',
      ],
    };
  }
  
  if (lowerMessage.includes('agua') || lowerMessage.includes('hidrat')) {
    return {
      message: `La hidratación es fundamental para ${userContext.objetivo}. Beber suficiente agua ayuda a controlar el apetito, mejora tu metabolismo y mantiene tu energía. Intenta beber al menos 2-3 litros diarios.`,
      recomendaciones: [
        'Bebe un vaso de agua al despertar',
        'Lleva una botella de agua contigo siempre',
        'Bebe agua antes de cada comida',
      ],
      tips: [
        'Agrega limón o pepino para más sabor',
        'Usa apps para recordar beber agua',
      ],
      preguntasSeguimiento: [
        '¿Cuánta agua bebes actualmente?',
        '¿Te cuesta recordar beber agua?',
      ],
    };
  }

  // Respuesta genérica para otras preguntas
  return {
    message: `Entiendo tu pregunta sobre "${message}". Basándome en tu objetivo de ${userContext.objetivo} y tu dieta ${userContext.dieta}, te puedo dar algunos consejos personalizados. Recuerda que la consistencia es clave para ver resultados.`,
    recomendaciones: [
      `Mantén un registro de lo que comes para ${userContext.objetivo}`,
      'Planifica tus comidas con anticipación',
      'No te saltes comidas, especialmente el desayuno',
    ],
    tips: [
      'La consistencia supera la perfección',
      'Pequeños cambios sostenibles dan grandes resultados',
      'Escucha las señales de hambre de tu cuerpo',
    ],
    preguntasSeguimiento: [
      '¿Hay algún aspecto específico de tu alimentación que te gustaría mejorar?',
      '¿Cuál es tu mayor desafío para seguir tu dieta?',
    ],
  };
}
