import MainBottomTabs from '@/components/MainBottomTabs';
import RecipeList from '@/components/recipes/RecipeList';
import { useRecipes } from '@/hooks/useRecipes';
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

const FILTERS = [
  { id: 'ALL' as const, label: 'Todos', icon: 'grid-outline' },
  { id: 'BREAKFAST' as const, label: 'Desayuno', icon: 'sunny-outline' },
  { id: 'LUNCH' as const, label: 'Almuerzo', icon: 'restaurant-outline' },
  { id: 'DINNER' as const, label: 'Cena', icon: 'moon-outline' },
  { id: 'SNACK' as const, label: 'Snacks', icon: 'cafe-outline' },
];

export default function RecipesScreen() {
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

  // Componente de carga inicial
  if (loading && recipes.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A4D65E" />
          <Text style={styles.loadingText}>Cargando recetas...</Text>
          <Text style={styles.loadingSubtext}>
            (Puede tardar hasta 30s si el servidor está despertando)
          </Text>
        </View>
        <MainBottomTabs activeTab="recipes" />
      </View>
    );
  }

  // Componente de error
  if (error && recipes.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
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
        <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar recetas..."
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
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
                color={isActive ? '#FFFFFF' : '#4B5563'}
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#A4D65E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 4,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  filtersContainer: {
    marginBottom: 12,
    maxHeight: 60,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    minHeight: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#A4D65E',
    shadowColor: '#A4D65E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  filterText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '600',
    marginLeft: 6,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
