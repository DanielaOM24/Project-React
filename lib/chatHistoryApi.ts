/**
 * API del historial de chat — NutriLens
 *
 * Lo que enviamos al backend:
 * - POST /api/chat/history — body: { conversationId, role, content }
 *   roles: USER | ASSISTANT | SYSTEM
 *
 * Lo que consumimos:
 * - GET /api/chat/history/{conversationId} — devuelve historial (array o { messages: [...] })
 */

const BASE_URL = 'https://nutrilens-0x37.onrender.com/api/chat';

export type ChatRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

/** Body que espera la API al guardar un mensaje */
export interface PostMessageBody {
  conversationId: string;
  role: ChatRole;
  content: string;
}

/** Mensaje devuelto por el GET (ajusta según lo que devuelva tu API) */
export interface HistoryMessage {
  role: string;
  content: string;
  createdAt?: string;
}

/** Respuesta posible del GET: array directo o { messages: [...] } */
type GetHistoryResponse = HistoryMessage[] | { messages?: HistoryMessage[] };

/**
 * Guarda un mensaje en el historial del chat.
 * POST /api/chat/history
 */
export async function postChatMessage(
  conversationId: string,
  role: ChatRole,
  content: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId,
      role,
      content,
    } as PostMessageBody),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chat history API error: ${res.status} ${text}`);
  }
}

/**
 * Obtiene el historial de una conversación.
 * GET /api/chat/history/{conversationId}
 */
export async function getChatHistory(
  conversationId: string
): Promise<HistoryMessage[]> {
  const res = await fetch(`${BASE_URL}/history/${encodeURIComponent(conversationId)}`);

  if (!res.ok) {
    if (res.status === 404) return [];
    const text = await res.text();
    throw new Error(`Chat history API error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as GetHistoryResponse;
  if (Array.isArray(data)) return data;
  if (data && 'messages' in data && Array.isArray(data.messages)) return data.messages;
  return [];
}
