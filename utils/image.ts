import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

/**
 * Convierte una imagen a base64
 */
export async function imageToBase64(uri: string): Promise<string> {
  try {
    if (!uri) {
      throw new Error('No se proporcionó una URI de imagen válida');
    }

    if (Platform.OS === 'web') {
      // En web, usar fetch para obtener el blob y convertirlo a base64
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('No se pudo cargar la imagen');
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remover el prefijo data:image/...;base64, si existe
          const base64Data = base64.split(',')[1] || base64;
          if (!base64Data) {
            reject(new Error('No se pudo convertir la imagen a base64'));
            return;
          }
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error('Error al leer la imagen'));
        reader.readAsDataURL(blob);
      });
    } else {
      // En React Native, usar FileSystem
      try {
        // Verificar que FileSystem esté disponible
        if (!FileSystem) {
          throw new Error('FileSystem no está disponible. Asegúrate de tener expo-file-system instalado.');
        }
        
        // Verificar que EncodingType esté disponible
        const encodingType = FileSystem.EncodingType?.Base64 || 'base64';
        
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: encodingType as any,
        });
        
        if (!base64) {
          throw new Error('No se pudo convertir la imagen a base64');
        }
        return base64;
      } catch (fsError: any) {
        console.error('[Image] Error con FileSystem:', fsError);
        // Si FileSystem falla, intentar con fetch como alternativa
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              const base64Data = base64.split(',')[1] || base64;
              if (!base64Data) {
                reject(new Error('No se pudo convertir la imagen a base64'));
                return;
              }
              resolve(base64Data);
            };
            reader.onerror = () => reject(new Error('Error al leer la imagen'));
            reader.readAsDataURL(blob);
          });
        } catch (fetchError: any) {
          throw new Error(`Error al procesar la imagen: ${fsError.message || fetchError.message}`);
        }
      }
    }
  } catch (error: any) {
    console.error('[Image] Error convirtiendo imagen a base64:', error);
    throw new Error(error?.message || 'Error al procesar la imagen');
  }
}

