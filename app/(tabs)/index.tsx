import { CameraView, useCameraPermissions } from "expo-camera";
import { Audio } from "expo-av";
import { useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { takePhoto } from "../../sensores/sensorsManager";

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <SafeAreaView>
        <View style={styles.container}>
          <Text style={styles.title}>
            Se requiere permiso para usar la cámara
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Conceder permiso</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleTakePhoto = async () => {
    const photo = await takePhoto(cameraRef.current);
    if (photo) {
      setPhotoUri(photo.uri);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error("Error iniciando grabación", error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    setAudioUri(uri || null);
    setRecording(null);
  };

  const playAudio = async () => {
    if (!audioUri) return;

    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    await sound.playAsync();
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

      <View style={styles.audioContainer}>
        <Text style={styles.previewTitle}>Audio</Text>

        {!isRecording ? (
          <TouchableOpacity style={styles.button} onPress={startRecording}>
            <Text style={styles.buttonText}>Iniciar grabación</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={stopRecording}>
            <Text style={styles.buttonText}>Detener grabación</Text>
          </TouchableOpacity>
        )}

        {audioUri && (
          <TouchableOpacity style={styles.button} onPress={playAudio}>
            <Text style={styles.buttonText}>Reproducir audio</Text>
          </TouchableOpacity>
        )}
      </View>
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
  audioContainer: {
    marginTop: 16,
  },
});
