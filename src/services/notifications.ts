import { Post } from '@/types/index';

export interface Notification {
  id: string;
  type: 'comment' | 'like' | 'mention' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId: string;
  postId?: string;
  commentId?: string;
}

export interface NotificationPreferences {
  email: {
    comments: boolean;
    likes: boolean;
    shares: boolean;
    weeklyDigest: boolean;
  };
  push: {
    comments: boolean;
    likes: boolean;
    shares: boolean;
    system: boolean;
  };
  inApp: {
    comments: boolean;
    likes: boolean;
    shares: boolean;
    system: boolean;
  };
}

export interface NotificationService {
  getNotifications(): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  getPreferences(): NotificationPreferences;
  updatePreferences(preferences: Partial<NotificationPreferences>): void;
  createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): void;
}

class RealNotificationService implements NotificationService {
  private notifications: Notification[] = [];
  private preferences: NotificationPreferences = {
    email: {
      comments: true,
      likes: true,
      shares: false,
      weeklyDigest: true
    },
    push: {
      comments: true,
      likes: false,
      shares: false,
      system: true
    },
    inApp: {
      comments: true,
      likes: true,
      shares: true,
      system: true
    }
  };

  constructor() {
    this.loadNotifications();
    this.loadPreferences();
    this.generateInitialNotifications();
  }

  private loadNotifications() {
    const saved = localStorage.getItem('nexus-notifications');
    if (saved) {
      try {
        this.notifications = JSON.parse(saved).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }));
      } catch (error) {
        console.error('Error loading notifications:', error);
        this.notifications = [];
      }
    }
  }

  private loadPreferences() {
    const saved = localStorage.getItem('nexus-notification-preferences');
    if (saved) {
      try {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }

  private saveNotifications() {
    localStorage.setItem('nexus-notifications', JSON.stringify(this.notifications));
  }

  private savePreferences() {
    localStorage.setItem('nexus-notification-preferences', JSON.stringify(this.preferences));
  }

  private generateInitialNotifications() {
    if (this.notifications.length === 0) {
      // Generate some sample notifications based on blog activity
      const sampleNotifications: Omit<Notification, 'id' | 'createdAt' | 'read'>[] = [
        {
          type: 'comment',
          title: 'Novo comentário em seu post',
          message: 'João Silva comentou em "Como implementar React com TypeScript"',
          userId: 'user-1',
          postId: 'post-1'
        },
        {
          type: 'like',
          title: 'Seu post recebeu uma curtida',
          message: 'Maria Santos curtiu "Guia completo de CSS Grid"',
          userId: 'user-1',
          postId: 'post-2'
        },
        {
          type: 'system',
          title: 'Bem-vindo ao Nexus Blog!',
          message: 'Seu blog está configurado e pronto para uso. Comece criando seu primeiro post!',
          userId: 'user-1'
        },
        {
          type: 'comment',
          title: 'Novo comentário em seu post',
          message: 'Pedro Costa comentou em "JavaScript ES2024: Novidades"',
          userId: 'user-1',
          postId: 'post-3'
        },
        {
          type: 'like',
          title: 'Seu post recebeu uma curtida',
          message: 'Ana Oliveira curtiu "Como implementar React com TypeScript"',
          userId: 'user-1',
          postId: 'post-1'
        }
      ];

      sampleNotifications.forEach((notification, index) => {
        this.notifications.push({
          ...notification,
          id: `notification-${Date.now()}-${index}`,
          createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)), // Spread over last 5 days
          read: index > 2 // First 3 are unread
        });
      });

      this.saveNotifications();
    }
  }

  async getNotifications(): Promise<Notification[]> {
    return [...this.notifications].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async markAsRead(id: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.saveNotifications();
  }

  async deleteNotification(id: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
  }

  createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    
    if (this.notifications.length > 100) this.notifications = this.notifications.slice(0, 100);

    this.saveNotifications();

    if (this.preferences.push[notification.type as keyof typeof this.preferences.push] && 
        'Notification' in window && 
        Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  }

  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  generateActivityNotifications(_posts: Post[]): void {
    if (this.notifications.length < 3) this.generateInitialNotifications();
  }
}

export const notificationService = new RealNotificationService();

export type { NotificationService as NotificationServiceType };