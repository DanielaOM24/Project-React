import { gradients, GradientType } from '@/styles/backgrounds';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';

interface GradientBackgroundProps {
  type?: GradientType;
  style?: ViewStyle;
  children?: React.ReactNode;
}

/**
 * Componente reutilizable para fondos con degradado
 * 
 * @param type - Tipo de gradiente: 'darkPrimary', 'darkSecondary', 'darkTertiary'
 * @param style - Estilos adicionales
 * @param children - Contenido hijo
 * 
 * @example
 * <GradientBackground type="darkPrimary">
 *   <Text>Contenido</Text>
 * </GradientBackground>
 */
export default function GradientBackground({ 
  type = 'darkPrimary', 
  style,
  children 
}: GradientBackgroundProps) {
  const gradient = gradients[type];

  return (
    <LinearGradient
      colors={gradient.colors}
      start={gradient.start}
      end={gradient.end}
      locations={gradient.locations}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

