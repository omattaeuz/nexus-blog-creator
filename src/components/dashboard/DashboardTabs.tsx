import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, MessageCircle, FileText, Search, Settings, HardDrive, Bell } from 'lucide-react';
import { DASHBOARD_TABS } from '@/lib/constants';

export interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export default function DashboardTabs({ activeTab, onTabChange, children }: DashboardTabsProps) {
  const tabs = [
    { id: DASHBOARD_TABS.OVERVIEW, label: 'Visão Geral', icon: BarChart3 },
    { id: DASHBOARD_TABS.ANALYTICS, label: 'Analytics', icon: BarChart3 },
    { id: DASHBOARD_TABS.COMMENTS, label: 'Comentários', icon: MessageCircle },
    { id: DASHBOARD_TABS.TEMPLATES, label: 'Templates', icon: FileText },
    { id: DASHBOARD_TABS.SEARCH, label: 'Busca', icon: Search },
    { id: DASHBOARD_TABS.NOTIFICATIONS, label: 'Notificações', icon: Bell },
    { id: DASHBOARD_TABS.BACKUP, label: 'Backup', icon: HardDrive },
    { id: DASHBOARD_TABS.SETTINGS, label: 'Configurações', icon: Settings },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {children}
    </Tabs>
  );
}