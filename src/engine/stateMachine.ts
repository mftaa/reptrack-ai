export class StateMachine {
  private sequence: string[];
  private currentIndex: number = 0;
  private currentState: string;
  
  constructor(startState: string, sequence: string[]) {
    this.currentState = startState;
    this.sequence = sequence;
  }
  
  /**
   * Updates the state machine based on the smoothed prediction.
   * Returns true if a full sequence (a rep) has been completed.
   */
  update(predictedState: string): boolean {
    if (predictedState === "UNKNOWN") return false;
    
    const targetState = this.sequence[this.currentIndex + 1];
    
    // If the prediction matches the NEXT state in the sequence
    if (predictedState === targetState) {
      this.currentIndex++;
      this.currentState = predictedState;
      
      // If we reached the end of the sequence, it's a full rep
      if (this.currentIndex === this.sequence.length - 1) {
        this.currentIndex = 0; // Reset for next rep
        // However, we want the state to remain at the end state (which is usually the start state of the next rep)
        this.currentState = this.sequence[0];
        return true;
      }
    } 
    // If the prediction goes back to the START of the sequence while we were mid-way (false start)
    else if (predictedState === this.sequence[0] && this.currentIndex > 0) {
       // Reset sequence
       this.currentIndex = 0;
       this.currentState = this.sequence[0];
    }
    // Note: if it's the SAME as current state, or some random jump, we ignore it (stable state)
    
    return false;
  }
  
  getCurrentState(): string {
    return this.currentState;
  }
  
  reset() {
    this.currentIndex = 0;
    this.currentState = this.sequence[0];
  }
}
