import { colors, radius } from '@/styles/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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

// Componente wrapper para BlurView con fallback para web
const BlurViewWrapper = ({ children, style, intensity, tint }: any) => {
  if (isWeb) {
    return (
      <View style={[
        style,
        {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }
      ]}>
        {children}
      </View>
    );
  }
  return (
    <BlurView intensity={intensity} tint={tint} style={style}>
      {children}
    </BlurView>
  );
};

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

    if (onNext) {
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
          activeOpacity={0.7}
          style={styles.backButtonWrapper}>
          <BlurViewWrapper intensity={40} tint="light" style={styles.backButtonContainer}>
            <Animated.View
              style={[
                styles.backButtonContent,
                {
                  transform: [{ scale: backScale }],
                },
              ]}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.primaryText}
              />
            </Animated.View>
          </BlurViewWrapper>
        </TouchableOpacity>
      )}

      {/* Botón Siguiente - Bottom Tab */}
      <TouchableOpacity
        onPress={handleNext}
        activeOpacity={nextEnabled && !nextDisabled ? 0.7 : 1}
        disabled={!nextEnabled || nextDisabled}
        style={[
          styles.nextButtonWrapper,
          (!nextEnabled || nextDisabled) && styles.nextButtonWrapperDisabled,
        ]}>
        <BlurViewWrapper
          intensity={40}
          tint="light"
          style={[
            styles.nextButtonContainer,
            nextEnabled && styles.nextButtonContainerActive,
          ]}>
          <Animated.View
            style={[
              styles.nextButtonContent,
              {
                transform: [{ scale: nextScale }],
                opacity: nextEnabled && !nextDisabled ? 1 : 0.5,
              },
            ]}>
            <Text style={[styles.nextText, nextEnabled && !nextDisabled && styles.nextTextActive]}>
              Siguiente
            </Text>
          </Animated.View>
        </BlurViewWrapper>
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
    borderRadius: radius.pill / 2,
    overflow: 'hidden',
    backgroundColor: colors.whiteOverlay,
    borderWidth: 1.5,
    borderColor: colors.greenprimary + '66', // 40% opacity
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 32,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  backButtonContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Botón Siguiente - Bottom Tab
  nextButtonWrapper: {
    flex: 1,
  },
  nextButtonWrapperDisabled: {
    opacity: 0.6,
  },
  nextButtonContainer: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.whiteOverlay,
    borderWidth: 1.5,
    borderColor: colors.greenprimary + '66', // 40% opacity
    opacity: 0.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 32,
      },
      android: {
        elevation: 24,
      },
      web: {
        boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      } as any,
    }),
  },
  nextButtonContent: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonContainerActive: {
    backgroundColor: colors.greenprimary,
    borderColor: colors.greenprimary,
    opacity: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#A4D65E',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 32,
      },
      android: {
        elevation: 24,
      },
      web: {
        boxShadow: '0px 12px 32px rgba(164, 214, 94, 0.4)',
        cursor: 'pointer',
      } as any,
    }),
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondaryText + 'CC', // 80% opacity
  },
  nextTextActive: {
    color: colors.textdark,
  },
});
