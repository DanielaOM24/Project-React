import { apiRequest } from './apiRequest';
import { Recipe, TypeFood } from '@/types/recipes';

export const recipesAPI = {
  /**
   * Obtiene recetas del backend
   * @param typeFood - Tipo de comida (BREAKFAST, LUNCH, DINNER, SNACK) - REQUERIDO
   * @returns Lista de recetas
   */
  getRecipes: async (typeFood: TypeFood): Promise<Recipe[]> => {
    try {
      // El backend requiere el parámetro typeFood siempre
      const endpoint = `/api/recipes?typeFood=${typeFood}`;

      console.log('[RecipesAPI] Obteniendo recetas:', { endpoint, typeFood });
      
      const response = await apiRequest(endpoint, {
        method: 'GET',
      });

      // El backend devuelve un array directamente
      const recipes = Array.isArray(response) ? response : [];
      
      console.log('[RecipesAPI] Recetas obtenidas:', recipes.length, 'para', typeFood);
      
      return recipes;
    } catch (error: any) {
      console.error('[RecipesAPI] Error al obtener recetas:', {
        message: error.message,
        typeFood,
      });
      throw error;
    }
  },

  /**
   * Obtiene todas las recetas haciendo múltiples peticiones (una por cada tipo)
   * @returns Lista de todas las recetas
   */
  getAllRecipes: async (): Promise<Recipe[]> => {
    try {
      const types: TypeFood[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
      
      console.log('[RecipesAPI] Obteniendo todas las recetas (múltiples peticiones)');
      
      // Hacer peticiones en paralelo para todos los tipos
      const promises = types.map(async (type) => {
        const endpoint = `/api/recipes?typeFood=${type}`;
        const response = await apiRequest(endpoint, { method: 'GET' });
        return Array.isArray(response) ? response : [];
      });
      
      const results = await Promise.all(promises);
      
      // Combinar todos los resultados y eliminar duplicados por ID
      const allRecipes = results.flat();
      const uniqueRecipes = Array.from(
        new Map(allRecipes.map(recipe => [recipe.id, recipe])).values()
      );
      
      console.log('[RecipesAPI] Total de recetas obtenidas:', uniqueRecipes.length);
      
      return uniqueRecipes;
    } catch (error: any) {
      console.error('[RecipesAPI] Error al obtener todas las recetas:', error);
      throw error;
    }
  },

  /**
   * Obtiene una receta por ID
   * @param id - ID de la receta
   * @returns Receta
   */
  getRecipeById: async (id: string): Promise<Recipe> => {
    try {
      const endpoint = `/api/recipes/${id}`;
      
      console.log('[RecipesAPI] Obteniendo receta por ID:', id);
      
      const response = await apiRequest(endpoint, {
        method: 'GET',
      });

      return response;
    } catch (error: any) {
      console.error(`[RecipesAPI] Error al obtener receta ${id}:`, error);
      throw error;
    }
  },
};

