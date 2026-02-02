// Utilidades de traducción y formateo

/**
 * Formatea una fecha a formato legible en español
 */
export function formatDate(date: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} de ${month} de ${year}`;
}

/**
 * Traduce el tipo de comida al español
 */
export function translateMealType(mealType: string): string {
  const translations: Record<string, string> = {
    'BREAKFAST': 'Desayuno',
    'LUNCH': 'Almuerzo',
    'DINNER': 'Cena',
    'SNACK': 'Snack',
  };
  return translations[mealType] || mealType;
}

/**
 * Obtiene el ícono correspondiente al tipo de comida
 */
export function getMealIcon(mealType: string): string {
  const icons: Record<string, string> = {
    'BREAKFAST': 'sunny-outline',
    'LUNCH': 'restaurant-outline',
    'DINNER': 'moon-outline',
    'SNACK': 'cafe-outline',
  };
  return icons[mealType] || 'restaurant-outline';
}

/**
 * Traduce el objetivo del usuario al español
 */
export function translateGoal(goal: string): string {
  const translations: Record<string, string> = {
    'LOSE_WEIGHT': 'Bajar de peso',
    'MAINTAIN_WEIGHT': 'Mantener peso',
    'GAIN_MUSCLE': 'Ganar masa muscular',
  };
  return translations[goal] || goal;
}

