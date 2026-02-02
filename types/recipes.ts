// Recipe Types

export interface Ingredient {
  name: string;
  quantity: string;
}

export type TypeFood = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

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

