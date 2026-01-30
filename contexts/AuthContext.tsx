import { UserProfile, getToken, profileAPI } from '@/services/api';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const token = await getToken();
      if (token) {
        try {
          const profile = await profileAPI.getProfile();
          // Convertir MAINTAIN antiguo a MAINTAIN_WEIGHT si viene del backend
          if (profile.goal === 'MAINTAIN' as any) {
            profile.goal = 'MAINTAIN_WEIGHT';
          }
          setUser(profile);
        } catch (profileError: any) {
          console.error('[AuthContext] Error al obtener perfil:', profileError);
          // Solo limpiar token si el error específicamente indica sesión expirada
          const errorMessage = profileError?.message || '';
          if (
            errorMessage.includes('expirado') || 
            errorMessage.includes('expired') ||
            errorMessage.includes('Tu sesión ha expirado') ||
            errorMessage.includes('No estás autenticado')
          ) {
            console.warn('[AuthContext] Token inválido o expirado, limpiando sesión');
            const { removeToken } = require('@/services/api');
            await removeToken();
            setUser(null);
          } else {
            // Para otros errores, mantener el usuario actual si existe
            console.warn('[AuthContext] No se pudo actualizar el perfil, manteniendo datos actuales');
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error al verificar token:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        setUser,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

