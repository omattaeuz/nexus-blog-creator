import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Keyboard, 
  Mouse, 
  Lightbulb,
  Search,
  FileText,
  BarChart3,
  Settings,
  Palette
} from 'lucide-react';
import { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface HelpModalProps {
  shortcuts: KeyboardShortcut[];
  children?: React.ReactNode;
}

export default function HelpModal({ shortcuts, children }: HelpModalProps) {
  const [open, setOpen] = useState(false);

  const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const formatKeyCombo = (shortcut: KeyboardShortcut): string => {
    const keys: string[] = [];
    
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.metaKey) keys.push('Cmd');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    
    let mainKey = shortcut.key;

    if (mainKey === ' ') mainKey = 'Space';
    if (mainKey === '?') mainKey = '?';
    
    keys.push(mainKey);
    
    return keys.join(' + ');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Posts':
        return <FileText className="h-4 w-4" />;
      case 'Navegação':
        return <Search className="h-4 w-4" />;
      case 'Interface':
        return <Palette className="h-4 w-4" />;
      case 'Formatação':
        return <Keyboard className="h-4 w-4" />;
      case 'Inserir':
        return <Mouse className="h-4 w-4" />;
      case 'Edição':
        return <Keyboard className="h-4 w-4" />;
      case 'Ajuda':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Ajuda
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Central de Ajuda
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="shortcuts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 backdrop-blur-md border-slate-700/50">
            <TabsTrigger value="shortcuts" className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-slate-600/50 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Keyboard className="h-4 w-4" />
              Atalhos
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-slate-600/50 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Lightbulb className="h-4 w-4" />
              Recursos
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-slate-600/50 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Mouse className="h-4 w-4" />
              Dicas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shortcuts" className="space-y-4">
            <div className="space-y-4">
              {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
                <div key={category} className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 rounded-lg p-4">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                    {getCategoryIcon(category)}
                    {category}
                  </h3>
                  <div className="grid gap-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg hover:bg-slate-600/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-300">{shortcut.description}</p>
                        </div>
                        <Badge variant="outline" className="font-mono text-sm bg-slate-600/50 text-gray-300 border-slate-500/50">
                          {formatKeyCombo(shortcut)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="grid gap-4">
              <div className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  Editor Avançado
                </h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Editor rico com formatação completa</li>
                  <li>• Inserção de imagens com edição avançada</li>
                  <li>• Preview em tempo real</li>
                  <li>• Templates de posts</li>
                  <li>• Auto-save automático</li>
                </ul>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Dashboard de métricas</li>
                  <li>• Estatísticas de engajamento</li>
                  <li>• Posts mais populares</li>
                  <li>• Gráficos interativos</li>
                </ul>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4" />
                  Gerenciamento
                </h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Sistema de comentários</li>
                  <li>• Backup automático</li>
                  <li>• Busca avançada</li>
                  <li>• Notificações</li>
                  <li>• RSS Feed</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <div className="grid gap-4">
              <div className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">💡 Dicas de Produtividade</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Use Ctrl+N para criar posts rapidamente</li>
                  <li>• Ctrl+K abre a busca global</li>
                  <li>• Use templates para posts recorrentes</li>
                  <li>• Configure notificações para engajamento</li>
                </ul>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">📝 Dicas de Escrita</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Use o preview para ver como ficará o post</li>
                  <li>• Adicione imagens para melhorar o engajamento</li>
                  <li>• Use tags para organização</li>
                  <li>• Configure SEO para melhor visibilidade</li>
                </ul>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">🔧 Dicas Técnicas</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Faça backups regularmente</li>
                  <li>• Use o modo escuro para economizar bateria</li>
                  <li>• Configure atalhos personalizados</li>
                  <li>• Monitore analytics para otimização</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}