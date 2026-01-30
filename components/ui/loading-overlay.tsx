import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const colorScheme = useColorScheme();
  const spinnerColor = Colors[colorScheme ?? 'light'].tint;

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={spinnerColor} />
          {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    gap: 16,
    minWidth: 120,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
});
