// Funciones helper para convertir valores del onboarding al formato del backend
export const convertGoalToBackend = (goal: string): 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE' => {
  switch (goal) {
    case 'lose': return 'LOSE_WEIGHT';
    case 'maintain': return 'MAINTAIN';
    case 'gain': return 'GAIN_MUSCLE';
    default: return 'MAINTAIN';
  }
};

export const convertActivityToBackend = (activity: string): 'LOW' | 'MEDIUM' | 'HIGH' => {
  switch (activity) {
    case 'low': return 'LOW';
    case 'medium': return 'MEDIUM';
    case 'high': return 'HIGH';
    default: return 'MEDIUM';
  }
};

export const convertDietToBackend = (diet: string): 'NORMAL' | 'VEGETARIANO' => {
  switch (diet) {
    case 'vegetarian': return 'VEGETARIANO';
    case 'normal':
    case 'no-restrictions':
    default: return 'NORMAL';
  }
};

