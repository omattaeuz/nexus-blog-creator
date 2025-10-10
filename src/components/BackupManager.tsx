import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Upload, 
  Trash2, 
  Calendar, 
  FileText, 
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { BackupManager, BackupData, BackupOptions } from '@/lib/backup-manager';
import { Post } from '@/types/index';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BackupManagerComponentProps {
  posts: Post[];
  onRestoreComplete?: (message: string) => void;
}

export default function BackupManagerComponent({ 
  posts, 
  onRestoreComplete 
}: BackupManagerComponentProps) {
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    includeImages: true,
    compress: true,
    format: 'json'
  });

  const backupManager = BackupManager.getInstance();

  useEffect(() => {
    setBackups(backupManager.getBackups());
  }, []);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const backup = await backupManager.createBackup(posts, backupOptions);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setBackups(backupManager.getBackups());
      
      setTimeout(() => {
        setProgress(0);
        setIsCreatingBackup(false);
      }, 1000);

    } catch (error) {
      console.error('Backup creation failed:', error);
      setIsCreatingBackup(false);
      setProgress(0);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    setIsRestoring(true);
    setSelectedBackup(backupId);

    try {
      const backup = backupManager.getBackupById(backupId);
      if (!backup) throw new Error('Backup not found');

      const result = await backupManager.restoreBackup(backup);
      
      if (result.success) onRestoreComplete?.(result.message);
      else throw new Error(result.message);

    } catch (error) {
      console.error('Backup restoration failed:', error);
      onRestoreComplete?.(`Erro ao restaurar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsRestoring(false);
      setSelectedBackup(null);
    }
  };

  const handleExportBackup = async (backupId: string, format: 'json' | 'markdown' | 'html') => {
    try {
      const backup = backupManager.getBackupById(backupId);
      if (!backup) throw new Error('Backup not found');

      await backupManager.exportBackup(backup, format);
    } catch (error) {
      console.error('Backup export failed:', error);
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    if (confirm('Tem certeza que deseja excluir este backup?')) {
      const success = backupManager.deleteBackup(backupId);
      if (success) setBackups(backupManager.getBackups());
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciador de Backup</h2>
          <p className="text-gray-300">
            Crie, restaure e gerencie backups dos seus posts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-slate-700/50 text-gray-300 border-slate-600/50 flex items-center gap-1">
            <Database className="h-3 w-3" />
            {posts.length} posts
          </Badge>
        </div>
      </div>

      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <HardDrive className="h-5 w-5 text-cyan-400" />
            Criar Novo Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-white">Formato</label>
              <select
                value={backupOptions.format}
                onChange={(e) => setBackupOptions(prev => ({ 
                  ...prev, 
                  format: e.target.value as 'json' | 'markdown' | 'html' 
                }))}
                className="w-full p-2 border border-slate-600/50 rounded-md bg-slate-700/50 text-white focus:border-cyan-400 focus:ring-cyan-400/20"
              >
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
                <option value="html">HTML</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeImages"
                checked={backupOptions.includeImages}
                onChange={(e) => setBackupOptions(prev => ({ 
                  ...prev, 
                  includeImages: e.target.checked 
                }))}
                className="h-4 w-4 text-cyan-400 bg-slate-700/50 border-slate-600/50 rounded focus:ring-cyan-400/20"
              />
              <label htmlFor="includeImages" className="text-sm text-gray-300">
                Incluir imagens
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="compress"
                checked={backupOptions.compress}
                onChange={(e) => setBackupOptions(prev => ({ 
                  ...prev, 
                  compress: e.target.checked 
                }))}
                className="h-4 w-4 text-cyan-400 bg-slate-700/50 border-slate-600/50 rounded focus:ring-cyan-400/20"
              />
              <label htmlFor="compress" className="text-sm text-gray-300">
                Comprimir backup
              </label>
            </div>
          </div>

          {isCreatingBackup && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Criando backup...</span>
                <span className="text-white">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup || posts.length === 0}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white disabled:opacity-50"
          >
            {isCreatingBackup ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Criando Backup...
              </>
            ) : (
              <>
                <HardDrive className="h-4 w-4 mr-2" />
                Criar Backup
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-cyan-400" />
            Backups Disponíveis ({backups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-300">
                Nenhum backup encontrado. Crie seu primeiro backup!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => {
                const backupId = backup.metadata.createdAt.toISOString();
                const isSelected = selectedBackup === backupId;
                const isRestoringThis = isRestoring && isSelected;

                return (
                  <Card key={backupId} className={`${isSelected ? 'border-cyan-400/50 bg-cyan-400/5' : ''} bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl transition-all duration-200`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">
                              Backup {new Date(backup.metadata.createdAt).toLocaleString('pt-BR')}
                            </h3>
                            <Badge className="bg-slate-700/50 text-gray-300 border-slate-600/50">
                              v{backup.metadata.version}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {backup.metadata.totalPosts} posts
                            </div>
                            <div className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              {formatFileSize(backup.metadata.totalSize)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(backup.metadata.createdAt, { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              {isRestoringThis ? (
                                <>
                                  <Clock className="h-3 w-3 animate-spin text-cyan-400" />
                                  <span className="text-cyan-400">Restaurando...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 text-green-400" />
                                  <span className="text-green-400">Pronto</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportBackup(backupId, 'json')}
                              disabled={isRestoringThis}
                              className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 border-slate-600/50"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportBackup(backupId, 'markdown')}
                              disabled={isRestoringThis}
                              className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 border-slate-600/50"
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* Restore Button */}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleRestoreBackup(backupId)}
                            disabled={isRestoring}
                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                          >
                            {isRestoringThis ? (
                              <>
                                <Clock className="h-3 w-3 mr-1 animate-spin" />
                                Restaurando
                              </>
                            ) : (
                              <>
                                <Upload className="h-3 w-3 mr-1" />
                                Restaurar
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBackup(backupId)}
                            disabled={isRestoring}
                            className="text-gray-400 hover:text-red-400 hover:bg-red-500/20 border-slate-600/50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-cyan-400 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Informações sobre Backups</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Backups são armazenados localmente no seu navegador</li>
                <li>• Recomendamos exportar backups regularmente para segurança</li>
                <li>• O formato JSON preserva todos os dados originais</li>
                <li>• Markdown e HTML são formatos legíveis para humanos</li>
                <li>• Máximo de 10 backups são mantidos automaticamente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}