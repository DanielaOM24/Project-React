# Integración Backend - NutriLens API

Este documento describe cómo está estructurada la conexión entre la aplicación React Native y el backend REST API, incluyendo la configuración de endpoints, manejo de tokens y estructura de datos.

## 🌐 Configuración del Backend

### URL Base
```typescript
// services/config.ts
export const API_BASE_URL = 'https://nutrilens-0x37.onrender.com';
```

La aplicación se conecta a un backend REST API desplegado en Render. Todos los endpoints se construyen concatenando esta URL base con la ruta específica.

## 📁 Estructura Modular de Servicios

La integración con el backend está organizada en módulos separados para facilitar el mantenimiento:

```
services/
├── api.ts              # Archivo principal (re-exporta todo)
├── config.ts           # Configuración (URL base)
├── types.ts            # Interfaces TypeScript para requests/responses
├── token.ts            # Gestión de tokens (getToken, saveToken, removeToken)
├── apiRequest.ts       # Función helper para peticiones HTTP
├── auth.ts             # API de autenticación
├── profile.ts          # API de perfil de usuario
└── converters.ts      # Funciones de conversión de datos
```

## 🔐 Autenticación y Tokens

### Almacenamiento de Tokens

Los tokens se almacenan de forma segura según la plataforma:

- **Web**: `localStorage` (persistente en el navegador)
- **React Native**: `AsyncStorage` (persistente en el dispositivo)
- **Memoria**: Variable en memoria para acceso rápido

```typescript
// services/token.ts
let tokenInMemory: string | null = null;

export const getToken = async (): Promise<string | null>
export const saveToken = async (accessToken: string, refreshToken?: string): Promise<void>
export const removeToken = async (): Promise<void>
```

### Flujo de Autenticación

1. **Login/Registro**: El backend devuelve `accessToken` y `refreshToken`
2. **Guardado**: Los tokens se guardan en memoria y almacenamiento persistente
3. **Verificación**: Se verifica que el token se guardó correctamente
4. **Uso**: El token se incluye automáticamente en headers de peticiones protegidas

### Headers de Autenticación

Para endpoints protegidos (`/api/*`), el token se incluye automáticamente:

```typescript
headers.Authorization = `Bearer ${token}`
```

## 📡 Endpoints Implementados

### 1. Autenticación (`/auth`)

#### POST `/auth/login`
**Archivo**: `services/auth.ts` → `authAPI.login()`

**Request Body**:
```typescript
{
  email: string;      // Email en minúsculas y sin espacios
  password: string;   // Contraseña del usuario
}
```

**Response**:
```typescript
{
  accessToken: string;
  refreshToken: string;
}
```

**Uso**:
```typescript
import { authAPI } from '@/services/api';

const response = await authAPI.login(email, password);
// El token se guarda automáticamente
```

---

#### POST `/auth/register`
**Archivo**: `services/auth.ts` → `authAPI.register()`

**Request Body** (según schema del Swagger):
```typescript
{
  displayName: string;           // Requerido
  email: string;                 // Requerido (minúsculas)
  password: string;              // Requerido
  weight: number;                // Default: 0
  height: number;                // Default: 0
  age: number;                   // Default: 0
  preference: 'NORMAL' | 'VEGETARIANO';  // Default: 'NORMAL'
  meals: number;                 // Default: 0
  goal: 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE';  // Default: 'MAINTAIN'
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';  // Default: 'LOW'
}
```

**Response**:
```typescript
{
  accessToken: string;
  refreshToken: string;
}
```

**Uso**:
```typescript
import { authAPI, RegisterData } from '@/services/api';

const registerData: RegisterData = {
  displayName: 'Juan Pérez',
  email: 'juan@example.com',
  password: 'password123',
  weight: 70,
  height: 175,
  age: 25,
  preference: 'NORMAL',
  meals: 3,
  goal: 'LOSE_WEIGHT',
  activityLevel: 'MEDIUM'
};

const response = await authAPI.register(registerData);
```

---

#### POST `/auth/google`
**Archivo**: `services/auth.ts` → `authAPI.loginWithGoogle()`

**Request Body**:
```typescript
{
  googleSub: string;
  email: string;
  name: string;
  avatarUrl?: string;
}
```

**Response**:
```typescript
{
  accessToken: string;
  refreshToken: string;
}
```

