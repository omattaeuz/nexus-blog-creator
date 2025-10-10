import { useKeyboardShortcuts, createBlogShortcuts } from '@/hooks/useKeyboardShortcuts';
import { NavigationUtils } from '@/lib/navigation-utils';

export interface UseDashboardShortcutsProps {
  onTabChange: (tab: string) => void;
}

export function useDashboardShortcuts({ onTabChange }: UseDashboardShortcutsProps) {
  useKeyboardShortcuts({
    shortcuts: createBlogShortcuts({
      onNewPost: NavigationUtils.goToCreatePost,
      onSavePost: () => console.log('Save post shortcut'),
      onPreviewPost: () => console.log('Preview post shortcut'),
      onSearch: () => onTabChange('search'),
      onGoToPosts: NavigationUtils.goToPosts,
      onGoToHome: () => onTabChange('overview'),
      onGoToAnalytics: () => onTabChange('analytics'),
      onGoToSettings: () => onTabChange('settings'),
      onHelp: () => console.log('Help shortcut')
    })
  });
}