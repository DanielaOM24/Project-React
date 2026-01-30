import axios from "axios";

const API_BASE_URL = "https://nutrilens-0x37.onrender.com";

// Interfaces para los tipos de datos
export interface MealSummary {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    calorieGoal: number;
    calorieProgressPercentage: number;
}

export interface NutritionProfile {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface MealHistory {
    id: string;
    mediaUrl: string;
    mediaType: string;
    mealType: string;
    nutritionProfile: NutritionProfile;
}

export interface UserProfile {
    id: number;
    displayName: string;
    email: string;
    avatarUrl: string;
    weight: number;
    height: number;
    age: number;
    preference: string;
    meals: number;
    goal: string;
    activityLevel: string;
}

// Servicios de API
export const getMealSummary = async (): Promise<MealSummary> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/meals/summary`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMealHistory = async (): Promise<MealHistory[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/meals/history`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUserProfile = async (): Promise<UserProfile> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
