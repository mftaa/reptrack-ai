import { useState, useEffect } from 'react';
import { StorageUtils } from '../utils/storage';
import type { AppSettings } from '../utils/storage';
import { Save, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setSettings(StorageUtils.getSettings());
  }, []);

  if (!settings) return null;

  const handleSave = () => {
    StorageUtils.updateSettings(settings);
    alert('Settings saved!');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Settings</h2>
        <button onClick={handleSave} className="btn btn-primary">
          <Save size={18} className="mr-2" />
          Save
        </button>
      </div>

      <div className="space-y-6">
        <div className="card p-6 space-y-4">
          <h3 className="text-xl font-bold border-b border-zinc-800 pb-2">General</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Demo Mode</p>
              <p className="text-sm text-zinc-400">Run without camera and real AI predictions.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.demoMode}
                onChange={(e) => setSettings({...settings, demoMode: e.target.checked})}
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="text-xl font-bold border-b border-zinc-800 pb-2">AI Models</h3>
          <div className="p-4 bg-primary/10 text-primary-400 rounded-lg flex gap-3 text-sm border border-primary/20">
            <AlertCircle size={18} className="shrink-0 text-primary mt-0.5" />
            <p>Paste your Google Teachable Machine Pose Model URLs here. Make sure they end with a slash or directly point to model.json.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Push Up Model URL</label>
              <input 
                type="text"
                placeholder="https://teachablemachine.withgoogle.com/models/..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                value={settings.modelUrls['pushup'] || ''}
                onChange={(e) => setSettings({
                  ...settings, 
                  modelUrls: { ...settings.modelUrls, pushup: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Squat Model URL</label>
              <input 
                type="text"
                placeholder="https://teachablemachine.withgoogle.com/models/..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                value={settings.modelUrls['squat'] || ''}
                onChange={(e) => setSettings({
                  ...settings, 
                  modelUrls: { ...settings.modelUrls, squat: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pull Up Model URL</label>
              <input 
                type="text"
                placeholder="https://teachablemachine.withgoogle.com/models/..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                value={settings.modelUrls['pullup'] || ''}
                onChange={(e) => setSettings({
                  ...settings, 
                  modelUrls: { ...settings.modelUrls, pullup: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="text-xl font-bold text-danger border-b border-zinc-800 pb-2">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Clear History</p>
              <p className="text-sm text-zinc-400">Permanently delete all workout records.</p>
            </div>
            <button 
              className="btn btn-danger"
              onClick={() => {
                if(confirm('Are you sure you want to delete all history?')) {
                  StorageUtils.clearHistory();
                  alert('History cleared');
                }
              }}
            >
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
