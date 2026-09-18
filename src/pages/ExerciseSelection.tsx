import { EXERCISES } from '../config/exercises';
import { Dumbbell, Activity, ShieldPlus, ChevronRight } from 'lucide-react';

export default function ExerciseSelection({ onSelect }: { onSelect: (id: string) => void }) {
  const exercises = Object.values(EXERCISES);

  const getIcon = (category: string) => {
    if (category === 'Upper Body') return <Dumbbell className="text-primary" />;
    if (category === 'Lower Body') return <Activity className="text-accent" />;
    return <ShieldPlus className="text-success" />;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Select Exercise</h2>
        <p className="text-zinc-400">Choose a workout to start tracking your reps.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map(ex => (
          <div 
            key={ex.id}
            onClick={() => onSelect(ex.id)}
            className="card p-6 cursor-pointer hover:border-primary/50 transition-all hover:shadow-primary/10 group flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-zinc-800/50 group-hover:bg-primary/10 transition-colors">
                {getIcon(ex.category)}
              </div>
              <ChevronRight className="text-zinc-600 group-hover:text-primary transition-colors" />
            </div>
            
            <div className="space-y-1 mb-4 flex-grow">
              <h3 className="text-xl font-bold group-hover:text-white transition-colors">{ex.name}</h3>
              <p className="text-sm font-medium text-primary/80">{ex.category}</p>
              <p className="text-sm text-zinc-400 line-clamp-2 mt-2">{ex.description}</p>
            </div>
          </div>
        ))}
        

      </div>
    </div>
  );
}
