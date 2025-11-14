'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Settings, Moon, Sun, Type, Code, Scroll, Clock, Minimize2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Preferences {
  theme: string;
  fontSize: string;
  codeTheme: string;
  autoScroll: boolean;
  showTimestamps: boolean;
  compactMode: boolean;
}

export default function SettingsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'auto',
    fontSize: 'medium',
    codeTheme: 'github',
    autoScroll: true,
    showTimestamps: true,
    compactMode: false
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await api.get('/users/preferences');
        if (response.data) {
          setPreferences(response.data);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        // Use defaults
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadPreferences();
    }
  }, [isAuthenticated]);

  const savePreferences = async () => {
    setSaving(true);
    try {
      await api.put('/users/preferences', preferences);
      
      // Apply theme immediately
      if (preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else if (preferences.theme === 'light') {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        // Auto - use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.removeItem('theme');
      }
      
      alert('Preferences saved successfully!');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your chat experience
          </p>
        </div>

        {/* Preferences Form */}
        <div className="space-y-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Theme */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              <Moon className="w-4 h-4" />
              Theme
            </label>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences(p => ({ ...p, theme: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="auto">Auto (System)</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              <Type className="w-4 h-4" />
              Font Size
            </label>
            <select
              value={preferences.fontSize}
              onChange={(e) => setPreferences(p => ({ ...p, fontSize: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Code Theme */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              <Code className="w-4 h-4" />
              Code Theme
            </label>
            <select
              value={preferences.codeTheme}
              onChange={(e) => setPreferences(p => ({ ...p, codeTheme: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="github">GitHub</option>
              <option value="monokai">Monokai</option>
              <option value="dracula">Dracula</option>
              <option value="vscDarkPlus">VS Code Dark+</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoScroll}
                onChange={(e) => setPreferences(p => ({ ...p, autoScroll: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Scroll className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">Auto-scroll to new messages</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showTimestamps}
                onChange={(e) => setPreferences(p => ({ ...p, showTimestamps: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">Show message timestamps</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.compactMode}
                onChange={(e) => setPreferences(p => ({ ...p, compactMode: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Minimize2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">Compact mode (reduce spacing)</span>
              </div>
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={savePreferences}
            disabled={saving}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <a
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

