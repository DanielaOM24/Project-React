import api from './api';
import { Recipe, TypeFood } from '@/types/recipes';



export const recipesService = {


    getRecipes: async (typeFood?: TypeFood | 'ALL'): Promise<Recipe[]> => {
        try {
            const params: { typeFood?: TypeFood } = {};
            

            if (typeFood && typeFood !== 'ALL') {
                params.typeFood = typeFood;
            }

            console.log('Fetching recipes with params:', params);
            const response = await api.get<Recipe[]>('/recipes', { params });
            console.log('Recipes fetched successfully:', response.data?.length, 'recipes');
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener recetas:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
            });
            throw error;
        }
    },

    getRecipeById: async (id: string): Promise<Recipe> => {
        try {
            const response = await api.get<Recipe>(`/recipes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener receta ${id}:`, error);
            throw error;
        }
    },


    searchRecipes: async (query: string): Promise<Recipe[]> => {
        try {
            const response = await api.get<Recipe[]>('/recipes/search', {
                params: { q: query }
            });
            return response.data;
        } catch (error) {
            console.error('Error al buscar recetas:', error);
            throw error;
        }
    },
};

export default recipesService;
