import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification, NotificationPreferences } from '@/services/notifications';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  preferences: NotificationPreferences;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const notificationList = await notificationService.getNotifications();
      setNotifications(notificationList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar notificações');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar notificação como lida');
    }
  }, [loadNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar todas as notificações como lidas');
    }
  }, [loadNotifications]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar notificação');
    }
  }, [loadNotifications]);

  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    try {
      notificationService.updatePreferences(newPreferences);
      setPreferences(notificationService.getPreferences());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar preferências');
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Set up periodic refresh (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    preferences,
    updatePreferences,
    refreshNotifications
  };
}
