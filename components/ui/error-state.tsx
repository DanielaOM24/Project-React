import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ErrorStateProps = {
  message: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  showIcon?: boolean;
};

export function ErrorState({
  message,
  title = 'Algo salió mal',
  actionLabel,
  onAction,
  showIcon = true,
}: ErrorStateProps) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <ThemedView style={styles.container}>
      {showIcon ? (
        <View style={styles.iconContainer}>
          <MaterialIcons name="error-outline" size={48} color={tintColor} />
        </View>
      ) : null}
      {title ? (
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}
      <ThemedText style={styles.message}>{message}</ThemedText>
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={[styles.button, { borderColor: tintColor }]}
          onPress={onAction}
        >
          <ThemedText style={[styles.buttonText, { color: tintColor }]}>
            {actionLabel}
          </ThemedText>
        </TouchableOpacity>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
