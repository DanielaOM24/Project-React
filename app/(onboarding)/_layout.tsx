import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Atrás' }}>
      <Stack.Screen name="index" options={{ title: 'Onboarding', headerShown: false }} />
      <Stack.Screen name="pantalla-11" options={{ title: 'Comenzar' }} />
    </Stack>
  );
}
