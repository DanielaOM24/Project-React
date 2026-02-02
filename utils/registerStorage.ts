// Importar AsyncStorage de forma condicional
let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  AsyncStorage = null;
}

const REGISTER_DATA_KEY = 'pending_register_data';

export interface PendingRegisterData {
  displayName: string;
  email: string;
  password: string;
}

// Guardar datos temporales de registro
export const savePendingRegisterData = async (data: PendingRegisterData): Promise<void> => {
  try {
    const jsonData = JSON.stringify(data);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(REGISTER_DATA_KEY, jsonData);
    } else if (AsyncStorage) {
      await AsyncStorage.setItem(REGISTER_DATA_KEY, jsonData);
    } else {
      (global as any).__pendingRegisterData = jsonData;
    }
    console.log('[RegisterStorage] Datos de registro guardados temporalmente');
  } catch (error) {
    console.error('[RegisterStorage] Error al guardar datos:', error);
    try {
      (global as any).__pendingRegisterData = JSON.stringify(data);
    } catch (fallbackError) {
      console.error('[RegisterStorage] Error en fallback:', fallbackError);
    }
  }
};

// Obtener datos temporales de registro
export const getPendingRegisterData = async (): Promise<PendingRegisterData | null> => {
  try {
    let jsonData: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      jsonData = window.localStorage.getItem(REGISTER_DATA_KEY);
    } else if (AsyncStorage) {
      jsonData = await AsyncStorage.getItem(REGISTER_DATA_KEY);
    } else {
      jsonData = (global as any).__pendingRegisterData || null;
    }
    
    if (jsonData) {
      const data = JSON.parse(jsonData);
      console.log('[RegisterStorage] Datos de registro recuperados');
      return data;
    }
    return null;
  } catch (error) {
    console.error('[RegisterStorage] Error al obtener datos:', error);
    try {
      const memoryData = (global as any).__pendingRegisterData;
      if (memoryData) {
        return JSON.parse(memoryData);
      }
    } catch (fallbackError) {
      console.error('[RegisterStorage] Error en fallback:', fallbackError);
    }
    return null;
  }
};

// Limpiar datos temporales de registro
export const clearPendingRegisterData = async (): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(REGISTER_DATA_KEY);
    } else if (AsyncStorage) {
      await AsyncStorage.removeItem(REGISTER_DATA_KEY);
    }
    delete (global as any).__pendingRegisterData;
    console.log('[RegisterStorage] Datos de registro limpiados');
  } catch (error) {
    console.error('[RegisterStorage] Error al limpiar datos:', error);
    try {
      delete (global as any).__pendingRegisterData;
    } catch (fallbackError) {
      console.error('[RegisterStorage] Error en fallback de limpieza:', fallbackError);
    }
  }
};

