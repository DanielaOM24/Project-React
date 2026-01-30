import { Recipe } from '@/types/recipes';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import RecipeItem from './RecipeItem';

interface RecipeListProps {
  recipes: Recipe[];
  onRecipePress?: (recipe: Recipe) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const RecipeList = ({ recipes, onRecipePress, refreshing = false, onRefresh }: RecipeListProps) => {
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
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#A4D65E']}
            tintColor="#A4D65E"
          />
        ) : undefined
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay recetas disponibles</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default RecipeList;

