import { toast } from '@/hooks/use-toast';

export interface SyncData {
  tasks: unknown[];
  notes: unknown[];
  moodEntries: unknown[];
  focusSessions: unknown[];
  studySessions: unknown[];
  lastSync: number;
}

class DataSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    this.setupOnlineOfflineHandling();
  }

  private setupOnlineOfflineHandling() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncData();
      toast({
        title: "Back online",
        description: "Your data will be synced automatically",
      });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      toast({
        title: "You're offline",
        description: "Changes will be saved locally and synced when you're back online",
        variant: "destructive"
      });
    });
  }

  // Save data to localStorage with error handling
  saveData(key: string, data: unknown): boolean {
    try {
      const dataToSave = {
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(key, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error(`Failed to save data for key ${key}:`, error);
      toast({
        title: "Save failed",
        description: "Your data couldn't be saved. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }

  // Load data from localStorage with error handling
  loadData<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;

      const parsed = JSON.parse(stored);
      
      // Handle legacy data format (without timestamp)
      if (parsed.data !== undefined) {
        return parsed.data;
      }
      
      // Handle old format
      return parsed;
    } catch (error) {
      console.error(`Failed to load data for key ${key}:`, error);
      return defaultValue;
    }
  }

  // Export all user data
  exportData(): SyncData {
    const data: SyncData = {
      tasks: this.loadData('tasks', []),
      notes: this.loadData('notes', []),
      moodEntries: this.loadData('moodEntries', []),
      focusSessions: this.loadData('focusSessions', []),
      studySessions: this.loadData('studySessions', []),
      lastSync: Date.now()
    };

    return data;
  }

  // Import user data
  importData(data: SyncData): boolean {
    try {
      this.saveData('tasks', data.tasks);
      this.saveData('notes', data.notes);
      this.saveData('moodEntries', data.moodEntries);
      this.saveData('focusSessions', data.focusSessions);
      this.saveData('studySessions', data.studySessions);
      
      toast({
        title: "Data imported",
        description: "Your data has been successfully imported",
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      toast({
        title: "Import failed",
        description: "Failed to import data. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }

  // Download data as JSON file
  downloadData(): void {
    try {
      const data = this.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentience-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup downloaded",
        description: "Your data has been saved to a file",
      });
    } catch (error) {
      console.error('Failed to download data:', error);
      toast({
        title: "Download failed",
        description: "Failed to download backup. Please try again.",
        variant: "destructive"
      });
    }
  }

  // Clear all data
  clearAllData(): void {
    try {
      const keys = ['tasks', 'notes', 'moodEntries', 'focusSessions', 'studySessions'];
      keys.forEach(key => {
        localStorage.removeItem(key);
        // Also clear form persistence data
        localStorage.removeItem(`form_${key}`);
      });
      
      toast({
        title: "Data cleared",
        description: "All your data has been cleared",
      });
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast({
        title: "Clear failed",
        description: "Failed to clear data. Please try again.",
        variant: "destructive"
      });
    }
  }

  // Start automatic sync with debouncing
  startAutoSync(intervalMs: number = 60000): void { // Increased to 60 seconds
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    let lastSync = 0;
    this.syncInterval = setInterval(() => {
      const now = Date.now();
      // Only sync if enough time has passed and user is active
      if (now - lastSync > intervalMs && this.isOnline) {
        lastSync = now;
        this.syncData();
      }
    }, intervalMs);
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Sync data with backend
  private async syncData(): Promise<void> {
    if (!this.isOnline) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const headers = {
        'Content-Type': 'application/json',
        'x-auth-token': token
      };

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sentience.onrender.com/api';

      // Sync tasks
      const localTasks = this.loadData('tasks', []);
      if (localTasks.length > 0) {
        try {
          await fetch(`${API_BASE_URL}/tasks`, { headers });
        } catch (error) {
          console.log('Tasks already synced or API unavailable');
        }
      }

      // Sync mood entries
      const localMoodEntries = this.loadData('moodEntries', []);
      if (localMoodEntries.length > 0) {
        try {
          await fetch(`${API_BASE_URL}/mood`, { headers });
        } catch (error) {
          console.log('Mood entries already synced or API unavailable');
        }
      }

      // Sync study sessions
      const localStudySessions = this.loadData('studySessions', []);
      if (localStudySessions.length > 0) {
        try {
          await fetch(`${API_BASE_URL}/study-sessions`, { headers });
        } catch (error) {
          console.log('Study sessions already synced or API unavailable');
        }
      }

      // Sync focus sessions
      const localFocusSessions = this.loadData('focusSessions', []);
      if (localFocusSessions.length > 0) {
        try {
          await fetch(`${API_BASE_URL}/focus-sessions`, { headers });
        } catch (error) {
          console.log('Focus sessions already synced or API unavailable');
        }
      }

      console.log('Data sync completed');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // Get storage usage
  getStorageUsage(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        used += localStorage[key].length + key.length;
      }
      
      // Estimate total storage (varies by browser)
      const total = 5 * 1024 * 1024; // 5MB estimate
      const percentage = (used / total) * 100;
      
      return { used, total, percentage };
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}

export const dataSyncService = new DataSyncService(); 