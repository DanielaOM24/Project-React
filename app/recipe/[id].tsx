// Recipe Detail Screen Component

import { recipesAPI } from '@/services/api';
import { colors, radius, spacing, typography } from '@/styles/designSystem';
import { Recipe } from '@/types/recipes';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RecipeDetailScreen() {
  // Component State
  const { id, recipeData } = useLocalSearchParams<{ id: string; recipeData?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Effects
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        // Primero intentar usar los datos pasados como parámetro (más rápido)
        if (recipeData) {
          try {
            const parsedRecipe = JSON.parse(recipeData) as Recipe;
            if (parsedRecipe && parsedRecipe.id === id) {
              setRecipe(parsedRecipe);
              console.log('[RecipeDetail] Receta obtenida de parámetros:', parsedRecipe.name);
              setLoading(false);
              return;
            }
          } catch (parseError) {
            console.warn('[RecipeDetail] Error al parsear recipeData:', parseError);
          }
        }

        // Si no hay datos en parámetros, intentar obtener del backend
        try {
          const data = await recipesAPI.getRecipeById(id);
          setRecipe(data);
          console.log('[RecipeDetail] Receta obtenida del backend:', data.name);
        } catch (backendError: any) {
          console.warn('[RecipeDetail] Error al obtener del backend, intentando obtener de la lista:', backendError.message);
          
          // Si falla, intentar obtener todas las recetas y buscar por ID
          // Esto es un fallback en caso de que el endpoint por ID no exista
          try {
            const allRecipes = await recipesAPI.getAllRecipes();
            const foundRecipe = allRecipes.find(r => r.id === id);
            
            if (foundRecipe) {
              setRecipe(foundRecipe);
              console.log('[RecipeDetail] Receta encontrada en la lista:', foundRecipe.name);
            } else {
              throw new Error('Receta no encontrada');
            }
          } catch (fallbackError: any) {
            console.error('[RecipeDetail] Error en fallback:', fallbackError);
            throw backendError; // Lanzar el error original
          }
        }
      } catch (err: any) {
        console.error('[RecipeDetail] Error fetching recipe:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, recipeData]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.greenprimary} />
        <Text style={styles.loadingText}>Cargando receta...</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>No se pudo cargar la receta</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagen Hero */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: recipe.image }} style={styles.heroImage} contentFit="cover" />
          {/* Botón cerrar */}
          <Pressable
            style={[styles.closeButton, { top: insets.top + 10 }]}
            onPress={() => router.back()}>
            <View style={styles.closeButtonInner}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </View>
          </Pressable>
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          {/* Tipo de comida */}
          <View style={styles.typeContainer}>
            <View style={styles.typeBadge}>
              <Ionicons name="restaurant-outline" size={16} color={colors.darkgreen} />
              <Text style={styles.typeText}>{recipe.typeFood}</Text>
            </View>
          </View>

          {/* Título */}
          <Text style={styles.title}>{recipe.name}</Text>

          {/* Descripción */}
          <Text style={styles.description}>{recipe.description}</Text>

          {/* Info Cards */}
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={24} color={colors.greenprimary} />
              <Text style={styles.infoValue}>{recipe.time} min</Text>
              <Text style={styles.infoLabel}>Tiempo</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="people-outline" size={24} color={colors.greenprimary} />
              <Text style={styles.infoValue}>{recipe.portion}</Text>
              <Text style={styles.infoLabel}>Porciones</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="flame-outline" size={24} color={colors.greenprimary} />
              <Text style={styles.infoValue}>{recipe.calories}</Text>
              <Text style={styles.infoLabel}>Calorías</Text>
            </View>
          </View>

          {/* Ingredientes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>1</Text>
              </View>
              <Text style={styles.sectionTitle}>Ingredientes</Text>
            </View>

            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientDot} />
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientQuantity}>{ingredient.quantity}</Text>
              </View>
            ))}
          </View>

          {/* Pasos de preparación */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>2</Text>
              </View>
              <Text style={styles.sectionTitle}>Preparación</Text>
            </View>

            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
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
  errorText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.greenprimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  backButtonText: {
    color: colors.darkgreen,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    padding: spacing.lg,
  },
  typeContainer: {
    marginBottom: spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.greenprimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    gap: spacing.xs,
  },
  typeText: {
    color: colors.darkgreen,
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.semibold,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: typography.size.title + 2,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.whiteOverlay,
  },
  infoValue: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
  },
  infoLabel: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.medium,
    color: colors.textdark,
    opacity: 0.7,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.greenprimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionNumberText: {
    color: colors.darkgreen,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.bold,
  },
  sectionTitle: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlay,
    gap: spacing.sm,
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.greenprimary,
  },
  ingredientName: {
    flex: 1,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
  },
  ingredientQuantity: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.greenprimary,
  },
  stepItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.greenprimary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: colors.darkgreen,
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.bold,
  },
  stepText: {
    flex: 1,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    lineHeight: 24,
  },
});

