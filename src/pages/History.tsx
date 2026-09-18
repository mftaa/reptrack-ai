import { useState, useEffect } from 'react';
import { StorageUtils } from '../utils/storage';
import type { WorkoutRecord } from '../utils/storage';
import { EXERCISES } from '../config/exercises';
import { Trash2, Dumbbell, Activity, ShieldPlus, Clock } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState<WorkoutRecord[]>([]);

  useEffect(() => {
    setHistory(StorageUtils.getHistory().reverse());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Delete this workout record?")) {
      const updated = history.filter(w => w.id !== id);
      setHistory(updated);
      localStorage.setItem('reptrack_history', JSON.stringify(updated.reverse())); // it was reversed for UI
    }
  };

  const getIcon = (category: string) => {
    if (category === 'Upper Body') return <Dumbbell size={16} className="text-primary" />;
    if (category === 'Lower Body') return <Activity size={16} className="text-accent" />;
    if (category === 'Manual') return <Activity size={16} className="text-zinc-500" />;
    return <ShieldPlus size={16} className="text-success" />;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Workout History</h2>
          <p className="text-zinc-400 mt-1">Track your progress over time.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 text-zinc-500">
            <Clock size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">No Workouts Yet</h3>
          <p className="text-zinc-400">Complete a workout to see it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(record => {
            const exercise = record.exerciseId === 'manual' 
              ? { name: 'Manual Counter', category: 'Manual' } 
              : EXERCISES[record.exerciseId] || { name: 'Unknown', category: 'Unknown' };
            
            const date = new Date(record.timestamp);
            
            return (
              <div key={record.id} className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-zinc-800/50">
                    {getIcon(exercise.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {exercise.name}
                      {record.isDemo && <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 uppercase tracking-widest font-semibold">Demo</span>}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {date.toLocaleDateString()} at {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">Reps</p>
                    <p className="text-2xl font-bold">{record.reps}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">Duration</p>
                    <p className="text-2xl font-bold">{Math.floor(record.duration / 60)}:{(record.duration % 60).toString().padStart(2, '0')}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(record.id)}
                    className="p-2 text-zinc-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors ml-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
