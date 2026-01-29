import RecipeList from '@/components/recipes/RecipeList';
import { useRecipes } from '@/hooks/useRecipes';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TypeFood } from '@/types/recipes';

const FILTERS = [
    { id: 'ALL', label: 'Todos' },
    { id: 'BREAKFAST', label: 'Desayuno' },
    { id: 'LUNCH', label: 'Almuerzo' },
    { id: 'DINNER', label: 'Cena' },
    { id: 'SNACK', label: 'Snacks' },
];

export default function RecipesScreen() {
    const {
        recipes,
        loading,
        error,
        searchText,
        setSearchText,
        selectedFilter,
        setSelectedFilter,
        refetch
    } = useRecipes();

    // Componente de carga inicial
    if (loading && recipes.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Cargando recetas...</Text>
                    <Text style={styles.loadingSubtext}>
                        (Puede tardar hasta 30s si el servidor está despertando)
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Componente de error
    if (error && recipes.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={refetch}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar recetas..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {/* Filtros horizontales */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                {FILTERS.map((filter) => (
                    <Pressable
                        key={filter.id}
                        style={[
                            styles.filterButton,
                            selectedFilter === filter.id && styles.filterButtonActive
                        ]}
                        onPress={() => setSelectedFilter(filter.id as TypeFood)}
                    >
                        <Text style={[
                            styles.filterText,
                            selectedFilter === filter.id && styles.filterTextActive
                        ]}>
                            {filter.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Lista de recetas con pull-to-refresh */}
            <RecipeList
                recipes={recipes}
                onRecipePress={(recipe) => {
                    router.push(`/recipe/${recipe.id}`);
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refetch}
                        colors={['#4CAF50']}
                        tintColor="#4CAF50"
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        color: '#666',
    },
    loadingSubtext: {
        marginTop: 8,
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchContainer: {
        padding: 16,
    },
    searchInput: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    filtersContainer: {
        marginBottom: 8,
    },
    filtersContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    filterButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        marginRight: 8,
        marginTop: 8
    },
    filterButtonActive: {
        backgroundColor: '#4CAF50',
    },
    filterText: {
        fontSize: 14,
        color: '#666',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
