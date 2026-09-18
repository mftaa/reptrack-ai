export class PredictionSmoother {
  private windowSize: number;
  private minStablePredictions: number;
  private minConfidence: number;
  private buffer: string[] = [];
  
  constructor(windowSize = 5, minStablePredictions = 3, minConfidence = 0.75) {
    this.windowSize = windowSize;
    this.minStablePredictions = minStablePredictions;
    this.minConfidence = minConfidence;
  }
  
  /**
   * Add a new prediction to the buffer and get the smoothed result.
   */
  smooth(predictionClass: string, confidence: number): string {
    if (confidence < this.minConfidence) {
      this.buffer.push("UNKNOWN");
    } else {
      this.buffer.push(predictionClass);
    }
    
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift(); // Keep buffer size
    }
    
    return this.getMajorityClass();
  }
  
  private getMajorityClass(): string {
    const counts: Record<string, number> = {};
    for (const p of this.buffer) {
      counts[p] = (counts[p] || 0) + 1;
    }
    
    let maxCount = 0;
    let majorityClass = "UNKNOWN";
    
    for (const [p, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        majorityClass = p;
      }
    }
    
    // Only return the majority class if it meets the stability threshold
    if (maxCount >= this.minStablePredictions) {
      return majorityClass;
    }
    
    return "UNKNOWN";
  }
  
  reset() {
    this.buffer = [];
  }
}
