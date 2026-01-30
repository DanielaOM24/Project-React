// Archivo principal que re-exporta todos los módulos de la API
// Esto mantiene la compatibilidad con el código existente que importa desde '@/services/api'

// Re-exportar tipos
export type {
  GoogleLoginData, LoginResponse, RegisterData, RegisterResponse, UpdateProfileData, UserProfile
} from './types';

// Re-exportar funciones de conversión
export {
  convertActivityToBackend,
  convertDietToBackend, convertGoalToBackend
} from './converters';

// Re-exportar funciones de token
export {
  getToken, removeToken, saveToken
} from './token';

// Re-exportar APIs
export { authAPI } from './auth';
export { profileAPI } from './profile';
export { recipesAPI } from './recipes';

// Re-exportar configuración
export { API_BASE_URL } from './config';

