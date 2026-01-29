# Servicios de API - Nutrilens

Esta carpeta contiene todos los servicios para comunicarse con el backend de Nutrilens.

## Estructura

### `api.ts`
Configuración base de Axios con:
- **Base URL**: `https://nutrilens-0x37.onrender.com/api`
- **Timeout**: 15 segundos
- **Interceptores** para manejo de autenticación y errores

### `recipes.service.ts`
Servicio específico para recetas con los siguientes métodos:

#### `getRecipes(typeFood?: TypeFood | 'ALL')`
Obtiene todas las recetas o filtradas por tipo de comida.
- **Parámetros**: 
  - `typeFood` (opcional): 'ALL', 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'
- **Returns**: `Promise<Recipe[]>`
- **Ejemplo**:
  ```typescript
  // Todas las recetas
  const allRecipes = await recipesService.getRecipes();
  
  // Solo desayunos
  const breakfasts = await recipesService.getRecipes('BREAKFAST');
  ```

#### `getRecipeById(id: string)`
Obtiene una receta específica por su ID.
- **Parámetros**: 
  - `id`: ID de la receta
- **Returns**: `Promise<Recipe>`
- **Ejemplo**:
  ```typescript
  const recipe = await recipesService.getRecipeById('65fd1a8c9b1e');
  ```

#### `searchRecipes(query: string)`
Busca recetas por nombre.
- **Parámetros**: 
  - `query`: Texto de búsqueda
- **Returns**: `Promise<Recipe[]>`
- **Ejemplo**:
  ```typescript
  const results = await recipesService.searchRecipes('quinoa');
  ```

## Uso en componentes

### Con hooks personalizados (recomendado)
```typescript
import { useRecipes } from '@/hooks/useRecipes';

function RecipesScreen() {
  const { recipes, loading, error, refetch } = useRecipes();
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return <RecipeList recipes={recipes} />;
}
```

### Uso directo del servicio
```typescript
import { recipesService } from '@/services/recipes.service';

async function loadRecipes() {
  try {
    const recipes = await recipesService.getRecipes('LUNCH');
    console.log('Recetas de almuerzo:', recipes);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Manejo de errores

Todos los servicios manejan errores automáticamente y:
1. Los registran en la consola
2. Lanzan el error para que pueda ser manejado por el componente
3. El interceptor de Axios proporciona contexto adicional

## Futuras mejoras

- [ ] Agregar autenticación con tokens JWT
- [ ] Implementar caché local con AsyncStorage
- [ ] Agregar servicio de meals (comidas)
- [ ] Agregar servicio de user profile
- [ ] Implementar retry automático en caso de fallos de red
