# Chat, objetivo dinámico, endpoints y base de datos — NutriLens

## 1. Dónde está el objetivo

- **Pantalla del chat:** `app/(tabs)/ai-chat.tsx`
  - Líneas **27–32**: `testUserContext` con `objetivo: 'perder peso'` (fijo).
  - Línea **154**: la pill del header muestra `testUserContext.objetivo`.
  - Línea **63**: `getChatResponse(text, testUserContext)` usa ese contexto.
- **Prompts y servicio:** `ai/prompts.ts` define `UserContext` (objetivo, dieta, etc.) y `ai/chat.service.ts` lo usa para chat, imagen y audio.

Para que sea dinámico: el objetivo debe venir de **estado** (o de la base de datos) y la UI debe preguntar “¿Cuál es tu objetivo?” y permitir agregar/cambiar objetivo (y opcionalmente “reiniciar” el chat con el nuevo objetivo).

---

## 2. Endpoints para audio e imagen (y perfil nutricional)

**En este proyecto no hay backend propio.** La app es React Native/Expo y llama **directo a la API de Gemini** desde el cliente:

- **Imagen:** `ai/chat.service.ts` → `analyzeFoodImage(imageBase64, userContext)`  
  - Recibe imagen en base64 y contexto; devuelve `{ foodDescription, suggestion, message }`.
- **Audio:** `ai/chat.service.ts` → `analyzeAudioDescription(transcript, userContext)`  
  - Recibe la **transcripción** del audio (no el archivo) y contexto; devuelve `{ message }`.

No existen endpoints HTTP en el repo (no hay `api/`, Express, etc.). Si quieres:

- **Endpoints que reciban audio/imagen y devuelvan la respuesta del perfil nutricional**, tendrías que crear un backend que:
  1. Reciba imagen (o audio → transcribir con STT).
  2. Llame a la lógica equivalente a `analyzeFoodImage` / `analyzeAudioDescription` (o a Gemini).
  3. Opcionalmente guarde el resultado en la base de datos (según `docs/DATABASE.md`).
  4. Devuelva la respuesta (y si aplica, el perfil nutricional usado).

Hasta que exista ese backend, la app puede seguir usando las funciones de `ai/chat.service.ts` desde el cliente (o desde un futuro backend que las reutilice).

---

## 3. JSON para el chat: qué necesita la app y qué envía/recibe la base de datos

### Qué necesita el chat (entrada)

El chat usa un **perfil de usuario** con esta forma (ya definida en `UserContext` en `ai/prompts.ts`):

```json
{
  "objetivo": "perder peso",
  "dieta": "sin restricciones",
  "comidasPreferidas": ["pollo", "ensaladas", "frutas"],
  "restricciones": ["lactosa"],
  "infoAdicional": "Hago ejercicio 3 veces por semana"
}
```

- **objetivo** (string): ej. "perder peso", "ganar masa muscular", "mantener peso".
- **dieta** (string): ej. "vegetariana", "vegana", "keto", "sin restricciones".
- **comidasPreferidas** (array, opcional).
- **restricciones** (array, opcional): alergias, intolerancias.
- **infoAdicional** (string, opcional).

Opcionalmente también puede usar **historial de conversación** (lista de mensajes user/assistant) para contexto multi-turno.

### Qué envía la app a la base de datos

- **Cada mensaje del chat** (para persistir historial), por ejemplo:

```json
{
  "user_id": "uuid-del-usuario",
  "role": "user",
  "content": "¿Qué puedo cenar?"
}
```

y después el mensaje del asistente:

```json
{
  "user_id": "uuid-del-usuario",
  "role": "assistant",
  "content": "Para cenar, con tu objetivo de..."
}
```

- **Perfil nutricional:** cuando el usuario actualiza objetivo, dieta, restricciones, etc., la app enviaría ese objeto (o los campos que cambien) para guardar en la tabla de usuarios/perfil (ver `docs/DATABASE.md`).

### Qué envía la base de datos a la app

- **Perfil nutricional del usuario** (para armar `UserContext` y mostrarlo en la pill / preguntas):
  - Misma estructura que arriba: `objetivo`, `dieta`, `comidasPreferidas`, `restricciones`, `infoAdicional`.
- **Historial de chat** (opcional): lista de mensajes `{ role, content, created_at }` para mostrar y/o enviar a la IA.

### Por qué la app envía datos a la base de datos

- **Guardar mensajes:** para tener historial, retomar conversaciones y métricas.
- **Guardar/actualizar perfil:** para que el objetivo, dieta y restricciones persistan y se usen en todos los dispositivos y en futuras sesiones.
- **Guardar análisis de imagen/audio:** para “Objetivo del día”, historial de comidas o reportes (según `docs/DATABASE.md`).

---

## 4. Resumen

| Tema | Respuesta breve |
|------|-----------------|
| **Dónde está el objetivo** | `app/(tabs)/ai-chat.tsx` en `testUserContext` (líneas 27–32 y 154, 63). |
| **Objetivo dinámico** | Usar estado (o API) para el perfil; preguntar “¿Cuál es tu objetivo?” y permitir agregar/cambiar objetivo y opcionalmente reiniciar chat. |
| **Endpoints audio/imagen** | No hay endpoints en el repo; la lógica está en `ai/chat.service.ts` (Gemini desde cliente). Un backend futuro podría exponer endpoints que llamen a esas funciones y devuelvan la respuesta (y perfil). |
| **JSON para el chat** | Entrada: `UserContext` (objetivo, dieta, comidasPreferidas, restricciones, infoAdicional). Opcional: historial de mensajes. |
| **Qué envía la app al backend/DB** | Mensajes (user/assistant) y actualizaciones de perfil (objetivo, dieta, etc.). |
| **Qué envía la DB a la app** | Perfil del usuario y, si aplica, historial de chat. |
| **Por qué la app manda datos al backend** | Persistir historial, perfil y análisis (imagen/audio) para uso multi-dispositivo y reportes. |
