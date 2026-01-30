import { useCallback, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getMessage } from '@/constants/messages';
import { useAsyncState } from '@/hooks/useAsyncState';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { Recipe } from '@/services/recipeService';
import { handleRecipeServiceError, recipeService } from '@/services/recipeService';
import { showToastFrom } from '@/utils/showToast';

export default function RecipesScreen() {
  const { data: recipes, loading, error, status, execute, reset } = useAsyncState<Recipe[]>([]);
  const { isConnected } = useNetworkStatus();
  const errorToastShown = useRef(false);

  const loadRecipes = useCallback(async () => {
    if (isConnected === false) {
      showToastFrom.error.network();
      return;
    }
    await execute(async () => recipeService.getRecipes());
  }, [execute, isConnected]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  useEffect(() => {
    if (status === 'error' && error && !errorToastShown.current) {
      errorToastShown.current = true;
      handleRecipeServiceError(error);
    }
    if (status !== 'error') {
      errorToastShown.current = false;
    }
  }, [status, error]);

  const list = recipes ?? [];
  const showInitialLoading = status === 'loading' && list.length === 0;
  const showErrorState = status === 'error' && list.length === 0;

  if (showInitialLoading) {
    return (
      <ThemedView style={styles.container}>
        <LoadingOverlay
          visible={true}
          message={getMessage('info.loadingRecipes')}
        />
      </ThemedView>
    );
  }

  if (showErrorState) {
    const errorMessage = error?.message ?? getMessage('error.loadFailed');
    return (
      <ThemedView style={styles.container}>
        <ErrorState
          title="No se pudieron cargar las recetas"
          message={errorMessage}
          actionLabel="Reintentar"
          onAction={() => {
            reset();
            loadRecipes();
          }}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Mis Recetas</ThemedText>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadRecipes}
            disabled={loading}
          >
            <ThemedText type="link">Actualizar</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {loading && list.length > 0 && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner message={getMessage('info.refreshingRecipes')} size="small" />
          </View>
        )}

        {list.length === 0 && status === 'success' && (
          <ThemedView style={styles.emptyState}>
            <ThemedText>No tienes recetas guardadas aún.</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Las recetas que guardes aparecerán aquí.
            </ThemedText>
          </ThemedView>
        )}

        {list.map((recipe) => (
          <ThemedView key={recipe.id} style={styles.recipeCard}>
            <ThemedText type="subtitle">{recipe.name}</ThemedText>
            <ThemedText style={styles.description}>{recipe.description}</ThemedText>
            <ThemedView style={styles.meta}>
              <ThemedText style={styles.metaText}>{recipe.calories} cal</ThemedText>
              <ThemedText style={styles.metaText}>{recipe.prepTime} min</ThemedText>
              <ThemedText style={styles.metaText}>{recipe.servings} porciones</ThemedText>
            </ThemedView>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptySubtext: {
    opacity: 0.6,
    fontSize: 14,
  },
  recipeCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 8,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
