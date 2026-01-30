import { API_BASE_URL } from './config';
import { getToken, removeToken } from './token';

// Función helper para hacer peticiones
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
  
  if (isProtectedEndpoint) {
    // Obtener token solo para endpoints protegidos
    const token = await getToken();
    
    if (!token) {
      console.error(`[API] No hay token disponible para ${endpoint}`);
      console.error(`[API] tokenInMemory:`, token ? `${token.substring(0, 20)}...` : 'null');
      if (typeof window !== 'undefined' && window.localStorage) {
        console.error(`[API] localStorage token:`, window.localStorage.getItem('authToken') ? 'presente' : 'ausente');
      }
      throw new Error('No estás autenticado. Por favor inicia sesión.');
    }
    
    // Asegurar que el token no tenga espacios ni caracteres extra
    const cleanToken = token.trim();
    headers.Authorization = `Bearer ${cleanToken}`;
    console.log(`[API] Token incluido en petición a ${endpoint}:`, {
      tokenPreview: cleanToken.substring(0, 20) + '...',
      tokenLength: cleanToken.length,
      headerValue: `Bearer ${cleanToken.substring(0, 20)}...`,
    });
  }

  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(fullUrl, {
      method: options.method || 'GET',
      headers,
      body: options.body,
      mode: 'cors',
      credentials: 'omit',
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      responseData = { message: responseText || 'Error desconocido' };
    }

    if (!response.ok) {
      const errorMessage = responseData.message || responseData.error || responseData.msg || `Error ${response.status}`;
      
      console.error(`[API] Error en ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        hasToken: !!headers.Authorization,
        tokenPreview: headers.Authorization ? headers.Authorization.substring(0, 30) + '...' : 'none',
        responseData: responseData,
        responseText: responseText.substring(0, 500),
      });
      
      if (response.status === 401) {
        // 401 siempre significa no autorizado
        console.warn('[API] Error 401 - Limpiando token');
        await removeToken();
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }
      
      if (response.status === 403) {
        // 403 puede ser por diferentes razones, verificar el mensaje
        const lowerMessage = errorMessage.toLowerCase();
        console.warn('[API] Error 403 - Analizando mensaje:', lowerMessage);
        
        if (lowerMessage.includes('token') || lowerMessage.includes('expired') || 
            lowerMessage.includes('expirado') || lowerMessage.includes('unauthorized') ||
            lowerMessage.includes('no autorizado') || lowerMessage.includes('acceso denegado') ||
            lowerMessage.includes('forbidden') || lowerMessage.includes('session')) {
          console.warn('[API] Error 403 relacionado con autenticación - Limpiando token');
          await removeToken();
          throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        }
        
        // Si es 403 pero no es por token, mostrar el error original con más detalles
        console.error('[API] Error 403 no relacionado con autenticación:', errorMessage);
        throw new Error(errorMessage || 'Acceso denegado. Verifica tus permisos.');
      }
      
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error: any) {
    // Si es un error de red u otro tipo
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('[API] Error de red:', error);
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
    
    if (error.message && !error.message.includes('Error')) {
      throw new Error(`Error de conexión: ${error.message}`);
    }
    
    throw error;
  }
};

