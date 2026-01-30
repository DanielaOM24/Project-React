import { API_BASE_URL } from './config';
import { getToken, saveToken, removeToken, setTokenInMemory } from './token';
import type { LoginResponse, RegisterResponse, RegisterData, GoogleLoginData } from './types';

// API de autenticación
export const authAPI = {
  // Login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // NO incluir token en el login (es público)
    const loginUrl = `${API_BASE_URL}/auth/login`;
    
    console.log('[API] URL de login:', loginUrl);
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(), 
        password 
      }),
    });

    const responseText = await response.text();
    let responseData: any;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('[API] Error parseando respuesta de login:', responseText);
      throw new Error('Error en la respuesta del servidor');
    }

    console.log('[API] Respuesta del login:', {
      status: response.status,
      hasAccessToken: !!responseData.accessToken,
      hasRefreshToken: !!responseData.refreshToken,
      keys: Object.keys(responseData),
    });

    if (!response.ok) {
      const errorMessage = 
        responseData.message || 
        responseData.error || 
        (typeof responseData.error === 'string' ? responseData.error : responseData.error?.message) ||
        `Error ${response.status}: ${response.statusText}`;
      
      console.error('[API] Error en login:', {
        status: response.status,
        errorData: responseData,
        responseText: responseText.substring(0, 200),
      });
      
      throw new Error(errorMessage);
    }
    
    // El backend devuelve accessToken y refreshToken según la documentación
    const accessToken = responseData.accessToken;
    const refreshToken = responseData.refreshToken;
    
    if (!accessToken) {
      console.error('[API] No se recibió accessToken:', responseData);
      throw new Error('No se recibió token de acceso del servidor');
    }
    
    await saveToken(accessToken, refreshToken);
    
    // Verificar que el token se guardó correctamente
    const verifyToken = await getToken();
    if (!verifyToken || verifyToken !== accessToken) {
      console.warn('[login] Token no se verificó después de guardar, reintentando...');
      // Reintentar guardar el token
      setTokenInMemory(accessToken);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', accessToken);
      }
    }
    
    return {
      accessToken,
      refreshToken: refreshToken || '',
    };
  },

  // Register
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    // Validar que los campos requeridos estén presentes
    if (!data.displayName || !data.email || !data.password) {
      throw new Error('Nombre, email y contraseña son requeridos');
    }

    // Preparar el cuerpo de la petición exactamente como lo espera el backend
    // Todos los campos deben enviarse según el schema, con valores por defecto si no están presentes
    const requestBody: Record<string, any> = {
      displayName: data.displayName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      // Campos numéricos - usar 0 como valor por defecto si no están definidos
      weight: data.weight !== undefined && data.weight !== null ? Number(data.weight) : 0,
      height: data.height !== undefined && data.height !== null ? Number(data.height) : 0,
      age: data.age !== undefined && data.age !== null ? Number(data.age) : 0,
      meals: data.meals !== undefined && data.meals !== null ? Number(data.meals) : 0,
      // Campos de texto - usar valores por defecto si no están definidos
      preference: data.preference && (data.preference === 'VEGETARIANO' || data.preference === 'NORMAL') 
        ? data.preference 
        : 'NORMAL', // Por defecto NORMAL
      goal: data.goal && (data.goal === 'LOSE_WEIGHT' || data.goal === 'MAINTAIN' || data.goal === 'GAIN_MUSCLE')
        ? data.goal
        : 'MAINTAIN', // Por defecto MAINTAIN
      activityLevel: data.activityLevel && (data.activityLevel === 'LOW' || data.activityLevel === 'MEDIUM' || data.activityLevel === 'HIGH')
        ? data.activityLevel
        : 'LOW', // Por defecto LOW
    };

    console.log('[API] Registrando usuario:', { 
      ...requestBody, 
      password: '***' 
    });

    // NO incluir token en el registro (es público)
    const registerUrl = `${API_BASE_URL}/auth/register`;
    
    console.log('[API] URL de registro:', registerUrl);
    
    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let responseData: any;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('[API] Error parseando respuesta de registro:', responseText);
      // Si no es JSON, puede ser un mensaje de error en texto plano
      if (!response.ok) {
        throw new Error(responseText || `Error ${response.status}: ${response.statusText}`);
      }
      throw new Error('Error en la respuesta del servidor');
    }

    console.log('[API] Respuesta del registro:', {
      status: response.status,
      ok: response.ok,
      hasAccessToken: !!responseData.accessToken,
      hasRefreshToken: !!responseData.refreshToken,
      keys: Object.keys(responseData),
      responsePreview: JSON.stringify(responseData).substring(0, 200),
    });

    if (!response.ok) {
      // Manejo especial para diferentes códigos de error
      let errorMessage = 
        responseData.message || 
        responseData.error || 
        (typeof responseData.error === 'string' ? responseData.error : responseData.error?.message) ||
        responseData.msg ||
        `Error ${response.status}: ${response.statusText}`;
      
      // Mensajes más específicos según el código de error
      if (response.status === 400) {
        errorMessage = responseData.message || 'Datos inválidos. Verifica que todos los campos sean correctos.';
      } else if (response.status === 403) {
        errorMessage = responseData.message || 'Acceso denegado. El servidor rechazó la solicitud.';
      } else if (response.status === 409) {
        errorMessage = responseData.message || 'Este email ya está registrado. Intenta iniciar sesión.';
      } else if (response.status === 500) {
        errorMessage = responseData.message || 'Error del servidor. Por favor intenta más tarde.';
      }
      
      console.error('[API] Error en registro:', {
        status: response.status,
        statusText: response.statusText,
        errorData: responseData,
        responseText: responseText.substring(0, 500),
        requestBody: { ...requestBody, password: '***' },
      });
      
      throw new Error(errorMessage);
    }
    
    // El backend devuelve accessToken y refreshToken según la documentación
    const accessToken = responseData.accessToken || responseData.token;
    const refreshToken = responseData.refreshToken || responseData.refresh_token;
    
    console.log('[API] Tokens recibidos:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
    });
    
    if (!accessToken) {
      console.error('[API] No se recibió accessToken en la respuesta:', {
        responseData,
        allKeys: Object.keys(responseData),
      });
      throw new Error('No se recibió token de acceso del servidor. La respuesta fue: ' + JSON.stringify(responseData).substring(0, 100));
    }
    
    // Guardar el token
    await saveToken(accessToken, refreshToken);
    
    // Verificar que el token se guardó correctamente
    const savedToken = await getToken();
    if (!savedToken || savedToken !== accessToken) {
      console.warn('[register] Token no se verificó después de guardar, reintentando...');
      // Reintentar guardar el token
      setTokenInMemory(accessToken);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', accessToken);
        if (refreshToken) {
          window.localStorage.setItem('refreshToken', refreshToken);
        }
      } else {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem('authToken', accessToken);
          if (refreshToken) {
            await AsyncStorage.setItem('refreshToken', refreshToken);
          }
        } catch (error) {
          // Token queda en memoria
        }
      }
    }
    
    return {
      accessToken,
      refreshToken: refreshToken || '',
    };
  },

  // Login con Google
  loginWithGoogle: async (data: GoogleLoginData): Promise<LoginResponse> => {
    // NO incluir token en el login con Google (es público)
    const googleUrl = `${API_BASE_URL}/auth/google`;
    
    const response = await fetch(googleUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        googleSub: data.googleSub,
        email: data.email.trim().toLowerCase(),
        name: data.name.trim(),
        avatarUrl: data.avatarUrl || '',
      }),
    });

    const responseText = await response.text();
    let responseData: any;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('[API] Error parseando respuesta de Google login:', responseText);
      throw new Error('Error en la respuesta del servidor');
    }

    if (!response.ok) {
      const errorMessage = 
        responseData.message || 
        responseData.error || 
        (typeof responseData.error === 'string' ? responseData.error : responseData.error?.message) ||
        `Error ${response.status}: ${response.statusText}`;
      
      throw new Error(errorMessage);
    }
    
    const accessToken = responseData.accessToken;
    const refreshToken = responseData.refreshToken;
    
    if (!accessToken) {
      throw new Error('No se recibió token de acceso del servidor');
    }
    
    await saveToken(accessToken, refreshToken);
    
    return {
      accessToken,
      refreshToken: refreshToken || '',
    };
  },

  // Logout
  logout: async (): Promise<void> => {
    await removeToken();
  },
};

