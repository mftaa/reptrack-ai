import { DEFAULT_MODEL_CONFIG } from './teachableMachine';

export interface ExerciseConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  modelUrl: string;
  labels: { [key: string]: string };
  startState: string;
  countingSequence: string[];
  confidenceThreshold: number;
  cooldown: number;
  feedback: { [key: string]: string };
}

export const EXERCISES: Record<string, ExerciseConfig> = {
  pushup: {
    id: "pushup",
    name: "Push Up",
    description: "Standard push-ups for chest and triceps.",
    category: "Upper Body",
    modelUrl: DEFAULT_MODEL_CONFIG.pushup.modelUrl,
    labels: DEFAULT_MODEL_CONFIG.pushup.labels,
    startState: "UP",
    countingSequence: ["UP", "DOWN", "UP"],
    confidenceThreshold: 0.75,
    cooldown: 600,
    feedback: {
      UP: "Lower your body",
      DOWN: "Push back up",
      REP_COMPLETE: "Rep Complete!",
      UNKNOWN: "Move into position"
    }
  },
  squat: {
    id: "squat",
    name: "Squat",
    description: "Bodyweight squats for legs and glutes.",
    category: "Lower Body",
    modelUrl: DEFAULT_MODEL_CONFIG.squat.modelUrl,
    labels: DEFAULT_MODEL_CONFIG.squat.labels,
    startState: "UP",
    countingSequence: ["UP", "DOWN", "UP"],
    confidenceThreshold: 0.75,
    cooldown: 600,
    feedback: {
      UP: "Lower into a squat",
      DOWN: "Stand back up",
      REP_COMPLETE: "Good rep!",
      UNKNOWN: "Move into position"
    }
  },
  pullup: {
    id: "pullup",
    name: "Pull Up",
    description: "Upper body pulling exercise.",
    category: "Upper Body",
    modelUrl: DEFAULT_MODEL_CONFIG.pullup.modelUrl,
    labels: DEFAULT_MODEL_CONFIG.pullup.labels,
    startState: "DOWN",
    countingSequence: ["DOWN", "UP", "DOWN"],
    confidenceThreshold: 0.75,
    cooldown: 600,
    feedback: {
      DOWN: "Pull up",
      UP: "Lower back down",
      REP_COMPLETE: "Great pull!",
      UNKNOWN: "Move into position"
    }
  }
};
