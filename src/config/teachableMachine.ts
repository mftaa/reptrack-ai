export interface ModelConfig {
  modelUrl: string;
  labels: { [key: string]: string };
}

export const DEFAULT_MODEL_CONFIG: Record<string, ModelConfig> = {
  pushup: {
    modelUrl: "", // User must provide this, or use Demo Mode
    labels: {
      up: "PushUp_Up",
      down: "PushUp_Down"
    }
  },
  squat: {
    modelUrl: "",
    labels: {
      up: "Squat_Up",
      down: "Squat_Down"
    }
  },
  pullup: {
    modelUrl: "",
    labels: {
      up: "PullUp_Up",
      down: "PullUp_Down"
    }
  }
};
