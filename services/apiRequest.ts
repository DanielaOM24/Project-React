// API Request Helper

import { API_BASE_URL } from './config';
import { getToken, removeToken } from './token';

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const isProtectedEndpoint = endpoint.includes('/api/');
  let token: string | null = null;
  
  if (isProtectedEndpoint) {
    token = await getToken();
    if (!token) {
      throw new Error('No estás autenticado. Por favor inicia sesión.');
    }
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  try {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const fullUrl = `${baseUrl}${cleanEndpoint}`;
    
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      throw new Error(`URL inválida: ${fullUrl}`);
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(fullUrl, {
        method: options.method || 'GET',
        headers,
        body: options.body,
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
        cache: 'no-store',
      });
      
      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        responseData = { message: responseText || 'Error desconocido' };
      }

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || responseData.msg || `Error ${response.status}`;
        
        if (response.status === 401) {
          await removeToken();
          throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        }
        
        if (response.status === 403) {
          const lowerMessage = errorMessage.toLowerCase();
          const isAuthError = lowerMessage.includes('token') || 
            lowerMessage.includes('expired') || 
            lowerMessage.includes('expirado') || 
            lowerMessage.includes('unauthorized') ||
            lowerMessage.includes('no autorizado') ||
            lowerMessage.includes('session');
          
          if (isAuthError) {
            await removeToken();
            throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
          }
          throw new Error(errorMessage || 'Acceso denegado. Verifica tus permisos.');
        }
        
        if (response.status >= 500) {
          const serverError = responseData.error || responseData.message || responseData.msg;
          if (serverError && typeof serverError === 'string' && serverError.length > 0) {
            throw new Error(serverError);
          }
          throw new Error('Error del servidor. Por favor intenta más tarde.');
        }
        
        if (response.status === 400) {
          const badRequestError = responseData.error || responseData.message || responseData.msg;
          if (badRequestError && typeof badRequestError === 'string') {
            throw new Error(badRequestError);
          }
          throw new Error('Datos inválidos. Verifica que todos los campos sean correctos.');
        }
        
        throw new Error(errorMessage);
      }

      return responseData;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('La petición tardó demasiado. Por favor intenta nuevamente.');
      }
      throw fetchError;
    }
  } catch (error: any) {
    if (error?.message && error.message.includes('No static resource')) {
      throw new Error('Error de conexión con el servidor. Por favor verifica tu conexión a internet e intenta nuevamente.');
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
    
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      throw error;
    }
    
    if (error.message && (error.message.includes('Error') || error.message.includes('sesión') || error.message.includes('conexión'))) {
      throw error;
    }
    
    throw error;
  }
};

