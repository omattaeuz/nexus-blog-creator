import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

export interface KeyboardShortcutsConfig {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const { shortcuts, enabled = true, preventDefault = true } = config;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.metaKey === event.metaKey
      );
    });

    if (matchingShortcut) {
      if (preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
      matchingShortcut.action();
    }
  }, [shortcuts, enabled, preventDefault]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

export const createBlogShortcuts = (
  actions: {
    onNewPost?: () => void;
    onSavePost?: () => void;
    onPreviewPost?: () => void;
    onSearch?: () => void;
    onToggleTheme?: () => void;
    onGoToPosts?: () => void;
    onGoToHome?: () => void;
    onGoToAnalytics?: () => void;
    onGoToSettings?: () => void;
    onHelp?: () => void;
  }
): KeyboardShortcut[] => {
  const shortcuts: KeyboardShortcut[] = [];

  if (actions.onNewPost) {
    shortcuts.push({
      key: 'n',
      ctrlKey: true,
      action: actions.onNewPost,
      description: 'Criar novo post',
      category: 'Posts'
    });
  }

  if (actions.onSavePost) {
    shortcuts.push({
      key: 's',
      ctrlKey: true,
      action: actions.onSavePost,
      description: 'Salvar post',
      category: 'Posts'
    });
  }

  if (actions.onPreviewPost) {
    shortcuts.push({
      key: 'p',
      ctrlKey: true,
      action: actions.onPreviewPost,
      description: 'Visualizar post',
      category: 'Posts'
    });
  }

  if (actions.onSearch) {
    shortcuts.push({
      key: 'k',
      ctrlKey: true,
      action: actions.onSearch,
      description: 'Buscar posts',
      category: 'Navegação'
    });
  }

  if (actions.onToggleTheme) {
    shortcuts.push({
      key: 'd',
      ctrlKey: true,
      shiftKey: true,
      action: actions.onToggleTheme,
      description: 'Alternar tema',
      category: 'Interface'
    });
  }

  if (actions.onGoToPosts) {
    shortcuts.push({
      key: '1',
      ctrlKey: true,
      action: actions.onGoToPosts,
      description: 'Ir para Posts',
      category: 'Navegação'
    });
  }

  if (actions.onGoToHome) {
    shortcuts.push({
      key: 'h',
      ctrlKey: true,
      action: actions.onGoToHome,
      description: 'Ir para Home',
      category: 'Navegação'
    });
  }

  if (actions.onGoToAnalytics) {
    shortcuts.push({
      key: '2',
      ctrlKey: true,
      action: actions.onGoToAnalytics,
      description: 'Ir para Analytics',
      category: 'Navegação'
    });
  }

  if (actions.onGoToSettings) {
    shortcuts.push({
      key: '3',
      ctrlKey: true,
      action: actions.onGoToSettings,
      description: 'Ir para Configurações',
      category: 'Navegação'
    });
  }

  if (actions.onHelp) {
    shortcuts.push({
      key: '?',
      action: actions.onHelp,
      description: 'Mostrar ajuda',
      category: 'Ajuda'
    });
  }

  return shortcuts;
};

export const createEditorShortcuts = (
  actions: {
    onBold?: () => void;
    onItalic?: () => void;
    onUnderline?: () => void;
    onInsertLink?: () => void;
    onInsertImage?: () => void;
    onInsertCode?: () => void;
    onInsertQuote?: () => void;
    onInsertList?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
  }
): KeyboardShortcut[] => {
  const shortcuts: KeyboardShortcut[] = [];

  if (actions.onBold) {
    shortcuts.push({
      key: 'b',
      ctrlKey: true,
      action: actions.onBold,
      description: 'Negrito',
      category: 'Formatação'
    });
  }

  if (actions.onItalic) {
    shortcuts.push({
      key: 'i',
      ctrlKey: true,
      action: actions.onItalic,
      description: 'Itálico',
      category: 'Formatação'
    });
  }

  if (actions.onUnderline) {
    shortcuts.push({
      key: 'u',
      ctrlKey: true,
      action: actions.onUnderline,
      description: 'Sublinhado',
      category: 'Formatação'
    });
  }

  if (actions.onInsertLink) {
    shortcuts.push({
      key: 'k',
      ctrlKey: true,
      action: actions.onInsertLink,
      description: 'Inserir link',
      category: 'Inserir'
    });
  }

  if (actions.onInsertImage) {
    shortcuts.push({
      key: 'i',
      ctrlKey: true,
      shiftKey: true,
      action: actions.onInsertImage,
      description: 'Inserir imagem',
      category: 'Inserir'
    });
  }

  if (actions.onInsertCode) {
    shortcuts.push({
      key: 'e',
      ctrlKey: true,
      action: actions.onInsertCode,
      description: 'Inserir código',
      category: 'Inserir'
    });
  }

  if (actions.onInsertQuote) {
    shortcuts.push({
      key: 'q',
      ctrlKey: true,
      action: actions.onInsertQuote,
      description: 'Inserir citação',
      category: 'Inserir'
    });
  }

  if (actions.onInsertList) {
    shortcuts.push({
      key: 'l',
      ctrlKey: true,
      action: actions.onInsertList,
      description: 'Inserir lista',
      category: 'Inserir'
    });
  }

  if (actions.onUndo) {
    shortcuts.push({
      key: 'z',
      ctrlKey: true,
      action: actions.onUndo,
      description: 'Desfazer',
      category: 'Edição'
    });
  }

  if (actions.onRedo) {
    shortcuts.push({
      key: 'y',
      ctrlKey: true,
      action: actions.onRedo,
      description: 'Refazer',
      category: 'Edição'
    });
  }

  return shortcuts;
};