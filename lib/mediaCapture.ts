/**
 * Puntos de extensión para cámara y audio.
 * captureImage usa expo-image-picker. recordAudio sigue como placeholder
 * (grabación + STT debe implementarse con expo-av + servicio de voz).
 */

import * as ImagePicker from 'expo-image-picker';

/**
 * Captura una foto (cámara o galería) y devuelve la imagen en base64.
 * Formato: "data:image/jpeg;base64,..." para enviar a la IA.
 * Si el usuario cancela o no da permiso, devuelve null.
 */
export async function captureImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets?.[0]?.base64) {
    return null;
  }

  const base64 = result.assets[0].base64;
  return `data:image/jpeg;base64,${base64}`;
}

/**
 * Abre la galería para elegir una imagen (alternativa a cámara).
 */
export async function pickImageFromGallery(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets?.[0]?.base64) {
    return null;
  }

  const base64 = result.assets[0].base64;
  return `data:image/jpeg;base64,${base64}`;
}

/**
 * Graba audio del usuario y devuelve la transcripción (texto) de lo que dijo.
 * Si el usuario cancela o falla el reconocimiento, devolver null.
 *
 * REEMPLAZAR: usar expo-av o similar para grabar, luego enviar a un servicio
 * de speech-to-text (Google Speech-to-Text, Whisper, etc.) y return el transcript.
 */
export async function recordAudio(): Promise<string | null> {
  // TODO: Reemplazar por implementación real (grabar -> STT -> transcript).
  console.warn('[mediaCapture] recordAudio: implementación placeholder. Reemplazar por grabación + STT real.');
  return null;
}
