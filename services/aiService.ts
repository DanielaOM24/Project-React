import { showToastFrom } from '@/utils/showToast';

export type AIAnalysis = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  suggestions: string[];
};

export type AnalyzeMealParams = {
  imageUrl?: string;
  description?: string;
};

/**
 * Simula un delay de red (la IA puede tardar más)
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Servicio para interactuar con la IA de análisis nutricional.
 * En producción, aquí irían las llamadas reales a tu API de IA.
 */
export const aiService = {
  /**
   * Analiza una comida usando IA.
   * Puede recibir una imagen o descripción de texto.
   */
  async analyzeMeal(params: AnalyzeMealParams): Promise<AIAnalysis> {
    // Simular delay de procesamiento de IA (más largo que otras operaciones)
    await delay(2500);

    // Simular error de red ocasionalmente (15% de probabilidad)
    if (Math.random() < 0.15) {
      throw new NetworkError('No se pudo conectar con el servicio de IA');
    }

    // Simular que la IA no entiende la solicitud (10% de probabilidad)
    if (Math.random() < 0.1) {
      throw new AIUnderstandingError('No pudimos identificar la comida en la imagen');
    }

    // Simular timeout ocasionalmente (5% de probabilidad)
    if (Math.random() < 0.05) {
      throw new TimeoutError('El análisis tardó demasiado');
    }

    // Validar que haya al menos imagen o descripción
    if (!params.imageUrl && !params.description) {
      throw new ValidationError('Se requiere una imagen o descripción de la comida');
    }

    // Simular respuesta exitosa de la IA
    const analysis: AIAnalysis = {
      calories: 450,
      protein: 25,
      carbs: 50,
      fat: 15,
      ingredients: ['Pollo', 'Arroz', 'Verduras', 'Aceite de oliva'],
      suggestions: [
        'Considera agregar más proteína',
        'Esta comida tiene un buen balance nutricional',
      ],
    };

    return analysis;
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

export class AIUnderstandingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIUnderstandingError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Helper para manejar errores del servicio de IA y mostrar toasts apropiados
 */
export function handleAIServiceError(error: unknown): void {
  if (error instanceof NetworkError) {
    showToastFrom.error.network();
  } else if (error instanceof AIUnderstandingError) {
    showToastFrom.error.aiNotUnderstood();
  } else if (error instanceof TimeoutError) {
    showToastFrom.error.timeout();
  } else if (error instanceof ValidationError) {
    showToastFrom.error.invalidFields(error.message);
  } else {
    showToastFrom.error.aiNoResponse();
  }
}
