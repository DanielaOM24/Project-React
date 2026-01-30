// Tipos relacionados con el perfil de usuario

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