import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { redisCache } from '@/lib/redis-cache';

interface CacheStats {
  connected: boolean;
  memoryKeys: number;
  redisKeys?: number;
}

export default function CacheManager() {
  const [stats, setStats] = useState<CacheStats>({
    connected: false,
    memoryKeys: 0,
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const cacheStats = await redisCache.getStats();
      setStats(cacheStats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    if (confirm('Tem certeza que deseja limpar todo o cache?')) {
      setLoading(true);
      try {
        await redisCache.clear();
        await fetchStats();
      } catch (error) {
        console.error('Error clearing cache:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const healthCheck = async () => {
    setLoading(true);
    try {
      const isHealthy = await redisCache.healthCheck();
      if (isHealthy) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Update stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getConnectionStatus = () => {
    if (stats.connected) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        text: 'Conectado',
        variant: 'default' as const,
      };
    } else {
      return {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        text: 'Desconectado',
        variant: 'destructive' as const,
      };
    }
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciador de Cache</h2>
          <p className="text-muted-foreground">
            Gerencie o cache Redis e monitore o desempenho
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={connectionStatus.variant} className="flex items-center gap-1">
            {connectionStatus.icon}
            {connectionStatus.text}
          </Badge>
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Redis</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.redisKeys || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Chaves no Redis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Local</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.memoryKeys}
            </div>
            <p className="text-xs text-muted-foreground">
              Chaves na memória
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {lastUpdate.toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastUpdate.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cache Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações do Cache</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={fetchStats}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Estatísticas
            </Button>
            
            <Button
              onClick={healthCheck}
              disabled={loading}
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verificar Saúde
            </Button>
            
            <Button
              onClick={clearCache}
              disabled={loading}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando...</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cache Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cache</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Configuração</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• TTL Posts: 5 minutos</li>
                <li>• TTL Analytics: 10 minutos</li>
                <li>• TTL Comentários: 2 minutos</li>
                <li>• TTL Usuário: 30 minutos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Funcionalidades</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Cache-Aside Pattern</li>
                <li>• Invalidação automática</li>
                <li>• Fallback para memória</li>
                <li>• Health check automático</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
