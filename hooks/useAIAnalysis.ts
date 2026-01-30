import { aiService, handleAIServiceError, type AIAnalysis, type AnalyzeMealParams } from '@/services/aiService';
import { showToastFrom } from '@/utils/showToast';
import { useAsyncState } from './useAsyncState';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Hook personalizado para análisis de comidas con IA.
 * Maneja automáticamente loading states, errores y muestra feedback visual.
 *
 * @example
 * const { analyzeMeal, loading, error, analysis } = useAIAnalysis();
 *
 * const handleAnalyze = async () => {
 *   await analyzeMeal({ description: 'Ensalada con pollo' });
 * };
 */
export function useAIAnalysis() {
  const { data, loading, error, status, execute, reset } = useAsyncState<AIAnalysis>();
  const { isConnected } = useNetworkStatus();

  const analyzeMeal = async (params: AnalyzeMealParams) => {
    // Verificar conexión antes de analizar
    if (isConnected === false) {
      showToastFrom.error.network();
      return null;
    }

    // Mostrar toast de loading específico para IA
    showToastFrom.info.aiThinking();

    const result = await execute(async () => {
      const analysis = await aiService.analyzeMeal(params);
      return analysis;
    });

    if (result) {
      // Mostrar toast de éxito
      showToastFrom.success.aiResponse();
    } else if (error) {
      // El error ya fue manejado por execute
      handleAIServiceError(error);
    }

    return result;
  };

  return {
    analyzeMeal,
    analysis: data,
    loading,
    error,
    status,
    reset,
  };
}
