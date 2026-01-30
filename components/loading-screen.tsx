import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActivityIndicator, StyleSheet } from 'react-native';

type LoadingScreenProps = {
  message?: string;
};

/**
 * Pantalla de carga. Evita pantallas en blanco mientras se resuelve algo async.
 */
export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" />
      {message ? (
        <ThemedText style={styles.message}>{message}</ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  message: { textAlign: 'center', opacity: 0.8 },
});
