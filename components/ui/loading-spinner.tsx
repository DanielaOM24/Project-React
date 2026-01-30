import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type LoadingSpinnerProps = {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
};

export function LoadingSpinner({
  message,
  size = 'large',
  color,
}: LoadingSpinnerProps) {
  const colorScheme = useColorScheme();
  const spinnerColor = color ?? Colors[colorScheme ?? 'light'].tint;

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
