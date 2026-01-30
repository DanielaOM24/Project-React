/**
 * Servicio de IA — Interfaz para consumir endpoints de Daniel.
 * Diego NO implementa IA, solo consume.
 * Daniel define las respuestas y la forma de los endpoints.
 */

const AI_BASE_URL = process.env.EXPO_PUBLIC_AI_API_URL ?? 'https://api-ejemplo-ia.nutrilens.app';

export type ChatMessageResponse = {
  message?: string;
  reply?: string;
  [key: string]: unknown;
};

export type FoodAnalysisResponse = {
  description?: string;
  calories?: number;
  suggestions?: string[];
  [key: string]: unknown;
};

/**
 * Envía un mensaje al chat de IA.
 * Endpoint definido por Daniel.
 */
export async function sendChatMessage(text: string): Promise<ChatMessageResponse> {
  const res = await fetch(`${AI_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, text }),
  });
  if (!res.ok) throw new Error(`AI chat: ${res.status}`);
  return res.json();
}

/**
 * Analiza una imagen de comida (IA).
 * image: URI local (file://) o base64. Daniel define el formato que acepta el endpoint.
 */
export async function analyzeFoodImage(image: string): Promise<FoodAnalysisResponse> {
  const formData = new FormData();
  formData.append('image', {
    uri: image,
    type: 'image/jpeg',
    name: 'food.jpg',
  } as unknown as Blob);

  const res = await fetch(`${AI_BASE_URL}/analyze/image`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`AI image: ${res.status}`);
  return res.json();
}

/**
 * Analiza un audio de comida (por ejemplo descripción por voz).
 * audio: URI local (file://). Daniel define el formato que acepta el endpoint.
 */
export async function analyzeFoodAudio(audio: string): Promise<FoodAnalysisResponse> {
  const formData = new FormData();
  formData.append('audio', {
    uri: audio,
    type: 'audio/mpeg',
    name: 'food.m4a',
  } as unknown as Blob);

  const res = await fetch(`${AI_BASE_URL}/analyze/audio`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`AI audio: ${res.status}`);
  return res.json();
}
