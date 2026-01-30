import MainBottomTabs from '@/components/MainBottomTabs';
import { takePhoto } from '@/utils/camera';
import { addMealPhoto, getMealPhotos, MealPhoto, removeMealPhoto } from '@/utils/mealPhotosStorage';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RegisterMode = 'main' | 'camera' | 'preview' | 'history';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<RegisterMode>('main');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [savedPhotos, setSavedPhotos] = useState<MealPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<MealPhoto | null>(null);

  useEffect(() => {
    loadSavedPhotos();
  }, []);

  const loadSavedPhotos = async () => {
    try {
      setIsLoadingPhotos(true);
      const photos = await getMealPhotos();
      setSavedPhotos(photos);
    } catch (error) {
      console.error('[Register] Error al cargar fotos:', error);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  const handleRequestPermissionAndOpenCamera = async () => {
    if (permission?.granted) {
      setMode('camera');
    } else if (permission) {
      const result = await requestPermission();
      if (result.granted) {
        setMode('camera');
      }
    }
  };

  const handleSavePhoto = async () => {
    if (!photoUri) return;
    try {
      setIsProcessing(true);
      await addMealPhoto(photoUri);
      await loadSavedPhotos();
      setPhotoUri(null);
      setMode('main');
      Alert.alert('Éxito', 'Foto registrada correctamente');
    } catch (error) {
      console.error('[Register] Error al guardar foto:', error);
      Alert.alert('Error', 'No se pudo guardar la foto');
    } finally {
      setIsProcessing(false);
    }
  };

  // Pantalla principal
  if (mode === 'main') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <Text style={styles.mainTitle}>¿Cómo quieres registrar?</Text>
            <Text style={styles.mainSubtitle}>Elige la opción que te sea más fácil</Text>
          </View>

          <View style={styles.actionsContainer}>
            {/* Tomar foto */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRequestPermissionAndOpenCamera}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#A4D65E', '#89F336']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="camera" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Tomar foto</Text>
                  <Text style={styles.actionSubtitle}>Del plato de comida</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Registrar por audio */}
            <TouchableOpacity
              style={styles.actionButtonDisabled}
              disabled
              activeOpacity={0.8}>
              <View style={styles.actionIconContainerDisabled}>
                <Ionicons name="mic" size={28} color="#A4D65E" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitleDisabled}>Registrar por audio</Text>
                <Text style={styles.actionSubtitleDisabled}>Describe lo que comiste</Text>
              </View>
            </TouchableOpacity>

            {/* Ver historial */}
            <TouchableOpacity
              style={styles.actionButtonDisabled}
              onPress={() => setMode('history')}
              activeOpacity={0.8}>
              <View style={styles.actionIconContainerDisabled}>
                <Ionicons name="time-outline" size={28} color="#A4D65E" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitleDisabled}>Ver mi historial de comidas</Text>
                <Text style={styles.actionSubtitleDisabled}>
                  {savedPhotos.length} {savedPhotos.length === 1 ? 'foto guardada' : 'fotos guardadas'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <MainBottomTabs activeTab="register" />
      </View>
    );
  }

  // Solicitud de permisos
  if (!permission) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#A4D65E" />
      </View>
    );
  }

  if (!permission.granted && mode !== 'history') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <Ionicons name="camera-outline" size={64} color="#A4D65E" />
          <Text style={styles.permissionTitle}>Se requiere permiso para usar la cámara</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermissionAndOpenCamera}>
            <Text style={styles.permissionButtonText}>Conceder permiso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('main')}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Vista de cámara
  if (mode === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        <View style={[styles.cameraHeader, { paddingTop: insets.top + 10 }]}>
          <Pressable style={styles.closeButton} onPress={() => setMode('main')}>
            <View style={styles.closeButtonInner}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>
        <View style={[styles.cameraFooter, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={async () => {
              setIsProcessing(true);
              const photo = await takePhoto(cameraRef.current);
              setIsProcessing(false);
              if (photo) {
                setPhotoUri(photo.uri);
                setMode('preview');
              }
            }}
            disabled={isProcessing}>
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Vista de preview
  if (mode === 'preview' && photoUri) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Vista previa</Text>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.previewButtonSecondary}
              onPress={() => {
                setPhotoUri(null);
                setMode('camera');
              }}
              disabled={isProcessing}>
              <Ionicons name="camera-outline" size={20} color="#6B7280" />
              <Text style={styles.previewButtonSecondaryText}>Tomar otra</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.previewButtonPrimary}
              onPress={handleSavePhoto}
              disabled={isProcessing}>
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.previewButtonPrimaryText}>Registrar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <MainBottomTabs activeTab="register" />
      </View>
    );
  }

  // Vista de historial
  if (mode === 'history') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.historyHeader}>
          <Pressable style={styles.backButtonHeader} onPress={() => setMode('main')}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text style={styles.historyHeaderTitle}>Mi historial de comidas</Text>
          <View style={styles.backButtonHeader} />
        </View>

        {isLoadingPhotos ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#A4D65E" />
            <Text style={styles.loadingText}>Cargando historial...</Text>
          </View>
        ) : savedPhotos.length === 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="images-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyHistoryTitle}>No hay fotos guardadas</Text>
            <Text style={styles.emptyHistorySubtitle}>
              Toma una foto de tu comida para comenzar tu historial
            </Text>
            <TouchableOpacity style={styles.emptyHistoryButton} onPress={handleRequestPermissionAndOpenCamera}>
              <Text style={styles.emptyHistoryButtonText}>Tomar foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={savedPhotos}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.historyList}
            renderItem={({ item }) => (
              <Pressable style={styles.historyPhotoItem} onPress={() => setSelectedPhoto(item)}>
                <Image source={{ uri: item.uri }} style={styles.historyPhotoImage} />
                <Pressable
                  style={styles.deletePhotoButton}
                  onPress={async (e) => {
                    e.stopPropagation();
                    Alert.alert('Eliminar foto', '¿Estás seguro de que deseas eliminar esta foto?', [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await removeMealPhoto(item.id);
                            await loadSavedPhotos();
                          } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar la foto');
                          }
                        },
                      },
                    ]);
                  }}>
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                </Pressable>
              </Pressable>
            )}
          />
        )}

        {/* Modal para ver foto */}
        {selectedPhoto && (
          <Modal
            visible={!!selectedPhoto}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedPhoto(null)}>
            <View style={styles.photoModalContainer}>
              <Pressable style={styles.photoModalBackdrop} onPress={() => setSelectedPhoto(null)}>
                <View style={styles.photoModalContent}>
                  <Pressable
                    style={styles.photoModalCloseButton}
                    onPress={() => setSelectedPhoto(null)}>
                    <Ionicons name="close" size={28} color="#FFFFFF" />
                  </Pressable>
                  <Image
                    source={{ uri: selectedPhoto.uri }}
                    style={styles.photoModalImage}
                    resizeMode="contain"
                  />
                </View>
              </Pressable>
            </View>
          </Modal>
        )}

        <MainBottomTabs activeTab="register" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 16,
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 30,
    overflow: 'hidden',
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonDisabled: {
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    width: '85%',
    maxWidth: 350,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIconContainerDisabled: {
    width: 56,
    height: 56,
    borderRadius: 30,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionTitleDisabled: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actionSubtitleDisabled: {
    fontSize: 14,
    color: '#6B7280',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#A4D65E',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 20,
    zIndex: 10,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A4D65E',
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    marginBottom: 24,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  previewButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  previewButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#A4D65E',
    gap: 8,
  },
  previewButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  historyList: {
    padding: 20,
  },
  historyPhotoItem: {
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  historyPhotoImage: {
    width: '100%',
    height: '100%',
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyHistoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHistorySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyHistoryButton: {
    backgroundColor: '#A4D65E',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyHistoryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  photoModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalBackdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalContent: {
    width: '90%',
    maxWidth: 500,
    position: 'relative',
  },
  photoModalCloseButton: {
    position: 'absolute',
    top: -50,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  photoModalImage: {
    width: '100%',
    height: 500,
    borderRadius: 20,
  },
});
