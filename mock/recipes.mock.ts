/**
 * Mock de recetas.
 * Reemplazar por API cuando el backend esté disponible (Sebastián).
 * Daniela puede avanzar con vistas usando estos datos.
 */

export type MockRecipe = {
  id: string;
  nombre: string;
  descripcion: string;
  imagenUri: string | null;
  calorias: number;
  tiempoMinutos: number;
  porciones: number;
  categoria: string;
  ingredientes: string[];
  pasos: string[];
};

const MOCK_RECIPES: MockRecipe[] = [
  {
    id: '1',
    nombre: 'Ensalada verde con pollo',
    descripcion: 'Ensalada fresca con pechuga a la plancha, lechuga, espinaca y aderezo de limón.',
    imagenUri: null,
    calorias: 320,
    tiempoMinutos: 25,
    porciones: 2,
    categoria: 'Ensaladas',
    ingredientes: [
      'Pechuga de pollo 200 g',
      'Lechuga, espinaca, rúcula',
      'Tomate cherry',
      'Aceite de oliva, limón, sal, pimienta',
    ],
    pasos: [
      'Cocinar la pechuga a la plancha con sal y pimienta.',
      'Lavar y trocear las hojas verdes y el tomate.',
      'Mezclar en un bol con aceite, zumo de limón, sal y pimienta.',
      'Servir con el pollo en láminas encima.',
    ],
  },
  {
    id: '2',
    nombre: 'Pollo al horno con verduras',
    descripcion: 'Muslos de pollo horneados con patata, zanahoria y cebolla.',
    imagenUri: null,
    calorias: 410,
    tiempoMinutos: 50,
    porciones: 4,
    categoria: 'Platos principales',
    ingredientes: [
      'Muslos de pollo 600 g',
      'Patatas 400 g',
      'Zanahorias 2',
      'Cebolla 1',
      'Aceite, romero, ajo, sal, pimienta',
    ],
    pasos: [
      'Precalentar el horno a 200 °C.',
      'Cortar patatas, zanahorias y cebolla en trozos. Aliñar con aceite, sal y romero.',
      'Colocar el pollo encima de las verduras. Añadir ajo y hornear 40–45 min.',
      'Comprobar que el pollo esté bien hecho y servir.',
    ],
  },
  {
    id: '3',
    nombre: 'Bowl de avena y frutos rojos',
    descripcion: 'Desayuno con avena, plátano, frutos rojos y miel.',
    imagenUri: null,
    calorias: 280,
    tiempoMinutos: 10,
    porciones: 1,
    categoria: 'Desayunos',
    ingredientes: [
      'Avena 50 g',
      'Leche o bebida vegetal 120 ml',
      'Plátano 1',
      'Frutos rojos (fresas, arándanos)',
      'Miel o sirope (opcional)',
    ],
    pasos: [
      'Mezclar avena y leche. Cocinar 2–3 min en microondas o en cazo.',
      'Cortar el plátano en rodajas y añadir los frutos rojos.',
      'Servir en un bowl y agregar miel al gusto.',
    ],
  },
  {
    id: '4',
    nombre: 'Sopa de lentejas',
    descripcion: 'Sopa de lentejas con verduras, ideal para días fríos.',
    imagenUri: null,
    calorias: 220,
    tiempoMinutos: 40,
    porciones: 4,
    categoria: 'Sopas',
    ingredientes: [
      'Lentejas 250 g',
      'Cebolla, zanahoria, apio',
      'Tomate triturado 200 g',
      'Caldo de verduras, laurel, comino, sal, pimienta',
    ],
    pasos: [
      'Sofreír cebolla, zanahoria y apio en una olla.',
      'Añadir lentejas, tomate, caldo, laurel y comino. Cocer 30 min.',
      'Salpimentar y servir caliente.',
    ],
  },
];

export function getMockRecipes(): MockRecipe[] {
  return MOCK_RECIPES;
}

export function getMockRecipeById(id: string): MockRecipe | undefined {
  return MOCK_RECIPES.find((r) => r.id === id);
}
