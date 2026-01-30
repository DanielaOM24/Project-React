import { handleMealServiceError, mealService, type Meal, type SaveMealParams } from '@/services/mealService';
import { showToastFrom } from '@/utils/showToast';
import { useAsyncState } from './useAsyncState';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Hook personalizado para el registro de comidas.
 * Maneja automáticamente loading states, errores y validación de red.
 *
 * @example
 * const { saveMeal, loading, error, data } = useMealRegistration();
 *
 * const handleSave = async () => {
 *   await saveMeal({
 *     name: 'Ensalada',
 *     calories: 300,
 *     protein: 15,
 *     carbs: 20,
 *     fat: 10,
 *   });
 * };
 */
export function useMealRegistration() {
  const { data, loading, error, status, execute, reset } = useAsyncState<Meal>();
  const { isConnected } = useNetworkStatus();

  const saveMeal = async (params: SaveMealParams) => {
    // Verificar conexión antes de intentar guardar
    if (isConnected === false) {
      showToastFrom.error.network();
      return null;
    }

    // Mostrar toast de loading
    showToastFrom.info.savingMeal();

    const result = await execute(async () => {
      const meal = await mealService.saveMeal(params);
      return meal;
    });

    if (result) {
      // Mostrar toast de éxito
      showToastFrom.success.mealRegistered();
    } else if (error) {
      // El error ya fue manejado por execute, pero podemos agregar lógica adicional
      handleMealServiceError(error);
    }

    return result;
  };

  return {
    saveMeal,
    meal: data,
    loading,
    error,
    status,
    reset,
  };
}
