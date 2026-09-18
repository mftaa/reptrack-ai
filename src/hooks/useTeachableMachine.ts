import { useState, useCallback, useRef } from 'react';
import * as tmPose from '@teachablemachine/pose';

export function useTeachableMachine() {
  const [model, setModel] = useState<tmPose.CustomPoseNet | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  
  // Use a ref to store the latest prediction so we don't cause React re-renders on every frame unless needed
  const latestPredictionRef = useRef<{ label: string; confidence: number }>({ label: 'Unknown', confidence: 0 });

  const loadModel = useCallback(async (modelUrl: string) => {
    if (!modelUrl) {
      setModelError("Model URL is not configured.");
      return;
    }
    
    setIsLoadingModel(true);
    setModelError(null);
    
    try {
      const modelURL = modelUrl + (modelUrl.endsWith('/') ? '' : '/') + "model.json";
      const metadataURL = modelUrl + (modelUrl.endsWith('/') ? '' : '/') + "metadata.json";
      
      const loadedModel = await tmPose.load(modelURL, metadataURL);
      setModel(loadedModel);
      setIsLoadingModel(false);
    } catch (err: any) {
      setIsLoadingModel(false);
      setModelError("Failed to load Teachable Machine model. Check the URL.");
      console.error(err);
    }
  }, []);

  const predict = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!model) return null;
    
    try {
      const { posenetOutput } = await model.estimatePose(videoElement);
      const prediction = await model.predict(posenetOutput);
      
      let maxProbability = 0;
      let maxClass = "Unknown";
      
      for (let i = 0; i < prediction.length; i++) {
        if (prediction[i].probability > maxProbability) {
          maxProbability = prediction[i].probability;
          maxClass = prediction[i].className;
        }
      }
      
      latestPredictionRef.current = {
        label: maxClass,
        confidence: maxProbability
      };
      
      return latestPredictionRef.current;
    } catch (e) {
      console.error("Prediction error:", e);
      return null;
    }
  }, [model]);

  return {
    model,
    isLoadingModel,
    modelError,
    loadModel,
    predict,
    latestPredictionRef
  };
}
