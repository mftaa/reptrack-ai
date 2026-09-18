import { useState, useEffect } from 'react';
import { StorageUtils } from '../utils/storage';
import { Play, TrendingUp, Clock, Activity } from 'lucide-react';

export default function Dashboard({ onStart }: { onStart: () => void }) {
  const [stats, setStats] = useState({
    totalReps: 0,
    totalWorkouts: 0,
    timeActive: 0
  });

  useEffect(() => {
    const history = StorageUtils.getHistory();
    const reps = history.reduce((acc, curr) => acc + curr.reps, 0);
    const workouts = history.length;
    const time = history.reduce((acc, curr) => acc + curr.duration, 0);
    
    setStats({
      totalReps: reps,
      totalWorkouts: workouts,
      timeActive: time
    });
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Count your reps. <br className="hidden md:block" />
          <span className="text-primary">Improve your workout.</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
          AI-powered repetition tracking using your camera. No extra hardware required.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <button onClick={onStart} className="btn btn-primary text-lg px-8 py-3">
            <Play className="mr-2" size={24} fill="currentColor" />
            Start Workout
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="card p-6 flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-2">
            <Activity size={24} />
          </div>
          <h3 className="text-zinc-400 font-medium">Total Reps</h3>
          <p className="text-3xl font-bold">{stats.totalReps}</p>
        </div>
        <div className="card p-6 flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-2">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-zinc-400 font-medium">Workouts</h3>
          <p className="text-3xl font-bold">{stats.totalWorkouts}</p>
        </div>
        <div className="card p-6 flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mb-2">
            <Clock size={24} />
          </div>
          <h3 className="text-zinc-400 font-medium">Time Active</h3>
          <p className="text-3xl font-bold">{formatTime(stats.timeActive)}</p>
        </div>
      </section>
    </div>
  );
}
