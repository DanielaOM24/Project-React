
import { Recipe } from '@/types/recipes';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, View, Pressable } from 'react-native';

interface RecipeItemProps {
    recipe: Recipe;
    onPress?: () => void;
}

const RecipeItem = ({ recipe, onPress }: RecipeItemProps) => {
    return (
        <Pressable onPress={onPress}>
            <View style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                <Image
                    source={{ uri: recipe.image }}
                    style={{ width: '100%', height: 180 }}
                />

                <View style={{ padding: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>{recipe.name}</Text>

                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={{ fontSize: 14, color: '#666' }}>{recipe.time} min</Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="flame-outline" size={16} color="#FF6B6B" />
                            <Text style={{ fontSize: 14, color: '#666' }}>{recipe.calories} kcal</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};


export default RecipeItem;
