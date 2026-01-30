import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"; // Agregué ActivityIndicator
import { CameraView, useCameraPermissions } from "expo-camera";
import * as sensorsManager from "./sensorsManager";
import { Audio } from "expo-av";

export default function SensorApp() {
  const cameraRef = useRef<CameraView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // --- EDITADO: Nuevo estado de carga ---
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await sensorsManager.requestMicrophonePermission();
      setMicrophonePermission(ok);
    })();
  }, []);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.sensorTitle}>Se requiere permiso para usar la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- EDITADO: Función de captura con envío a API ---
  const handleTakePhoto = async () => {
    if (isUploading) return;

    const photo = await sensorsManager.takePhoto(cameraRef.current);
    if (photo) {
      try {
        setIsUploading(true);
        console.log("Enviando foto a la base de datos...");
        
        const result = await sensorsManager.analyzeMealPhoto(photo.uri);
        
        console.log("Análisis exitoso:", result);
        alert("¡Foto analizada y guardada correctamente!");
        await sensorsManager.speak("Análisis completado");
        
      } catch (error) {
        console.error("Error al conectar con el servidor de NutriLens", error)
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRecordAudio = async () => {
    if (!isRecording) {
      const recording = await sensorsManager.recordAudio();
      if (recording) {
        recordingRef.current = recording;
        setIsRecording(true);
      }
    } else {
      if (recordingRef.current) {
        const uri = await sensorsManager.stopRecordingAudio(recordingRef.current);
        setIsRecording(false);
        recordingRef.current = null;
        if (uri) {
          await sensorsManager.playAudio(uri);
        }
      }
    }
  };

  const handleSpeak = async () => {
    await sensorsManager.speak("Prueba del sensor de voz");
  };

  return (
    <View style={styles.container}>
      {/* CÁMARA */}
      <View style={styles.sensorCard}>
        <Text style={styles.sensorTitle}>Cámara NutriLens</Text>
        <CameraView ref={cameraRef} style={styles.camera} />
        
        {/* --- EDITADO: Botón con feedback de carga --- */}
        <TouchableOpacity 
          style={[styles.button, isUploading && { backgroundColor: '#A9A9A9' }]} 
          onPress={handleTakePhoto}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Tomar foto y analizar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Resto de componentes (Micrófono y Síntesis) permanecen igual */}
      {microphonePermission && (
        <View style={styles.sensorCard}>
          <Text style={styles.sensorTitle}>Micrófono</Text>
          <TouchableOpacity
            style={[styles.button, isRecording && styles.buttonActive]}
            onPress={handleRecordAudio}
          >
            <Text style={styles.buttonText}>
              {isRecording ? "Detener grabación" : "Grabar audio"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.sensorCard}>
        <Text style={styles.sensorTitle}>Síntesis de voz</Text>
        <TouchableOpacity style={styles.button} onPress={handleSpeak}>
          <Text style={styles.buttonText}>Hablar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos se mantienen igual que tu código original
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    sensorCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 3 },
    sensorTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
    camera: { width: '100%', height: 250, borderRadius: 8, marginBottom: 12 },
    button: { backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    buttonActive: { backgroundColor: '#FF3B30' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});