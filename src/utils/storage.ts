export interface WorkoutRecord {
  id: string;
  exerciseId: string;
  reps: number;
  duration: number; // in seconds
  timestamp: number;
  isDemo?: boolean;
}

export interface AppSettings {
  demoMode: boolean;
  cameraDeviceId: string | null;
  modelUrls: Record<string, string>;
  darkMode: boolean;
}

const HISTORY_KEY = 'reptrack_history';
const SETTINGS_KEY = 'reptrack_settings';

export const StorageUtils = {
  getHistory: (): WorkoutRecord[] => {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  saveWorkout: (record: Omit<WorkoutRecord, 'id' | 'timestamp'>) => {
    const history = StorageUtils.getHistory();
    const newRecord: WorkoutRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    history.push(newRecord);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },
  
  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY);
  },
  
  getSettings: (): AppSettings => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    
    return {
      demoMode: true,
      cameraDeviceId: null,
      modelUrls: {},
      darkMode: true
    };
  },
  
  updateSettings: (partialSettings: Partial<AppSettings>) => {
    const current = StorageUtils.getSettings();
    const updated = { ...current, ...partialSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  }
};
