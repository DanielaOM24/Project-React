import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Primera pantalla del Onboarding.
 * Reemplazar con la pantalla de Aleja cuando esté disponible.
 */
export default function OnboardingIndex() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Onboarding</ThemedText>
      <ThemedText style={styles.sub}>Pantalla inicial del flujo. Ir a la última.</ThemedText>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push('/(onboarding)/pantalla-11')}
        activeOpacity={0.8}>
        <ThemedText type="defaultSemiBold">Siguiente → Pantalla 11</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  sub: { textAlign: 'center' },
  btn: { padding: 16, backgroundColor: 'rgba(10,126,164,0.2)', borderRadius: 12 },
});