---

### 2. Perfil de Usuario (`/api/users`)

#### GET `/api/users/profile`
**Archivo**: `services/profile.ts` → `profileAPI.getProfile()`

**Headers Requeridos**:
```
Authorization: Bearer <accessToken>
```

**Response**:
```typescript
{
  id?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  preference?: 'NORMAL' | 'VEGETARIANO';
  meals?: number;
  goal?: 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE';
  daily_calories?: number;
}
```

**Uso**:
```typescript
import { profileAPI } from '@/services/api';

const profile = await profileAPI.getProfile();
```

---

#### PUT `/api/users/profile`
**Archivo**: `services/profile.ts` → `profileAPI.updateProfile()`

**Headers Requeridos**:
```
Authorization: Bearer <accessToken>
```

**Request Body** (según schema del Swagger):
```typescript
{
  displayName: string;           // Requerido (no puede estar vacío)
  avatarUrl: string;              // Default: ''
  weight: number;                 // Default: 0
  height: number;                 // Default: 0
  age: number;                    // Default: 0
  preference: 'NORMAL' | 'VEGETARIANO';  // Default: 'NORMAL'
  meals: number;                  // Default: 0
  goal: 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE';  // Default: 'MAINTAIN'
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';  // Default: 'LOW'
}
```

**Response**: Mismo formato que GET `/api/users/profile`

**Uso**:
```typescript
import { profileAPI, UpdateProfileData } from '@/services/api';

const updateData: UpdateProfileData = {
  displayName: 'Juan Pérez Actualizado',
  weight: 72,
  height: 175,
  age: 26,
  preference: 'VEGETARIANO',
  meals: 4,
  goal: 'MAINTAIN',
  activityLevel: 'HIGH'
};

const updatedProfile = await profileAPI.updateProfile(updateData);
```

## 🔄 Función Helper: `apiRequest`

Todas las peticiones HTTP pasan por la función `apiRequest` que:

1. **Detecta endpoints protegidos**: Cualquier endpoint que contenga `/api/` requiere autenticación
2. **Obtiene el token**: Automáticamente obtiene el token del almacenamiento
3. **Incluye headers**: Agrega `Authorization: Bearer <token>` para endpoints protegidos
4. **Maneja errores**: Gestiona errores 401/403 limpiando tokens expirados
5. **Logging**: Registra todas las peticiones para debugging

```typescript
// services/apiRequest.ts
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any>
```

### Configuración de Fetch

```typescript
{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer <token>' // Solo para endpoints protegidos
  },
  mode: 'cors',
  credentials: 'omit',
  body: JSON.stringify(data) // Solo para POST/PUT
}
```

## 🛡️ Manejo de Errores

### Errores 401 (Unauthorized)
- **Acción**: Limpia el token automáticamente
- **Mensaje**: "Tu sesión ha expirado. Por favor inicia sesión nuevamente."
- **Comportamiento**: Redirige al usuario al login

### Errores 403 (Forbidden)
- **Análisis**: Verifica el mensaje del servidor
- **Si es por autenticación**: Limpia el token y muestra mensaje de sesión expirada
- **Si es por permisos**: Muestra el mensaje específico del servidor sin limpiar el token

### Otros Errores
- **400**: Datos inválidos
- **409**: Conflicto (email ya registrado)
- **500**: Error del servidor
- **Network**: Error de conexión

## 🔄 Conversión de Datos

### Funciones de Conversión

El módulo `services/converters.ts` contiene funciones para convertir valores del frontend al formato del backend:

```typescript
// Objetivos
convertGoalToBackend('lose')      → 'LOSE_WEIGHT'
convertGoalToBackend('maintain') → 'MAINTAIN'
convertGoalToBackend('gain')      → 'GAIN_MUSCLE'

// Nivel de actividad
convertActivityToBackend('low')   → 'LOW'
convertActivityToBackend('medium') → 'MEDIUM'
convertActivityToBackend('high')  → 'HIGH'

// Preferencias alimentarias
convertDietToBackend('vegetarian') → 'VEGETARIANO'
convertDietToBackend('normal')     → 'NORMAL'
```

## 📊 Flujo de Datos

### Registro con Onboarding

1. **Usuario completa registro** (`app/register.tsx`)
   - Datos guardados temporalmente en `registerStorage`

