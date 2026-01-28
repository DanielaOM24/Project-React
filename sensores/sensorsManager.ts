import { CameraView, CameraCapturedPicture } from "expo-camera";

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
