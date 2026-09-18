import { PredictionSmoother } from './predictionSmoother';
import { StateMachine } from './stateMachine';
import type { ExerciseConfig } from '../config/exercises';

export class RepCounterEngine {
  private smoother: PredictionSmoother;
  private stateMachine: StateMachine;
  private cooldownMs: number;
  private lastRepTime: number = 0;
  
  constructor(config: ExerciseConfig) {
    this.smoother = new PredictionSmoother(5, 3, config.confidenceThreshold);
    this.stateMachine = new StateMachine(config.startState, config.countingSequence);
    this.cooldownMs = config.cooldown;
  }
  
  /**
   * Processes a raw prediction from the AI model.
   * @returns An object containing the smoothed state and a boolean indicating if a rep was completed.
   */
  processPrediction(rawClass: string, confidence: number): { state: string, isRep: boolean } {
    const smoothedPrediction = this.smoother.smooth(rawClass, confidence);
    
    let isRep = false;
    const now = Date.now();
    
    // Only update state machine if cooldown has passed since last rep
    if (now - this.lastRepTime > this.cooldownMs) {
      isRep = this.stateMachine.update(smoothedPrediction);
      if (isRep) {
        this.lastRepTime = now;
      }
    }
    
    return {
      state: this.stateMachine.getCurrentState(),
      isRep
    };
  }
  
  reset() {
    this.smoother.reset();
    this.stateMachine.reset();
    this.lastRepTime = 0;
  }
}
