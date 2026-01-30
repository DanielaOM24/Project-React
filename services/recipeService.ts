import { showToastFrom } from '@/utils/showToast';

export type Recipe = {
  id: string;
  name: string;
  description: string;
  calories: number;
  prepTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const recipeService = {
  async getRecipes(): Promise<Recipe[]> {
    await delay(1200);
    if (Math.random() < 0.1) {
      throw new Error('No se pudieron cargar las recetas');
    }
    return [
      {
        id: '1',
        name: 'Ensalada Mediterránea',
        description: 'Ensalada fresca con ingredientes del Mediterráneo',
        calories: 320,
        prepTime: 15,
        servings: 2,
        ingredients: ['Lechuga', 'Tomate', 'Pepino', 'Aceitunas', 'Queso feta', 'Aceite de oliva'],
        instructions: ['Lavar y cortar las verduras', 'Mezclar y aliñar'],
      },
      {
        id: '2',
        name: 'Salmón al Horno',
        description: 'Salmón con hierbas y limón',
        calories: 280,
        prepTime: 25,
        servings: 2,
        ingredients: ['Filete de salmón', 'Limón', 'Hierbas', 'Aceite', 'Sal'],
        instructions: ['Precalentar horno 180°C', 'Sazonar y hornear 20 min'],
      },
    ];
  },
};

export function handleRecipeServiceError(error: unknown): void {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('red') || message.includes('conexión') || message.includes('network')) {
    showToastFrom.error.network();
  } else if (message.includes('servidor') || message.includes('server')) {
    showToastFrom.error.serverDown();
  } else {
    showToastFrom.error.loadFailed();
  }
}
