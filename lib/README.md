# Lib — Utilidades y extensiones

## Media capture (cámara y audio)

El chat de NutriLens consume las funciones de `mediaCapture.ts`. Quien implemente **cámara** y **audio** debe reemplazar solo el cuerpo de:

- **`captureImage()`** → Devuelve la imagen en base64 (o `null` si cancela).  
  Ejemplo: `expo-image-picker` → `launchCameraAsync` / `launchImageLibraryAsync` → leer archivo y convertir a base64.

- **`recordAudio()`** → Devuelve la **transcripción** (texto) del audio (o `null` si cancela/falla).  
  Ejemplo: `expo-av` para grabar → enviar a un servicio de speech-to-text (Google, Whisper, etc.) → devolver el transcript.

La UI ya llama a estas funciones al usar los botones de cámara y micrófono. No hace falta cambiar el chat; solo sustituir las implementaciones en `mediaCapture.ts`.
