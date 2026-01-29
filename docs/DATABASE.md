# Datos a guardar en base de datos — NutriLens

Idea de qué persistir para el chat, el análisis de imágenes y el contexto del usuario.

---

## 1. Usuarios y contexto (onboarding)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user_id` | UUID | Id del usuario |
| `objetivo` | string | "perder peso", "ganar masa muscular", "mantener peso", etc. |
| `dieta` | string | "vegetariana", "vegana", "keto", "sin restricciones", etc. |
| `comidas_preferidas` | string[] | Alimentos que le gustan |
| `restricciones` | string[] | Alergias, intolerancias (lactosa, gluten, etc.) |
| `info_adicional` | string? | Ejercicio, horarios, etc. |
| `protein` | number? | Proteína (g/día) |
| `carbs` | number? | Carbohidratos (g/día) |
| `fat` | number? | Grasa (g/día) |
| `created_at` | timestamp | Cuándo se creó/actualizó el perfil |

---

## 2. Historial del chat

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Id del mensaje |
| `user_id` | UUID | Usuario que escribe |
| `role` | enum | `"user"` \| `"assistant"` |
| `content` | string | Texto del mensaje (corto, sin estructura extra) |
| `created_at` | timestamp | Cuándo se envió |

Útil para: retomar conversaciones, métricas, y opcionalmente enviar historial a la IA.

---

## 3. Análisis de imágenes de comida

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Id del análisis |
| `user_id` | UUID | Usuario que capturó la foto |
| `image_url` o `image_storage_key` | string | Dónde está la imagen (URL o clave en almacenamiento) |
| `food_description` | string | Qué parece la comida (salida de `analyzeFoodImage`) |
| `suggestion` | string | Sugerencia nutricional breve |
| `message` | string | Texto completo para mostrar en UI |
| `created_at` | timestamp | Cuándo se analizó |

**Flujo:** Juan Pablo captura la imagen → se sube a storage → se llama `analyzeFoodImage` → se guarda este registro → Diego consume (p. ej. en “Objetivo del día” o historial de comidas).

---

## 4. Análisis de audio (descripción hablada)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Id del análisis |
| `user_id` | UUID | Usuario que grabó el audio |
| `audio_url` o `audio_storage_key` | string? | Dónde está el audio (URL o clave), si lo guardáis en storage |
| `transcript` | string | Transcripción de lo que dijo el usuario (entrada a `analyzeAudioDescription`) |
| `message` | string | Respuesta de la IA (salida de `analyzeAudioDescription`) |
| `created_at` | timestamp | Cuándo se analizó |

**Flujo:** El usuario graba → se obtiene `transcript` (STT) → se llama `analyzeAudioDescription` → se guarda este registro. Opcionalmente se sube el audio a storage y se guarda `audio_url` / `audio_storage_key` para auditoría o replay.

---

## 5. Resumen

- **Usuarios:** perfil y contexto de onboarding.
- **Chat:** mensajes user/assistant por usuario y fecha.
- **Imágenes:** análisis de fotos (`food_description`, `suggestion`, `message`) + referencia a la imagen.
- **Audio:** análisis de descripciones habladas (`transcript`, `message`) + opcionalmente referencia al archivo de audio.

Con esto se puede construir historial de chat, “log” de comidas analizadas (imagen y audio) y reportes sencillos.