2. **Usuario completa onboarding** (`app/(tabs)/index.tsx`)
   - Respuestas convertidas con `convertOnboardingToBackend()`
   - Datos combinados con datos de registro

3. **Petición al backend** (`services/auth.ts`)
   - `POST /auth/register` con todos los datos
   - Backend devuelve tokens

4. **Guardado de tokens** (`services/token.ts`)
   - Tokens guardados en memoria y almacenamiento persistente
   - Verificación de guardado correcto

5. **Obtención de perfil** (`services/profile.ts`)
   - `GET /api/users/profile` con token en header
   - Perfil mostrado en pantalla

### Actualización de Perfil

1. **Usuario edita datos** (`app/(tabs)/profile.tsx`)
   - Datos validados localmente

2. **Petición al backend** (`services/profile.ts`)
   - `PUT /api/users/profile` con datos actualizados
   - Token incluido automáticamente en header

3. **Respuesta del backend**
   - Perfil actualizado devuelto
   - UI actualizada con nuevos datos

## 🔍 Logging y Debugging

Todas las peticiones incluyen logging detallado:

```typescript
// Ejemplo de logs
[API] Token incluido en petición a /api/users/profile: {
  tokenPreview: 'eyJhbGciOiJIUzI1NiIsInR5...',
  tokenLength: 234,
  headerValue: 'Bearer eyJhbGciOiJIUzI1NiIsInR5...'
}

[API] Error en /api/users/profile: {
  status: 403,
  statusText: 'Forbidden',
  errorMessage: 'Acceso denegado',
  hasToken: true,
  tokenPreview: 'Bearer eyJhbGciOiJIUzI1NiIsInR5...',
  responseData: {...},
  responseText: '...'
}
```

## 📝 Validaciones

### Validaciones del Frontend

- **Email**: Se convierte a minúsculas y se eliminan espacios
- **Números**: Se validan que no sean NaN y tengan valores por defecto
- **Enums**: Se validan contra valores permitidos del backend
- **displayName**: No puede estar vacío en actualización de perfil

### Valores por Defecto

Si un campo no se proporciona, se usan estos valores por defecto:

```typescript
{
  weight: 0,
  height: 0,
  age: 0,
  meals: 0,
  preference: 'NORMAL',
  goal: 'MAINTAIN',
  activityLevel: 'LOW',
  displayName: '', // Requerido en actualización
  avatarUrl: ''
}
```

## 🔗 Integración con Contexto de Autenticación

El `AuthContext` (`contexts/AuthContext.tsx`) utiliza los servicios de API:

```typescript
import { getToken, profileAPI } from '@/services/api';

// Obtiene el perfil del usuario al iniciar la app
const refreshProfile = async () => {
  const token = await getToken();
  if (token) {
    const profile = await profileAPI.getProfile();
    setUser(profile);
  }
};
```

## 🚨 Manejo de Sesión Expirada

Cuando se detecta una sesión expirada:

1. **Token limpiado**: Se elimina de memoria y almacenamiento
2. **Usuario deslogueado**: El contexto de autenticación se limpia
3. **Redirección**: Usuario redirigido a pantalla de login
4. **Mensaje**: Se muestra alerta informando al usuario

## 📚 Referencias

- **Swagger Backend**: Documentación completa de la API en el backend
- **Tipos TypeScript**: Todas las interfaces están definidas en `services/types.ts`
- **Código fuente**: Ver archivos en `services/` para implementación detallada

## 🔧 Configuración de CORS

El backend debe tener configurado CORS para permitir peticiones desde:
- **Web**: Origen del dominio de la aplicación
- **Mobile**: Origen de la aplicación móvil

Las peticiones se realizan con:
```typescript
{
  mode: 'cors',
  credentials: 'omit'
}
```

## ✅ Checklist de Integración

- [x] Configuración de URL base
- [x] Gestión de tokens (guardar, obtener, eliminar)
- [x] Endpoint de login implementado
- [x] Endpoint de registro implementado
- [x] Endpoint de perfil (GET) implementado
- [x] Endpoint de perfil (PUT) implementado
- [x] Manejo de errores 401/403
- [x] Conversión de datos frontend → backend
- [x] Validación de datos antes de enviar
- [x] Logging para debugging
- [x] Integración con AuthContext
- [x] Manejo de sesión expirada


