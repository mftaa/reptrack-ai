import { useState, useEffect, useCallback } from 'react';

export function useWorkoutTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const start = useCallback(() => setIsActive(true), []);
  const pause = useCallback(() => setIsActive(false), []);
  const reset = useCallback(() => {
    setSeconds(0);
    setIsActive(false);
  }, []);

  return {
    seconds,
    isActive,
    start,
    pause,
    reset,
    formatted: new Date(seconds * 1000).toISOString().substring(14, 19) // MM:SS format
  };
}
