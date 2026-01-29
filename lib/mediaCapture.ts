/**
 * Puntos de extensión para cámara y audio.
 * El compañero encargado de cámara/video debe REEMPLAZAR las implementaciones
 * de captureImage y recordAudio por las reales (expo-camera, expo-av, etc.).
 *
 * La UI del chat ya consume estas funciones: solo hay que sustituir el cuerpo
 * de cada una por la lógica real.
 */

/**
 * Captura una foto (cámara o galería) y devuelve la imagen en base64.
 * Formato aceptado: base64 puro o "data:image/jpeg;base64,..." / "data:image/png;base64,..."
 *
 * REEMPLAZAR: usar expo-image-picker o expo-camera para capturar/seleccionar,
 * luego convertir a base64 y return. Si el usuario cancela, devolver null.
 */
export async function captureImage(): Promise<string | null> {
  // TODO: Reemplazar por implementación real (ej. ImagePicker.launchCameraAsync / launchImageLibraryAsync).
  // El resultado debe ser base64 (uri -> readAsStringAsync base64 o similar).
  console.warn('[mediaCapture] captureImage: implementación placeholder. Reemplazar por cámara/galería real.');
  return null;
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
