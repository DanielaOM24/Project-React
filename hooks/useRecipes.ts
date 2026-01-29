import { useEffect, useState, useMemo } from 'react';
import { Recipe, TypeFood } from '@/types/recipes';
import { recipesService } from '@/services/recipes.service';
import { showToastFrom } from '@/utils/showToast';
import { RECIPES_MOCK } from '@/data/recipes.mock';

// MODO DESARROLLO: Cambia a false cuando la autenticación esté lista
const USE_MOCK_DATA = true;

export const useRecipes = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<TypeFood | 'ALL'>('ALL');

    /**
     * Carga las recetas desde el backend o datos mock
     */
    const fetchRecipes = async (typeFood?: TypeFood | 'ALL') => {
        try {
            setLoading(true);
            setError(null);

            if (USE_MOCK_DATA) {
                // Simular delay de red
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Filtrar datos mock por tipo
                let filtered = RECIPES_MOCK;
                if (typeFood && typeFood !== 'ALL') {
                    filtered = RECIPES_MOCK.filter(r => r.typeFood === typeFood);
                }
                
                setRecipes(filtered);
                console.log('Usando datos MOCK:', filtered.length, 'recetas');
            } else {
                // Usar API real
                const data = await recipesService.getRecipes(typeFood);
                setRecipes(data);
            }
        } catch (err: any) {
            console.error('Error fetching recipes:', err);

            // Mensaje más específico según el tipo de error
            if (err.code === 'ECONNABORTED') {
                setError('El servidor está cargando, intenta de nuevo en unos segundos');
            } else if (err.message?.includes('Network')) {
                setError('Sin conexión a internet');
            } else if (err.response?.status === 404) {
                setError('Endpoint no encontrado');
            } else {
                setError('No se pudieron cargar las recetas');
            }

            showToastFrom.error.network();
        } finally {
            setLoading(false);
        }
    };

    /**
     * Efecto para cargar recetas cuando cambia el filtro
     */
    useEffect(() => {
        fetchRecipes(selectedFilter);
    }, [selectedFilter]);

    /**
     * Filtrado local por texto de búsqueda
     * (el filtro por tipo ya se hace en el backend)
     */
    const filteredRecipes = useMemo(() => {
        if (!searchText.trim()) {
            return recipes;
        }

        return recipes.filter(recipe =>
            recipe.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [recipes, searchText]);

    /**
     * Recargar recetas manualmente
     */
    const refetch = () => {
        fetchRecipes(selectedFilter);
    };

    return {
        recipes: filteredRecipes,
        loading,
        error,
        searchText,
        setSearchText,
        selectedFilter,
        setSelectedFilter,
        refetch,
    };
};
