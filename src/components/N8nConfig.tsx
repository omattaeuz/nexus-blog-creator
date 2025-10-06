import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const N8nConfig = () => {
  const [webhookUrl, setWebhookUrl] = useState('https://primary-production-e91c.up.railway.app/webhook');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (webhookUrl === 'https://primary-production-e91c.up.railway.app/webhook-test' || !webhookUrl.includes('railway.app')) {
      setTestResult({
        success: false,
        message: 'Por favor, configure a URL do webhook do N8n primeiro.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Conexão com N8n estabelecida com sucesso!'
        });
      } else {
        setTestResult({
          success: false,
          message: `Erro HTTP ${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('n8n_webhook_url', webhookUrl);
    alert('Configuração salva! Reinicie a aplicação para aplicar as mudanças.');
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Configuração do N8n
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">URL do Webhook N8n</Label>
          <Input
            id="webhook-url"
            type="url"
            placeholder="https://primary-production-e91c.up.railway.app/webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            URL base do webhook do N8n: https://primary-production-e91c.up.railway.app/webhook
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleTestConnection} 
            disabled={isTesting}
            className="flex-1"
          >
            {isTesting ? 'Testando...' : 'Testar Conexão'}
          </Button>
          <Button 
            onClick={handleSaveConfig}
            variant="outline"
            className="flex-1"
          >
            Salvar Configuração
          </Button>
        </div>

        {testResult && (
          <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Como configurar:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Importe o workflow JSON no seu N8n</li>
            <li>Copie a URL do webhook (nó "C: Criar Post")</li>
            <li>Cole a URL no campo acima</li>
            <li>Teste a conexão</li>
            <li>Salve a configuração</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default N8nConfig;