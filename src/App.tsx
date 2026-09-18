import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import ExerciseSelection from './pages/ExerciseSelection';
import Workout from './pages/Workout';
import History from './pages/History';
import Settings from './pages/Settings';
import { Activity, History as HistoryIcon, Settings as SettingsIcon } from 'lucide-react';

export type PageView = 'dashboard' | 'exercise_selection' | 'workout' | 'history' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<PageView>('dashboard');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const navigateTo = (view: PageView) => setCurrentView(view);

  const startExercise = (id: string) => {
    setSelectedExerciseId(id);
    navigateTo('workout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-zinc-100">
      {/* Top Navigation / Header */}
      <header className="border-b border-zinc-800/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigateTo('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Activity size={20} className="animate-pulse-fast" />
            </div>
            <span className="font-bold text-xl tracking-tight">RepTrack <span className="text-primary">AI</span></span>
          </div>
          
          <nav className="flex items-center gap-4">
            <button 
              onClick={() => navigateTo('history')}
              className={`p-2 rounded-lg transition-colors ${currentView === 'history' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
              title="History"
            >
              <HistoryIcon size={20} />
            </button>
            <button 
              onClick={() => navigateTo('settings')}
              className={`p-2 rounded-lg transition-colors ${currentView === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
              title="Settings"
            >
              <SettingsIcon size={20} />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 lg:p-8">
        {currentView === 'dashboard' && <Dashboard onStart={() => navigateTo('exercise_selection')} />}
        {currentView === 'exercise_selection' && <ExerciseSelection onSelect={startExercise} />}
        {currentView === 'workout' && <Workout exerciseId={selectedExerciseId} onFinish={() => navigateTo('dashboard')} />}
        {currentView === 'history' && <History />}
        {currentView === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;
