// Register Screen Component

import { useAuth } from '@/contexts/AuthContext';
import { colors, radius, spacing, typography } from '@/styles/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  // Component State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refreshProfile } = useAuth();

  // Event Handlers
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      // Guardar datos de registro temporalmente para usar después del onboarding
      const { savePendingRegisterData } = require('@/utils/registerStorage');
      await savePendingRegisterData({
        displayName: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      
      console.log('[Register] Datos guardados temporalmente, redirigiendo al onboarding');
      
      // Limpiar cualquier dato de onboarding previo
      const { clearOnboardingData } = require('@/utils/onboardingStorage');
      await clearOnboardingData();
      
      // Navegar al onboarding usando push en lugar de replace
      router.push('/(tabs)');
    } catch (error: any) {
      console.error('[Register] Error al guardar datos temporales:', error);
      Alert.alert('Error', 'Error al procesar el registro. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Header con back arrow */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.backButton}
            activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.darkgreen} />
          </TouchableOpacity>
        </View>

        {/* Logo/Icon Section */}
        <View style={styles.logoSection}>
          
            <Ionicons name="leaf" size={48} color={colors.greenprimary} />
          
        </View>

        {/* Título */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>¡Crea tu cuenta!</Text>
          <Text style={styles.subtitle}>Comienza tu viaje hacia una vida más saludable</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          {/* Name Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={colors.darkgreen} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={colors.textdark + '60'}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={colors.darkgreen} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={colors.textdark + '60'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.darkgreen} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={colors.textdark + '60'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              activeOpacity={0.7}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textdark + '60'}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.darkgreen} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor={colors.textdark + '60'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
              activeOpacity={0.7}>
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textdark + '60'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.8}>
          {isLoading ? (
            <ActivityIndicator color={colors.darkgreen} />
          ) : (
            <Text style={styles.primaryButtonText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
            <Text style={styles.footerLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: radius.md,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  titleSection: {
    marginBottom: spacing.xl + spacing.md,
  },
  title: {
    fontSize: 32,
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
    lineHeight: 20,
  },
  inputContainer: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 56,
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
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    padding: 0,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.greenprimary,
    borderRadius: radius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
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
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: typography.size.body + 2,
    fontFamily: typography.fontfamily.semibold,
    color: colors.darkgreen,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
  },
  footerLink: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.greenprimary,
  },
});
