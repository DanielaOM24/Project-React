
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { Recipe } from '../../types/recipe';

// 2. INTERFAZ DE PROPS: Definimos qué datos recibirá el componente
interface RecipeItemProps {
  recipe: Recipe;        // La receta completa (obligatorio)
  onPress?: () => void;  // Función opcional para cuando se presione el item
}

// 3. EL COMPONENTE: Esta es la función que crea el componente visual
const RecipeItem: React.FC<RecipeItemProps> = ({ recipe, onPress }) => {
  
  // 4. RETORNO: Esto es lo que se mostrará en pantalla
  return (
    <View>
      {/* Imagen de la receta */}
      <Image 
        source={{ uri: recipe.image }} 
        style={{ width: '100%', height: 180 }}
      />
      
      {/* Contenedor del contenido */}
      <View>
        {/* Nombre de la receta */}
        <Text>{recipe.name}</Text>
        
        {/* Información: Tiempo y Calorías */}
        <View style={{ flexDirection: 'row' }}>
          {/* Tiempo */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="time-outline" size={16} />
            <Text>{recipe.time} min</Text>
          </View>
          
          {/* Calorías */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="flame-outline" size={16} />
            <Text>{recipe.calories} kcal</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// 5. EXPORT: Exportamos el componente para usarlo en otros archivos
export default RecipeItem;
