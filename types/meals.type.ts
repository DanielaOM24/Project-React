// Tipos relacionados con comidas y nutrición

export interface NutritionProfile {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface MealSummary {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    calorieGoal: number;
    calorieProgressPercentage: number;
}

export interface MealHistory {
    id: string;
    mediaUrl: string;
    mediaType: string;
    mealType: string;
    nutritionProfile: NutritionProfile;
}