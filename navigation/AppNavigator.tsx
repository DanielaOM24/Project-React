import { Stack } from 'expo-router';

/**
 * AppNavigator — Configuración de navegación principal
 *
 * Stack de Onboarding: app/(onboarding)/ — flujo inicial
 * Stack principal (Tabs): app/(tabs)/ — Inicio, Recetas, Registrar, Chat, Perfil
 *
 * La ruta "index" redirige a (onboarding) o (tabs) según onboarding completado.
 */
export function AppNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="receta/[id]"
        options={{ headerShown: true, title: 'Receta', headerBackTitle: 'Atrás' }}
      />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}
