import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Barra de progreso - 5 líneas verdes */}
      <View style={[styles.progressContainer, { top: insets.top + 20 }]}>
        <View style={styles.progressLines}>
          {[1, 2, 3, 4, 5].map((index) => (
            <View key={index} style={[styles.progressLine, styles.progressLineActive]} />
          ))}
        </View>
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Ícono de celebración */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={80} color="#A4D65E" />
            <View style={styles.confettiContainer}>
              <View style={[styles.confetti, styles.confetti1]} />
              <View style={[styles.confetti, styles.confetti2]} />
              <View style={[styles.confetti, styles.confetti3]} />
              <View style={[styles.confetti, styles.confetti4]} />
              <View style={[styles.confetti, styles.confetti5]} />
            </View>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>¡Todo listo!</Text>

        {/* Mensaje */}
        <Text style={styles.message}>
          Ya tenemos todo para ayudarte a comer mejor.{' '}
          <Text style={styles.highlight}>¡Comencemos!</Text>
        </Text>

        {/* Botones */}
        <View style={styles.buttonsContainer}>
          {/* Botón de retroceso */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>

          {/* Botón de comenzar */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#89F336', '#A4D65E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButtonGradient}>
              <Text style={styles.startButtonText}>Comenzar →</Text>
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
  progressContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 10,
  },
  progressLines: {
    flexDirection: 'row',
    gap: 8,
  },
  progressLine: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  progressLineActive: {
    backgroundColor: '#A4D65E',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F9E8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  confettiContainer: {
    position: 'absolute',
    top: -10,
    left: '50%',
    width: 100,
    height: 100,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confetti1: {
    top: 10,
    left: 20,
    backgroundColor: '#FF6B9D',
  },
  confetti2: {
    top: 20,
    right: 15,
    backgroundColor: '#4ECDC4',
  },
  confetti3: {
    top: 35,
    left: 10,
    backgroundColor: '#FFE66D',
  },
  confetti4: {
    top: 45,
    right: 25,
    backgroundColor: '#95E1D3',
  },
  confetti5: {
    top: 5,
    left: 45,
    backgroundColor: '#FFB347',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  highlight: {
    color: '#A4D65E',
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    paddingHorizontal: 24,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    flex: 1,
    height: 56,
    borderRadius: 24,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

