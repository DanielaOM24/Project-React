// Variable para almacenar el token en memoria (para React Native)
let tokenInMemory: string | null = null;

// Función para obtener el token almacenado
export const getToken = async (): Promise<string | null> => {
  if (tokenInMemory) {
    return tokenInMemory;
  }
  
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = window.localStorage.getItem('authToken');
    if (token) {
      tokenInMemory = token;
    }
    return token;
  }
  
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      tokenInMemory = token;
    }
    return token;
  } catch (error) {
    return tokenInMemory;
  }
};

// Función para guardar el token
export const saveToken = async (accessToken: string, refreshToken?: string): Promise<void> => {
  // Guardar primero en memoria para acceso inmediato
  tokenInMemory = accessToken;
  console.log('[saveToken] Guardando token en memoria:', accessToken.substring(0, 20) + '...');
  
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('authToken', accessToken);
      if (refreshToken) {
        window.localStorage.setItem('refreshToken', refreshToken);
      }
      console.log('[saveToken] Token guardado en localStorage');
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('authToken', accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }
      console.log('[saveToken] Token guardado en AsyncStorage');
    }
    
    // Verificar que se guardó correctamente
    const verifyToken = await getToken();
    if (!verifyToken || verifyToken !== accessToken) {
      console.warn('[saveToken] Advertencia: Token no se verificó correctamente, asegurando en memoria');
      tokenInMemory = accessToken;
    } else {
      console.log('[saveToken] Token verificado correctamente');
    }
  } catch (error) {
    console.error('[saveToken] Error al guardar token:', error);
    // Si hay error, asegurar que al menos esté en memoria
    tokenInMemory = accessToken;
  }
};

// Función para eliminar el token
export const removeToken = async (): Promise<void> => {
  tokenInMemory = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('refreshToken');
  } else {
    try {
      // Para React Native
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      // Si AsyncStorage no está disponible, solo limpiamos memoria
      console.warn('AsyncStorage no disponible');
    }
  }
};

// Función interna para obtener el token en memoria (usada por apiRequest)
export const getTokenInMemory = (): string | null => {
  return tokenInMemory;
};

// Función interna para establecer el token en memoria (usada por authAPI)
export const setTokenInMemory = (token: string): void => {
  tokenInMemory = token;
};

