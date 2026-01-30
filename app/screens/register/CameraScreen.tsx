import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { takePhoto } from "../../../sensores/sensorsManager";


export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
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
      setPhotoUri(photo.uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cámara</Text>

      <CameraView ref={cameraRef} style={styles.camera} />

      <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
        <Text style={styles.buttonText}>Tomar foto</Text>
      </TouchableOpacity>

      {photoUri && (
        <>
          <Text style={styles.previewTitle}>Vista previa</Text>
          <Image source={{ uri: photoUri }} style={styles.preview} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
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
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  preview: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
});

