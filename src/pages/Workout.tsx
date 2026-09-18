import { useState, useEffect, useRef, useCallback } from 'react';
import { EXERCISES } from '../config/exercises';
import { StorageUtils } from '../utils/storage';
import { useCamera } from '../hooks/useCamera';
import { useTeachableMachine } from '../hooks/useTeachableMachine';
import { useRoboflow } from '../hooks/useRoboflow';
import { useRepCounter } from '../hooks/useRepCounter';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { Play, Pause, Square, Save, Activity, AlertCircle } from 'lucide-react';

type WorkoutState = 'LOADING_MODEL' | 'READY' | 'COUNTING' | 'PAUSED' | 'FINISHED' | 'ERROR';

export default function Workout({ exerciseId, onFinish }: { exerciseId: string | null, onFinish: () => void }) {
  const [workoutState, setWorkoutState] = useState<WorkoutState>('LOADING_MODEL');
  const [errorMessage, setErrorMessage] = useState('');
  
  const exercise = exerciseId && exerciseId !== 'manual' ? EXERCISES[exerciseId] : null;
  const isManual = exerciseId === 'manual';
  const settings = StorageUtils.getSettings();
  
  const { videoRef, isCameraReady, error: cameraError, startCamera, stopCamera } = useCamera();
  const tm = useTeachableMachine();
  const rf = useRoboflow(exerciseId);
  
  const isRoboflow = exerciseId === 'pullup' || exerciseId === 'squat';
  const loadModel = isRoboflow ? rf.loadModel : tm.loadModel;
  const predict = isRoboflow ? rf.predict : tm.predict;
  const isLoadingModel = isRoboflow ? rf.isLoadingModel : tm.isLoadingModel;
  const modelError = isRoboflow ? rf.modelError : tm.modelError;
  
  // Rep Counter Engine
  const engineConfig = exercise || EXERCISES['pushup']; // fallback
  const { repCount, currentState, processPrediction, incrementManual } = useRepCounter(engineConfig);
  
  const timer = useWorkoutTimer();
  
  // UI State for Confidence
  const [confidence, setConfidence] = useState(0);
  
  // Animation Frame Ref for Prediction Loop
  const requestRef = useRef<number>(0);
  
  const loop = useCallback(async () => {
    if (workoutState === 'COUNTING' && videoRef.current && isCameraReady && !settings.demoMode) {
      const result = await predict(videoRef.current);
      if (result) {
        setConfidence(result.confidence);
        processPrediction(result.label, result.confidence);
      }
      
      if (isRoboflow) {
        // Throttle Roboflow API calls to ~10fps max
        await new Promise(r => setTimeout(r, 100));
      }
    }
    
    if (workoutState === 'COUNTING') {
      requestRef.current = requestAnimationFrame(loop);
    }
  }, [workoutState, isCameraReady, predict, processPrediction, settings.demoMode, isRoboflow]);
  
  useEffect(() => {
    if (workoutState === 'COUNTING') {
      requestRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [workoutState, loop]);
  
  // Initialization
  useEffect(() => {
    if (isManual) {
      setWorkoutState('READY');
      return;
    }
    
    if (!exercise) {
      setErrorMessage("Exercise not found.");
      setWorkoutState('ERROR');
      return;
    }

    const init = async () => {
      if (!settings.demoMode) {
        // Load actual model and camera
        const userModelUrl = settings.modelUrls[exercise.id] || exercise.modelUrl;
        if (!userModelUrl) {
          setErrorMessage("No Teachable Machine model URL configured for this exercise. Please go to Settings to add it, or enable Demo Mode.");
          setWorkoutState('ERROR');
          return;
        }
        
        await loadModel(userModelUrl);
        await startCamera(settings.cameraDeviceId || undefined);
      } else {
        // Demo mode initialization
        setTimeout(() => setWorkoutState('READY'), 1000);
      }
    };
    
    init();
    
    return () => {
      stopCamera();
    };
  }, [exerciseId]);
  
  useEffect(() => {
    if (modelError || cameraError) {
      setErrorMessage(modelError || cameraError || "Unknown error");
      setWorkoutState('ERROR');
    } else if (!isLoadingModel && (isCameraReady || settings.demoMode) && workoutState === 'LOADING_MODEL') {
      setWorkoutState('READY');
    }
  }, [modelError, cameraError, isLoadingModel, isCameraReady, settings.demoMode]);

  // Demo Mode Simulation
  useEffect(() => {
    let demoInterval: ReturnType<typeof setInterval>;
    if (settings.demoMode && workoutState === 'COUNTING' && exercise) {
      let step = 0;
      demoInterval = setInterval(() => {
        const state = exercise.countingSequence[step % exercise.countingSequence.length];
        processPrediction(exercise.labels[state.toLowerCase()] || state, 0.95);
        step++;
      }, 1500);
    }
    return () => clearInterval(demoInterval);
  }, [settings.demoMode, workoutState, exercise, processPrediction]);

  // Actions
  const handleStart = () => {
    setWorkoutState('COUNTING');
    timer.start();
  };
  
  const handlePause = () => {
    setWorkoutState('PAUSED');
    timer.pause();
  };
  
  const handleFinish = () => {
    setWorkoutState('FINISHED');
    timer.pause();
    stopCamera();
  };
  
  const handleSave = () => {
    StorageUtils.saveWorkout({
      exerciseId: exerciseId || 'manual',
      reps: repCount,
      duration: timer.seconds,
      isDemo: settings.demoMode
    });
    onFinish();
  };
  
  // Feedback Helper
  const getFeedback = () => {
    if (isManual) return "Tap to count reps";
    if (confidence < engineConfig.confidenceThreshold && workoutState === 'COUNTING') {
      return engineConfig.feedback.UNKNOWN;
    }
    return engineConfig.feedback[currentState] || "Good";
  };
  
  // Render
  if (workoutState === 'LOADING_MODEL') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-fade-in">
        <Activity size={48} className="text-primary animate-pulse" />
        <h2 className="text-2xl font-bold">Preparing AI Model...</h2>
        <p className="text-zinc-400">Loading Teachable Machine for {exercise?.name}</p>
      </div>
    );
  }
  
  if (workoutState === 'ERROR') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-fade-in text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-danger/20 text-danger flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold">Unable to Start Workout</h2>
        <p className="text-zinc-400">{errorMessage}</p>
        <button onClick={onFinish} className="btn btn-primary">Back to Dashboard</button>
      </div>
    );
  }
  
  if (workoutState === 'FINISHED') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-center">
        <div className="inline-block p-4 rounded-full bg-success/20 text-success mb-2">
          <Save size={48} />
        </div>
        <h2 className="text-4xl font-extrabold text-success">Workout Complete 🎉</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-6 border-zinc-800">
            <p className="text-zinc-400">Total Reps</p>
            <p className="text-5xl font-bold mt-2">{repCount}</p>
          </div>
          <div className="card p-6 border-zinc-800">
            <p className="text-zinc-400">Duration</p>
            <p className="text-5xl font-bold mt-2">{timer.formatted}</p>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 pt-4">
          <button onClick={handleSave} className="btn btn-primary px-8">Save Workout</button>
          <button onClick={onFinish} className="btn btn-secondary px-8">Discard</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      {/* LEFT: Camera */}
      <div className="card overflow-hidden bg-black flex items-center justify-center relative min-h-[300px] lg:min-h-[500px]">
        {!settings.demoMode && !isManual ? (
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover transform scale-x-[-1]" 
            playsInline 
            muted 
          />
        ) : (
          <div className="text-center p-8 space-y-4">
            <Activity size={48} className="mx-auto text-zinc-600" />
            <h3 className="text-xl font-bold text-zinc-500">
              {isManual ? "Manual Mode" : "Demo Mode Active"}
            </h3>
            <p className="text-zinc-600">Camera processing is disabled.</p>
          </div>
        )}
        
        {/* State Overlay */}
        {!isManual && workoutState === 'COUNTING' && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-zinc-800">
              <span className="text-xs text-zinc-400 block uppercase tracking-wider">State</span>
              <span className="font-bold text-lg text-primary">{currentState}</span>
            </div>
            
            {!settings.demoMode && (
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-zinc-800 text-right">
                <span className="text-xs text-zinc-400 block uppercase tracking-wider">Confidence</span>
                <span className={`font-bold text-lg ${confidence > 0.8 ? 'text-success' : 'text-accent'}`}>
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Stats & Controls */}
      <div className="space-y-6 flex flex-col justify-center">
        <div>
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">
            {exercise?.name || "Manual Tracking"}
          </h2>
          <h1 className="text-4xl font-extrabold">{timer.formatted}</h1>
        </div>
        
        <div className="card p-8 text-center bg-zinc-900 border-zinc-800 flex flex-col items-center justify-center flex-grow min-h-[250px]">
          <p className="text-zinc-400 uppercase tracking-widest text-sm font-bold mb-2">Repetitions</p>
          <div className="text-8xl md:text-9xl font-black text-white tabular-nums tracking-tighter">
            {repCount}
          </div>
          
          <div className="mt-8 px-6 py-3 rounded-full bg-zinc-800/80 text-zinc-300 font-medium w-full max-w-xs transition-colors">
            {getFeedback()}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-4">
          {workoutState === 'READY' || workoutState === 'PAUSED' ? (
            <button onClick={handleStart} className="btn btn-primary col-span-2 py-4 text-lg">
              <Play className="mr-2" fill="currentColor" /> 
              {workoutState === 'READY' ? 'Start' : 'Resume'}
            </button>
          ) : (
            <button onClick={handlePause} className="btn bg-zinc-800 hover:bg-zinc-700 text-white col-span-2 py-4 text-lg">
              <Pause className="mr-2" fill="currentColor" /> Pause
            </button>
          )}
          
          <button onClick={handleFinish} className="btn btn-danger py-4" disabled={workoutState === 'READY'}>
            <Square fill="currentColor" />
          </button>
        </div>
        
        {isManual && workoutState === 'COUNTING' && (
          <button onClick={incrementManual} className="btn bg-zinc-800 hover:bg-zinc-700 w-full py-8 text-2xl font-bold">
            +1 REP
          </button>
        )}
      </div>
    </div>
  );
}
