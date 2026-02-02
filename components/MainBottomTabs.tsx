import { colors, radius, spacing, typography } from '@/styles/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MainBottomTabsProps {
  activeTab?: 'home' | 'recipes' | 'register' | 'chat' | 'profile';
}

export default function MainBottomTabs({ activeTab }: MainBottomTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Determinar el tab activo basado en la ruta
  const getActiveTab = () => {
    if (activeTab) return activeTab;
    if (pathname?.includes('home')) return 'home';
    if (pathname?.includes('recipes')) return 'recipes';
    if (pathname?.includes('register')) return 'register';
    if (pathname?.includes('chat')) return 'chat';
    if (pathname?.includes('profile')) return 'profile';
    return 'home';
  };

  const currentActiveTab = getActiveTab();

  const tabs = [
    { id: 'home', label: 'Inicio', icon: 'home', iconOutline: 'home-outline', route: '/(tabs)/home' },
    { id: 'recipes', label: 'Recetas', icon: 'restaurant', iconOutline: 'restaurant-outline', route: '/(tabs)/recipes' },
    { id: 'register', label: 'Registrar', icon: 'camera', iconOutline: 'camera-outline', route: '/(tabs)/register' },
    { id: 'chat', label: 'Chat', icon: 'chatbubbles', iconOutline: 'chatbubbles-outline', route: '/(tabs)/chat' },
    { id: 'profile', label: 'Perfil', icon: 'person', iconOutline: 'person-outline', route: '/(tabs)/profile' },
  ];

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View
      style={[
        styles.container,
        {
          bottom: insets.bottom + 20,
        },
      ]}>
      <View style={styles.wrapper}>
        <BlurView intensity={40} tint="light" style={styles.blurContainer}>
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => {
              const isActive = currentActiveTab === tab.id;
              const isRegister = tab.id === 'register';

              if (isRegister) {
                return (
                  <View key={tab.id} style={styles.tab}>
                    <View style={styles.cameraPlaceholder} />
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => handleTabPress(tab.route)}
                  activeOpacity={0.7}
                  style={styles.tab}>
                  <View style={styles.tabContent}>
                    <Ionicons
                      name={(isActive ? tab.icon : tab.iconOutline) as any}
                      size={20}
                      color={isActive ? colors.darkgreen : colors.darkgreen}
                      style={{ opacity: isActive ? 1 : 0.6 }}
                    />
                    <Text
                      style={[
                        styles.tabLabel,
                        isActive && styles.tabLabelActive,
                      ]}>
                      {tab.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
        {/* Botón de cámara fuera del contenedor, sobresaliendo */}
        <TouchableOpacity
          onPress={() => handleTabPress('/(tabs)/register')}
          activeOpacity={0.8}
          style={styles.cameraButtonWrapper}>
          <View style={styles.cameraButton}>
            <Ionicons name="camera" size={26} color={colors.darkgreen} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  wrapper: {
    width: '100%',
    maxWidth: 400,
    position: 'relative',
    alignItems: 'center',
  },
  blurContainer: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.whiteOverlay,
    borderWidth: 1.5,
    borderColor: colors.whiteOverlay,
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
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPlaceholder: {
    width: 56,
    height: 56,
  },
  tabLabel: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.medium,
    color: colors.darkgreen,
    marginTop: spacing.xs,
    opacity: 0.8,
  },
  tabLabelActive: {
    color: colors.darkgreen,
    fontFamily: typography.fontfamily.semibold,
  },
  cameraButtonWrapper: {
    position: 'absolute',
    top: -5,
    alignSelf: 'center',
    zIndex: 100,
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.greenprimary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.greenprimary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
});

