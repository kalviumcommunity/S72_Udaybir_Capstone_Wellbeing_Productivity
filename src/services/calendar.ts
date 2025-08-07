import { toast } from '@/hooks/use-toast';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  color?: string;
  type: 'study' | 'exam' | 'assignment' | 'meeting' | 'other';
}

export interface CalendarSettings {
  googleCalendarEnabled: boolean;
  autoSync: boolean;
  syncInterval: number; // in minutes
  defaultEventDuration: number; // in minutes
}

interface StoredEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  color?: string;
  type: 'study' | 'exam' | 'assignment' | 'meeting' | 'other';
}

class CalendarService {
  private settings: CalendarSettings = {
    googleCalendarEnabled: false,
    autoSync: false,
    syncInterval: 30,
    defaultEventDuration: 60
  };

  constructor() {
    this.loadSettings();
  }

  // Load settings from localStorage
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('calendarSettings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load calendar settings:', error);
    }
  }

  // Save settings to localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem('calendarSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save calendar settings:', error);
    }
  }

  // Get calendar settings
  getSettings(): CalendarSettings {
    return { ...this.settings };
  }

  // Update calendar settings
  updateSettings(newSettings: Partial<CalendarSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // Create a new calendar event
  createEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    };

    this.saveEvent(newEvent);
    
    // Sync with Google Calendar if enabled
    if (this.settings.googleCalendarEnabled) {
      this.syncToGoogleCalendar(newEvent);
    }

    toast({
      title: "Event created",
      description: `${event.title} has been added to your calendar`,
    });

    return newEvent;
  }

  // Save event to localStorage
  private saveEvent(event: CalendarEvent): void {
    try {
      const events = this.getAllEvents();
      events.push(event);
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to save calendar event:', error);
    }
  }

  // Get all calendar events
  getAllEvents(): CalendarEvent[] {
    try {
      const stored = localStorage.getItem('calendarEvents');
      if (!stored) return [];

      const events: StoredEvent[] = JSON.parse(stored);
      return events.map((event) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime)
      }));
    } catch (error) {
      console.error('Failed to load calendar events:', error);
      return [];
    }
  }

  // Get events for a specific date range
  getEventsByDateRange(startDate: Date, endDate: Date): CalendarEvent[] {
    const events = this.getAllEvents();
    return events.filter(event => {
      return event.startTime >= startDate && event.startTime <= endDate;
    });
  }

  // Get today's events
  getTodayEvents(): CalendarEvent[] {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    return this.getEventsByDateRange(startOfDay, endOfDay);
  }

  // Get this week's events
  getWeekEvents(): CalendarEvent[] {
    const today = new Date();
    const startOfWeek = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.getEventsByDateRange(startOfWeek, endOfWeek);
  }

  // Update an existing event
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
    try {
      const events = this.getAllEvents();
      const eventIndex = events.findIndex(e => e.id === eventId);
      
      if (eventIndex === -1) return null;

      const updatedEvent = { ...events[eventIndex], ...updates };
      events[eventIndex] = updatedEvent;
      
      localStorage.setItem('calendarEvents', JSON.stringify(events));
      
      // Sync with Google Calendar if enabled
      if (this.settings.googleCalendarEnabled) {
        this.syncToGoogleCalendar(updatedEvent);
      }

      toast({
        title: "Event updated",
        description: `${updatedEvent.title} has been updated`,
      });

      return updatedEvent;
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      return null;
    }
  }

  // Delete an event
  deleteEvent(eventId: string): boolean {
    try {
      const events = this.getAllEvents();
      const filteredEvents = events.filter(e => e.id !== eventId);
      
      localStorage.setItem('calendarEvents', JSON.stringify(filteredEvents));
      
      toast({
        title: "Event deleted",
        description: "Event has been removed from your calendar",
      });

      return true;
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      return false;
    }
  }

  // Create study session event
  createStudySessionEvent(subject: string, topic: string, startTime: Date, duration: number = 60): CalendarEvent {
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    return this.createEvent({
      title: `Study: ${subject}`,
      description: `Studying ${topic}`,
      startTime,
      endTime,
      type: 'study',
      color: '#3b82f6' // Blue for study sessions
    });
  }

  // Create exam event
  createExamEvent(subject: string, examName: string, startTime: Date, duration: number = 120): CalendarEvent {
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    return this.createEvent({
      title: `Exam: ${subject}`,
      description: examName,
      startTime,
      endTime,
      type: 'exam',
      color: '#ef4444' // Red for exams
    });
  }

  // Create assignment due event
  createAssignmentEvent(subject: string, assignmentName: string, dueDate: Date): CalendarEvent {
    const startTime = new Date(dueDate.getTime() - 60 * 60 * 1000); // 1 hour before due
    
    return this.createEvent({
      title: `Assignment Due: ${subject}`,
      description: assignmentName,
      startTime,
      endTime: dueDate,
      type: 'assignment',
      color: '#f59e0b' // Orange for assignments
    });
  }

  // Sync with Google Calendar (placeholder implementation)
  private async syncToGoogleCalendar(event: CalendarEvent): Promise<void> {
    try {
      // This would integrate with Google Calendar API
      console.log('Syncing event to Google Calendar:', event);
      
      // For now, just log the event
      // In a real implementation, you would:
      // 1. Authenticate with Google Calendar API
      // 2. Create/update/delete events in Google Calendar
      // 3. Handle API responses and errors
      
    } catch (error) {
      console.error('Failed to sync with Google Calendar:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync with Google Calendar",
        variant: "destructive"
      });
    }
  }

  // Enable Google Calendar integration
  async enableGoogleCalendar(): Promise<boolean> {
    try {
      // This would handle Google OAuth flow
      // For now, just enable the setting
      this.updateSettings({ googleCalendarEnabled: true });
      
      toast({
        title: "Google Calendar enabled",
        description: "Your events will now sync with Google Calendar",
      });
      
      return true;
    } catch (error) {
      console.error('Failed to enable Google Calendar:', error);
      return false;
    }
  }

  // Disable Google Calendar integration
  disableGoogleCalendar(): void {
    this.updateSettings({ googleCalendarEnabled: false });
    
    toast({
      title: "Google Calendar disabled",
      description: "Events will no longer sync with Google Calendar",
    });
  }

  // Export events as JSON
  exportEvents(): void {
    try {
      const events = this.getAllEvents();
      const data = {
        events,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendar-events-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Events exported",
        description: "Calendar events have been saved to a file",
      });
    } catch (error) {
      console.error('Failed to export calendar events:', error);
      toast({
        title: "Export failed",
        description: "Failed to export calendar events",
        variant: "destructive"
      });
    }
  }

  // Import events from JSON
  importEvents(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.events && Array.isArray(data.events)) {
            localStorage.setItem('calendarEvents', JSON.stringify(data.events));
            toast({
              title: "Events imported",
              description: "Calendar events have been imported successfully",
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

export const calendarService = new CalendarService(); 