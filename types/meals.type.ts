// Meal and Nutrition Types

export interface NutritionProfile {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DailyNutritionResponseDto {
  description?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  calorieGoal: number;
  calorieProgressPercentage: number;
}

export type MealSummary = DailyNutritionResponseDto;

export interface MealHistory {
  id: string;
  mediaUrl: string;
  mediaType: string;
  mealType: string;
  nutritionProfile?: NutritionProfile;
}

