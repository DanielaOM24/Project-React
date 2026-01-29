/**
 * Mensajes del sistema centralizados para Nutrilens.
 * Tono: amigable, claro y coherente con una app de nutrición premium.
 * Uso: getMessage('success.onboarding'), showSuccess({ messageKey: 'success.onboarding' }) o showToastFrom.success.onboarding().
 */

export const Messages = {
  // ─── SUCCESS ─────────────────────────────────────────────────────────────
  success: {
    onboarding: '¡Listo! Guardamos tu información y ya estás listo para empezar.',
    mealRegistered: 'Tu comida quedó registrada',
    recipeSaved: 'Receta guardada en tu colección',
    profileUpdated: 'Tu perfil se actualizó correctamente.',
    syncSuccess: 'Datos sincronizados. Todo está al día.',
    aiResponse: 'Listo, aquí tienes tu análisis.',
  },

  // ─── ERROR ───────────────────────────────────────────────────────────────
  error: {
    invalidFields: 'Falta completar este dato.',
    invalidFieldsGeneric: 'Revisa los campos marcados y complétalos.',
    network: 'No pudimos conectar. Revisa tu internet e intenta otra vez.',
    aiNoResponse: 'La IA no pudo responder ahora. Intenta de nuevo en un momento.',
    saveFailed: 'No pudimos guardar. Intenta otra vez.',
    generic: 'Algo salió mal. Intenta de nuevo.',
  },

  // ─── INFO / SYSTEM ───────────────────────────────────────────────────────
  info: {
    syncing: 'Sincronizando tus datos…',
    loading: 'Un momento…',
    aiThinking: 'Analizando tu comida…',
    offlineData: 'Estás sin conexión. Usarás los datos guardados.',
  },

  // ─── WARNING ─────────────────────────────────────────────────────────────
  warning: {
    unsavedChanges: 'Tienes cambios sin guardar.',
    lowConnection: 'La conexión es inestable. Algunas funciones pueden fallar.',
  },
} as const;

/**
 * Obtiene el texto de un mensaje a partir de una clave con punto.
 * Ej: getMessage('success.onboarding') → Messages.success.onboarding
 * Si la clave no existe, devuelve la clave tal cual.
 */
export function getMessage(key: string): string {
  const [category, subKey] = key.split('.');
  const cat = (Messages as Record<string, Record<string, string>>)[category];
  return cat?.[subKey] ?? key;
}

export default Messages;
