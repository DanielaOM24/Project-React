// Traducir tipos de comidas de inglés a español
export const translateMealType = (mealType: string): string => {
    const translations: { [key: string]: string } = {
        'BREAKFAST': 'Desayuno',
        'LUNCH': 'Almuerzo',
        'DINNER': 'Cena',
        'SNACK': 'Snack',
    };
    return translations[mealType] || mealType;
};

// Traducir objetivos de inglés a español
export const translateGoal = (goal: string): string => {
    const translations: { [key: string]: string } = {
        'LOSE_WEIGHT': 'Bajar de peso',
        'GAIN_WEIGHT': 'Subir de peso',
        'MAINTAIN_WEIGHT': 'Mantener peso',
        'BUILD_MUSCLE': 'Ganar músculo',
    };
    return translations[goal] || goal;
};

// Obtener icono según tipo de comida
export const getMealIcon = (mealType: string): string => {
    const icons: { [key: string]: string } = {
        'BREAKFAST': 'sunny-outline',
        'LUNCH': 'restaurant-outline',
        'DINNER': 'moon-outline',
        'SNACK': 'cafe-outline',
    };
    return icons[mealType] || 'fast-food-outline';
};

// Formatear fecha a español
export const formatDate = (date: Date): string => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    
    return `${dayName}, ${monthName} ${day}`;
};
