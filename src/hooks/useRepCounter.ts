import { useState, useRef, useCallback } from 'react';
import { RepCounterEngine } from '../engine/repCounter';
import type { ExerciseConfig } from '../config/exercises';

export function useRepCounter(config: ExerciseConfig) {
  const [repCount, setRepCount] = useState(0);
  const [currentState, setCurrentState] = useState(config.startState);
  const engineRef = useRef<RepCounterEngine>(new RepCounterEngine(config));
  
  const processPrediction = useCallback((label: string, confidence: number) => {
    const result = engineRef.current.processPrediction(label, confidence);
    
    // Update state to trigger UI changes if necessary
    setCurrentState(result.state);
    
    if (result.isRep) {
      setRepCount(prev => prev + 1);
    }
    
    return result;
  }, []);
  
  const reset = useCallback(() => {
    setRepCount(0);
    setCurrentState(config.startState);
    engineRef.current.reset();
  }, [config.startState]);

  return {
    repCount,
    currentState,
    processPrediction,
    reset,
    incrementManual: () => setRepCount(prev => prev + 1)
  };
}
