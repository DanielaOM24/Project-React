import { useAuth } from '@/contexts/AuthContext';
import { recipesAPI } from '@/services/api';
import { Recipe, TypeFood } from '@/types/recipes';
import { useEffect, useMemo, useState } from 'react';

export const useRecipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TypeFood | 'ALL'>('ALL');

  /**
   * Carga las recetas desde el backend
   * Filtra según las preferencias del usuario si está disponible
   */
  const fetchRecipes = async (typeFood?: TypeFood | 'ALL') => {
    try {
      setLoading(true);
      setError(null);

      // Obtener recetas del backend
      let allRecipes: Recipe[] = [];
      
      if (typeFood && typeFood !== 'ALL') {
        // Si hay un filtro específico, obtener solo ese tipo
        allRecipes = await recipesAPI.getRecipes(typeFood);
      } else {
        // Si es 'ALL', obtener todas las recetas haciendo múltiples peticiones
        // porque el backend requiere el parámetro typeFood siempre
        allRecipes = await recipesAPI.getAllRecipes();
      }

      // Filtrar según las preferencias del usuario
      // Nota: El backend debería hacer este filtrado automáticamente según el token del usuario
      // Por ahora, mostramos todas las recetas ya que el backend las filtra según las preferencias del usuario
      // Si el backend no filtra, aquí podríamos hacer un filtrado adicional si tuviéramos esa información en las recetas
      setRecipes(allRecipes);

      console.log('[useRecipes] Recetas cargadas:', allRecipes.length, 'para usuario:', user?.displayName);
    } catch (err: any) {
      console.error('[useRecipes] Error fetching recipes:', err);

      // Mensaje más específico según el tipo de error
      let errorMessage = 'No se pudieron cargar las recetas';
      
      if (err.message?.includes('conexión') || err.message?.includes('Network') || 
          err.message?.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (err.message?.includes('expirado') || err.message?.includes('autenticado') ||
                 err.message?.includes('sesión ha expirado') || err.message?.includes('No estás autenticado')) {
        errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
      } else if (err.message?.includes('typeFood') || err.message?.includes('Required request parameter')) {
        errorMessage = 'Error al cargar recetas. Por favor intenta nuevamente.';
        console.error('[useRecipes] Error relacionado con parámetros:', err.message);
      } else if (err.message?.includes('403') || err.message?.includes('Acceso denegado')) {
        errorMessage = 'No tienes permisos para acceder a las recetas. Verifica tu sesión.';
      } else if (err.message?.includes('500') || err.message?.includes('Error del servidor')) {
        errorMessage = 'Error del servidor. Por favor intenta más tarde.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      
      // Solo mostrar alerta si no es un error de sesión expirada (ese se maneja en otro lugar)
      if (!errorMessage.includes('sesión ha expirado') && !errorMessage.includes('autenticado')) {
        // No mostrar alerta para errores de conexión menores, solo actualizar el estado
        console.warn('[useRecipes] Error al cargar recetas:', errorMessage);
      }
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
   * Efecto para recargar recetas cuando cambia el usuario (por ejemplo, después de actualizar el perfil)
   * Esto asegura que las recetas se actualicen según las nuevas preferencias del usuario
   */
  useEffect(() => {
    if (user) {
      // Recargar recetas cuando el usuario cambia (por ejemplo, después de actualizar el perfil)
      console.log('[useRecipes] Usuario actualizado, recargando recetas...', {
        goal: user.goal,
        preference: user.preference,
        activityLevel: user.activityLevel,
      });
      // Usar el filtro actual para recargar
      const currentFilter = selectedFilter;
      fetchRecipes(currentFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.goal, user?.preference, user?.activityLevel]);

  /**
   * Filtrado local por texto de búsqueda
   * (el filtro por tipo ya se hace en el backend)
   */
  const filteredRecipes = useMemo(() => {
    if (!searchText.trim()) {
      return recipes;
    }

    return recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchText.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchText.toLowerCase())
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

