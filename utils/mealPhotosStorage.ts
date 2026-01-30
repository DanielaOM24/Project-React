// Importar AsyncStorage de forma condicional
let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  // Si AsyncStorage no está disponible, usar localStorage para web
  AsyncStorage = null;
}

const MEAL_PHOTOS_KEY = 'meal_photos';

export interface MealPhoto {
  id: string;
  uri: string;
  timestamp: number;
}

// Guardar fotos de comidas
export const saveMealPhotos = async (photos: MealPhoto[]): Promise<void> => {
  try {
    const jsonData = JSON.stringify(photos);
    // Verificar si estamos en web y localStorage está disponible
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(MEAL_PHOTOS_KEY, jsonData);
    } else if (AsyncStorage) {
      await AsyncStorage.setItem(MEAL_PHOTOS_KEY, jsonData);
    } else {
      // Fallback a memoria (solo para desarrollo)
      console.warn('[MealPhotosStorage] No hay almacenamiento disponible, usando memoria');
      (global as any).__mealPhotosStorage = jsonData;
    }
  } catch (error) {
    console.error('[MealPhotosStorage] Error al guardar fotos:', error);
    throw error;
  }
};

// Obtener fotos de comidas
export const getMealPhotos = async (): Promise<MealPhoto[]> => {
  try {
    let jsonData: string | null = null;

    // Verificar si estamos en web y localStorage está disponible
    if (typeof window !== 'undefined' && window.localStorage) {
      jsonData = window.localStorage.getItem(MEAL_PHOTOS_KEY);
    } else if (AsyncStorage) {
      jsonData = await AsyncStorage.getItem(MEAL_PHOTOS_KEY);
    } else {
      // Fallback a memoria (solo para desarrollo)
      jsonData = (global as any).__mealPhotosStorage || null;
    }

    if (!jsonData) {
      return [];
    }

    const photos = JSON.parse(jsonData);
    return Array.isArray(photos) ? photos : [];
  } catch (error) {
    console.error('[MealPhotosStorage] Error al obtener fotos:', error);
    return [];
  }
};

// Agregar una nueva foto
export const addMealPhoto = async (uri: string): Promise<MealPhoto> => {
  try {
    const existingPhotos = await getMealPhotos();
    const newPhoto: MealPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uri,
      timestamp: Date.now(),
    };
    const updatedPhotos = [newPhoto, ...existingPhotos];
    await saveMealPhotos(updatedPhotos);
    return newPhoto;
  } catch (error) {
    console.error('[MealPhotosStorage] Error al agregar foto:', error);
    throw error;
  }
};

// Eliminar una foto
export const removeMealPhoto = async (id: string): Promise<void> => {
  try {
    const existingPhotos = await getMealPhotos();
    const updatedPhotos = existingPhotos.filter((photo) => photo.id !== id);
    await saveMealPhotos(updatedPhotos);
  } catch (error) {
    console.error('[MealPhotosStorage] Error al eliminar foto:', error);
    throw error;
  }
};

// Limpiar todas las fotos
export const clearMealPhotos = async (): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(MEAL_PHOTOS_KEY);
    } else if (AsyncStorage) {
      await AsyncStorage.removeItem(MEAL_PHOTOS_KEY);
    } else {
      delete (global as any).__mealPhotosStorage;
    }
  } catch (error) {
    console.error('[MealPhotosStorage] Error al limpiar fotos:', error);
    throw error;
  }
};

