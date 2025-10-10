import { useState } from 'react';
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
        return <MessageCircle className="h-4 w-4 text-blue-400" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-400" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-green-400" />;
      case 'system':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
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
          <h2 className="text-2xl font-bold text-white">Notificações</h2>
          <p className="text-gray-300">
            Gerencie suas notificações e preferências
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-slate-700/50 text-gray-300 border-slate-600/50">
            {unreadCount} não lidas
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className="border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white disabled:text-gray-600 disabled:hover:bg-transparent"
          >
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-300 hover:text-white"
          >
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger 
            value="unread"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-300 hover:text-white"
          >
            Não lidas ({unreadCount})
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-300 hover:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardContent className="p-6 text-center">
                <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-300">
                  Nenhuma notificação encontrada
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all duration-200 bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl ${
                    !notification.read ? 'border-cyan-400/50 bg-cyan-400/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${!notification.read ? 'text-cyan-400' : 'text-white'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                              Nova
                            </Badge>
                          )}
                          <Badge className="bg-slate-700/50 text-gray-300 border-slate-600/50 text-xs">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
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
                                className="text-gray-400 hover:text-green-400 hover:bg-green-500/20"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteNotification(notification.id)}
                              className="text-gray-400 hover:text-red-400 hover:bg-red-500/20"
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
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardContent className="p-6 text-center">
                <Check className="h-12 w-12 mx-auto text-green-400 mb-4" />
                <p className="text-gray-300">
                  Todas as notificações foram lidas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.filter(n => !n.read).map((notification) => (
                <Card 
                  key={notification.id} 
                  className="border-cyan-400/50 bg-cyan-400/5 transition-all duration-200 backdrop-blur-md shadow-2xl"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-cyan-400">
                            {notification.title}
                          </h4>
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                            Nova
                          </Badge>
                          <Badge className="bg-slate-700/50 text-gray-300 border-slate-600/50 text-xs">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
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
                              className="text-gray-400 hover:text-green-400 hover:bg-green-500/20"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteNotification(notification.id)}
                              className="text-gray-400 hover:text-red-400 hover:bg-red-500/20"
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
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Mail className="h-5 w-5 text-gray-400" />
                  Notificações por Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Novos comentários</p>
                    <p className="text-sm text-gray-300">
                      Receba um email quando alguém comentar em seus posts
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email.comments}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('email', 'comments', checked)
                    }
                    className="data-[state=checked]:bg-cyan-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Curtidas</p>
                    <p className="text-sm text-gray-300">
                      Receba um email quando alguém curtir seus posts
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email.likes}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('email', 'likes', checked)
                    }
                    className="data-[state=checked]:bg-cyan-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Compartilhamentos</p>
                    <p className="text-sm text-gray-300">
                      Receba um email quando alguém compartilhar seus posts
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email.shares}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('email', 'shares', checked)
                    }
                    className="data-[state=checked]:bg-cyan-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Resumo semanal</p>
                    <p className="text-sm text-gray-300">
                      Receba um resumo semanal das atividades do seu blog
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email.weeklyDigest}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('email', 'weeklyDigest', checked)
                    }
                    className="data-[state=checked]:bg-cyan-400"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                  Notificações Push
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Comentários</p>
                    <p className="text-sm text-gray-300">
                      Notificações push para novos comentários
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push.comments}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('push', 'comments', checked)
                    }
                    className="data-[state=checked]:bg-cyan-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Curtidas</p>
                    <p className="text-sm text-gray-300">
                      Notificações push para curtidas
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push.likes}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('push', 'likes', checked)
                    }
                    className="data-[state=checked]:bg-cyan-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Compartilhamentos</p>
                    <p className="text-sm text-gray-300">
                      Notificações push para compartilhamentos
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push.shares}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('push', 'shares', checked)
                    }
                    className="data-[state=checked]:bg-cyan-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Sistema</p>
                    <p className="text-sm text-gray-300">
                      Notificações importantes do sistema
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push.system}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('push', 'system', checked)
                    }
                    className="data-[state=checked]:bg-cyan-400"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestNotificationPermission}
                  className="w-full border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Solicitar Permissão
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Monitor className="h-5 w-5 text-gray-400" />
                  Notificações no App
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Comentários</p>
                    <p className="text-sm text-gray-300">
                      Mostrar notificações de comentários no app
                    </p>
                  </div>
                  <Switch
                    checked={preferences.inApp.comments}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('inApp', 'comments', checked)
                    }
                    className="data-[state=checked]:bg-cyan-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Curtidas</p>
                    <p className="text-sm text-gray-300">
                      Mostrar notificações de curtidas no app
                    </p>
                  </div>
                  <Switch
                    checked={preferences.inApp.likes}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('inApp', 'likes', checked)
                    }
                    className="data-[state=checked]:bg-cyan-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Compartilhamentos</p>
                    <p className="text-sm text-gray-300">
                      Mostrar notificações de compartilhamentos no app
                    </p>
                  </div>
                  <Switch
                    checked={preferences.inApp.shares}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('inApp', 'shares', checked)
                    }
                    className="data-[state=checked]:bg-cyan-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Sistema</p>
                    <p className="text-sm text-gray-300">
                      Mostrar notificações do sistema no app
                    </p>
                  </div>
                  <Switch
                    checked={preferences.inApp.system}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('inApp', 'system', checked)
                    }
                    className="data-[state=checked]:bg-cyan-400"
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