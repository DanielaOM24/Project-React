# NutriLens

NutriLens is a mobile application designed to help users manage their nutritional profile, track daily meals, and achieve their health goals through personalized recommendations and meal analysis.

## Features

### Authentication & Onboarding
- User registration with email and password
- Secure login with JWT token management
- Personalized onboarding flow to capture user preferences and goals
- Profile management with editable nutritional information

### Meal Tracking
- Photo-based meal registration using device camera
- Audio-based meal registration for voice descriptions
- AI-powered meal analysis with detailed nutritional breakdown
- Daily calorie and macronutrient tracking
- Meal history with visual timeline

### Dashboard
- Daily calorie progress visualization
- Macronutrient breakdown (proteins, carbs, fats)
- Meal summary by type (breakfast, lunch, dinner, snack)
- Real-time goal tracking

### Recipes
- Personalized recipe recommendations based on user profile
- Filter recipes by meal type
- Detailed recipe view with ingredients and preparation steps
- Nutritional information per recipe

### Chat Assistant
- Conversational interface for nutritional guidance
- Goal-based recommendations
- Meal planning assistance

## Technology Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript 5.9.2
- **Navigation**: Expo Router 6.0.22
- **State Management**: React Context API
- **Storage**: AsyncStorage (mobile) / localStorage (web)
- **UI Components**: Custom design system with Ionicons
- **Backend**: REST API integration

## Project Structure

```
Onboarding-Nutrilens/
├── app/                    # Application screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Onboarding flow
│   │   ├── home.tsx       # Dashboard
│   │   ├── recipes.tsx    # Recipe browser
│   │   ├── register.tsx   # Meal registration
│   │   ├── chat.tsx       # Chat assistant
│   │   └── profile.tsx   # User profile
│   ├── index.tsx          # Initial screen
│   ├── login.tsx          # Login screen
│   └── register.tsx       # Registration screen
├── components/            # Reusable components
│   ├── buttons/          # Button components
│   ├── recipes/          # Recipe components
│   └── ui/               # UI primitives
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state
├── services/             # API services
│   ├── api.ts            # Main API exports
│   ├── apiRequest.ts     # HTTP request helper
│   ├── auth.ts           # Authentication API
│   ├── meals.ts          # Meal analysis API
│   ├── profile.ts        # Profile API
│   └── recipes.ts        # Recipes API
├── types/                # TypeScript type definitions
│   ├── api.type.ts       # API request/response types
│   ├── meals.type.ts     # Meal-related types
│   ├── recipes.ts        # Recipe types
│   └── user.type.ts      # User profile types
├── utils/                # Utility functions
│   ├── audio.ts          # Audio recording utilities
│   ├── camera.ts         # Camera utilities
│   ├── image.ts          # Image processing
│   └── translations.ts   # Translation helpers
├── styles/               # Design system
│   └── designSystem.ts   # Colors, typography, spacing
└── ai/                   # AI integration
    ├── chat.service.ts    # Chat AI service
    └── meal-analysis.service.ts  # Meal analysis AI
```

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Expo CLI (install globally or use npx)

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android  # Android
npm run ios       # iOS
npm run web       # Web browser
```

## Configuration

The application connects to a backend REST API. Configure the API base URL in `services/config.ts`:

```typescript
export const API_BASE_URL = 'https://nutrilens-0x37.onrender.com';
```

## Design System

The application uses a consistent design system defined in `styles/designSystem.ts`:

- **Primary Color**: `#A4D65E` (Lime green)
- **Dark Green**: `#1F2937` (Text and accents)
- **Background**: `#FFFFFF` (White)
- **Typography**: System fonts with consistent sizing
- **Spacing**: 4px base unit system

## Key Features Implementation

### Meal Analysis
Meal analysis is performed using AI services that process images or audio recordings. The analysis provides:
- Detected foods with portions
- Nutritional breakdown (calories, protein, carbs, fats)
- Meal type classification

### Authentication Flow
1. User registers with email and password
2. Completes onboarding questionnaire
3. Receives JWT tokens (access and refresh)
4. Tokens stored securely for subsequent requests

### Data Synchronization
All meal data is synchronized with the backend API. The dashboard automatically updates when new meals are registered.

## Development Guidelines

### Code Organization
- Types are centralized in the `types/` directory
- Services are modularized by domain (auth, meals, profile, recipes)
- Components follow a reusable pattern
- Comments are minimal and section-based in English

### Error Handling
- API errors are handled consistently through `apiRequest` helper
- Session expiration is automatically detected and handled
- User-friendly error messages are displayed

### State Management
- Authentication state managed via React Context
- Local component state for UI interactions
- API responses cached where appropriate

## Building for Production

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## License

This project is proprietary software developed for NutriLens.

## Support

For technical support or questions, please contact the development team.
