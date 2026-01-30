import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, TouchableOpacity } from 'react-native';

type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

/**
 * Mensaje de error. Si falla backend → mostrar con botón "Reintentar".
 */
export function ErrorMessage({
  message,
  onRetry,
  retryLabel = 'Reintentar',
}: ErrorMessageProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.message}>{message}</ThemedText>
      {onRetry ? (
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            {retryLabel}
          </ThemedText>
        </TouchableOpacity>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 80, 80, 0.5)',
    backgroundColor: 'rgba(200, 80, 80, 0.08)',
    alignItems: 'center',
    gap: 12,
  },
  message: { textAlign: 'center' },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 126, 164, 0.2)',
  },
  buttonText: {},
});
