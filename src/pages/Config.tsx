import N8nConfig from '@/components/N8nConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle } from 'lucide-react';

const Config = () => {
  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Configuração
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Configure a integração com N8n para conectar ao backend
          </p>
        </div>

        {/* Status Alert */}
        <Alert className="mb-8 max-w-2xl mx-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Status atual:</strong> A aplicação está rodando em modo de desenvolvimento. 
            Configure o N8n para habilitar todas as funcionalidades.
          </AlertDescription>
        </Alert>

        {/* Configuration Card */}
        <N8nConfig />

        {/* Instructions */}
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Instruções de Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Configure o N8n</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Importe o workflow JSON fornecido no seu N8n</li>
                <li>Ative o workflow</li>
                <li>Copie a URL do webhook do nó "C: Criar Post"</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Configure a Aplicação</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Cole a URL do webhook no campo acima</li>
                <li>Teste a conexão</li>
                <li>Salve a configuração</li>
                <li>Reinicie a aplicação</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Verifique a Integração</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Crie um novo post para testar</li>
                <li>Verifique se aparece no Supabase</li>
                <li>Teste edição e exclusão de posts</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Config;
