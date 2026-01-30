import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as sensorsManager from "./sensorsManager";
import { Audio } from "expo-av";

export default function SensorApp() {
  const cameraRef = useRef<CameraView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // permisos de micrófono
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
        <Text style={styles.sensorTitle}>
          Se requiere permiso para usar la cámara
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTakePhoto = async () => {
    const photo = await sensorsManager.takePhoto(cameraRef.current);
    if (photo) {
      console.log("foto tomada:", photo.uri);
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
        const uri = await sensorsManager.stopRecordingAudio(
          recordingRef.current
        );
        setIsRecording(false);
        recordingRef.current = null;

        if (uri) {
          console.log("audio grabado en:", uri);
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
        <Text style={styles.sensorTitle}>Cámara</Text>
        <CameraView ref={cameraRef} style={styles.camera} />
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
          <Text style={styles.buttonText}>Tomar foto</Text>
        </TouchableOpacity>
      </View>

      {/* MICRÓFONO */}
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

      {/* SÍNTESIS DE VOZ */}
      <View style={styles.sensorCard}>
        <Text style={styles.sensorTitle}>Síntesis de voz</Text>
        <TouchableOpacity style={styles.button} onPress={handleSpeak}>
          <Text style={styles.buttonText}>Hablar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  sensorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sensorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sensorData: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Menlo',
  },
  description: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  camera: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonActive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#0D47A1',
    lineHeight: 20,
  },
});