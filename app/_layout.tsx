import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { OnboardingProvider } from '@/context/OnboardingContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppNavigator } from '@/navigation/AppNavigator';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <OnboardingProvider>
        <AppNavigator />
      </OnboardingProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
