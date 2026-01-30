import { MealHistory, MealSummary } from "@/types/meals.type";
import { UserProfile } from "@/types/user.type";

import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;


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
