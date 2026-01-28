import { useOnboarding } from '@/context/OnboardingContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * Ruta raíz "/".
 * Redirige a (onboarding) o (tabs) según si el usuario completó el onboarding.
 */
export default function Index() {
  const { isReady, hasCompletedOnboarding } = useOnboarding();

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(onboarding)" />;
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
