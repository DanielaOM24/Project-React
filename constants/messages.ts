
export const Messages = {
  // ─── SUCCESS ─────────────────────────────────────────────────────────────
  success: {
    onboarding: '¡Listo! Guardamos tu información y ya estás listo para empezar.',
    mealRegistered: 'Tu comida quedó registrada.',
    recipeSaved: 'Receta guardada en tu colección.',
    profileUpdated: 'Tu perfil se actualizó correctamente.',
    syncSuccess: 'Datos sincronizados. Todo está al día.',
    aiResponse: 'Listo, aquí tienes tu análisis.',
  },

  // ─── ERROR ───────────────────────────────────────────────────────────────
  error: {
    invalidFields: 'Falta completar este dato.',
    invalidFieldsGeneric: 'Revisa los campos marcados y complétalos.',
    network: 'Ups… parece que no hay internet. Revisa tu conexión e intenta de nuevo.',
    serverDown: 'Estamos teniendo problemas con el servidor. Intenta más tarde.',
    aiNoResponse: 'La IA no pudo responder ahora. Intenta de nuevo en un momento.',
    aiNotUnderstood: 'No pudimos entender tu comida. ¿Puedes intentar con otra foto o descripción?',
    saveFailed: 'No pudimos guardar. Intenta otra vez.',
    loadFailed: 'No pudimos cargar. Intenta otra vez.',
    timeout: 'La operación tardó demasiado. Intenta de nuevo.',
    generic: 'Algo salió mal. Intenta de nuevo.',
  },

  // ─── INFO / SYSTEM ───────────────────────────────────────────────────────
  info: {
    syncing: 'Sincronizando tus datos…',
    loading: 'Un momento…',
    loadingRecipes: 'Estamos buscando recetas para ti.',
    refreshingRecipes: 'Actualizando recetas…',
    filteringRecipes: 'Buscando con tus filtros…',
    aiThinking: 'Analizando tu comida con IA.',
    aiAnalyzingImage: 'Analizando tu foto con IA.',
    generatingRecommendations: 'Generando recomendaciones para ti…',
    savingMeal: 'Guardando tu comida.',
    offlineData: 'Estás sin conexión. Usarás los datos guardados.',
  },

  // ─── WARNING ─────────────────────────────────────────────────────────────
  warning: {
    unsavedChanges: 'Tienes cambios sin guardar.',
    lowConnection: 'La conexión es inestable. Algunas funciones pueden fallar.',
  },
} as const;


export function getMessage(key: string): string {
  const [category, subKey] = key.split('.');
  const cat = (Messages as Record<string, Record<string, string>>)[category];
  return cat?.[subKey] ?? key;
}

export default Messages;
