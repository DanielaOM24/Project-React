/**
 * API del historial de chat — NutriLens
 * Adaptado para usar el sistema de autenticación existente
 */

import { API_BASE_URL } from '@/services/config';
import { getToken, removeToken } from '@/services/token';

const BASE_URL = `${API_BASE_URL}/api/chat`;

export type ChatRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

/** Body que espera la API al guardar un mensaje */
export interface PostMessageBody {
  conversationId: string;
  role: ChatRole;
  content: string;
}

/** Mensaje devuelto por el GET según Swagger */
export interface HistoryMessage {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  createdAt: string;
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
  const token = await getToken();
  
  if (!token) {
    console.warn('[ChatHistory] No hay token, no se guardará el mensaje');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      },
      body: JSON.stringify({
        conversationId,
        role,
        content,
      } as PostMessageBody),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        await removeToken();
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }
      const text = await res.text();
      throw new Error(`Chat history API error: ${res.status} ${text}`);
    }
  } catch (error: any) {
    console.error('[ChatHistory] Error al guardar mensaje:', error);
    // No lanzar error, solo loguear para no interrumpir el flujo del chat
  }
}

/**
 * Obtiene el historial de una conversación.
 * GET /api/chat/history/{conversationId}
 */
export async function getChatHistory(
  conversationId: string
): Promise<HistoryMessage[]> {
  const token = await getToken();
  
  if (!token) {
    console.warn('[ChatHistory] No hay token, no se cargará el historial');
    return [];
  }

  try {
    const res = await fetch(`${BASE_URL}/history/${encodeURIComponent(conversationId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      },
    });

    if (!res.ok) {
      if (res.status === 404) return [];
      if (res.status === 401 || res.status === 403) {
        await removeToken();
        return [];
      }
      const text = await res.text();
      throw new Error(`Chat history API error: ${res.status} ${text}`);
    }

    const data = (await res.json()) as GetHistoryResponse;
    if (Array.isArray(data)) return data;
    if (data && 'messages' in data && Array.isArray(data.messages)) return data.messages;
    return [];
  } catch (error: any) {
    console.error('[ChatHistory] Error al obtener historial:', error);
    // Retornar array vacío en lugar de lanzar error
    return [];
  }
}

