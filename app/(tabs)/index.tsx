import { Badge } from '@/components/ui/Badge';
import { CardBase } from '@/components/ui/CardBase';
import { Divider } from '@/components/ui/Divider';
import { MealHistory, MealSummary, UserProfile, getMealHistory, getMealSummary, getUserProfile } from '@/services/dashboard';
import { colors, radious, spacing, typography } from '@/styles/designSystem';
import { formatDate, getMealIcon, translateGoal, translateMealType } from '@/utils/translations';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  // Estados para los datos de la API
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [mealSummary, setMealSummary] = useState<MealSummary | null>(null);
  const [mealHistory, setMealHistory] = useState<MealHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fecha actual
  const currentDate = formatDate(new Date());

  // Cargar datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profile, summary, history] = await Promise.all([
          getUserProfile(),
          getMealSummary(),
          getMealHistory(),
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
    };

    fetchData();
  }, []);

  // Mostrar loading
  if (loading) {
    return (
      <View style={[styles.appContainer, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.greenprimary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Mostrar error
  if (error || !mealSummary || !userProfile) {
    return (
      <View style={[styles.appContainer, styles.centerContent]}>
        <Text style={styles.errorText}>{error || 'Error al cargar datos'}</Text>
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
      calorias: meal?.nutritionProfile.calories || 0,
      proteinas: meal?.nutritionProfile.protein || 0,
      carbohidratos: meal?.nutritionProfile.carbs || 0,
      grasas: meal?.nutritionProfile.fats || 0,
    };
  });

  return (
    <View style={styles.appContainer}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateTitle}>Hola,</Text>
            <Text style={styles.dateTitle}>{userProfile.displayName}</Text>
          </View>
          <View>
            <Badge 
              variant="secondary" 
              text={translateGoal(userProfile.goal)}
              icon={<Ionicons name="trophy" size={16} color={colors.darkgreen} />}
            />
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
              <Badge 
                text='Proteínas' 
                value={`${mealSummary.totalProtein}g`}
                icon={<Ionicons name="barbell-outline" size={16} color={colors.darkgreen} />}
                style={styles.nutrientBadge}
              />
              <Badge 
                text='Carbos' 
                value={`${mealSummary.totalCarbs}g`}
                icon={<Ionicons name="flash-outline" size={16} color={colors.darkgreen} />}
                style={styles.nutrientBadge}
              />
              <Badge 
                text='Grasas' 
                value={`${mealSummary.totalFats}g`}
                icon={<Ionicons name="water-outline" size={16} color={colors.darkgreen} />}
                style={styles.nutrientBadge}
              />
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
                      <Text style={styles.nutrientValue}>{meal.proteinas}g</Text>
                    </View>
                    <View style={styles.nutrientItem}>
                      <Text style={styles.nutrientLabel}>C</Text>
                      <Text style={styles.nutrientValue}>{meal.carbohidratos}g</Text>
                    </View>
                    <View style={styles.nutrientItem}>
                      <Text style={styles.nutrientLabel}>G</Text>
                      <Text style={styles.nutrientValue}>{meal.grasas}g</Text>
                    </View>
                  </View>
                </View>

                {/* Divider entre comidas (excepto el último) */}
                {index < meals.length - 1 && (
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
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.appBackground,
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
    paddingTop: spacing.xl * 3,
    paddingBottom: spacing.lg,
  },
  dateTitle: {
    fontSize: typography.size.title + 6,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
    lineHeight: typography.size.title + 8,
  },

  nutrientsrow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: 20,
  },
  nutrientBadge: {
    shadowColor: colors.darkgreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
    borderRadius: radious.pill,
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