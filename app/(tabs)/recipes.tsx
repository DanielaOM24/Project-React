// Recipes Screen Component

import MainBottomTabs from '@/components/MainBottomTabs';
import RecipeList from '@/components/recipes/RecipeList';
import { useRecipes } from '@/hooks/useRecipes';
import { colors, radius, spacing, typography } from '@/styles/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Constants
const FILTERS = [
  { id: 'ALL' as const, label: 'Todos', icon: 'grid-outline' },
  { id: 'BREAKFAST' as const, label: 'Desayuno', icon: 'sunny-outline' },
  { id: 'LUNCH' as const, label: 'Almuerzo', icon: 'restaurant-outline' },
  { id: 'DINNER' as const, label: 'Cena', icon: 'moon-outline' },
  { id: 'SNACK' as const, label: 'Snacks', icon: 'cafe-outline' },
];

export default function RecipesScreen() {
  // Component State
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    recipes,
    loading,
    error,
    searchText,
    setSearchText,
    selectedFilter,
    setSelectedFilter,
    refetch,
  } = useRecipes();

  // Render States
  if (loading && recipes.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.greenprimary} />
          <Text style={styles.loadingText}>Cargando recetas...</Text>
        </View>
        <MainBottomTabs activeTab="recipes" />
      </View>
    );
  }

  if (error && recipes.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </Pressable>
        </View>
        <MainBottomTabs activeTab="recipes" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recetas</Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textdark} style={[styles.searchIcon, { opacity: 0.7 }]} />
        <TextInput
          style={[styles.searchInput, { opacity: 0.5 }]}
          placeholder="Buscar recetas..."
          placeholderTextColor={colors.textdark + '80'}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.textdark} style={{ opacity: 0.5 }} />
          </Pressable>
        )}
      </View>

      {/* Filtros horizontales */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}>
        {FILTERS.map((filter) => {
          const isActive = selectedFilter === filter.id;
          return (
            <Pressable
              key={filter.id}
              style={[styles.filterButton, isActive && styles.filterButtonActive]}
              onPress={() => setSelectedFilter(filter.id)}>
              <Ionicons
                name={filter.icon as any}
                size={18}
                color={isActive ? colors.darkgreen : colors.textdark}
                style={{ opacity: isActive ? 1 : 0.7 }}
              />
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Lista de recetas */}
      <RecipeList
        recipes={recipes}
        onRecipePress={(recipe) => {
          // Pasar la receta completa como parámetro para evitar petición adicional
          router.push({
            pathname: '/recipe/[id]',
            params: { 
              id: recipe.id,
              recipeData: JSON.stringify(recipe) // Pasar datos como string
            }
          } as any);
        }}
        refreshing={loading}
        onRefresh={refetch}
      />

      <MainBottomTabs activeTab="recipes" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.medium,
    color: colors.textdark,
    opacity: 0.7,
  },
  loadingSubtext: {
    marginTop: spacing.sm,
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.5,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.greenprimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  retryButtonText: {
    color: colors.primaryText,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.title + 6,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.whiteOverlay,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  filtersContainer: {
    marginBottom: spacing.sm,
    maxHeight: 60,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.whiteOverlay,
    marginRight: spacing.sm,
    minHeight: 40,
  },
  filterButtonActive: {
    backgroundColor: colors.greenprimary,
    shadowColor: colors.greenprimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  filterText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.darkgreen,
    marginLeft: spacing.xs,
  },
  filterTextActive: {
    color: colors.darkgreen,
    fontFamily: typography.fontfamily.bold,
  },
});
