import BottomTabs from '@/components/BottomTabs';
import NumberSelector from '@/components/NumberSelector';
import GradientBackground from '@/components/ui/GradientBackground';
import { useAuth } from '@/contexts/AuthContext';
import { colors, radius, spacing } from '@/styles/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

type AnswerType = string | null | { age?: number; weight?: number; height?: number };

interface Question {
  id: number;
  question: string;
  type: 'options' | 'form';
  options?: {
    id: string;
    label: string;
    icon: string;
  }[];
  formFields?: {
    id: string;
    label: string;
    unit: string;
    min: number;
    max: number;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: '¿Cuál es tu objetivo principal ahora mismo?',
    type: 'options',
    options: [
      { id: 'lose', label: 'Bajar de peso', icon: 'fitness-outline' },
      { id: 'maintain', label: 'Mantener mi peso', icon: 'scale-outline' },
      { id: 'gain', label: 'Ganar masa muscular', icon: 'barbell-outline' },
    ],
  },
  {
    id: 2,
    question: '¿Qué tan claro tienes qué comer en tu día a día?',
    type: 'options',
    options: [
      { id: 'not-sure', label: 'No sé muy bien qué comer', icon: 'restaurant-outline' },
      { id: 'need-support', label: 'Sé qué comer, pero quiero apoyo', icon: 'people-outline' },
    ],
  },
  {
    id: 3,
    question: 'Cuéntanos un poco sobre ti',
    type: 'form',
    formFields: [
      { id: 'age', label: 'Edad', unit: 'años', min: 13, max: 75 },
      { id: 'weight', label: 'Peso', unit: 'kg', min: 40, max: 200 },
      { id: 'height', label: 'Estatura', unit: 'cm', min: 140, max: 250 },
    ],
  },
  {
    id: 4,
    question: '¿Cómo es tu nivel de actividad física actualmente?',
    type: 'options',
    options: [
      { id: 'low', label: 'Bajo — Camino poco o paso mucho tiempo sentado', icon: 'bed-outline' },
      { id: 'medium', label: 'Medio — Me muevo seguido durante el día', icon: 'walk-outline' },
      { id: 'high', label: 'Alto — Entreno varias veces por semana', icon: 'fitness-outline' },
    ],
  },
  {
    id: 5,
    question: '¿Sigues algún tipo de alimentación en especial?',
    type: 'options',
    options: [
      { id: 'normal', label: 'Normal', icon: 'restaurant-outline' },
      { id: 'vegetarian', label: 'Vegetariana', icon: 'leaf-outline' },
      { id: 'no-restrictions', label: 'Sin restricciones por ahora', icon: 'checkmark-circle-outline' },
    ],
  },
  {
    id: 6,
    question: '¿Cuántas comidas sueles hacer al día?',
    type: 'options',
    options: [
      { id: '2', label: '2', icon: 'leaf-outline' },
      { id: '3', label: '3', icon: 'restaurant-outline' },
      { id: '4', label: '4', icon: 'nutrition-outline' },
      { id: '5', label: '5', icon: 'barbell-outline' },
    ],
  },
  {
    id: 7,
    question: '¿Qué tanta variedad te gustaría en tus comidas?',
    type: 'options',
    options: [
      { id: 'little', label: 'Poca', icon: 'remove-circle-outline' },
      { id: 'normal-variety', label: 'Normal', icon: 'radio-button-on-outline' },
      { id: 'much', label: 'Mucha', icon: 'flower-outline' },
    ],
  },
];

const totalSteps = questions.length;

// Generar arrays de números para los pickers
const generateNumbers = (min: number, max: number): number[] => {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
};

