import { colors } from './designSystem';

/**
 * Definición de gradientes para fondos de la app
 */

export const gradients = {
  // Fondo oscuro principal - estilo del mockup
  darkPrimary: {
    colors: ['#0A1F1C', '#0E2A25', '#1A3F38'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 0.5, 1] as const,
  },

  // Gradiente diagonal suave más claro 
  darkSecondary: {
    colors: [
      '#1A3F38',        // Verde oscuro
      '#4A7A62',        // Verde medio con toque lima
      '#3D6B5A',        // Verde intermedio
      colors.darkgreen, // Verde muy oscuro
    ] as const,
    start: { x: 0, y: 0 },     // Esquina superior izquierda
    end: { x: 1, y: 1 },       // Esquina inferior derecha (diagonal)
    locations: [0, 0.50, 0.65, 1] as const,
  },

  // gradiente diagonal más oscuro
  darkTertiary: {
    colors: [
      colors.darkgreen,       // Verde oscuro
      '#35563f',       // Verde intermedio
      colors.darkgreen,       // Verde oscuro
    ] as const,
    start: { x: 0, y: 0 },     // Esquina superior izquierda
    end: { x: 1, y: 1 },       // Esquina inferior derecha (diagonal)
    locations: [0, 0.35, 1] as const,
  },
};

// Tipos de gradiente disponibles
export type GradientType = keyof typeof gradients;

