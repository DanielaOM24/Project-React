import { Recipe } from "@/types/recipes";
import { FlatList, Text, View } from "react-native";
import RecipeItem from './RecipeItem';

interface RecipeListProps {
    recipes: Recipe[];
    onRecipePress?: (recipe: Recipe) => void;
}

const RecipeList = ({ recipes, onRecipePress }: RecipeListProps) => {
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
            ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text>No hay recetas disponibles</Text>
                </View>
            }
        />
    );
}

export default RecipeList;