export default function HomeScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, AnswerType>>({});
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { refreshProfile } = useAuth();
  
  const currentQuestion = questions.find((q) => q.id === currentStep);
  
  // Para preguntas de opciones
  const selectedAnswer = currentQuestion?.type === 'options' 
    ? (answers[currentQuestion.id] as string | null)
    : null;
  
  // Para preguntas de formulario
  const formData = currentQuestion?.type === 'form'
    ? (answers[currentQuestion.id] as { age?: number; weight?: number; height?: number } | null) || {}
    : {};
  
  const isFormComplete = currentQuestion?.type === 'form'
    ? formData.age !== undefined && formData.weight !== undefined && formData.height !== undefined
    : false;
  
  const isNextEnabled = currentQuestion?.type === 'options' 
    ? selectedAnswer !== null 
    : isFormComplete;

  // Animación de la barra de progreso
  const progressWidth = useRef(new Animated.Value(0)).current;

  // Animaciones de entrada
  const questionTranslateY = useRef(new Animated.Value(30)).current;
  
  // Animaciones para cada card usando Map para evitar errores de índice
  const cardAnimations = useRef(
    new Map<string, {
      selectScale: Animated.Value;
      translateY: Animated.Value;
    }>()
  ).current;

  // Inicializar animaciones para todas las opciones
  questions.forEach((q) => {
    if (q.type === 'options') {
      q.options!.forEach((option) => {
        const key = `${q.id}-${option.id}`;
        if (!cardAnimations.has(key)) {
          cardAnimations.set(key, {
            selectScale: new Animated.Value(1),
            translateY: new Animated.Value(30),
          });
        }
      });
    }
  });

  // Animación de la barra de progreso
  useEffect(() => {
    const progress = currentStep / totalSteps;
    Animated.spring(progressWidth, {
      toValue: progress,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Animación de entrada cuando cambia el paso
  useEffect(() => {
    // Resetear animaciones
    questionTranslateY.setValue(30);

    // Resetear animaciones de las cards de la pregunta actual
    if (currentQuestion && currentQuestion.type === 'options') {
      currentQuestion.options!.forEach((option) => {
        const key = `${currentQuestion.id}-${option.id}`;
        const anim = cardAnimations.get(key);
        if (anim) {
          anim.selectScale.setValue(1);
          anim.translateY.setValue(30);
        }
      });
    }

    // Animación de la pregunta
    Animated.spring(questionTranslateY, {
      toValue: 0,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
    }).start();

    // Animación escalonada de las cards (solo para preguntas de opciones)
    if (currentQuestion && currentQuestion.type === 'options') {
      currentQuestion.options!.forEach((option, index) => {
        const key = `${currentQuestion.id}-${option.id}`;
        const anim = cardAnimations.get(key);
        
        if (anim) {
          setTimeout(() => {
            Animated.spring(anim.translateY, {
              toValue: 0,
              tension: 50,
              friction: 10,
              useNativeDriver: true,
            }).start();
          }, 150 + index * 80);
        }
      });
    }
  }, [currentStep]);

  // Función para manejar la selección con animación
  const handleSelect = (optionId: string) => {
    if (currentQuestion && currentQuestion.type === 'options') {
      setAnswers({ ...answers, [currentQuestion.id]: optionId });
      
      // Animación sutil de "toquecito" al seleccionar
      const key = `${currentQuestion.id}-${optionId}`;
      const anim = cardAnimations.get(key);
      if (anim) {
        Animated.sequence([
          Animated.spring(anim.selectScale, {
            toValue: 1.02,
            tension: 200,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.spring(anim.selectScale, {
            toValue: 1,
            tension: 200,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  // Función para manejar cambios en el formulario
  const handleFormChange = (fieldId: string, value: number) => {
    if (currentQuestion && currentQuestion.type === 'form') {
      const currentFormData = formData || {};
      setAnswers({
        ...answers,
        [currentQuestion.id]: {
          ...currentFormData,
          [fieldId]: value,
        },
      });
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completar onboarding
      try {
        const { convertOnboardingToBackend } = require('@/utils/onboardingStorage');
        const { getPendingRegisterData, clearPendingRegisterData } = require('@/utils/registerStorage');
        const { authAPI } = require('@/services/api');
        
        // Convertir respuestas del onboarding al formato del backend
        const onboardingData = convertOnboardingToBackend(answers);
        
        // Verificar si hay datos de registro pendientes
        const pendingRegisterData = await getPendingRegisterData();
        
        if (pendingRegisterData) {
          // Si hay datos de registro pendientes, registrar al usuario
          console.log('[Onboarding] Registrando usuario con datos del onboarding...');
          
          // Preparar datos completos de registro según el schema del swagger
          const registerData: any = {
            displayName: pendingRegisterData.displayName.trim(),
            email: pendingRegisterData.email.trim().toLowerCase(),
            password: pendingRegisterData.password,
            // Incluir todos los campos del onboarding con validación
            weight: onboardingData.weight !== undefined && onboardingData.weight !== null ? Number(onboardingData.weight) : 0,
            height: onboardingData.height !== undefined && onboardingData.height !== null ? Number(onboardingData.height) : 0,
            age: onboardingData.age !== undefined && onboardingData.age !== null ? Number(onboardingData.age) : 0,
            meals: onboardingData.meals !== undefined && onboardingData.meals !== null ? Number(onboardingData.meals) : 0,
            preference: (onboardingData.preference === 'VEGETARIANO' || onboardingData.preference === 'NORMAL') 
              ? onboardingData.preference 
              : 'NORMAL',
            goal: (onboardingData.goal === 'LOSE_WEIGHT' || onboardingData.goal === 'MAINTAIN' || onboardingData.goal === 'GAIN_MUSCLE')
              ? onboardingData.goal
              : 'MAINTAIN',
            activityLevel: (onboardingData.activityLevel === 'LOW' || onboardingData.activityLevel === 'MEDIUM' || onboardingData.activityLevel === 'HIGH')
              ? onboardingData.activityLevel
              : 'LOW',
          };
          
          // Validar que los valores numéricos sean válidos
          registerData.weight = isNaN(Number(registerData.weight)) ? 0 : Number(registerData.weight);
          registerData.height = isNaN(Number(registerData.height)) ? 0 : Number(registerData.height);
          registerData.age = isNaN(Number(registerData.age)) ? 0 : Number(registerData.age);
          registerData.meals = isNaN(Number(registerData.meals)) ? 0 : Number(registerData.meals);
          
          console.log('[Onboarding] Datos de registro preparados:', {
            ...registerData,
            password: '***',
          });
          
          // Registrar usuario
          await authAPI.register(registerData);
          
          // Limpiar datos temporales
          await clearPendingRegisterData();
          
          // Verificar que el token se guardó correctamente antes de continuar
          const { getToken } = require('@/services/api');
          let token = await getToken();
          let attempts = 0;
          const maxAttempts = 10;
          
          // Esperar hasta que el token esté disponible
          while (!token && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 50));
            token = await getToken();
            attempts++;
          }
          
          if (!token) {
            Alert.alert('Error', 'No se pudo guardar tu sesión. Por favor inicia sesión manualmente.');
            router.push('/login');
            return;
          }
          
          // Refrescar perfil y navegar al perfil
          await refreshProfile();
          router.push('/(tabs)/profile');
        } else {
          // Si no hay datos de registro pendientes, solo guardar datos del onboarding
          // (esto es para usuarios que ya están registrados y solo están actualizando su perfil)
          const { saveOnboardingData } = require('@/utils/onboardingStorage');
          await saveOnboardingData(onboardingData);
          console.log('[Onboarding] Datos guardados');
          
          // Navegar a success
          router.push('/success');
        }
      } catch (error: any) {
        console.error('[Onboarding] Error al completar:', error);
        Alert.alert('Error', error?.message || 'Error al completar el onboarding. Por favor intenta de nuevo.');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Limpiar la respuesta del paso actual al retroceder
      if (currentQuestion) {
        const newAnswers = { ...answers };
        delete newAnswers[currentQuestion.id];
        setAnswers(newAnswers);
      }
    }
  };


  return (
    <GradientBackground type="darkPrimary" style={styles.container}>
      {/* Barra de progreso */}
      <View style={[styles.progressContainer, { top: insets.top + 20 }]}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      <View style={[
        styles.content, 
        { 
          paddingTop: isWeb ? 100 : insets.top + 80, 
          paddingBottom: isWeb ? 120 : insets.bottom + 100,
          maxWidth: isWeb ? 600 : '100%',
          alignSelf: 'center',
          width: isWeb ? '90%' : '100%',
        }
      ]}>
        {currentQuestion && (
          <View style={styles.contentWrapper}>
            <Animated.Text
              style={[
                styles.question,
                {
                  transform: [{ translateY: questionTranslateY }],
                },
              ]}>
              {currentQuestion.question}
            </Animated.Text>
            
            {currentQuestion.type === 'options' && (
              <View style={styles.cardsContainer}>
                {currentQuestion.options!.map((option) => {
                  const isSelected = selectedAnswer === option.id;
                  const key = `${currentQuestion.id}-${option.id}`;
                  const anim = cardAnimations.get(key);
                  
                  if (!anim) return null;
                  
                  return (
                    <Animated.View
                      key={option.id}
                      style={[
                        styles.cardWrapper,
                        {
                          transform: [{ translateY: anim.translateY }],
                        },
                      ]}>
                      <TouchableOpacity
                        onPress={() => handleSelect(option.id)}
                        activeOpacity={0.7}>
                        <Animated.View
                          style={{
                            transform: [{ scale: anim.selectScale }],
                          }}>
                          <View style={styles.card}>
                            <View style={styles.cardContent}>
                              {/* Ícono */}
                              <View style={styles.iconWrapper}>
                                <Ionicons
                                  name={option.icon as any}
                                  size={24}
                                  color={isSelected ? colors.greenprimary : colors.secondaryText + '80'} // 50% opacity cuando no está seleccionado
                                />
                              </View>

                              {/* Texto de la opción */}
                              <View style={styles.textContainer}>
                                <Text style={styles.cardText} numberOfLines={3}>
                                  {option.label}
                                </Text>
                              </View>

                              {/* Círculo de selección */}
                              <View
                                style={[
                                  styles.circle,
                                  isSelected && styles.circleSelected,
                                ]}>
                                {isSelected && (
                                  <Ionicons name="checkmark" size={16} color={colors.textdark} />
                                )}
                              </View>
                            </View>
                          </View>
                        </Animated.View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            )}

            {currentQuestion.type === 'form' && (
              <View style={styles.formContainer}>
                {currentQuestion.formFields!.map((field, index) => {
                  const currentValue = formData[field.id as keyof typeof formData] || field.min;
                  
                  return (
                    <View key={field.id} style={styles.selectorWrapper}>
                      {index > 0 && <View style={styles.separator} />}
                      <NumberSelector
                        label={field.label}
                        value={currentValue as number}
                        min={field.min}
                        max={field.max}
                        unit={field.unit}
                        onValueChange={(value) => handleFormChange(field.id, value)}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>
      <BottomTabs
        onBack={currentStep > 1 ? handleBack : undefined}
        onNext={handleNext}
        nextEnabled={isNextEnabled}
        showBack={currentStep > 1}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Barra de progreso
  progressContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
    ...Platform.select({
      web: {
        top: 20,
      },
    }),
  },
  progressBarBackground: {
    width: '100%',
    maxWidth: 400,
    height: 6,
    backgroundColor: colors.whiteOverlay + '33', // 20% opacity
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.greenprimary,
    borderRadius: radius.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        minHeight: 'calc(100vh - 200px)',
      } as any,
    }),
  },
  contentWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  question: {
    fontSize: Platform.select({
      web: 28,
      default: 24,
    }) as number,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: spacing.xl,
    textAlign: 'center',
    paddingHorizontal: Platform.select({
      web: 40,
      default: 0,
    }) as number,
    ...(Platform.OS === 'web' ? { maxWidth: 600 } : { maxWidth: '100%' }),
  },
  cardsContainer: {
    gap: spacing.md,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      web: {
        maxWidth: 500,
        alignSelf: 'center',
      },
    }),
  },
  cardWrapper: {
    width: Platform.select({
      web: '100%',
      default: '95%',
    }),
    alignSelf: 'center',
  },
  card: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.background,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.greenprimary + '33', // 20% opacity
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 12px rgba(200, 247, 94, 0.2)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      } as any,
    }),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 60,
    width: '100%',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.greenprimary + '66', // 40% opacity
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  circleSelected: {
    backgroundColor: colors.greenprimary,
    borderColor: colors.greenprimary,
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    marginHorizontal: 8,
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primaryText,
    textAlign: 'left',
    lineHeight: 22,
  },
  // Estilos para el formulario
  formContainer: {
    flexDirection: 'column',
    gap: 0,
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  selectorWrapper: {
    width: '100%',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginBottom: 20,
  },
});
