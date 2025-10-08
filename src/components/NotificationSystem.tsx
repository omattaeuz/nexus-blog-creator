import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellOff, 
  Settings,
  Check,
  X,
  Trash2,
  Mail,
  Smartphone,
  Monitor,
  MessageCircle,
  Heart,
  Share2,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { notificationService, NotificationPreferences, Notification } from '@/services/notifications';

interface NotificationSystemProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onUpdatePreferences: (preferences: Partial<NotificationPreferences>) => void;
}

export default function NotificationSystem({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onUpdatePreferences
}: NotificationSystemProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-green-500" />;
      case 'system':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'comment':
        return 'Comentário';
      case 'like':
        return 'Curtida';
      case 'share':
        return 'Compartilhamento';
      case 'system':
        return 'Sistema';
      default:
        return 'Notificação';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.read;
    return true;
  });

  const handlePreferenceChange = (category: keyof NotificationPreferences, key: string, value: boolean) => {
    const newPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [key]: value
      }
    };
    setPreferences(newPreferences);
    onUpdatePreferences(newPreferences);
  };

  const handleRequestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) console.log('Notification permission granted');
    else console.log('Notification permission denied');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notificações</h2>
          <p className="text-muted-foreground">
            Gerencie suas notificações e preferências
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {unreadCount} não lidas
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Não lidas ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma notificação encontrada
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all duration-200 ${
                    !notification.read ? 'border-primary/20 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">
                              Nova
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMarkAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteNotification(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {notifications.filter(n => !n.read).length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">
                  Todas as notificações foram lidas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.filter(n => !n.read).map((notification) => (
                <Card 
                  key={notification.id} 
                  className="border-primary/20 bg-primary/5 transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-primary">
                            {notification.title}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            Nova
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMarkAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteNotification(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notificações por Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Novos comentários</p>
                    <p className="text-sm text-muted-foreground">
                      Receba um email quando alguém comentar em seus posts
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email.comments}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('email', 'comments', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Curtidas</p>
                    <p className="text-sm text-muted-foreground">
                      Receba um email quando alguém curtir seus posts
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email.likes}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('email', 'likes', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compartilhamentos</p>
                    <p className="text-sm text-muted-foreground">
                      Receba um email quando alguém compartilhar seus posts
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email.shares}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('email', 'shares', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Resumo semanal</p>
                    <p className="text-sm text-muted-foreground">
                      Receba um resumo semanal das atividades do seu blog
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email.weeklyDigest}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('email', 'weeklyDigest', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Notificações Push
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Comentários</p>
                    <p className="text-sm text-muted-foreground">
                      Notificações push para novos comentários
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push.comments}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('push', 'comments', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Curtidas</p>
                    <p className="text-sm text-muted-foreground">
                      Notificações push para curtidas
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push.likes}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('push', 'likes', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compartilhamentos</p>
                    <p className="text-sm text-muted-foreground">
                      Notificações push para compartilhamentos
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push.shares}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('push', 'shares', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sistema</p>
                    <p className="text-sm text-muted-foreground">
                      Notificações importantes do sistema
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push.system}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('push', 'system', checked)
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestNotificationPermission}
                  className="w-full"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Solicitar Permissão
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Notificações no App
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Comentários</p>
                    <p className="text-sm text-muted-foreground">
                      Mostrar notificações de comentários no app
                    </p>
                  </div>
                  <Switch
                    checked={preferences.inApp.comments}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('inApp', 'comments', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Curtidas</p>
                    <p className="text-sm text-muted-foreground">
                      Mostrar notificações de curtidas no app
                    </p>
                  </div>
                  <Switch
                    checked={preferences.inApp.likes}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('inApp', 'likes', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compartilhamentos</p>
                    <p className="text-sm text-muted-foreground">
                      Mostrar notificações de compartilhamentos no app
                    </p>
                  </div>
                  <Switch
                    checked={preferences.inApp.shares}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('inApp', 'shares', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sistema</p>
                    <p className="text-sm text-muted-foreground">
                      Mostrar notificações do sistema no app
                    </p>
                  </div>
                  <Switch
                    checked={preferences.inApp.system}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('inApp', 'system', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}