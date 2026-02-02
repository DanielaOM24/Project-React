// Home Screen Component

import MainBottomTabs from '@/components/MainBottomTabs';
import { Badge } from '@/components/ui/Badge';
import { CardBase } from '@/components/ui/CardBase';
import { Divider } from '@/components/ui/Divider';
import { getMealHistory, getMealSummary, getUserProfile } from '@/services/dashboard';
import { colors, radius, spacing, typography } from '@/styles/designSystem';
import { MealHistory, MealSummary } from "@/types/meals.type";
import { UserProfile } from "@/types/user.type";
import { formatDate, getMealIcon, translateGoal, translateMealType } from '@/utils/translations';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Helper Functions
const getTimezoneOffset = (): string => {
  const date = new Date();
  const offset = -date.getTimezoneOffset(); // Negativo porque getTimezoneOffset devuelve el offset en minutos
  const sign = offset >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HomeScreen() {
  // Component State
  const insets = useSafeAreaInsets();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [mealSummary, setMealSummary] = useState<MealSummary | null>(null);
  const [mealHistory, setMealHistory] = useState<MealHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data Fetching
  const currentDate = formatDate(new Date());
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener fecha actual y timezone offset
      const today = new Date();
      const dateString = formatDateForAPI(today);
      const timezoneOffset = getTimezoneOffset();
      
      const [profile, summary, history] = await Promise.all([
        getUserProfile().catch(() => null),
        getMealSummary(dateString, timezoneOffset).catch(() => null),
        getMealHistory().catch(() => []),
      ]);
      setUserProfile(profile);
      setMealSummary(summary);
      setMealHistory(history);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refrescar datos cuando se enfoca la pantalla (cuando se regresa desde register)
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Mostrar loading
  if (loading) {
    return (
      <View style={[styles.appContainer, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.greenprimary} />
        <Text style={styles.loadingText}>Cargando...</Text>
        <MainBottomTabs activeTab="home" />
      </View>
    );
  }

  if (error || !mealSummary || !userProfile) {
    return (
      <View style={[styles.appContainer, styles.centerContent, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error || 'Error al cargar datos'}</Text>
        <MainBottomTabs activeTab="home" />
      </View>
    );
  }

  // Calcular valores
  const caloriesLeft = mealSummary.calorieGoal - mealSummary.totalCalories;
  const percentage = mealSummary.calorieProgressPercentage;

  // Agrupar comidas por tipo (BREAKFAST, LUNCH, DINNER, SNACK)
  const mealsByType = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map(type => {
    const meal = mealHistory.find(m => m.mealType === type);
    return {
      id: meal?.id || type,
      tipo: translateMealType(type),
      icon: getMealIcon(type),
      calorias: meal?.nutritionProfile?.calories || 0,
      proteinas: meal?.nutritionProfile?.protein || 0,
      carbohidratos: meal?.nutritionProfile?.carbs || 0,
      grasas: meal?.nutritionProfile?.fats || 0,
    };
  });

  return (
    <View style={styles.appContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateTitle}>Hola,</Text>
            <Text style={styles.dateTitle}>{userProfile.displayName}</Text>
          </View>
          <View>
            <View style={styles.goalBadge}>
              <Ionicons name="trophy" size={16} color={colors.greenprimary} />
              <Text style={styles.goalBadgeText}>{translateGoal(userProfile.goal)}</Text>
            </View>
          </View>
        </View>

        {/* progreso de calorías */}
        <View style={styles.caloriesSection}>
          <CardBase variant="green" style={styles.caloriesCard}>
            <View style={styles.caloriesCardContent}>
              {/* Izquierda - Porcentaje */}
              <View style={styles.percentageSection}>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={20} color={colors.textdark} />
                  <Text style={styles.intakeLabel}>{currentDate}</Text>
                </View>
                <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
              </View>

              {/* Derecha - Media Luna */}
              <View style={styles.circleSection}>
                <View style={styles.halfCircleContainer}>
                  {/* Círculo de progreso */}
                  <View style={styles.progressRing} />

                  {/* Números centrados */}
                  <View style={styles.caloriesNumbers}>
                    <Text style={styles.currentCalories}>{mealSummary.totalCalories}</Text>
                    <View style={styles.dividerLine} />
                    <Text style={styles.totalCalories}>{mealSummary.calorieGoal}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.nutrientsrow}>
              <View style={styles.nutrientBadge}>
                <Ionicons name="barbell-outline" size={16} color={colors.darkgreen} />
                <Text style={styles.nutrientLabelBadge}>Proteínas</Text>
                <Text style={styles.nutrientValueBadge}>{mealSummary.totalProtein.toFixed(1)}g</Text>
              </View>
              <View style={styles.nutrientBadge}>
                <Ionicons name="flash-outline" size={16} color={colors.darkgreen} />
                <Text style={styles.nutrientLabelBadge}>Carbos</Text>
                <Text style={styles.nutrientValueBadge}>{mealSummary.totalCarbs.toFixed(1)}g</Text>
              </View>
              <View style={styles.nutrientBadge}>
                <Ionicons name="water-outline" size={16} color={colors.darkgreen} />
                <Text style={styles.nutrientLabelBadge}>Grasas</Text>
                <Text style={styles.nutrientValueBadge}>{mealSummary.totalFats.toFixed(1)}g</Text>
              </View>
            </View>
          </CardBase>
        </View>

        {/* Resumen de Comidas del Día */}
        <View style={styles.mealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Comidas de hoy</Text>
          </View>

          <CardBase variant="solid" style={styles.mealsCard}>
            {mealsByType.map((meal, index) => (
              <View key={meal.id}>
                <View style={styles.mealRow}>
                  {/* Icono y tipo de comida */}
                  <View style={styles.mealInfo}>
                    <Badge
                      variant='primary' 
                      icon={<Ionicons name={meal.icon as any} size={24} color={colors.darkgreen} />}
                      style={styles.mealIconBadge}
                    />
                    <View>
                      <Text style={styles.mealType}>{meal.tipo}</Text>
                      <Text style={styles.mealCalories}>{meal.calorias} kcal</Text>
                    </View>
                  </View>

                  {/* Valores nutricionales */}
                  <View style={styles.mealNutrients}>
                    <View style={styles.nutrientItem}>
                      <Text style={styles.nutrientLabel}>P</Text>
                      <Text style={styles.nutrientValue}>{meal.proteinas.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.nutrientItem}>
                      <Text style={styles.nutrientLabel}>C</Text>
                      <Text style={styles.nutrientValue}>{meal.carbohidratos.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.nutrientItem}>
                      <Text style={styles.nutrientLabel}>G</Text>
                      <Text style={styles.nutrientValue}>{meal.grasas.toFixed(1)}g</Text>
                    </View>
                  </View>
                </View>

                {/* Divider entre comidas (excepto el último) */}
                {index < mealsByType.length - 1 && (
                  <Divider 
                    color={colors.darkgreen + '20'} 
                    style={styles.mealDivider}
                  />
                )}
              </View>
            ))}
          </CardBase>
        </View>

        {/* Espaciado final */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
      <MainBottomTabs activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.medium,
    color: colors.darkgreen,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.medium,
    color: colors.error,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.lg,
  },
  dateTitle: {
    fontSize: typography.size.title + 6,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
    lineHeight: typography.size.title + 8,
  },

  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.darkgreen,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  goalBadgeText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.greenprimary,
  },
  nutrientsrow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  nutrientBadge: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs / 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.greenprimary,
    borderRadius: radius.md,
    shadowColor: colors.darkgreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: '33%',
  },
  nutrientLabelBadge: {
    fontSize: typography.size.caption - 1,
    fontFamily: typography.fontfamily.medium,
    color: colors.darkgreen,
    textAlign: 'center',
  },
  nutrientValueBadge: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
    textAlign: 'center',
  },


  // Calories Section
  caloriesSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  caloriesCard: {
    padding: spacing.lg,
  },
  caloriesCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Izquierda - Porcentaje
  percentageSection: {
    flex: 1,
    gap: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  intakeLabel: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
  },
  percentageText: {
    fontSize: typography.size.title + 16,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    lineHeight: typography.size.title + 20,
    marginTop: spacing.md,
  },

  // Derecha - Media Luna
  circleSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfCircleContainer: {
    width: 100,
    height: 100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRightColor: colors.greenprimary,
    borderTopColor: colors.greenprimary,
    transform: [{ rotate: '135deg' }],
  },
  caloriesNumbers: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dividerLine: {
    width: 30,
    height: 1,
    backgroundColor: colors.textdark + '40',
  },
  currentCalories: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
  },
  totalCalories: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark + 'CC',
  },

  // Meals Section
  mealsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
  },
  mealsCard: {
    padding: spacing.lg,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  mealIconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  mealType: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.darkgreen,
  },
  mealCalories: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.regular,
    color: colors.darkgreen + 'AA',
    marginTop: spacing.xs / 2,
  },
  mealNutrients: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  nutrientItem: {
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  nutrientLabel: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.medium,
    color: colors.darkgreen + '99',
  },
  nutrientValue: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
  },
  mealDivider: {
    marginVertical: spacing.xs,
  },
});
