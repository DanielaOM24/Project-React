# NutriLens - Aplicación de Gestión Nutricional

NutriLens es una aplicación móvil desarrollada con React Native y Expo que permite a los usuarios gestionar su perfil nutricional, recibir recomendaciones personalizadas y realizar un seguimiento de sus objetivos de salud.

## 🚀 Características Principales

### Autenticación
- **Registro de usuarios**: Creación de cuenta con información personal básica
- **Inicio de sesión**: Autenticación con email y contraseña
- **Login con Google**: (Preparado para implementación futura)
- **Gestión de sesión**: Tokens JWT con persistencia segura

### Onboarding
- **Flujo de preguntas personalizado**: 7 preguntas para conocer las preferencias del usuario
- **Objetivos**: Bajar de peso, mantener peso, o ganar masa muscular
- **Nivel de actividad**: Bajo, medio o alto
- **Preferencias alimentarias**: Normal o vegetariana
- **Datos personales**: Edad, peso y estatura

### Perfil de Usuario
- **Visualización de datos**: Muestra información completa del perfil nutricional
- **Edición de perfil**: Actualización de todos los campos del perfil
- **Objetivos editables**: Cambio de objetivo y nivel de actividad
- **Cálculo de calorías**: Visualización de calorías diarias recomendadas

### Navegación
- **Bottom Tabs**: Navegación principal con 5 pestañas
  - Inicio
  - Recetas
  - Cámara (destacada)
  - Chat
  - Perfil
- **Diseño "Liquid Glass"**: Efecto visual moderno en las barras de navegación

## 📱 Plataformas Soportadas

- **iOS**: Compatible con iPhone y iPad
- **Android**: Compatible con dispositivos Android
- **Web**: Versión web responsive

## 🛠️ Tecnologías Utilizadas

### Framework y Librerías Principales
- **Expo SDK 54**: Framework para desarrollo multiplataforma
- **React Native 0.81.5**: Framework base
- **React 19.1.0**: Biblioteca de UI
- **TypeScript 5.9.2**: Tipado estático

### Navegación
- **Expo Router 6.0.22**: Sistema de navegación basado en archivos
- **React Navigation**: Navegación entre pantallas

### UI/UX
- **Expo Linear Gradient**: Gradientes y efectos visuales
- **Expo Blur**: Efectos de desenfoque (liquid glass)
- **React Native Reanimated**: Animaciones fluidas
- **Expo Vector Icons**: Iconografía (Ionicons)

### Almacenamiento
- **AsyncStorage**: Almacenamiento local para React Native
- **localStorage**: Almacenamiento local para web

### Estado y Contexto
- **React Context API**: Gestión de estado global (autenticación)

## 📁 Estructura del Proyecto

```
Onboarding-Nutrilens/
├── app/                    # Pantallas de la aplicación (Expo Router)
│   ├── (tabs)/            # Pantallas con navegación por tabs
│   │   ├── index.tsx      # Onboarding
│   │   ├── home.tsx       # Pantalla de inicio
│   │   ├── recipes.tsx    # Pantalla de recetas
│   │   ├── register.tsx   # Pantalla de cámara
│   │   ├── chat.tsx       # Pantalla de chat
│   │   └── profile.tsx    # Perfil de usuario
│   ├── index.tsx          # Pantalla inicial (login/registro)
│   ├── login.tsx          # Pantalla de login
│   ├── register.tsx       # Pantalla de registro
│   └── success.tsx        # Pantalla de éxito
├── components/             # Componentes reutilizables
│   ├── BottomTabs.tsx     # Barra de navegación del onboarding
│   ├── MainBottomTabs.tsx # Barra de navegación principal
│   ├── NumberSelector.tsx # Selector numérico
│   └── ui/                # Componentes UI
│       └── GradientBackground.tsx
├── contexts/               # Contextos de React
│   └── AuthContext.tsx    # Contexto de autenticación
├── services/               # Servicios de API (modularizado)
│   ├── api.ts             # Archivo principal (re-exportaciones)
│   ├── types.ts           # Tipos e interfaces TypeScript
│   ├── config.ts          # Configuración (URL base)
│   ├── token.ts           # Gestión de tokens
│   ├── apiRequest.ts      # Helper para peticiones HTTP
│   ├── auth.ts            # API de autenticación
│   ├── profile.ts         # API de perfil
│   └── converters.ts      # Funciones de conversión
├── styles/                 # Sistema de diseño
│   ├── designSystem.ts    # Colores, tipografía, espaciado
│   ├── backgrounds.ts     # Gradientes predefinidos
│   └── index.ts           # Exportaciones centralizadas
├── utils/                  # Utilidades
│   ├── onboardingStorage.ts # Almacenamiento de datos de onboarding
│   └── registerStorage.ts   # Almacenamiento temporal de registro
├── assets/                 # Recursos estáticos
│   └── images/            # Imágenes e iconos
├── app.json               # Configuración de Expo
└── package.json           # Dependencias del proyecto
```

