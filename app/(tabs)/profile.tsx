import MainBottomTabs from '@/components/MainBottomTabs';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI, profileAPI, UpdateProfileData } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, refreshProfile, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<UpdateProfileData>({});

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
      
      if (errorMessage.includes('expirado') || errorMessage.includes('expired') || 
          errorMessage.includes('No estás autenticado') || errorMessage.includes('Tu sesión ha expirado')) {
        Alert.alert('Error', errorMessage, [
          { text: 'OK', onPress: async () => {
            await authAPI.logout();
            router.push('/login');
          }},
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

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A4D65E" />
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
        {/* Header con gradiente verde */}
        <LinearGradient
          colors={['#A4D65E', '#89F336']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}>
          {/* Título y acciones */}
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.headerIconButton}
                onPress={() => setIsEditing(!isEditing)}>
                <Ionicons
                  name={isEditing ? 'close-outline' : 'create-outline'}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.headerIconButton}
                onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={70} color="#FFFFFF" />
            </View>
          </View>

          {/* Username */}
          {isEditing ? (
            <TextInput
              style={styles.usernameInput}
              value={editData.displayName || ''}
              onChangeText={(text) => setEditData({ ...editData, displayName: text })}
              placeholder="Nombre"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
            />
          ) : (
            <Text style={styles.username}>{user?.displayName || 'Usuario'}</Text>
          )}

          {/* Botón de objetivo */}
          <View style={styles.goalButtonContainer}>
            {isEditing ? (
              <View style={styles.goalSelectorContainer}>
                <Text style={styles.goalSelectorLabel}>Selecciona tu objetivo:</Text>
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
                        size={18}
                        color="#FFFFFF"
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
            ) : (
              <TouchableOpacity style={styles.goalButton} activeOpacity={0.8}>
                <Ionicons name="barbell-outline" size={18} color="#FFFFFF" />
                <Text style={styles.goalText}>
                  {getGoalLabel(user?.goal)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Card de objetivo diario */}
        <View style={styles.dailyObjectiveCard}>
          <View style={styles.objectiveHeader}>
            <View style={styles.objectiveIconContainer}>
              <Ionicons name="flag-outline" size={20} color="#A4D65E" />
            </View>
            <Text style={styles.objectiveTitle}>Tu objetivo diario</Text>
          </View>
          <Text style={styles.calorieGoal}>{user?.daily_calories || 0} kcal</Text>
          <Text style={styles.objectiveDescription}>
            Calculado según tu perfil y objetivo
          </Text>
        </View>

        {/* Sección Mis datos */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Mis datos</Text>

          {/* Altura */}
          <TouchableOpacity
            style={styles.dataCard}
            activeOpacity={isEditing ? 0.7 : 1}
            onPress={() => isEditing && setIsEditing(true)}>
            <View style={styles.dataCardLeft}>
              <View style={styles.dataIconContainer}>
                <Ionicons name="resize-outline" size={22} color="#A4D65E" />
              </View>
              <Text style={styles.dataLabel}>Altura</Text>
            </View>
            <View style={styles.dataCardRight}>
              {isEditing ? (
                <TextInput
                  style={styles.dataInput}
                  value={editData.height?.toString() || ''}
                  onChangeText={(text) =>
                    setEditData({ ...editData, height: parseInt(text) || undefined })
                  }
                  placeholder="cm"
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.dataValue}>{user?.height ? `${user.height} cm` : 'No especificado'}</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Peso */}
          <TouchableOpacity
            style={styles.dataCard}
            activeOpacity={isEditing ? 0.7 : 1}
            onPress={() => isEditing && setIsEditing(true)}>
            <View style={styles.dataCardLeft}>
              <View style={styles.dataIconContainer}>
                <Ionicons name="scale-outline" size={22} color="#A4D65E" />
              </View>
              <Text style={styles.dataLabel}>Peso</Text>
            </View>
            <View style={styles.dataCardRight}>
              {isEditing ? (
                <TextInput
                  style={styles.dataInput}
                  value={editData.weight?.toString() || ''}
                  onChangeText={(text) =>
                    setEditData({ ...editData, weight: parseFloat(text) || undefined })
                  }
                  placeholder="kg"
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={styles.dataValue}>{user?.weight ? `${user.weight} kg` : 'No especificado'}</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Actividad */}
          <View style={styles.dataCard}>
            <View style={styles.dataCardLeft}>
              <View style={styles.dataIconContainer}>
                <Ionicons name="pulse-outline" size={22} color="#A4D65E" />
              </View>
              <Text style={styles.dataLabel}>Actividad</Text>
            </View>
            <View style={styles.dataCardRight}>
              {isEditing ? (
                <View style={styles.activitySelectorContainer}>
                  {[
                    { value: 'LOW', label: 'Bajo' },
                    { value: 'MEDIUM', label: 'Medio' },
                    { value: 'HIGH', label: 'Alto' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.activityOption,
                        editData.activityLevel === option.value && styles.activityOptionSelected,
                      ]}
                      onPress={() => setEditData({ ...editData, activityLevel: option.value as any })}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.activityOptionText,
                          editData.activityLevel === option.value && styles.activityOptionTextSelected,
                        ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.dataValue}>{getActivityLabel(user?.activityLevel)}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Edad */}
        <View style={styles.ageContainer}>
          {isEditing ? (
            <TextInput
              style={styles.ageInput}
              value={editData.age?.toString() || ''}
              onChangeText={(text) =>
                setEditData({ ...editData, age: parseInt(text) || undefined })
              }
              placeholder="Edad"
              keyboardType="numeric"
            />
          ) : (
            <>
              <Text style={styles.ageValue}>{user?.age || '--'}</Text>
              <Text style={styles.ageUnit}>años</Text>
            </>
          )}
        </View>

        {/* Botón de guardar cuando está editando */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}>
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
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
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  usernameInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    paddingBottom: 8,
    minWidth: 200,
  },
  goalButtonContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  goalText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  dailyObjectiveCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: -24,
    borderRadius: 28,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    gap: 12,
    marginBottom: 16,
  },
  objectiveIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(164, 214, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  objectiveTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: -0.2,
  },
  calorieGoal: {
    fontSize: 42,
    fontWeight: '700',
    color: '#A4D65E',
    marginBottom: 8,
    letterSpacing: -1,
  },
  objectiveDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  dataSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    width: '90%',
    maxWidth: 400,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  dataCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    marginBottom: 14,
    minHeight: 70,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  dataCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dataIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(164, 214, 94, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: -0.2,
  },
  dataCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dataInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#A4D65E',
    minWidth: 80,
    textAlign: 'right',
    paddingBottom: 4,
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    gap: 6,
  },
  ageValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  ageUnit: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  ageInput: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    borderBottomWidth: 2,
    borderBottomColor: '#A4D65E',
    minWidth: 60,
    textAlign: 'center',
    paddingBottom: 4,
  },
  saveButton: {
    backgroundColor: '#A4D65E',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 24,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goalSelectorContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  goalSelectorLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  goalOptionsContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 100,
    justifyContent: 'center',
  },
  goalOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(255, 255, 255, 0.7)',
    transform: [{ scale: 1.05 }],
  },
  goalOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.1,
  },
  goalOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activitySelectorContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  activityOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: 70,
    alignItems: 'center',
  },
  activityOptionSelected: {
    backgroundColor: '#A4D65E',
    borderColor: '#89F336',
    transform: [{ scale: 1.05 }],
  },
  activityOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.1,
  },
  activityOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
