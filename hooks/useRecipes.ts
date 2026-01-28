import { RECIPES_MOCK } from '@/data/recipes.mock';
import { useMemo, useState } from 'react';

export const useRecipes = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

    const filteredRecipes = useMemo(() => {
        let recipes = RECIPES_MOCK;

        // Filtrar por tipo de comida
        if (selectedFilter !== 'ALL') {
            recipes = recipes.filter(recipe => recipe.typeFood === selectedFilter);
        }

        // Filtrar por texto de búsqueda
        if (searchText.trim()) {
            recipes = recipes.filter(recipe =>
                recipe.name.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        return recipes;
    }, [searchText, selectedFilter]);

    return {
        recipes: filteredRecipes,
        searchText,
        setSearchText,
        selectedFilter,
        setSelectedFilter,
    };
};
