import { ScrollView, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Recipe } from '@/types/recipes';
import { useEffect, useState } from 'react';
import { recipesService } from '@/services/recipes.service';
import { showToastFrom } from '@/utils/showToast';
import { RECIPES_MOCK } from '@/data/recipes.mock';

// MODO DESARROLLO: Cambia a false cuando la autenticación esté lista
const USE_MOCK_DATA = true;

export default function RecipeDetailScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                setLoading(true);
                
                if (USE_MOCK_DATA) {
                    // Simular delay de red
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    // Buscar receta en datos mock
                    const mockRecipe = RECIPES_MOCK.find(r => r.id === id);
                    if (mockRecipe) {
                        setRecipe(mockRecipe);
                        console.log('Usando datos MOCK para receta:', mockRecipe.name);
                    } else {
                        setError(true);
                    }
                } else {
                    // Usar API real
                    const data = await recipesService.getRecipeById(id as string);
                    setRecipe(data);
                }
            } catch (err) {
                console.error('Error fetching recipe:', err);
                setError(true);
                showToastFrom.error.network();
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRecipe();
        }
    }, [id]);

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Cargando receta...</Text>
            </View>
        );
    }

    if (error || !recipe) {
        return (
            <View style={[styles.container, styles.centerContent]}>
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
                    <Image
                        source={{ uri: recipe.image }}
                        style={styles.heroImage}
                    />
                    {/* Botón cerrar */}
                    <Pressable
                        style={[styles.closeButton, { top: insets.top + 10 }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="close" size={24} color="#333" />
                    </Pressable>
                </View>

                {/* Contenido */}
                <View style={styles.content}>
                    {/* Tags */}
                    <View style={styles.tagsContainer}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>Alta en proteína</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>Bajo en grasas</Text>
                        </View>
                    </View>

                    {/* Título */}
                    <Text style={styles.title}>{recipe.name}</Text>

                    {/* Descripción */}
                    <Text style={styles.description}>{recipe.description}</Text>

                    {/* Info Cards */}
                    <View style={styles.infoContainer}>
                        <View style={styles.infoCard}>
                            <Ionicons name="time-outline" size={24} color="#4CAF50" />
                            <Text style={styles.infoValue}>{recipe.time} min</Text>
                        </View>
                        <View style={styles.infoCard}>
                            <Ionicons name="people-outline" size={24} color="#4CAF50" />
                            <Text style={styles.infoValue}>{recipe.portion} porc.</Text>
                        </View>
                        <View style={styles.infoCard}>
                            <Ionicons name="flame-outline" size={24} color="#4CAF50" />
                            <Text style={styles.infoValue}>{recipe.calories} kcal</Text>
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
        backgroundColor: '#fff',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    content: {
        padding: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    tag: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: '600',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 20,
    },
    infoContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionNumberText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    ingredientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    ingredientName: {
        fontSize: 14,
        color: '#333',
    },
    ingredientQuantity: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
    },
    stepItem: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});
