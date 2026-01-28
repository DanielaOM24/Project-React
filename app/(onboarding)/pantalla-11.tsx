import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useOnboarding } from '@/context/OnboardingContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Pantalla 11 — Última del Onboarding.
 * Al tocar "Comenzar" / "Finalizar":
 * 1. Guarda estado "onboarding completado" (AsyncStorage)
 * 2. Redirige al Inicio (Dashboard / (tabs))
 *
 * Reemplazar contenido con la pantalla de Aleja cuando esté disponible.
 */
export default function Pantalla11() {
  const { setOnboardingComplete } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleComenzar = async () => {
    setLoading(true);
    try {
      await setOnboardingComplete();
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">¡Todo listo!</ThemedText>
      <ThemedText style={styles.sub}>Pantalla 11. Reemplazar con diseño de Aleja.</ThemedText>
      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleComenzar}
        disabled={loading}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText type="defaultSemiBold" style={styles.btnText}>
            Comenzar → Ir al Inicio
          </ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  sub: { textAlign: 'center' },
  btn: { padding: 16, backgroundColor: '#0a7ea4', borderRadius: 12, minWidth: 200, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff' },
});
