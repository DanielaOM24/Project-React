import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InitialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al perfil
    if (!isLoading && isAuthenticated) {
      router.push('/(tabs)/profile');
    }
  }, [isAuthenticated, isLoading]);

  // Mostrar pantalla de carga mientras se verifica autenticación
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Si ya está autenticado, no mostrar nada (el useEffect redirigirá)
  if (isAuthenticated) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        {/* Logo o ícono */}
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={64} color="#A4D65E" />
        </View>

        {/* Título */}
        <Text style={styles.title}>NutriLens</Text>
        <Text style={styles.subtitle}>Tu guía nutricional personalizada</Text>

        {/* Botones */}
        <View style={styles.buttonsContainer}>
          {/* Botón de Login */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          {/* Botón de Registro */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#89F336', '#A4D65E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.registerButtonGradient}>
              <Text style={styles.registerButtonText}>Registrarse</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F9E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  registerButton: {
    height: 56,
    borderRadius: 24,
    overflow: 'hidden',
  },
  registerButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