## 🚦 Flujo de la Aplicación

1. **Pantalla Inicial** (`app/index.tsx`)
   - Usuario ve opciones para iniciar sesión o registrarse
   - Si ya está autenticado, redirige al perfil

2. **Registro** (`app/register.tsx`)
   - Usuario ingresa: nombre, email y contraseña
   - Los datos se guardan temporalmente
   - Redirige al flujo de onboarding

3. **Onboarding** (`app/(tabs)/index.tsx`)
   - 7 preguntas sobre objetivos, preferencias y datos personales
   - Al completar, se registra el usuario con todos los datos
   - Redirige al perfil

4. **Login** (`app/login.tsx`)
   - Usuario ingresa email y contraseña
   - Obtiene tokens de autenticación
   - Redirige al perfil

5. **Perfil** (`app/(tabs)/profile.tsx`)
   - Visualiza información del usuario
   - Permite editar todos los campos
   - Muestra calorías diarias recomendadas

## 🎨 Sistema de Diseño

### Colores
- **Verde Principal**: `#A4D65E` - Color de marca
- **Verde Secundario**: `#89F336` - Gradientes
- **Texto Principal**: `#1F2937` - Gris oscuro
- **Texto Secundario**: `#6B7280` - Gris medio
- **Fondo**: `#FFFFFF` - Blanco

### Tipografía
- **Fuente Principal**: Sistema (San Francisco en iOS, Roboto en Android)
- **Tamaños**: xs (12px) a 4xl (36px)

### Espaciado
- Sistema consistente: xs (4px) a xl (32px)

## 🔐 Seguridad

- **Tokens JWT**: Autenticación segura con accessToken y refreshToken
- **Almacenamiento seguro**: Tokens guardados en AsyncStorage (mobile) o localStorage (web)
- **Validación de sesión**: Verificación automática de tokens en peticiones protegidas
- **Manejo de errores**: Limpieza automática de tokens expirados

## 📦 Instalación y Uso

### Requisitos Previos
- Node.js 18+ 
- npm o yarn
- Expo CLI (instalado globalmente o vía npx)

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Ejecutar en plataforma específica
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

### Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo con limpieza de caché
- `npm run android` - Ejecuta en Android
- `npm run ios` - Ejecuta en iOS
- `npm run web` - Ejecuta en navegador web
- `npm run lint` - Ejecuta el linter

## 🌐 Backend

La aplicación se conecta con un backend REST API desplegado en Render:
- **URL Base**: `https://nutrilens-0x37.onrender.com`
- **Documentación**: Ver `BACKEND_INTEGRATION.md` para detalles completos

## 📝 Notas de Desarrollo

- **Fast Refresh**: Habilitado para desarrollo rápido
- **TypeScript**: Tipado estricto en todo el proyecto
- **Modularización**: Código organizado en módulos reutilizables
- **Responsive**: Diseño adaptativo para diferentes tamaños de pantalla

## 🔄 Estado del Proyecto

### ✅ Implementado
- Autenticación (login, registro)
- Onboarding completo
- Perfil de usuario (visualización y edición)
- Navegación principal
- Integración con backend

### 🚧 En Desarrollo
- Pantallas de recetas
- Funcionalidad de cámara
- Sistema de chat
- Login con Google

## 📄 Licencia

Este proyecto es privado.

## 👥 Contribuidores

Desarrollado para NutriLens.


