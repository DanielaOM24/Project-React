import { Recipe } from '@/types/recipes';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface RecipeItemProps {
  recipe: Recipe;
  onPress?: () => void;
}

const RecipeItem = ({ recipe, onPress }: RecipeItemProps) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{ uri: recipe.image }}
          style={styles.image}
          contentFit="cover"
        />

        <View style={styles.content}>
          <Text style={styles.name}>{recipe.name}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{recipe.time} min</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="flame-outline" size={16} color="#FF6B6B" />
              <Text style={styles.infoText}>{recipe.calories} kcal</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
});

export default RecipeItem;

