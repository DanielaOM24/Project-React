/**
 * Toasts — stub si no está instalado react-native-toast-message.
 * Cuando instales: npm install react-native-toast-message
 * restaura el import y Toast.show() y añade <Toast /> en app/_layout.tsx
 */
import { getMessage } from '@/constants/messages';

type ToastType = 'success' | 'error' | 'info';

export interface ShowToastOptions {
  /** Si se pasa, se usa getMessage(key). Si no, se usa el text directo. */
  messageKey?: string;
  /** Texto del mensaje. Si se pasa messageKey, se ignora. */
  text?: string;
  /** Título opcional. */
  title?: string;
  /** Duración en ms. Por defecto: success 3000, error 4000, info 3000. */
  visibilityTime?: number;
}

function resolveText(options: ShowToastOptions): string {
  if (options.messageKey) return getMessage(options.messageKey);
  if (options.text != null && String(options.text).trim()) return String(options.text);
  return '';
}

/** Stub: no muestra nada hasta que react-native-toast-message esté instalado. */
export function showSuccess(options: ShowToastOptions = {}) {
  const text = resolveText(options);
  if (!text) return;
  // Toast.show({ type: 'success', text1: options.title, text2: text, ... });
}

/** Stub: no muestra nada hasta que react-native-toast-message esté instalado. */
export function showError(options: ShowToastOptions = {}) {
  const text = resolveText(options);
  if (!text) return;
  // Toast.show({ type: 'error', text1: options.title, text2: text, ... });
}

/** Stub: no muestra nada hasta que react-native-toast-message esté instalado. */
export function showInfo(options: ShowToastOptions = {}) {
  const text = resolveText(options);
  if (!text) return;
  // Toast.show({ type: 'info', text1: options.title, text2: text, ... });
}

/** Stub: no muestra nada hasta que react-native-toast-message esté instalado. */
export function showWarning(options: ShowToastOptions = {}) {
  const text = resolveText(options);
  if (!text) return;
  // Toast.show({ type: 'info', text1: options.title, text2: text, ... });
}

/**
 * Helper genérico para mostrar un toast por tipo.
 */
export function showToast(type: ToastType, options: ShowToastOptions) {
  if (type === 'success') showSuccess(options);
  else if (type === 'error') showError(options);
  else showInfo(options);
}

/**
 * Atajos para mensajes predefinidos de Messages.
 * Ej: showToastFrom.success.onboarding()
 */
export const showToastFrom = {
  success: {
    onboarding: () => showSuccess({ messageKey: 'success.onboarding' }),
    mealRegistered: () => showSuccess({ messageKey: 'success.mealRegistered' }),
    recipeSaved: () => showSuccess({ messageKey: 'success.recipeSaved' }),
    profileUpdated: () => showSuccess({ messageKey: 'success.profileUpdated' }),
    syncSuccess: () => showSuccess({ messageKey: 'success.syncSuccess' }),
    aiResponse: () => showSuccess({ messageKey: 'success.aiResponse' }),
  },
  error: {
    invalidFields: (custom?: string) =>
      showError(custom ? { text: custom } : { messageKey: 'error.invalidFields' }),
    invalidFieldsGeneric: () => showError({ messageKey: 'error.invalidFieldsGeneric' }),
    network: () => showError({ messageKey: 'error.network' }),
    aiNoResponse: () => showError({ messageKey: 'error.aiNoResponse' }),
    saveFailed: () => showError({ messageKey: 'error.saveFailed' }),
    generic: (custom?: string) =>
      showError(custom ? { text: custom } : { messageKey: 'error.generic' }),
  },
  info: {
    syncing: () => showInfo({ messageKey: 'info.syncing' }),
    loading: () => showInfo({ messageKey: 'info.loading' }),
    aiThinking: () => showInfo({ messageKey: 'info.aiThinking' }),
    offlineData: () => showInfo({ messageKey: 'info.offlineData' }),
  },
  warning: {
    unsavedChanges: () => showWarning({ messageKey: 'warning.unsavedChanges' }),
    lowConnection: () => showWarning({ messageKey: 'warning.lowConnection' }),
  },
} as const;
