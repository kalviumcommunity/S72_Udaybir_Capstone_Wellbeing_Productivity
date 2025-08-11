import { toast } from '@/hooks/use-toast';

export interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  subject: string;
  topic: string;
  notes?: string;
  productivity: number; // 1-10 scale
  breaks: number;
  completed: boolean;
}

export interface StudyStats {
  totalSessions: number;
  totalTime: number; // in minutes
  averageSessionLength: number;
  averageProductivity: number;
  mostStudiedSubject: string;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface StoredSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  subject: string;
  topic: string;
  notes?: string;
  productivity: number;
  breaks: number;
  completed: boolean;
}

class StudySessionService {
  private currentSession: StudySession | null = null;
  private sessionInterval: NodeJS.Timeout | null = null;

  // Start a new study session
  startSession(subject: string, topic: string, notes?: string): StudySession {
    if (this.currentSession) {
      this.endSession();
    }

    const session: StudySession = {
      id: Date.now().toString(),
      startTime: new Date(),
      duration: 0,
      subject,
      topic,
      notes,
      productivity: 5,
      breaks: 0,
      completed: false
    };

    this.currentSession = session;
    this.saveSession(session);

    // Start tracking time
    this.sessionInterval = setInterval(() => {
      if (this.currentSession) {
        this.currentSession.duration = Math.floor(
          (Date.now() - this.currentSession.startTime.getTime()) / 60000
        );
        this.saveSession(this.currentSession);
      }
    }, 60000); // Update every minute

    toast({
      title: "Study session started",
      description: `Studying ${subject}: ${topic}`,
    });

    return session;
  }

  // End the current study session
  endSession(): StudySession | null {
    if (!this.currentSession) return null;

    const session = { ...this.currentSession };
    session.endTime = new Date();
    session.completed = true;
    session.duration = Math.floor(
      (session.endTime.getTime() - session.startTime.getTime()) / 60000
    );

    this.saveSession(session);
    this.currentSession = null;

    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
      this.sessionInterval = null;
    }

    toast({
      title: "Study session ended",
      description: `Completed ${session.duration} minutes of studying`,
    });

    return session;
  }

  // Pause the current session
  pauseSession(): void {
    if (this.currentSession) {
      this.currentSession.breaks++;
      this.saveSession(this.currentSession);
      toast({
        title: "Session paused",
        description: "Take a short break",
      });
    }
  }

  // Update session productivity
  updateProductivity(productivity: number): void {
    if (this.currentSession) {
      this.currentSession.productivity = Math.max(1, Math.min(10, productivity));
      this.saveSession(this.currentSession);
    }
  }

  // Get current session
  getCurrentSession(): StudySession | null {
    return this.currentSession;
  }

  // Save session to localStorage
  private saveSession(session: StudySession): void {
    try {
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      localStorage.setItem('studySessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save study session:', error);
    }
  }

  // Get all study sessions
  getAllSessions(): StudySession[] {
    try {
      const stored = localStorage.getItem('studySessions');
      if (!stored) return [];

      const sessions: StoredSession[] = JSON.parse(stored);
      return sessions.map((session) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      }));
    } catch (error) {
      console.error('Failed to load study sessions:', error);
      return [];
    }
  }

  // Get sessions for a specific date range
  getSessionsByDateRange(startDate: Date, endDate: Date): StudySession[] {
    const sessions = this.getAllSessions();
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }

  // Get today's sessions
  getTodaySessions(): StudySession[] {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    return this.getSessionsByDateRange(startOfDay, endOfDay);
  }

  // Get this week's sessions
  getWeekSessions(): StudySession[] {
    const today = new Date();
    const startOfWeek = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.getSessionsByDateRange(startOfWeek, endOfWeek);
  }

  // Get study statistics
  getStudyStats(): StudyStats {
    const sessions = this.getAllSessions().filter(s => s.completed);
    const weekSessions = this.getWeekSessions().filter(s => s.completed);
    
    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalProductivity = sessions.reduce((sum, session) => sum + session.productivity, 0);
    
    // Find most studied subject
    const subjectCounts: { [key: string]: number } = {};
    sessions.forEach(session => {
      subjectCounts[session.subject] = (subjectCounts[session.subject] || 0) + 1;
    });
    
    const mostStudiedSubject = Object.keys(subjectCounts).reduce((a, b) => 
      subjectCounts[a] > subjectCounts[b] ? a : b, Object.keys(subjectCounts)[0] || ''
    );

    const weeklyGoal = 300; // 5 hours per week
    const weeklyProgress = weekSessions.reduce((sum, session) => sum + session.duration, 0);

    return {
      totalSessions: sessions.length,
      totalTime,
      averageSessionLength: sessions.length > 0 ? Math.round(totalTime / sessions.length) : 0,
      averageProductivity: sessions.length > 0 ? Math.round(totalProductivity / sessions.length * 10) / 10 : 0,
      mostStudiedSubject,
      weeklyGoal,
      weeklyProgress
    };
  }

  // Delete a session
  deleteSession(sessionId: string): void {
    try {
      const sessions = this.getAllSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem('studySessions', JSON.stringify(filteredSessions));
      
      toast({
        title: "Session deleted",
        description: "Study session has been removed",
      });
    } catch (error) {
      console.error('Failed to delete study session:', error);
    }
  }

  // Clear all sessions
  clearAllSessions(): void {
    try {
      localStorage.removeItem('studySessions');
      toast({
        title: "Sessions cleared",
        description: "All study sessions have been removed",
      });
    } catch (error) {
      console.error('Failed to clear study sessions:', error);
    }
  }

  // Export sessions as JSON
  exportSessions(): void {
    try {
      const sessions = this.getAllSessions();
      const data = {
        sessions,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-sessions-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sessions exported",
        description: "Study sessions have been saved to a file",
      });
    } catch (error) {
      console.error('Failed to export study sessions:', error);
      toast({
        title: "Export failed",
        description: "Failed to export study sessions",
        variant: "destructive"
      });
    }
  }

  // Import sessions from JSON
  importSessions(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.sessions && Array.isArray(data.sessions)) {
            localStorage.setItem('studySessions', JSON.stringify(data.sessions));
            toast({
              title: "Sessions imported",
              description: "Study sessions have been imported successfully",
            });
            resolve();
          } else {
            throw new Error('Invalid file format');
          }
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Invalid file format. Please select a valid backup file.",
            variant: "destructive"
          });
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }
}

export const studySessionService = new StudySessionService(); 