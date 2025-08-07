import { toast } from '@/hooks/use-toast';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  dueDate: string;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'Notification' in window;
    this.initialize();
  }

  private async initialize() {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser');
      return;
    }

    this.permission = Notification.permission;
    
    if (this.permission === 'default') {
      // Request permission when user interacts with the app
      document.addEventListener('click', () => {
        this.requestPermission();
      }, { once: true });
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.isSupported || this.permission !== 'granted') {
      // Fallback to toast notification
      toast({
        title: options.title,
        description: options.body,
      });
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction,
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Failed to show notification:', error);
      // Fallback to toast
      toast({
        title: options.title,
        description: options.body,
      });
    }
  }

  // Check for due tasks and show notifications
  checkDueTasks(): void {
    try {
      const tasks: TaskItem[] = JSON.parse(localStorage.getItem('tasks') || '[]');
      const now = new Date();
      
      tasks.forEach((task) => {
        if (task.status === 'completed') return;
        
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // Notify for tasks due within 24 hours
        if (hoursDiff > 0 && hoursDiff <= 24) {
          this.showNotification({
            title: 'Task Due Soon',
            body: `"${task.title}" is due ${hoursDiff <= 1 ? 'in less than an hour' : `in ${Math.round(hoursDiff)} hours`}`,
            tag: `task-${task.id}`,
            requireInteraction: hoursDiff <= 1, // Require interaction for urgent tasks
          });
        }
        
        // Notify for overdue tasks
        if (timeDiff < 0 && Math.abs(hoursDiff) <= 24) {
          this.showNotification({
            title: 'Task Overdue',
            body: `"${task.title}" is overdue by ${Math.round(Math.abs(hoursDiff))} hours`,
            tag: `task-overdue-${task.id}`,
            requireInteraction: true,
          });
        }
      });
    } catch (error) {
      console.error('Failed to check due tasks:', error);
    }
  }

  // Show study session reminder
  showStudyReminder(): void {
    this.showNotification({
      title: 'Study Time!',
      body: 'Time to focus on your studies. Start a study session now.',
      tag: 'study-reminder',
    });
  }

  // Show mood check reminder
  showMoodReminder(): void {
    this.showNotification({
      title: 'How are you feeling?',
      body: 'Take a moment to log your mood and track your well-being.',
      tag: 'mood-reminder',
    });
  }

  // Show break reminder
  showBreakReminder(): void {
    this.showNotification({
      title: 'Take a Break',
      body: 'You\'ve been studying for a while. Time to take a short break!',
      tag: 'break-reminder',
    });
  }

  // Start periodic notifications
  startPeriodicNotifications(): void {
    // Check due tasks every hour
    setInterval(() => {
      this.checkDueTasks();
    }, 60 * 60 * 1000);

    // Show study reminder every 4 hours (if user is active)
    setInterval(() => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceActivity > 4 * 60 * 60 * 1000) { // 4 hours
          this.showStudyReminder();
        }
      }
    }, 4 * 60 * 60 * 1000);

    // Show mood reminder daily at 6 PM
    const now = new Date();
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
    if (now > targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const timeUntilTarget = targetTime.getTime() - now.getTime();
    setTimeout(() => {
      this.showMoodReminder();
      // Then repeat daily
      setInterval(() => {
        this.showMoodReminder();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilTarget);
  }

  // Update last activity timestamp
  updateActivity(): void {
    localStorage.setItem('lastActivity', Date.now().toString());
  }
}

export const notificationService = new NotificationService(); 