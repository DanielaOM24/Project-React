// Initial Screen Component

import { useAuth } from '@/contexts/AuthContext';
import { colors, radius, spacing, typography } from '@/styles/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InitialScreen() {
  // Component State
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();

  // Effects
  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al perfil
    if (!isLoading && isAuthenticated) {
      try {
        router.push('/(tabs)/profile');
      } catch (error) {
        console.error('[InitialScreen] Error al redirigir:', error);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Render States
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.greenprimary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}>
      <View style={styles.content}>
        {/* Logo o ícono */}
        <View style={styles.logoSection}>
          <Ionicons name="leaf" size={48} color={colors.greenprimary} />
        </View>

        {/* Título */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>NutriLens</Text>
          <Text style={styles.subtitle}>Tu guía nutricional personalizada</Text>
        </View>

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
            <Text style={styles.registerButtonText}>Registrarse</Text>
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
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    marginTop: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xl + spacing.lg,
  },
  title: {
    fontSize: 36,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.md,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.whiteOverlay,
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  loginButtonText: {
    fontSize: typography.size.body + 2,
    fontFamily: typography.fontfamily.semibold,
    color: colors.darkgreen,
  },
  registerButton: {
    backgroundColor: colors.greenprimary,
    borderRadius: radius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  registerButtonText: {
    fontSize: typography.size.body + 2,
    fontFamily: typography.fontfamily.semibold,
    color: colors.darkgreen,
  },
});
