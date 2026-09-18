import { useState, useCallback, useRef } from 'react';

export function useRoboflow(exerciseId: string | null) {
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  
  // Use a ref to store the latest prediction so we don't cause React re-renders on every frame unless needed
  const latestPredictionRef = useRef<{ label: string; confidence: number }>({ label: 'Unknown', confidence: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadModel = useCallback(async (modelUrl: string) => {
    // For Roboflow serverless, there is no real loading of the model locally.
    // We just verify that the API key exists.
    const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
    const workspace = import.meta.env.VITE_ROBOFLOW_WORKSPACE;
    const workflowId = exerciseId === 'squat' && import.meta.env.VITE_ROBOFLOW_SQUAT_WORKFLOW_ID 
      ? import.meta.env.VITE_ROBOFLOW_SQUAT_WORKFLOW_ID 
      : import.meta.env.VITE_ROBOFLOW_WORKFLOW_ID;

    if (!apiKey || !workspace || !workflowId) {
      setModelError("ROBOFLOW_API_KEY, ROBOFLOW_WORKSPACE, or ROBOFLOW_WORKFLOW_ID is missing in .env");
      return;
    }
    
    setIsLoadingModel(true);
    setModelError(null);
    
    // Simulate slight network delay just for UX consistency
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setIsLoadingModel(false);
        resolve();
      }, 500);
    });
  }, []);

  const predict = useCallback(async (videoElement: HTMLVideoElement) => {
    const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
    const workspace = import.meta.env.VITE_ROBOFLOW_WORKSPACE;
    const workflowId = exerciseId === 'squat' && import.meta.env.VITE_ROBOFLOW_SQUAT_WORKFLOW_ID 
      ? import.meta.env.VITE_ROBOFLOW_SQUAT_WORKFLOW_ID 
      : import.meta.env.VITE_ROBOFLOW_WORKFLOW_ID;

    if (!apiKey || !workspace || !workflowId) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    
    const canvas = canvasRef.current;
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return null;
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw the video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Get base64 string
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    // Remove the "data:image/jpeg;base64," prefix for the API body
    const base64Image = dataUrl.split(',')[1];
    
    const classesString = exerciseId === 'squat'
      ? "squat-down, squat-up"
      : "full-down, full-up, strait-back";

    try {
      const response = await fetch(`https://serverless.roboflow.com/${workspace}/workflows/${workflowId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: {
            "image": { "type": "base64", "value": base64Image },
            "classes": classesString
          }
        })
      });

      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }

      const data = await response.json();
      
      // Helper to find predictions array recursively in workflow response
      const findPredictions = (obj: any): any[] => {
        if (!obj || typeof obj !== 'object') return [];
        if (Array.isArray(obj.predictions)) return obj.predictions;
        
        for (const key of Object.keys(obj)) {
          if (typeof obj[key] === 'object') {
            const preds = findPredictions(obj[key]);
            if (preds.length > 0) return preds;
          }
        }
        return [];
      };

      const predictions = findPredictions(data);
      
      if (predictions && predictions.length > 0) {
        // Find highest confidence prediction
        let bestPred = predictions[0];
        for (let i = 1; i < predictions.length; i++) {
          if (predictions[i].confidence > bestPred.confidence) {
            bestPred = predictions[i];
          }
        }

        // Map labels to match RepTrack's engine expectations
        let label = bestPred.class;
        if (exerciseId === 'squat') {
          if (label === 'squat-up') label = 'Squat_Up';
          if (label === 'squat-down') label = 'Squat_Down';
        } else {
          if (label === 'full-up') label = 'PullUp_Up';
          if (label === 'full-down') label = 'PullUp_Down';
        }

        latestPredictionRef.current = {
          label: label,
          confidence: bestPred.confidence
        };
      } else {
        latestPredictionRef.current = {
          label: "Unknown",
          confidence: 0
        };
      }
      
      return latestPredictionRef.current;
    } catch (e) {
      console.error("Roboflow prediction error:", e);
      return null;
    }
  }, []);

  return {
    model: true, // Mock model object to bypass !model checks if any exist downstream
    isLoadingModel,
    modelError,
    loadModel,
    predict,
    latestPredictionRef
  };
}
