import axios from 'axios';

// Usar variables de entorno o fallback
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://nutrilens-0x37.onrender.com/api';
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '60000', 10);

console.log('API Configuration:', {
    baseURL: API_URL,
    timeout: API_TIMEOUT,
});

const api = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Nutrilens-Mobile-App/1.0',
    },
});

/**
 * Interceptor de solicitudes - Agregar token de autenticación
 * 
 * PENDIENTE: El equipo de autenticación debe implementar:
 * 1. Guardar el token en AsyncStorage después del login
 * 2. Descomentar el código de abajo
 */
api.interceptors.request.use(
    async (config) => {
        // TODO: Descomentar cuando el login esté listo
        // try {
        //     const token = await AsyncStorage.getItem('authToken');
        //     if (token) {
        //         config.headers.Authorization = `Bearer ${token}`;
        //         console.log('Token agregado a la petición');
        //     }
        // } catch (error) {
        //     console.error('Error al obtener token:', error);
        // }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // El servidor respondió con un código de error
            console.error('Error de respuesta:', error.response.status, error.response.data);
        } else if (error.request) {
            // La solicitud se hizo pero no hubo respuesta
            console.error('Error de red:', error.message);
        } else {
            // Algo pasó al configurar la solicitud
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
