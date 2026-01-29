import { Recipe } from "@/types/recipes";
import { FlatList, RefreshControl, RefreshControlProps, Text, View } from "react-native";
import { ReactElement } from "react";
import RecipeItem from './RecipeItem';

interface RecipeListProps {
    recipes: Recipe[];
    onRecipePress?: (recipe: Recipe) => void;
    refreshControl?: ReactElement<RefreshControlProps>;
}

const RecipeList = ({ recipes, onRecipePress, refreshControl }: RecipeListProps) => {
    return (
        <FlatList
            data={recipes}
            renderItem={({ item }) => (
                <RecipeItem
                    recipe={item}
                    onPress={() => onRecipePress?.(item)}
                />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={refreshControl}
            ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: '#666' }}>
                        No hay recetas disponibles
                    </Text>
                </View>
            }
        />
    );
}

export default RecipeList;
