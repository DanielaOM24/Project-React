// Profile Screen Component

import MainBottomTabs from '@/components/MainBottomTabs';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI, profileAPI, UpdateProfileData } from '@/services/api';
import { getMealSummary } from '@/services/dashboard';
import { colors, radius, spacing, typography } from '@/styles/designSystem';
import { MealSummary } from '@/types/meals.type';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Helper Functions
const getTimezoneOffset = (): string => {
  const date = new Date();
  const offset = -date.getTimezoneOffset();
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

export default function ProfileScreen() {
  // Component State
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, refreshProfile, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [editData, setEditData] = useState<UpdateProfileData>({});
  const [mealSummary, setMealSummary] = useState<MealSummary | null>(null);

  // Effects
  useEffect(() => {
    const loadMealSummary = async () => {
      try {
        const today = new Date();
        const dateString = formatDateForAPI(today);
        const timezoneOffset = getTimezoneOffset();
        const summary = await getMealSummary(dateString, timezoneOffset);
        setMealSummary(summary);
      } catch (error) {
        console.error('[Profile] Error al cargar meal summary:', error);
        // Si falla, usar el valor del perfil como fallback
        setMealSummary(null);
      }
    };

    if (user) {
      loadMealSummary();
    }
  }, [user]);

  useEffect(() => {
    if (user && !isEditing) {
      // Convertir MAINTAIN antiguo a MAINTAIN_WEIGHT (el backend puede devolver MAINTAIN de datos antiguos)
      let goal: string = (user.goal as any) || 'MAINTAIN_WEIGHT';
      if (goal === 'MAINTAIN') {
        goal = 'MAINTAIN_WEIGHT';
      }
      
      setEditData({
        displayName: user.displayName || '',
        age: user.age || 0,
        weight: user.weight || 0,
        height: user.height || 0,
        activityLevel: user.activityLevel || 'LOW',
        preference: user.preference || 'NORMAL',
        meals: user.meals || 0,
        goal: goal as 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_MUSCLE',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user, isEditing]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'No se pudo cargar tu perfil');
      return;
    }

    if (!editData.displayName?.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    setIsSaving(true);
    try {
      await profileAPI.updateProfile(editData);
      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al actualizar el perfil';
      console.error('[Profile] Error al guardar:', error);
      
      // Manejar errores de sesión
      if (errorMessage.includes('expirado') || 
          errorMessage.includes('expired') || 
          errorMessage.includes('No estás autenticado') || 
          errorMessage.includes('Tu sesión ha expirado') ||
          errorMessage.includes('403') ||
          errorMessage.includes('401')) {
        Alert.alert('Sesión expirada', 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.', [
          { 
            text: 'OK', 
            onPress: async () => {
              try {
                await authAPI.logout();
                router.replace('/login');
              } catch (logoutError) {
                router.replace('/login');
              }
            }
          },
        ]);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await authAPI.logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const getActivityLabel = (level?: string) => {
    switch (level) {
      case 'LOW': return 'Bajo';
      case 'MEDIUM': return 'Medio';
      case 'HIGH': return 'Alto';
      default: return 'No especificado';
    }
  };

  const getGoalLabel = (goal?: string) => {
    switch (goal) {
      case 'LOSE_WEIGHT': return 'Bajar de peso';
      case 'MAINTAIN_WEIGHT': return 'Mantener mi peso';
      case 'GAIN_MUSCLE': return 'Ganar masa muscular';
      default: return 'No especificado';
    }
  };

  const handleSelectPhoto = async () => {
    if (!isEditing) return;

    Alert.alert(
      'Seleccionar foto de perfil',
      '¿Cómo quieres seleccionar tu foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Tomar foto',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permiso requerido', 'Se necesita permiso de la cámara para tomar una foto');
                return;
              }

              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                await handleUploadPhoto(result.assets[0].uri);
              }
            } catch (error) {
              console.error('[Profile] Error al tomar foto:', error);
              Alert.alert('Error', 'No se pudo tomar la foto');
            }
          },
        },
        {
          text: 'Elegir de galería',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la galería');
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                await handleUploadPhoto(result.assets[0].uri);
              }
            } catch (error) {
              console.error('[Profile] Error al seleccionar foto:', error);
              Alert.alert('Error', 'No se pudo seleccionar la foto');
            }
          },
        },
      ]
    );
  };

  const handleUploadPhoto = async (imageUri: string) => {
    try {
      setIsUploadingPhoto(true);
      const result = await profileAPI.uploadProfilePhoto(imageUri);
      
      // Actualizar el editData con la nueva URL
      setEditData({ ...editData, avatarUrl: result.avatarUrl });
      
      // Actualizar el perfil inmediatamente
      await refreshProfile();
      
      Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
    } catch (error: any) {
      console.error('[Profile] Error al subir foto:', error);
      const errorMessage = error?.message || 'Error al subir la foto';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.greenprimary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {/* Título y acciones */}
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Mi perfil</Text>
              <Text style={styles.headerSubtitle}>Gestiona tu información</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.headerIconButton}
                onPress={() => setIsEditing(!isEditing)}>
                <View style={styles.headerIconContainer}>
                  <Ionicons
                    name={isEditing ? 'close-outline' : 'create-outline'}
                    size={20}
                    color={colors.darkgreen}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.headerIconButton}
                onPress={handleLogout}>
                <View style={styles.headerIconContainer}>
                  <Ionicons name="log-out-outline" size={20} color={colors.darkgreen} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Avatar y nombre */}
          <View style={styles.profileInfoContainer}>
            <TouchableOpacity
              onPress={handleSelectPhoto}
              disabled={!isEditing || isUploadingPhoto}
              activeOpacity={isEditing ? 0.7 : 1}
              style={styles.avatarButton}>
              {isUploadingPhoto ? (
                <View style={styles.avatar}>
                  <ActivityIndicator size="large" color={colors.greenprimary} />
                </View>
              ) : (user?.avatarUrl || editData.avatarUrl) ? (
                <Image
                  source={{ uri: editData.avatarUrl || user?.avatarUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="person" size={60} color={colors.greenprimary} />
                </View>
              )}
              {isEditing && (
                <View style={styles.avatarEditBadge}>
                  <Ionicons name="camera" size={18} color={colors.darkgreen} />
                </View>
              )}
            </TouchableOpacity>

            {/* Username */}
            {isEditing ? (
              <TextInput
                style={styles.usernameInput}
                value={editData.displayName || ''}
                onChangeText={(text) => setEditData({ ...editData, displayName: text })}
                placeholder="Nombre"
                placeholderTextColor={colors.textdark + '80'}
              />
            ) : (
              <Text style={styles.username}>{user?.displayName || 'Usuario'}</Text>
            )}

            {/* Badge de objetivo */}
            {!isEditing && (
              <View style={styles.goalBadge}>
                <Ionicons name="trophy" size={16} color={colors.greenprimary} />
                <Text style={styles.goalBadgeText}>
                  {getGoalLabel(user?.goal)}
                </Text>
              </View>
            )}
          </View>

          {/* Selector de objetivo cuando está editando */}
          {isEditing && (
            <View style={styles.goalSelectorContainer}>
              <Text style={styles.goalSelectorLabel}>Selecciona tu objetivo</Text>
              <View style={styles.goalOptionsContainer}>
                {[
                  { value: 'LOSE_WEIGHT', label: 'Bajar de peso', icon: 'fitness-outline' },
                  { value: 'MAINTAIN_WEIGHT', label: 'Mantener', icon: 'scale-outline' },
                  { value: 'GAIN_MUSCLE', label: 'Aumentar', icon: 'barbell-outline' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.goalOption,
                      editData.goal === option.value && styles.goalOptionSelected,
                    ]}
                    onPress={() => setEditData({ ...editData, goal: option.value as any })}
                    activeOpacity={0.7}>
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={editData.goal === option.value ? '#000000' : colors.greenprimary}
                    />
                    <Text
                      style={[
                        styles.goalOptionText,
                        editData.goal === option.value && styles.goalOptionTextSelected,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Card de objetivo diario */}
        <View style={styles.dailyObjectiveCard}>
          <View style={styles.objectiveHeader}>
            <View style={styles.objectiveIconContainer}>
              <Ionicons name="flame" size={24} color={colors.greenprimary} />
            </View>
            <View style={styles.objectiveHeaderText}>
              <Text style={styles.objectiveTitle}>Objetivo calórico diario</Text>
              <Text style={styles.objectiveSubtitle}>Calculado según tu perfil</Text>
            </View>
          </View>
          <View style={styles.calorieContainer}>
            <Text style={styles.calorieGoal}>{mealSummary?.calorieGoal || user?.daily_calories || 0}</Text>
            <Text style={styles.calorieUnit}>kcal</Text>
          </View>
        </View>

        {/* Sección Información Personal */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          
          <View style={styles.personalInfoCard}>
            {/* Altura */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="resize-outline" size={22} color={colors.darkgreen} />
                </View>
                <Text style={styles.infoLabel}>Altura</Text>
              </View>
              <View style={styles.infoRight}>
                {isEditing ? (
                  <View style={styles.infoInputContainer}>
                    <TextInput
                      style={styles.infoInput}
                      value={editData.height?.toString() || ''}
                      onChangeText={(text) =>
                        setEditData({ ...editData, height: parseInt(text) || undefined })
                      }
                      placeholder="--"
                      keyboardType="numeric"
                      placeholderTextColor={colors.textdark + '60'}
                    />
                    <Text style={styles.infoUnit}>cm</Text>
                  </View>
                ) : (
                  <View style={styles.infoValueContainer}>
                    <Text style={styles.infoValue}>{user?.height ? `${user.height}` : '--'}</Text>
                    <Text style={styles.infoUnit}>cm</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.infoDivider} />

            {/* Peso */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="scale-outline" size={22} color={colors.darkgreen} />
                </View>
                <Text style={styles.infoLabel}>Peso</Text>
              </View>
              <View style={styles.infoRight}>
                {isEditing ? (
                  <View style={styles.infoInputContainer}>
                    <TextInput
                      style={styles.infoInput}
                      value={editData.weight?.toString() || ''}
                      onChangeText={(text) =>
                        setEditData({ ...editData, weight: parseFloat(text) || undefined })
                      }
                      placeholder="--"
                      keyboardType="decimal-pad"
                      placeholderTextColor={colors.textdark + '60'}
                    />
                    <Text style={styles.infoUnit}>kg</Text>
                  </View>
                ) : (
                  <View style={styles.infoValueContainer}>
                    <Text style={styles.infoValue}>{user?.weight ? `${user.weight}` : '--'}</Text>
                    <Text style={styles.infoUnit}>kg</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.infoDivider} />

            {/* Edad */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="calendar-outline" size={22} color={colors.darkgreen} />
                </View>
                <Text style={styles.infoLabel}>Edad</Text>
              </View>
              <View style={styles.infoRight}>
                {isEditing ? (
                  <View style={styles.infoInputContainer}>
                    <TextInput
                      style={styles.infoInput}
                      value={editData.age?.toString() || ''}
                      onChangeText={(text) =>
                        setEditData({ ...editData, age: parseInt(text) || undefined })
                      }
                      placeholder="--"
                      keyboardType="numeric"
                      placeholderTextColor={colors.textdark + '60'}
                    />
                    <Text style={styles.infoUnit}>años</Text>
                  </View>
                ) : (
                  <View style={styles.infoValueContainer}>
                    <Text style={styles.infoValue}>{user?.age || '--'}</Text>
                    <Text style={styles.infoUnit}>años</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Preferencia Alimentaria */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Preferencia alimentaria</Text>
          
          <View style={styles.preferenceCard}>
            {isEditing ? (
              <View style={styles.preferenceSelectorContainer}>
                {[
                  { value: 'NORMAL', label: 'Normal', icon: 'restaurant-outline', description: 'Sin restricciones' },
                  { value: 'VEGETARIANO', label: 'Vegetariano', icon: 'leaf-outline', description: 'Sin carne' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.preferenceOptionCard,
                      editData.preference === option.value && styles.preferenceOptionCardSelected,
                    ]}
                    onPress={() => setEditData({ ...editData, preference: option.value as any })}
                    activeOpacity={0.7}>
                    <View style={[
                      styles.preferenceIconWrapper,
                      editData.preference === option.value && styles.preferenceIconWrapperSelected
                    ]}>
                      <Ionicons
                        name={option.icon as any}
                        size={28}
                        color={editData.preference === option.value ? '#FFFFFF' : colors.darkgreen}
                      />
                    </View>
                    <Text style={[
                      styles.preferenceOptionLabel,
                      editData.preference === option.value && styles.preferenceOptionLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.preferenceOptionDescription,
                      editData.preference === option.value && styles.preferenceOptionDescriptionSelected,
                    ]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.preferenceDisplayCard}>
                <View style={styles.preferenceDisplayIcon}>
                  <Ionicons
                    name={user?.preference === 'VEGETARIANO' ? 'leaf-outline' : 'restaurant-outline'}
                    size={28}
                    color={colors.darkgreen}
                  />
                </View>
                <View style={styles.preferenceDisplayText}>
                  <Text style={styles.preferenceDisplayLabel}>Tipo de alimentación</Text>
                  <Text style={styles.preferenceDisplayValue}>
                    {user?.preference === 'VEGETARIANO' ? 'Vegetariano' : 'Normal'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Nivel de Actividad */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Nivel de actividad</Text>
          
          <View style={styles.activityCard}>
            {isEditing ? (
              <View style={styles.activitySelectorContainer}>
                {[
                  { value: 'LOW', label: 'Bajo', icon: 'bed-outline', description: 'Poco ejercicio' },
                  { value: 'MEDIUM', label: 'Medio', icon: 'walk-outline', description: 'Ejercicio moderado' },
                  { value: 'HIGH', label: 'Alto', icon: 'barbell-outline', description: 'Ejercicio intenso' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.activityOptionCard,
                      editData.activityLevel === option.value && styles.activityOptionCardSelected,
                    ]}
                    onPress={() => setEditData({ ...editData, activityLevel: option.value as any })}
                    activeOpacity={0.7}>
                    <View style={[
                      styles.activityIconWrapper,
                      editData.activityLevel === option.value && styles.activityIconWrapperSelected
                    ]}>
                      <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={editData.activityLevel === option.value ? '#FFFFFF' : colors.darkgreen}
                      />
                    </View>
                    <Text style={[
                      styles.activityOptionLabel,
                      editData.activityLevel === option.value && styles.activityOptionLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.activityOptionDescription,
                      editData.activityLevel === option.value && styles.activityOptionDescriptionSelected,
                    ]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.activityDisplayCard}>
                <View style={styles.activityDisplayIcon}>
                  <Ionicons
                    name={
                      user?.activityLevel === 'HIGH'
                        ? 'barbell-outline'
                        : user?.activityLevel === 'MEDIUM'
                        ? 'walk-outline'
                        : 'bed-outline'
                    }
                    size={28}
                    color={colors.darkgreen}
                  />
                </View>
                <View style={styles.activityDisplayText}>
                  <Text style={styles.activityDisplayLabel}>Nivel de Actividad</Text>
                  <Text style={styles.activityDisplayValue}>{getActivityLabel(user?.activityLevel)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Botón de guardar cuando está editando */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}>
            {isSaving ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Bottom Tabs */}
      <MainBottomTabs activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + spacing.md,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    backgroundColor: colors.greenprimary,
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIconButton: {
    padding: spacing.xs,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: typography.size.title + 4,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
    letterSpacing: -0.5,
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.regular,
    color: colors.darkgreen,
    opacity: 0.7,
  },
  profileInfoContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.greenprimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  username: {
    fontSize: typography.size.title + 2,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  usernameInput: {
    fontSize: typography.size.title + 2,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.darkgreen + '40',
    paddingBottom: spacing.sm,
    minWidth: 200,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.darkgreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  goalBadgeText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.greenprimary,
  },
  dailyObjectiveCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xl + spacing.md,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  objectiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  objectiveIconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.greenOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  objectiveHeaderText: {
    flex: 1,
  },
  objectiveTitle: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  objectiveSubtitle: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.6,
  },
  calorieContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  calorieGoal: {
    fontSize: 48,
    fontFamily: typography.fontfamily.bold,
    color: colors.greenprimary,
    letterSpacing: -2,
  },
  calorieUnit: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
    opacity: 0.7,
    marginBottom: spacing.xs,
  },
  dataSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  sectionTitle: {
    fontSize: typography.size.subtitle + 2,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    letterSpacing: -0.3,
    marginBottom: spacing.lg,
  },
  personalInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  infoIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
  },
  infoRight: {
    alignItems: 'flex-end',
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  infoValue: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
  },
  infoUnit: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.medium,
    color: colors.textdark,
    opacity: 0.6,
  },
  infoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 100,
  },
  infoInput: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    borderBottomWidth: 2,
    borderBottomColor: colors.greenprimary,
    paddingBottom: spacing.xs / 2,
    minWidth: 60,
    textAlign: 'right',
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.greenOverlay,
    marginHorizontal: spacing.lg,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  activitySelectorContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  activityOptionCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.greenOverlay,
    borderWidth: 0,
    gap: spacing.sm,
    minHeight: 140,
    justifyContent: 'center',
  },
  activityOptionCardSelected: {
    backgroundColor: colors.greenprimary,
    borderWidth: 0,
    transform: [{ scale: 1.02 }],
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activityIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  activityIconWrapperSelected: {
    backgroundColor: colors.darkgreen,
  },
  activityOptionLabel: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
    textAlign: 'center',
    marginBottom: spacing.xs / 2,
  },
  activityOptionLabelSelected: {
    color: colors.darkgreen,
    fontFamily: typography.fontfamily.bold,
  },
  activityOptionDescription: {
    fontSize: typography.size.caption - 1,
    fontFamily: typography.fontfamily.regular,
    color: colors.darkgreen,
    textAlign: 'center',
  },
  activityOptionDescriptionSelected: {
    color: colors.darkgreen,
    fontFamily: typography.fontfamily.regular,
  },
  activityDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
  },
  activityDisplayIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityDisplayText: {
    flex: 1,
  },
  activityDisplayLabel: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.medium,
    color: colors.textdark,
    opacity: 0.7,
    marginBottom: spacing.xs / 2,
  },
  activityDisplayValue: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
  },
  saveButton: {
    backgroundColor: colors.greenprimary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
  },
  goalSelectorContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 44, 24, 0.1)',
  },
  goalSelectorLabel: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  goalOptionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.greenOverlay,
    minWidth: 100,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  goalOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    transform: [{ scale: 1.02 }],
    ...Platform.select({
      ios: {
        shadowColor: colors.greenprimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  goalOptionText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
    letterSpacing: 0.1,
  },
  goalOptionTextSelected: {
    color: '#000000',
    fontFamily: typography.fontfamily.bold,
  },
  // Preference Styles
  preferenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(16, 44, 24, 0.1)',
      } as any,
    }),
  },
  preferenceSelectorContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  preferenceOptionCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.greenOverlay,
    borderWidth: 0,
    gap: spacing.md,
    minHeight: 160,
    justifyContent: 'center',
  },
  preferenceOptionCardSelected: {
    backgroundColor: colors.greenprimary,
    borderWidth: 0,
    transform: [{ scale: 1.02 }],
    ...Platform.select({
      ios: {
        shadowColor: colors.darkgreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(16, 44, 24, 0.15)',
      } as any,
    }),
  },
  preferenceIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  preferenceIconWrapperSelected: {
    backgroundColor: colors.darkgreen,
  },
  preferenceOptionLabel: {
    fontSize: typography.size.body + 1,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  preferenceOptionLabelSelected: {
    color: colors.darkgreen,
    fontFamily: typography.fontfamily.bold,
  },
  preferenceOptionDescription: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.regular,
    color: colors.darkgreen,
    textAlign: 'center',
    opacity: 0.8,
  },
  preferenceOptionDescriptionSelected: {
    color: colors.darkgreen,
    fontFamily: typography.fontfamily.regular,
  },
  preferenceDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
  },
  preferenceDisplayIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preferenceDisplayText: {
    flex: 1,
  },
  preferenceDisplayLabel: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.medium,
    color: colors.textdark,
    opacity: 0.7,
    marginBottom: spacing.xs / 2,
  },
  preferenceDisplayValue: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
  },
});
