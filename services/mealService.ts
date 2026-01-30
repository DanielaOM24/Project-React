import { showToastFrom } from '@/utils/showToast';

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: Date;
};

export type SaveMealParams = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

/**
 * Simula un delay de red
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Servicio para manejar operaciones relacionadas con comidas.
 * En producción, aquí irían las llamadas reales a tu API.
 */
export const mealService = {
  /**
   * Guarda una comida en el servidor.
   * Maneja errores de red y del servidor.
   */
  async saveMeal(params: SaveMealParams): Promise<Meal> {
    // Simular delay de red
    await delay(1500);

    // Simular error de red ocasionalmente (10% de probabilidad)
    if (Math.random() < 0.1) {
      throw new NetworkError('No se pudo conectar al servidor');
    }

    // Simular error del servidor ocasionalmente (5% de probabilidad)
    if (Math.random() < 0.05) {
      throw new ServerError('El servidor no está disponible en este momento');
    }

    // Validar campos requeridos
    if (!params.name || params.name.trim().length === 0) {
      throw new ValidationError('El nombre de la comida es requerido');
    }

    if (params.calories < 0) {
      throw new ValidationError('Las calorías no pueden ser negativas');
    }

    // Simular éxito
    const meal: Meal = {
      id: `meal-${Date.now()}`,
      name: params.name,
      calories: params.calories,
      protein: params.protein,
      carbs: params.carbs,
      fat: params.fat,
      timestamp: new Date(),
    };

    return meal;
  },

  /**
   * Obtiene todas las comidas guardadas.
   */
  async getMeals(): Promise<Meal[]> {
    await delay(1000);

    // Simular error de red ocasionalmente
    if (Math.random() < 0.1) {
      throw new NetworkError('No se pudieron cargar las comidas');
    }

    // Retornar comidas de ejemplo
    return [
      {
        id: 'meal-1',
        name: 'Ensalada César',
        calories: 350,
        protein: 15,
        carbs: 25,
        fat: 20,
        timestamp: new Date(),
      },
      {
        id: 'meal-2',
        name: 'Pollo a la plancha',
        calories: 250,
        protein: 30,
        carbs: 5,
        fat: 10,
        timestamp: new Date(),
      },
    ];
  },
};

/**
 * Clases de error personalizadas para mejor manejo
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Helper para manejar errores del servicio de comidas y mostrar toasts apropiados
 */
export function handleMealServiceError(error: unknown): void {
  if (error instanceof NetworkError) {
    showToastFrom.error.network();
  } else if (error instanceof ServerError) {
    showToastFrom.error.serverDown();
  } else if (error instanceof ValidationError) {
    showToastFrom.error.invalidFields(error.message);
  } else {
    showToastFrom.error.saveFailed();
  }
}
