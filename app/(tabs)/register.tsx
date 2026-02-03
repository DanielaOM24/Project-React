// Register Screen Component

import { analyzeMealAudio, analyzeMealImage, type DetailedMealAnalysis } from '@/ai/meal-analysis.service';
import type { UserContext } from '@/ai/prompts';
import AudioWaveform from '@/components/AudioWaveform';
import MainBottomTabs from '@/components/MainBottomTabs';
import { useAuth } from '@/contexts/AuthContext';
import { getMealHistory } from '@/services/dashboard';
import { mealsAPI } from '@/services/meals';
import { colors, radius, spacing, typography } from '@/styles/designSystem';
import type { MealAnalysisResponseDto, MealType } from '@/types';
import { MealHistory } from '@/types/meals.type';
import {
  getMicrophonePermissionStatus,
  recordAudio,
  requestMicrophonePermission,
  stopRecordingAudio
} from '@/utils/audio';
import { takePhoto } from '@/utils/camera';
import { imageToBase64 } from '@/utils/image';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types
type RegisterMode = 'main' | 'camera' | 'audio' | 'mealTypeSelection' | 'analyzing' | 'analysis' | 'history';
type MediaType = 'camera' | 'audio';

export default function RegisterScreen() {
  // Component State
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const cameraRef = useRef<CameraView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<RegisterMode>('main');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [mealHistory, setMealHistory] = useState<MealHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<MealHistory | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState<boolean | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [pendingMediaType, setPendingMediaType] = useState<MediaType | null>(null);
  const [mealAnalysisResult, setMealAnalysisResult] = useState<MealAnalysisResponseDto | null>(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState<DetailedMealAnalysis | null>(null);
  const [audioTranscript, setAudioTranscript] = useState<string>('');

  // Effects
  useEffect(() => {
    loadMealHistory();
    checkMicrophonePermission();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (mode === 'history' || mode === 'main') {
        loadMealHistory();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode])
  );

  useEffect(() => {
    if (mode === 'audio' && microphonePermission === null) {
      checkMicrophonePermission();
    }
  }, [mode]);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.error);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(console.error);
      }
    };
  }, []);

  // Data Management Functions
  const loadMealHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const history = await getMealHistory();
      setMealHistory(history);
    } catch (error) {
      console.error('[Register] Error al cargar historial:', error);
      setMealHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const checkMicrophonePermission = async () => {
    const status = await getMicrophonePermissionStatus();
    setMicrophonePermission(status === 'granted');
  };

  const handleRequestPermissionAndOpenCamera = async () => {
    // Abrir cámara directamente
    if (!permission?.granted) {
      const result = await requestPermission();
      if (result.granted) {
        setMode('camera');
      }
    } else {
      setMode('camera');
    }
  };

  const buildUserContext = (): UserContext => {
    const goal = user?.goal || 'MAINTAIN_WEIGHT';
    const preference = user?.preference || 'NORMAL';
    let objetivo = 'mantener un estilo de vida saludable';
    if (goal === 'LOSE_WEIGHT') objetivo = 'perder peso';
    else if (goal === 'GAIN_MUSCLE') objetivo = 'ganar masa muscular';
    else if (goal === 'MAINTAIN_WEIGHT') objetivo = 'mantener el peso';
    let dieta = 'normal';
    if (preference === 'VEGETARIANO') dieta = 'vegetariana';
    return { objetivo, dieta, comidasPreferidas: [], restricciones: [], infoAdicional: '' };
  };

  const handleMealTypeSelected = async (mealType: MealType) => {
    setSelectedMealType(mealType);
    setMode('analyzing');
    setGeminiAnalysis(null);
    try {
      setIsProcessing(true);
      let result: MealAnalysisResponseDto;
      if (pendingMediaType === 'camera' && photoUri) {
        result = await mealsAPI.uploadImage(photoUri, mealType);
      } else if (pendingMediaType === 'audio' && audioUri) {
        result = await mealsAPI.uploadAudio(audioUri, mealType);
      } else {
        throw new Error('No hay media para analizar');
      }
      setMealAnalysisResult(result);

      // Llamar a Gemini para mensaje motivacional y alimentos identificados (no bloquea si falla)
      const userContext = buildUserContext();
      try {
        if (pendingMediaType === 'camera' && photoUri) {
          const base64 = await imageToBase64(photoUri);
          if (base64) {
            const dataUri = `data:image/jpeg;base64,${base64}`;
            const gemini = await analyzeMealImage(dataUri, userContext);
            setGeminiAnalysis(gemini);
          }
        } else if (pendingMediaType === 'audio' && audioUri) {
          const transcript = audioTranscript || 'Comida descrita por el usuario';
          const gemini = await analyzeMealAudio(transcript, userContext);
          setGeminiAnalysis(gemini);
        }
      } catch (geminiErr) {
        console.warn('[Register] Gemini no disponible o falló:', geminiErr);
      }
      setMode('analysis');
    } catch (error: any) {
      console.error('[Register] Error analizando comida:', error);
      
      // Determinar el tipo de error y mostrar mensaje apropiado
      const errorMessage = error?.message || '';
      
      if (errorMessage === 'FOOD_NOT_RECOGNIZED' || 
          errorMessage.includes('Base64') ||
          errorMessage.includes('undefined')) {
        Alert.alert(
          'Oops, eso no parece ser comida',
          'No pudimos reconocer comida en la imagen. Por favor, toma otra foto donde se vea claramente el plato de comida.',
          [
            {
              text: 'Tomar otra foto',
              onPress: () => {
                setPhotoUri(null);
                setSelectedMealType(null);
                setMode('camera');
              },
              style: 'default',
            },
            {
              text: 'Cancelar',
              onPress: () => {
                setPhotoUri(null);
                setSelectedMealType(null);
                setMode('main');
              },
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert(
          'Error al analizar',
          'No se pudo analizar la comida. Por favor intenta de nuevo.',
          [
            {
              text: 'Reintentar',
              onPress: () => {
                setMode('mealTypeSelection');
              },
            },
            {
              text: 'Cancelar',
              onPress: () => {
                setPhotoUri(null);
                setSelectedMealType(null);
                setMode('main');
              },
              style: 'cancel',
            },
          ]
        );
      }
      setMode('mealTypeSelection');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAnalysis = () => {
    if (!mealAnalysisResult) return;
    setPhotoUri(null);
    setAudioUri(null);
    setSelectedMealType(null);
    setMealAnalysisResult(null);
    setGeminiAnalysis(null);
    setPendingMediaType(null);
    setAudioTranscript('');
    setMode('main');
    Alert.alert('Éxito', 'Comida registrada correctamente', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
    ]);
  };

  const handleRequestPermissionAndOpenAudio = async () => {
    // Verificar permisos actuales primero
    const currentStatus = await getMicrophonePermissionStatus();
    const hasPermission = currentStatus === 'granted';
    
    if (hasPermission) {
      setMicrophonePermission(true);
      setMode('audio');
    } else {
      // Solicitar permiso
      const granted = await requestMicrophonePermission();
      setMicrophonePermission(granted);
      if (granted) {
        setMode('audio');
      } else {
        // Verificar si fue denegado o si aún está pendiente
        const newStatus = await getMicrophonePermissionStatus();
        if (newStatus === 'denied') {
          Alert.alert(
            'Permiso denegado',
            'Se necesita permiso del micrófono para grabar audio. Por favor, habilítalo en la configuración de la aplicación.'
          );
        } else {
          Alert.alert('Permiso requerido', 'Se necesita permiso del micrófono para grabar audio');
        }
      }
    }
  };

  const handleStartRecording = async () => {
    try {
      setIsProcessing(true);
      const recording = await recordAudio();
      if (recording) {
        recordingRef.current = recording;
        setIsRecording(true);
      } else {
        Alert.alert('Error', 'No se pudo iniciar la grabación');
      }
    } catch (error) {
      console.error('[Register] Error al iniciar grabación:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopRecording = async () => {
    if (!recordingRef.current) return;
    try {
      setIsProcessing(true);
      const uri = await stopRecordingAudio(recordingRef.current);
      recordingRef.current = null;
      setIsRecording(false);
      if (uri) {
        setAudioUri(uri);
        setPendingMediaType('audio');
        setMode('mealTypeSelection');
      } else {
        Alert.alert('Error', 'No se pudo guardar la grabación');
      }
    } catch (error) {
      console.error('[Register] Error al detener grabación:', error);
      Alert.alert('Error', 'No se pudo detener la grabación');
      setIsRecording(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!audioUri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      soundRef.current = sound;
      setIsPlaying(true);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          if (soundRef.current) {
            soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        }
      });
    } catch (error) {
      console.error('[Register] Error al reproducir audio:', error);
      setIsPlaying(false);
    }
  };

  const handleStopPlayback = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsPlaying(false);
      } catch (error) {
        console.error('[Register] Error al detener reproducción:', error);
      }
    }
  };



  // Datos de tipos de comida
  const mealTypes: { type: MealType; label: string; icon: string }[] = [
    { type: 'BREAKFAST', label: 'Desayuno', icon: 'sunny-outline' },
    { type: 'LUNCH', label: 'Almuerzo', icon: 'restaurant-outline' },
    { type: 'DINNER', label: 'Cena', icon: 'moon-outline' },
    { type: 'SNACK', label: 'Snack', icon: 'cafe-outline' },
  ];

  // Función para cerrar el modal de selección de tipo de comida
  const closeMealTypeModal = () => {
    setMode('main');
    setPendingMediaType(null);
    setSelectedMealType(null);
  };

  // Función para renderizar el modal de selección de tipo de comida
  const renderMealTypeModal = () => (
    <Modal
      visible={mode === 'mealTypeSelection'}
      transparent={true}
      animationType="slide"
      onRequestClose={closeMealTypeModal}>
      <Pressable style={styles.modalOverlay} onPress={closeMealTypeModal}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>¿Qué tipo de comida?</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeMealTypeModal}
              activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.textdark} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>Selecciona el tipo de comida que vas a registrar</Text>

          <View style={styles.mealTypeContainer}>
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.type}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === meal.type && styles.mealTypeButtonSelected,
                ]}
                onPress={() => handleMealTypeSelected(meal.type)}
                activeOpacity={0.7}
                disabled={isProcessing}>
                <View
                  style={[
                    styles.mealTypeIconContainer,
                    selectedMealType === meal.type && styles.mealTypeIconContainerSelected,
                  ]}>
                  <Ionicons
                    name={meal.icon as any}
                    size={24}
                    color={selectedMealType === meal.type ? '#000000' : colors.textdark}
                  />
                </View>
                <Text
                  style={[
                    styles.mealTypeLabel,
                    selectedMealType === meal.type && styles.mealTypeLabelSelected,
                  ]}>
                  {meal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

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
              <View style={[styles.actionGradient, { backgroundColor: colors.greenprimary }]}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="camera" size={24} color={colors.darkgreen} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Tomar foto</Text>
                  <Text style={styles.actionSubtitle}>Del plato de comida</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Registrar por audio */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRequestPermissionAndOpenAudio}
              activeOpacity={0.8}>
              <View style={[styles.actionGradient, { backgroundColor: colors.greenprimary }]}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="mic" size={24} color={colors.darkgreen} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Registrar por audio</Text>
                  <Text style={styles.actionSubtitle}>Describe lo que comiste</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Ver historial */}
            <TouchableOpacity
              style={styles.actionButtonDisabled}
              onPress={() => setMode('history')}
              activeOpacity={0.8}>
              <View style={styles.actionIconContainerDisabled}>
                <Ionicons name="time-outline" size={28} color={colors.greenprimary} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitleDisabled}>Ver mi historial de comidas</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <MainBottomTabs activeTab="register" />
        {renderMealTypeModal()}
      </View>
    );
  }

  // Solicitud de permisos
  if (!permission) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.greenprimary} />
      </View>
    );
  }

  if (!permission.granted && mode !== 'history') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <Ionicons name="camera-outline" size={64} color={colors.greenprimary} />
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
              <Ionicons name="close" size={24} color={colors.primaryText} />
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
                setPendingMediaType('camera');
                setMode('mealTypeSelection');
              }
            }}
            disabled={isProcessing}>
            {isProcessing ? (
              <ActivityIndicator size="small" color={colors.primaryText} />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
        {renderMealTypeModal()}
      </View>
    );
  }

  // Solicitud de permisos de micrófono
  if (mode === 'audio' && microphonePermission === false) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <Ionicons name="mic-outline" size={64} color={colors.greenprimary} />
          <Text style={styles.permissionTitle}>Se requiere permiso para usar el micrófono</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermissionAndOpenAudio}>
            <Text style={styles.permissionButtonText}>Conceder permiso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('main')}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Verificar permisos antes de mostrar la vista de audio (por si acaso)
  if (mode === 'audio' && microphonePermission === null) {
    // Verificar permisos de nuevo
    checkMicrophonePermission();
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.greenprimary} />
      </View>
    );
  }

  // Vista de grabación de audio (solo si tiene permisos)
  if (mode === 'audio' && microphonePermission === true) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.audioContainer}>
          <View style={[styles.audioHeader, { paddingTop: insets.top + 10 }]}>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                if (isRecording && recordingRef.current) {
                  handleStopRecording();
                }
                setMode('main');
              }}>
              <View style={styles.closeButtonInner}>
                <Ionicons name="close" size={24} color={colors.textdark} />
              </View>
            </Pressable>
          </View>

          <View style={styles.audioContent}>
            <Text style={styles.audioTitle}>Grabar audio</Text>
            <Text style={styles.audioSubtitle}>Describe lo que comiste</Text>

            <View style={styles.waveformContainer}>
              <AudioWaveform isActive={isRecording} color={colors.greenprimary} />
            </View>

            <View style={styles.audioControls}>
              {!isRecording ? (
                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={handleStartRecording}
                  disabled={isProcessing}>
                  {isProcessing ? (
                    <ActivityIndicator size="small" color={colors.primaryText} />
                  ) : (
                    <Ionicons name="mic" size={32} color={colors.primaryText} />
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.recordButton, styles.recordButtonStop]}
                  onPress={handleStopRecording}
                  disabled={isProcessing}>
                  {isProcessing ? (
                    <ActivityIndicator size="small" color={colors.primaryText} />
                  ) : (
                    <Ionicons name="stop" size={32} color={colors.primaryText} />
                  )}
                </TouchableOpacity>
              )}
            </View>

            {isRecording && (
              <Text style={styles.recordingText}>Grabando...</Text>
            )}
          </View>
        </View>
        <MainBottomTabs activeTab="register" />
        {renderMealTypeModal()}
      </View>
    );
  }

  // Vista de selección de tipo de comida (después de capturar)
  if (mode === 'mealTypeSelection') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.mealTypeSelectionContainer}>
          <View style={styles.mealTypeSelectionHeader}>
            <Pressable style={styles.backButtonHeader} onPress={() => {
              if (pendingMediaType === 'camera') {
                setPhotoUri(null);
                setMode('camera');
              } else {
                setAudioUri(null);
                setMode('audio');
              }
            }}>
              <Ionicons name="arrow-back" size={24} color={colors.textdark} />
            </Pressable>
            <Text style={styles.mealTypeSelectionTitle}>¿Qué tipo de comida?</Text>
            <View style={styles.backButtonHeader} />
          </View>

          {pendingMediaType === 'camera' && photoUri && (
            <Image source={{ uri: photoUri }} style={styles.mealTypeSelectionImage} />
          )}

          {pendingMediaType === 'audio' && audioUri && (
            <View style={styles.mealTypeSelectionAudioContainer}>
              <View style={styles.waveformContainer}>
                <AudioWaveform isActive={isPlaying} color={colors.greenprimary} />
              </View>
              <TouchableOpacity
                style={styles.playButton}
                onPress={isPlaying ? handleStopPlayback : handlePlayAudio}
                disabled={isProcessing}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={32} color={colors.primaryText} />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.mealTypeSelectionSubtitle}>Selecciona el tipo de comida que vas a registrar</Text>

          <View style={styles.mealTypeContainer}>
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.type}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === meal.type && styles.mealTypeButtonSelected,
                ]}
                onPress={() => handleMealTypeSelected(meal.type)}
                activeOpacity={0.7}
                disabled={isProcessing}>
                <View
                  style={[
                    styles.mealTypeIconContainer,
                    selectedMealType === meal.type && styles.mealTypeIconContainerSelected,
                  ]}>
                  <Ionicons
                    name={meal.icon as any}
                    size={24}
                    color={selectedMealType === meal.type ? '#000000' : colors.textdark}
                  />
                </View>
                <Text
                  style={[
                    styles.mealTypeLabel,
                    selectedMealType === meal.type && styles.mealTypeLabelSelected,
                  ]}>
                  {meal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <MainBottomTabs activeTab="register" />
      </View>
    );
  }

  // Vista de análisis en progreso
  if (mode === 'analyzing') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color={colors.greenprimary} />
          <Text style={styles.analyzingText}>Analizando tu comida...</Text>
          <Text style={styles.analyzingSubtext}>Esto puede tomar unos segundos</Text>
        </View>
        <MainBottomTabs activeTab="register" />
      </View>
    );
  }

  // Etiquetas de tipo de comida
  const mealTypeLabels: Record<string, string> = {
    BREAKFAST: 'Desayuno',
    LUNCH: 'Almuerzo',
    DINNER: 'Cena',
    SNACK: 'Snack',
  };
  const formatAnalyzedAt = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  // Vista de resultados del análisis (respuesta del endpoint /api/meals/analyze)
  if (mode === 'analysis' && mealAnalysisResult) {
    const np = mealAnalysisResult.nutritionProfile;
    const calories = np?.calories ?? 0;
    const protein = np?.protein ?? 0;
    const carbs = np?.carbs ?? 0;
    const fats = np?.fats ?? 0;
    const mealTypeLabel = mealTypeLabels[mealAnalysisResult.mealType || ''] || mealAnalysisResult.mealType || 'Comida';

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView style={styles.analysisContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.analysisHeader}>
            <Pressable style={styles.backButtonHeader}             onPress={() => {
              setMealAnalysisResult(null);
              setGeminiAnalysis(null);
              setSelectedMealType(null);
              setMode('mealTypeSelection');
            }}>
              <Ionicons name="arrow-back" size={24} color={colors.textdark} />
            </Pressable>
            <Text style={styles.analysisTitle}>Registrar comida</Text>
            <View style={styles.backButtonHeader} />
          </View>

          {/* Tipo de comida y fecha */}
          <View style={styles.apiResultBadge}>
            <Text style={styles.apiResultMealType}>{mealTypeLabel}</Text>
            {mealAnalysisResult.analyzedAt ? (
              <Text style={styles.apiResultDate}>{formatAnalyzedAt(mealAnalysisResult.analyzedAt)}</Text>
            ) : null}
          </View>

          {/* Mensaje de NutriLens (Gemini): "¡Excelente! Has tenido una comida equilibrada..." */}
          {geminiAnalysis?.message ? (
            <View style={styles.geminiMessageContainer}>
              <View style={styles.geminiIconRow}>
                <Ionicons name="sparkles" size={28} color={colors.greenprimary} />
                <Text style={styles.geminiMessageTitle}>NutriLens</Text>
              </View>
              <Text style={styles.geminiMessageText}>{geminiAnalysis.message}</Text>
            </View>
          ) : null}

          {/* Miniatura si es imagen */}
          {mealAnalysisResult.mediaType === 'IMAGE' && mealAnalysisResult.mediaUrl ? (
            <View style={styles.apiResultImageWrap}>
              <Image source={{ uri: mealAnalysisResult.mediaUrl }} style={styles.apiResultImage} resizeMode="cover" />
            </View>
          ) : null}

          {/* Perfil nutricional */}
          <View style={styles.nutritionProfileCard}>
            <View style={styles.nutritionProfileHeader}>
              <Ionicons name="nutrition-outline" size={28} color={colors.greenprimary} />
              <Text style={styles.nutritionProfileTitle}>Perfil nutricional</Text>
            </View>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{calories}</Text>
                <Text style={styles.nutritionLabel}>kcal</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{protein}</Text>
                <Text style={styles.nutritionLabel}>Proteína (g)</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{carbs}</Text>
                <Text style={styles.nutritionLabel}>Carbos (g)</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{fats}</Text>
                <Text style={styles.nutritionLabel}>Grasas (g)</Text>
              </View>
            </View>
          </View>

          {/* Total destacado */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total de esta comida</Text>
            <Text style={styles.totalCalories}>{calories} kcal</Text>
          </View>
        </ScrollView>

        <View style={styles.analysisActions}>
          <TouchableOpacity
            style={styles.analysisButtonSecondary}
            onPress={() => {
              setMealAnalysisResult(null);
              setGeminiAnalysis(null);
              setSelectedMealType(null);
              if (pendingMediaType === 'camera') {
                setPhotoUri(null);
                setMode('camera');
              } else {
                setAudioUri(null);
                setMode('audio');
              }
            }}
            disabled={isProcessing}>
            <Text style={styles.analysisButtonSecondaryText}>Tomar nuevamente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.analysisButtonPrimary}
            onPress={handleConfirmAnalysis}
            disabled={isProcessing}>
            <Text style={styles.analysisButtonPrimaryText}>Listo</Text>
          </TouchableOpacity>
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
            <Ionicons name="arrow-back" size={24} color={colors.textdark} />
          </Pressable>
          <Text style={styles.historyHeaderTitle}>Mi historial de comidas</Text>
          <View style={styles.backButtonHeader} />
        </View>

        {isLoadingHistory ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.greenprimary} />
            <Text style={styles.loadingText}>Cargando historial...</Text>
          </View>
        ) : mealHistory.length === 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="images-outline" size={64} color={colors.textdark} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyHistoryTitle}>No hay registros guardados</Text>
            <Text style={styles.emptyHistorySubtitle}>
              Toma una foto o graba un audio de tu comida para comenzar tu historial
            </Text>
            <TouchableOpacity style={styles.emptyHistoryButton} onPress={handleRequestPermissionAndOpenCamera}>
              <Text style={styles.emptyHistoryButtonText}>Tomar foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={mealHistory}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.historyList}
            renderItem={({ item }) => (
              <Pressable style={styles.historyItem} onPress={() => setSelectedMeal(item)}>
                {item.mediaType === 'IMAGE' ? (
                  <Image source={{ uri: item.mediaUrl }} style={styles.historyImage} />
                ) : (
                  <View style={styles.historyAudioItem}>
                    <Ionicons name="mic" size={40} color={colors.greenprimary} />
                    <Text style={styles.historyAudioText}>Audio</Text>
                  </View>
                )}
                <Pressable
                  style={[styles.deleteButton, isProcessing && { opacity: 0.5 }]}
                  onPress={async (e) => {
                    e.stopPropagation();
                    if (isProcessing) return;
                    
                    Alert.alert(
                      'Eliminar registro',
                      '¿Estás seguro de que deseas eliminar este registro?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              setIsProcessing(true);
                              console.log('[Register] Eliminando registro con ID:', item.id);
                              await mealsAPI.delete(item.id);
                              console.log('[Register] Registro eliminado exitosamente');
                              
                              // Recargar el historial
                              await loadMealHistory();
                              
                              // Navegar al home para que se actualice el dashboard automáticamente
                              // El useFocusEffect en home.tsx se encargará de refrescar los datos
                              router.push('/(tabs)/home');
                              
                              Alert.alert('Éxito', 'Registro eliminado correctamente. El dashboard se ha actualizado.');
                            } catch (error: any) {
                              console.error('[Register] Error al eliminar registro:', error);
                              const errorMessage = error?.message || 'No se pudo eliminar el registro';
                              
                              // Si es error de sesión, mostrar mensaje más claro
                              if (errorMessage.includes('sesión') || errorMessage.includes('expirado') || errorMessage.includes('autenticado')) {
                                Alert.alert('Sesión expirada', 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.', [
                                  { text: 'OK', onPress: () => router.push('/login') }
                                ]);
                              } else {
                                Alert.alert('Error', errorMessage);
                              }
                            } finally {
                              setIsProcessing(false);
                            }
                          },
                        },
                      ]
                    );
                  }}
                  disabled={isProcessing}>
                  {isProcessing ? (
                    <ActivityIndicator size="small" color={colors.primaryText} />
                  ) : (
                    <Ionicons name="trash-outline" size={20} color={colors.primaryText} />
                  )}
                </Pressable>
              </Pressable>
            )}
          />
        )}

        {/* Modal para ver foto o reproducir audio */}
        {selectedMeal && (
          <Modal
            visible={!!selectedMeal}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedMeal(null)}>
            <View style={styles.photoModalContainer}>
              <Pressable style={styles.photoModalBackdrop} onPress={() => setSelectedMeal(null)}>
                <View style={styles.photoModalContent}>
                  <Pressable
                    style={styles.photoModalCloseButton}
                    onPress={() => setSelectedMeal(null)}>
                    <Ionicons name="close" size={28} color={colors.primaryText} />
                  </Pressable>
                  {selectedMeal.mediaType === 'IMAGE' ? (
                    <Image
                      source={{ uri: selectedMeal.mediaUrl }}
                      style={styles.photoModalImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.mealModalAudioContainer}>
                      <AudioWaveform isActive={isPlaying} color={colors.greenprimary} />
                      <TouchableOpacity
                        style={styles.mealModalPlayButton}
                        onPress={async () => {
                          if (!isPlaying) {
                            try {
                              if (soundRef.current) {
                                await soundRef.current.unloadAsync();
                              }
                              const { sound } = await Audio.Sound.createAsync({
                                uri: selectedMeal.mediaUrl,
                              });
                              soundRef.current = sound;
                              setIsPlaying(true);
                              await sound.playAsync();
                              sound.setOnPlaybackStatusUpdate((status) => {
                                if (status.isLoaded && status.didJustFinish) {
                                  setIsPlaying(false);
                                  if (soundRef.current) {
                                    soundRef.current.unloadAsync();
                                    soundRef.current = null;
                                  }
                                }
                              });
                            } catch (error) {
                              console.error('[Register] Error al reproducir audio:', error);
                              setIsPlaying(false);
                            }
                          } else {
                            if (soundRef.current) {
                              await soundRef.current.stopAsync();
                              await soundRef.current.unloadAsync();
                              soundRef.current = null;
                              setIsPlaying(false);
                            }
                          }
                        }}>
                        <Ionicons
                          name={isPlaying ? 'pause' : 'play'}
                          size={32}
                          color={colors.primaryText}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
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
    padding: spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: typography.size.title,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: spacing.md,
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: radius.pill,
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
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.whiteOverlay,
    width: '85%',
    maxWidth: 350,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.whiteOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  actionIconContainerDisabled: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.whiteOverlay,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.darkgreen,
    marginBottom: spacing.xs,
  },
  actionTitleDisabled: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.regular,
    color: colors.darkgreen,
    opacity: 0.8,
  },
  actionSubtitleDisabled: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
  },
  permissionTitle: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: colors.greenprimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  permissionButtonText: {
    color: colors.primaryText,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    color: colors.textdark,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.medium,
    opacity: 0.7,
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
    paddingHorizontal: spacing.md,
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
    borderRadius: radius.pill,
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
    paddingVertical: spacing.md,
    zIndex: 10,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.whiteOverlay,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.greenprimary,
  },
  previewContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  previewTitle: {
    fontSize: typography.size.title,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    marginBottom: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  previewButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    gap: spacing.sm,
  },
  previewButtonSecondaryText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
    opacity: 0.7,
  },
  previewButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.greenprimary,
    gap: spacing.sm,
  },
  previewButtonPrimaryText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.darkgreen,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlay,
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyHeaderTitle: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
  },
  historyList: {
    padding: spacing.lg,
  },
  historyItem: {
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  historyImage: {
    width: '100%',
    height: '100%',
  },
  historyAudioItem: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  historyAudioText: {
    marginTop: spacing.sm,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.medium,
    color: colors.textdark,
    opacity: 0.7,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.error,
    opacity: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
  },
  emptyHistoryTitle: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyHistorySubtitle: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  emptyHistoryButton: {
    backgroundColor: colors.greenprimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  emptyHistoryButtonText: {
    color: colors.primaryText,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    maxWidth: 400,
    alignSelf: 'center',
  },
  mealTypeButton: {
    width: 160,
    height: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.darkgreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mealTypeButtonSelected: {
    backgroundColor: colors.greenprimary,
    shadowColor: colors.darkgreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  mealTypeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.greenprimary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  mealTypeIconContainerSelected: {
    backgroundColor: colors.darkgreen + '15',
  },
  mealTypeLabel: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
    textAlign: 'center',
  },
  mealTypeLabelSelected: {
    color: colors.darkgreen,
    fontFamily: typography.fontfamily.bold,
    fontSize: typography.size.caption,
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
    borderRadius: radius.pill,
    backgroundColor: colors.whiteOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  photoModalImage: {
    width: '100%',
    height: 500,
    borderRadius: radius.lg,
  },
  mealModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealModalBackdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealModalContent: {
    width: '90%',
    maxWidth: 500,
    position: 'relative',
  },
  mealModalCloseButton: {
    position: 'absolute',
    top: -50,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.whiteOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  mealModalAudioContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 60,
  },
  mealModalPlayButton: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.greenprimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Estilos para audio
  audioContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  audioHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  audioContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 100,
    paddingBottom: 100,
  },
  audioTitle: {
    fontSize: typography.size.title,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  audioSubtitle: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  waveformContainer: {
    width: '100%',
    maxWidth: 300,
    marginVertical: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioControls: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.greenprimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonStop: {
    backgroundColor: colors.error,
  },
  recordingText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.error,
    marginTop: spacing.md,
  },
  audioPreviewContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  audioPreviewControls: {
    marginTop: 30,
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.greenprimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonStop: {
    backgroundColor: colors.textdark,
    opacity: 0.7,
  },
  // Estilos para selección de tipo de comida
  mealTypeSelectionContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  mealTypeSelectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  mealTypeSelectionTitle: {
    fontSize: typography.size.title,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
  },
  mealTypeSelectionImage: {
    width: '100%',
    height: 300,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    resizeMode: 'cover',
  },
  mealTypeSelectionAudioContainer: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.whiteOverlay,
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  mealTypeSelectionSubtitle: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  // Estilos para análisis
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  analyzingText: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
    marginTop: spacing.lg,
  },
  analyzingSubtext: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    marginTop: spacing.sm,
  },
  analysisContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  analysisTitle: {
    fontSize: typography.size.title,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
  },
  nutrilensMessageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.whiteOverlay,
    shadowColor: colors.darkgreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  nutrilensIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.greenprimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutrilensMessageText: {
    flex: 1,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    lineHeight: 22,
  },
  geminiMessageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.whiteOverlay,
    shadowColor: colors.darkgreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  geminiIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  geminiMessageTitle: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
  },
  geminiMessageText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    lineHeight: 22,
  },
  detectedFoodsTitle: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.darkgreen,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  foodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  foodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  foodInfoContainer: {
    flex: 1,
  },
  foodName: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
    marginBottom: spacing.xs,
  },
  foodPortionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.darkgreen + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  foodPortion: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.medium,
    color: colors.darkgreen,
  },
  foodNutritionContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.whiteOverlay,
  },
  foodNutritionText: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.8,
  },
  totalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.whiteOverlay,
    shadowColor: colors.darkgreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  totalLabel: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.darkgreen,
  },
  totalCalories: {
    fontSize: typography.size.title,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
  },
  apiResultBadge: {
    backgroundColor: colors.appBackground,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.whiteOverlay,
  },
  apiResultMealType: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
  },
  apiResultDate: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  apiResultImageWrap: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.whiteOverlay,
  },
  apiResultImage: {
    width: '100%',
    height: '100%',
  },
  nutritionProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.whiteOverlay,
    shadowColor: colors.darkgreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  nutritionProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  nutritionProfileTitle: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.appBackground,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: typography.size.title,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
  },
  nutritionLabel: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    marginTop: spacing.xs,
  },
  analysisActions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 100,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.whiteOverlay,
  },
  analysisButtonSecondary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.whiteOverlay,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisButtonSecondaryText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
  },
  analysisButtonPrimary: {
    flex: 1,
    backgroundColor: colors.greenprimary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  analysisButtonPrimaryText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.darkgreen,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: colors.darkgreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.size.title,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
    flex: 1,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.whiteOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    opacity: 0.7,
    marginBottom: spacing.xl,
  },
});

