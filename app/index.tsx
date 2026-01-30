import { LoadingScreen } from '@/components/loading-screen';
import { useOnboarding } from '@/context/OnboardingContext';
import { Redirect } from 'expo-router';

/**
 * Ruta raíz "/". Loader mientras carga; redirige a (onboarding) o (tabs). Sin pantalla en blanco.
 */
export default function Index() {
  const { isReady, hasCompletedOnboarding } = useOnboarding();

  if (!isReady) {
    return <LoadingScreen message="Cargando..." />;
  }

  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(onboarding)" />;
}
