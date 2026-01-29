import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '@/components/ui/GradientBackground';
import { CardBase } from '@/components/ui/CardBase';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/buttons/IconButton';
import { colors, radious, spacing, typography } from '@/styles/designSystem';

export default function DashboardScreen() {
  // Datos provisionales
  const currentCalories = 950;
  const totalCalories = 1700;
  const caloriesLeft = totalCalories - currentCalories;
  const percentage = (currentCalories / totalCalories) * 100;

  return (
    <GradientBackground type="darkPrimary">
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateTitle}>Lunes,</Text>
            <Text style={styles.dateTitle}>Enero 27</Text>
          </View>
        </View>

        {/* progreso de calorías */}
        <View style={styles.caloriesSection}>
          <CardBase variant="solid" style={styles.caloriesCard}>
            <View style={styles.caloriesCardContent}>
              {/* Izquierda - Porcentaje */}
              <View style={styles.percentageSection}>
                <Ionicons name="flash" size={24} color={colors.textdark} />
                <Text style={styles.intakeLabel}>Consumo diario</Text>
                <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
              </View>
              
              {/* Derecha - Media Luna */}
              <View style={styles.circleSection}>
                <View style={styles.halfCircleContainer}>
                  {/* Círculo de progreso */}
                  <View style={styles.progressRing} />
                  
                  {/* Números centrados */}
                  <View style={styles.caloriesNumbers}>
                    <Text style={styles.currentCalories}>{currentCalories}</Text>
                    <View style={styles.dividerLine} />
                    <Text style={styles.totalCalories}>{totalCalories}</Text>
                  </View>
                </View>
              </View>
            </View>
          </CardBase>
        </View>

        {/* Nutrientes Pills */}
        <View style={styles.nutrientPills}>
          <Badge text="Proteínas" variant="primary" />
          <Badge text="Carbohidratos" variant="secondary" style={{ color: colors.secondaryText, fontFamily: typography.fontfamily.regular}} />
          <Badge text="Grasas" variant="secondary" style={{ color: colors.secondaryText, fontFamily: typography.fontfamily.regular}} />
        </View>

        {/* Botones de Registro */}
        <View style={styles.registerWrapper}>
          <CardBase variant="solid">
            <View style={styles.registerHeader}>
              <Ionicons name="restaurant-outline" size={20} color={colors.textdark} />
              <Text style={styles.registerTitle}> Registrar comida</Text>
            </View>
            
            <View style={styles.registerButtons}>
              {/* Tomar Foto - Card verde sólida */}
              <CardBase variant="green" style={styles.registerCard}>
                <View style={styles.cardContent}>
                  <View style={styles.iconCircleLarge}>
                    <Ionicons name="camera-outline" size={32} color={colors.textdark} />
                  </View>
                  <Text style={styles.cardTitle}>Tomar foto</Text>
                  <Text style={styles.cardSubtitle}>Del plato</Text>
                </View>
              </CardBase>
              
              {/* Por Voz - Card con borde punteado */}
              <View style={styles.registerCardOutline}>
                <View style={styles.cardContent}>
                  <View style={styles.iconCircleLargeOutline}>
                    <Ionicons name="mic-outline" size={32} color={colors.textdark} />
                  </View>
                  <Text style={styles.cardTitleOutline}>Decir</Text>
                  <Text style={styles.cardSubtitleOutline}>Lo que comiste</Text>
                </View>
              </View>
            </View>
          </CardBase>
        </View>

        {/* Espaciado final */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: colors.greenprimary,
    lineHeight: typography.size.title + 8,
  },

  // Nutrient Pills
  nutrientPills: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
    marginBottom: spacing.lg,
    gap: spacing.md,
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

  // Register Section
  registerWrapper: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  registerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  registerTitle: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
  },
  registerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  registerCard: {
    flex: 1,
    minHeight: 160,
    padding: spacing.md,
  },
  registerCardOutline: {
    flex: 1,
    minHeight: 160,
    backgroundColor: 'transparent',
    borderRadius: radious.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.darkgreen + '60',
    padding: spacing.md,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircleLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconCircleLargeOutline: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.greenprimary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    textAlign: 'center',
  },
  cardTitleOutline: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    textAlign: 'center',
  },
  cardSubtitleOutline: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    textAlign: 'center',
  },
});