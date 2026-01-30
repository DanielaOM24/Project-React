import { CameraView, CameraCapturedPicture } from "expo-camera";
import {Audio} from "expo-av"
import * as Speech from "expo-speech"

export async function takePhoto(
  cameraRef: CameraView | null
): Promise<CameraCapturedPicture | null> {
  try {
    if (!cameraRef) return null;
    return await cameraRef.takePictureAsync();
  } catch (error) {
    console.error("Error tomando la foto", error);
    return null;
  }
}

//Microphone

//permisos del microfono

export async function requestMicrophonePermission(): Promise<boolean>{
  try{
    const {status} = await Audio.requestPermissionsAsync();
    return status === "granted";
  } catch (error){
    console.error("error solicitando permisos de microfono", error);
    return false;
  }
}

//estado de permisos de microfono

export async function getMicrophonePermissionStatus(): Promise<string> {
  try{
    const {status} = await Audio.getPermissionsAsync();
    return status;
  }catch (error){
    console.error("error obteniendo permisos del microfono", error);
    return "denied";
  }
}

//grabar audio

export async function recordAudio(): Promise<Audio.Recording | null> {
  try{
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    await recording.startAsync();
    return recording;
  }catch (error){
    console.error("error iniciando grabación", error)
    return null;
  }
}

//detener grabación 

export async function stopRecordingAudio(
  recording: Audio.Recording,
):Promise<string | null> {
  try{
    await recording.stopAndUnloadAsync();
    return recording.getURI();
  } catch (error){
    console.error("error deteniendo grabación", error);
    return null;
  }
}

//reproducción de audio

export async function playAudio(audioUri: string): Promise<void>{
  try{
    const {sound} = await Audio.Sound.createAsync({ uri: audioUri });
    await sound.playAsync();
  } catch (error){
    console.error("Error reproduciendo audio", error);
  }
}

//sintesis de voz

export async function speak(
  text: string,
  language: string = "es-MX",
): Promise<void> {
  try{
    await Speech.speak(text,{
      language: language,
      pitch: 1.0,
      rate: 1.0,
    });
  }catch(error){
    console.error("error en sintesis de voz", error);
  }
}

export async function analyzeMealPhoto(photoUri: string): Promise <any>{
  const formData = new FormData();

  const photoFile = {
    uri: photoUri,
    name: 'meal_capture.png',
    type: 'image/jpeg'
  }

  formData.append('image', photoFile as any)
    

  try{
    const response = await fetch('https://nutrilens-0x37.onrender.com/api/meals/analyze',{
      method: 'POST',
      body: formData,
      headers:{
        'Accept': 'aplication/json',
        'Content-Type': 'multipart/form-data'
      },
    });
    if (!response.ok){
      throw new Error(`Error en servidor: ${response.status}`);
    }
    return await response.json();
  }catch (error){
    console.error("Error enviando la foto al endpoint:", error);
    throw error;
  }
}