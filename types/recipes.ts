// Tipo para un ingrediente
export interface Ingredient {
    name: string;
    quantity: string;
}

// Tipos de comida según backend
export type TypeFood = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

// Tipo principal de receta (coincide con el backend)
export interface Recipe {
    id: string;
    name: string;
    typeFood: TypeFood;
    time: number;
    description: string;
    portion: number;
    calories: number;
    image: string;
    ingredients: Ingredient[];
    steps: string[];
}
