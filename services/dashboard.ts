// Dashboard Service

// Dashboard Service

import { DailyNutritionResponseDto, MealHistory, MealSummary } from "@/types/meals.type";
import { UserProfile } from "@/types/user.type";
import { API_BASE_URL } from "./config";
import { getToken } from "./token";
export const getMealSummary = async (date?: string, timezoneOffset?: string): Promise<DailyNutritionResponseDto> => {
    try {
        const token = await getToken();
        if (!token) {
            throw new Error('No estás autenticado. Por favor inicia sesión.');
        }

        // Construir URL con query parameters según Swagger
        const url = new URL(`${API_BASE_URL}/api/meals/summary`);
        if (date) {
            url.searchParams.append('date', date);
        }
        if (timezoneOffset) {
            url.searchParams.append('timezoneOffset', timezoneOffset);
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.trim()}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('No estás autenticado. Por favor inicia sesión.');
            }
            // Si no hay datos, retornar valores por defecto basados en el perfil del usuario
            const profile = await getUserProfile().catch(() => null);
            const defaultGoal = profile?.daily_calories || 2000;
            return {
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFats: 0,
                calorieGoal: defaultGoal,
                calorieProgressPercentage: 0,
            };
        }

        const data = await response.json();
        
        // Si el perfil tiene daily_calories y el resumen no lo incluye, usarlo
        if (!data.calorieGoal || data.calorieGoal === 0) {
            const profile = await getUserProfile().catch(() => null);
            if (profile?.daily_calories) {
                data.calorieGoal = profile.daily_calories;
                if (data.totalCalories > 0) {
                    data.calorieProgressPercentage = (data.totalCalories / data.calorieGoal) * 100;
                }
            }
        }
        
        return data;
    } catch (error: any) {
        console.error('[Dashboard] Error al obtener resumen:', error);
        // Si es un error de red o no autenticado, retornar valores por defecto
        if (error.message?.includes('autenticado') || error.message?.includes('fetch')) {
            // Intentar obtener el perfil para usar las calorías diarias
            const profile = await getUserProfile().catch(() => null);
            const defaultGoal = profile?.daily_calories || 2000;
            return {
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFats: 0,
                calorieGoal: defaultGoal,
                calorieProgressPercentage: 0,
            };
        }
        throw error;
    }
};

export const getMealHistory = async (): Promise<MealHistory[]> => {
    try {
        const token = await getToken();
        if (!token) {
            throw new Error('No estás autenticado. Por favor inicia sesión.');
        }

        const response = await fetch(`${API_BASE_URL}/api/meals/history`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.trim()}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('No estás autenticado. Por favor inicia sesión.');
            }
            throw new Error('Error al obtener el historial de comidas');
        }

        const allMeals = await response.json();
        
        // Filtrar solo las comidas de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Inicio del día de hoy
        
        const todaysMeals = allMeals.filter((meal: MealHistory) => {
            if (!meal.analyzedAt) return false;
            
            const mealDate = new Date(meal.analyzedAt);
            mealDate.setHours(0, 0, 0, 0); // Inicio del día de la comida
            
            return mealDate.getTime() === today.getTime();
        });
        
        return todaysMeals;
    } catch (error) {
        console.error('[Dashboard] Error al obtener historial:', error);
        throw error;
    }
};

export const getUserProfile = async (): Promise<UserProfile> => {
    try {
        const token = await getToken();
        if (!token) {
            throw new Error('No estás autenticado. Por favor inicia sesión.');
        }

        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.trim()}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('No estás autenticado. Por favor inicia sesión.');
            }
            throw new Error('Error al obtener el perfil de usuario');
        }

        return await response.json();
    } catch (error) {
        console.error('[Dashboard] Error al obtener perfil:', error);
        throw error;
    }
};

