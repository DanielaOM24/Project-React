import { Audio } from 'expo-av';

// Solicitar permisos del micrófono
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[Audio] Error solicitando permisos de micrófono:', error);
    return false;
  }
}

// Obtener estado de permisos del micrófono
export async function getMicrophonePermissionStatus(): Promise<string> {
  try {
    const { status } = await Audio.getPermissionsAsync();
    return status;
  } catch (error) {
    console.error('[Audio] Error obteniendo permisos del micrófono:', error);
    return 'denied';
  }
}

// Grabar audio
export async function recordAudio(): Promise<Audio.Recording | null> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    return recording;
  } catch (error) {
    console.error('[Audio] Error iniciando grabación:', error);
    return null;
  }
}

// Detener grabación
export async function stopRecordingAudio(recording: Audio.Recording): Promise<string | null> {
  try {
    await recording.stopAndUnloadAsync();
    return recording.getURI();
  } catch (error) {
    console.error('[Audio] Error deteniendo grabación:', error);
    return null;
  }
}

// Reproducir audio
export async function playAudio(audioUri: string): Promise<void> {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    await sound.playAsync();
  } catch (error) {
    console.error('[Audio] Error reproduciendo audio:', error);
  }
}

