import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mantener la splash screen visible mientras se cargan las fuentes
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {
        // Ignorar errores al ocultar splash screen
      });
    }
  }, [fontsLoaded]);

  // Si las fuentes no se cargan después de 3 segundos, continuar de todas formas
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!fontsLoaded) {
        console.warn('[RootLayout] Las fuentes no se cargaron a tiempo, continuando sin ellas');
        SplashScreen.hideAsync().catch(() => {});
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Si las fuentes no se cargan, continuar de todas formas después de 3 segundos
  const [forceRender, setForceRender] = React.useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setForceRender(true);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  if (!fontsLoaded && !forceRender) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="success" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
