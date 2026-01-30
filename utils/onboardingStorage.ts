// Importar AsyncStorage de forma condicional
let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  // Si AsyncStorage no está disponible, usar localStorage para web
  AsyncStorage = null;
}

const ONBOARDING_DATA_KEY = 'onboarding_data';

export interface OnboardingAnswers {
  goal?: string; // 'lose', 'maintain', 'gain'
  activityLevel?: string; // 'low', 'medium', 'high'
  preference?: string; // 'normal', 'vegetarian', 'no-restrictions'
  meals?: string; // '2', '3', '4', '5'
  age?: number;
  weight?: number;
  height?: number;
}

// Guardar datos del onboarding
export const saveOnboardingData = async (data: OnboardingAnswers): Promise<void> => {
  try {
    const jsonData = JSON.stringify(data);
    // Verificar si estamos en web y localStorage está disponible
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ONBOARDING_DATA_KEY, jsonData);
    } else if (AsyncStorage) {
      await AsyncStorage.setItem(ONBOARDING_DATA_KEY, jsonData);
    } else {
      // Fallback: guardar en memoria (solo para la sesión actual)
      (global as any).__onboardingData = jsonData;
    }
    console.log('[OnboardingStorage] Datos guardados:', data);
  } catch (error) {
    console.error('[OnboardingStorage] Error al guardar datos:', error);
    // Si falla localStorage, intentar con memoria
    try {
      (global as any).__onboardingData = JSON.stringify(data);
    } catch (fallbackError) {
      console.error('[OnboardingStorage] Error en fallback:', fallbackError);
    }
  }
};

// Obtener datos del onboarding
export const getOnboardingData = async (): Promise<OnboardingAnswers | null> => {
  try {
    let jsonData: string | null = null;
    // Verificar si estamos en web y localStorage está disponible
    if (typeof window !== 'undefined' && window.localStorage) {
      jsonData = window.localStorage.getItem(ONBOARDING_DATA_KEY);
    } else if (AsyncStorage) {
      jsonData = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
    } else {
      // Fallback: obtener de memoria
      jsonData = (global as any).__onboardingData || null;
    }
    
    if (jsonData) {
      const data = JSON.parse(jsonData);
      console.log('[OnboardingStorage] Datos recuperados:', data);
      return data;
    }
    return null;
  } catch (error) {
    console.error('[OnboardingStorage] Error al obtener datos:', error);
    // Intentar obtener de memoria como fallback
    try {
      const memoryData = (global as any).__onboardingData;
      if (memoryData) {
        return JSON.parse(memoryData);
      }
    } catch (fallbackError) {
      console.error('[OnboardingStorage] Error en fallback:', fallbackError);
    }
    return null;
  }
};

// Limpiar datos del onboarding
export const clearOnboardingData = async (): Promise<void> => {
  try {
    // Verificar si estamos en web y localStorage está disponible
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(ONBOARDING_DATA_KEY);
    } else if (AsyncStorage) {
      await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
    } else {
      delete (global as any).__onboardingData;
    }
    // Siempre limpiar también de memoria como respaldo
    delete (global as any).__onboardingData;
    console.log('[OnboardingStorage] Datos limpiados');
  } catch (error) {
    console.error('[OnboardingStorage] Error al limpiar datos:', error);
    // Intentar limpiar de memoria como fallback
    try {
      delete (global as any).__onboardingData;
    } catch (fallbackError) {
      console.error('[OnboardingStorage] Error en fallback de limpieza:', fallbackError);
    }
  }
};

// Convertir respuestas del onboarding al formato del backend
// Siempre devuelve todos los campos con valores por defecto si no están presentes
export const convertOnboardingToBackend = (answers: Record<number, any>): {
  goal: 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_MUSCLE';
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  preference: 'NORMAL' | 'VEGETARIANO';
  meals: number;
  age: number;
  weight: number;
  height: number;
} => {
  const result: any = {
    // Valores por defecto para todos los campos
    goal: 'MAINTAIN_WEIGHT',
    activityLevel: 'LOW',
    preference: 'NORMAL',
    meals: 0,
    age: 0,
    weight: 0,
    height: 0,
  };

  // Pregunta 1: Objetivo (goal)
  if (answers[1]) {
    switch (answers[1]) {
      case 'lose':
        result.goal = 'LOSE_WEIGHT';
        break;
      case 'maintain':
        result.goal = 'MAINTAIN_WEIGHT';
        break;
      case 'gain':
        result.goal = 'GAIN_MUSCLE';
        break;
    }
  }

  // Pregunta 3: Formulario (age, weight, height)
  if (answers[3] && typeof answers[3] === 'object') {
    if (answers[3].age !== undefined && answers[3].age !== null) {
      result.age = Number(answers[3].age);
    }
    if (answers[3].weight !== undefined && answers[3].weight !== null) {
      result.weight = Number(answers[3].weight);
    }
    if (answers[3].height !== undefined && answers[3].height !== null) {
      result.height = Number(answers[3].height);
    }
  }

  // Pregunta 4: Actividad (activityLevel)
  if (answers[4]) {
    switch (answers[4]) {
      case 'low':
        result.activityLevel = 'LOW';
        break;
      case 'medium':
        result.activityLevel = 'MEDIUM';
        break;
      case 'high':
        result.activityLevel = 'HIGH';
        break;
    }
  }

  // Pregunta 5: Alimentación (preference) - Solo VEGETARIANO o NORMAL
  if (answers[5] === 'vegetarian') {
    result.preference = 'VEGETARIANO';
  } else {
    // 'normal', 'no-restrictions' o cualquier otro valor -> NORMAL
    result.preference = 'NORMAL';
  }

  // Pregunta 6: Comidas (meals)
  if (answers[6]) {
    const mealsNum = Number(answers[6]);
    if (!isNaN(mealsNum) && mealsNum >= 2 && mealsNum <= 5) {
      result.meals = mealsNum;
    }
  }

  console.log('[OnboardingStorage] Datos convertidos para backend:', result);
  return result;
};

