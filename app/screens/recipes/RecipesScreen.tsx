import RecipeList from '@/components/recipes/RecipeList';
import { useRecipes } from '@/hooks/useRecipes';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';


const FILTERS = [
    { id: 'ALL', label: 'Todos' },
    { id: 'BREAKFAST', label: 'Desayuno' },
    { id: 'LUNCH', label: 'Almuerzo' },
    { id: 'DINNER', label: 'Cena' },
    { id: 'SNACK', label: 'Snacks' },
];

export default function RecipesScreen() {
    const { recipes, searchText, setSearchText, selectedFilter, setSelectedFilter } = useRecipes();

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
                        onPress={() => setSelectedFilter(filter.id)}
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

            {/* Lista de recetas */}
            <RecipeList
                recipes={recipes}
                onRecipePress={(recipe) => {
                    router.push(`/recipe/${recipe.id}`);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
