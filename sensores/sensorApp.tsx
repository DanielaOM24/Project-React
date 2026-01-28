import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { takePhoto } from "./sensorsManager";

export default function SensorApp() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

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
    const photo = await takePhoto(cameraRef.current);
    if (photo) {
      console.log("foto tomada", photo.uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sensorCard}>
        <Text style={styles.sensorTitle}>Cámara</Text>
        <CameraView ref={cameraRef} style={styles.camera} />
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
          <Text style={styles.buttonText}>Tomar foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  sensorCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },
  sensorTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  camera: {
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
