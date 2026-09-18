import { useState, useEffect, useRef } from 'react';

export function useCamera() {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async (deviceId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
        };
      }
    } catch (err: any) {
      setError(err.message || "Camera permission denied.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraReady(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return {
    videoRef,
    isCameraReady,
    error,
    startCamera,
    stopCamera
  };
}
