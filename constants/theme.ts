/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/** Paleta verde para NutriLens — salud, nutrición, frescura */
export const NutritionColors = {
  light: {
    primary: '#059669',
    primaryDark: '#047857',
    primaryLight: '#10b981',
    surface: '#ecfdf5',
    surfaceCard: '#d1fae5',
    accent: '#34d399',
    textOnPrimary: '#ffffff',
    border: '#a7f3d0',
    muted: '#6b7280',
  },
  dark: {
    primary: '#10b981',
    primaryDark: '#059669',
    primaryLight: '#34d399',
    surface: '#064e3b',
    surfaceCard: '#065f46',
    accent: '#6ee7b7',
    textOnPrimary: '#ffffff',
    border: '#047857',
    muted: '#9ca3af',
  },
};

/**
 * Paleta verde — innovadora, elegante, profesional, tecnológica.
 * Teal/esmeralda: sensación tech y premium sin perder calidez.
 */
export const InnovationColors = {
  light: {
    primary: '#0d9488',
    primaryDark: '#0f766e',
    primaryLight: '#14b8a6',
    accent: '#2dd4bf',
    accentSecondary: '#5eead4',
    surface: '#f0fdfa',
    surfaceCard: '#ffffff',
    surfaceElevated: '#ccfbf1',
    border: '#99f6e4',
    borderLight: '#ccfbf1',
    muted: '#64748b',
    text: '#0f172a',
    textSecondary: '#475569',
  },
  dark: {
    primary: '#2dd4bf',
    primaryDark: '#14b8a6',
    primaryLight: '#5eead4',
    accent: '#5eead4',
    accentSecondary: '#99f6e4',
    surface: '#042f2e',
    surfaceCard: '#134e4a',
    surfaceElevated: '#115e59',
    border: '#0f766e',
    borderLight: '#134e4a',
    muted: '#94a3b8',
    text: '#f0fdfa',
    textSecondary: '#99f6e4',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
