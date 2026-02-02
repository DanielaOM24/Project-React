import { colors, radius, spacing, typography } from '@/styles/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface BottomTabsProps {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextEnabled?: boolean;
  showBack?: boolean;
}

export default function BottomTabs({ onBack, onNext, nextDisabled = false, nextEnabled = false, showBack = true }: BottomTabsProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animaciones para los botones
  const backScale = useRef(new Animated.Value(1)).current;
  const nextScale = useRef(new Animated.Value(1)).current;

  const handleBack = () => {
    // Animación sutil al presionar
    Animated.sequence([
      Animated.spring(backScale, {
        toValue: 0.95,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(backScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    // Validar que nextEnabled sea true antes de continuar
    if (!nextEnabled || nextDisabled) {
      return;
    }

    // Animación sutil al presionar
    Animated.sequence([
      Animated.spring(nextScale, {
        toValue: 0.95,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(nextScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Solo ejecutar si está habilitado
    if (nextEnabled && !nextDisabled && onNext) {
      onNext();
    }
  };

  return (
    <View
      style={[
        styles.bottomTabsWrapper,
        { 
          bottom: isWeb ? 30 : insets.bottom + 20,
          maxWidth: isWeb ? 600 : '100%',
          alignSelf: 'center',
        },
      ]}>
      {/* Botón de retroceso - Circular */}
      {showBack && (
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.8}
          style={styles.backButtonWrapper}>
          <Animated.View
            style={[
              styles.backButtonContainer,
              {
                transform: [{ scale: backScale }],
              },
            ]}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.darkgreen}
            />
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Botón Siguiente */}
      <TouchableOpacity
        onPress={handleNext}
        activeOpacity={nextEnabled && !nextDisabled ? 0.8 : 1}
        disabled={!nextEnabled || nextDisabled}
        style={styles.nextButtonWrapper}>
        <Animated.View
          style={[
            (!nextEnabled || nextDisabled) ? styles.nextButtonContainerDisabled : styles.nextButtonContainer,
            {
              transform: [{ scale: nextScale }],
            },
          ]}>
          <Text style={[
            styles.nextText,
            (!nextEnabled || nextDisabled) && styles.nextTextDisabled
          ]}>
            Siguiente
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomTabsWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 12,
    ...Platform.select({
      web: {
        width: '100%',
      },
    }),
  },
  // Botón de retroceso - Circular
  backButtonWrapper: {
    width: 56,
    height: 56,
  },
  backButtonContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.whiteOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  // Botón Siguiente
  nextButtonWrapper: {
    flex: 1,
    maxWidth: 400,
  },
  nextButtonContainer: {
    borderRadius: radius.lg,
    backgroundColor: colors.greenprimary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonContainerDisabled: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.whiteOverlay,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: typography.size.body + 2,
    fontFamily: typography.fontfamily.semibold,
    color: colors.darkgreen,
  },
  nextTextDisabled: {
    color: colors.textdark,
    opacity: 0.5,
  },
});
