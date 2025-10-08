import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Star,
  Clock
} from 'lucide-react';
import { PostTemplate } from '@/types/analytics';

interface PostTemplatesProps {
  templates: PostTemplate[];
  onSelectTemplate: (template: PostTemplate) => void;
  onCreateTemplate: (template: Omit<PostTemplate, 'id' | 'createdAt'>) => void;
  onUpdateTemplate: (id: string, template: Partial<PostTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
}

const defaultTemplates = [
  {
    name: 'Tutorial',
    description: 'Template para tutoriais passo a passo',
    content: `<h1>Como [Título do Tutorial]</h1>

<p>Neste tutorial, você aprenderá como [objetivo do tutorial] de forma simples e eficaz. Este guia é perfeito para iniciantes e inclui todos os passos necessários.</p>

<h2>📋 Pré-requisitos</h2>
<p>Antes de começar, certifique-se de ter:</p>
<ul>
  <li>Item necessário 1</li>
  <li>Item necessário 2</li>
  <li>Item necessário 3</li>
</ul>

<h2>🚀 Passo 1: [Primeiro Passo]</h2>
<p>Descrição detalhada do primeiro passo com instruções claras...</p>

<h2>⚙️ Passo 2: [Segundo Passo]</h2>
<p>Descrição detalhada do segundo passo com exemplos práticos...</p>

<h2>✅ Passo 3: [Terceiro Passo]</h2>
<p>Descrição detalhada do terceiro passo com dicas importantes...</p>

<h2>🎯 Conclusão</h2>
<p>Parabéns! Você aprendeu como [resumo do que foi ensinado]. Agora você pode aplicar esse conhecimento em seus projetos.</p>

<h2>💡 Dicas Extras</h2>
<ul>
  <li>Dica útil 1</li>
  <li>Dica útil 2</li>
  <li>Dica útil 3</li>
</ul>

<h2>🔗 Recursos Adicionais</h2>
<p>Para aprofundar seus conhecimentos:</p>
<ul>
  <li><a href="#">Link para documentação oficial</a></li>
  <li><a href="#">Tutorial relacionado</a></li>
</ul>`,
    category: 'Tutorial'
  },
  {
    name: 'Review',
    description: 'Template para reviews de produtos/serviços',
    content: `<h1>Review: [Nome do Produto/Serviço]</h1>

<p>Neste review, analisarei detalhadamente o [produto/serviço] e compartilharei minha experiência completa após [tempo de uso].</p>

<h2>📦 Sobre o Produto</h2>
<p>Descrição geral do produto/serviço, incluindo informações básicas e propósito...</p>

<h2>🔍 Características Principais</h2>
<ul>
  <li>Característica 1 - Descrição detalhada</li>
  <li>Característica 2 - Descrição detalhada</li>
  <li>Característica 3 - Descrição detalhada</li>
</ul>

<h2>✅ Prós</h2>
<ul>
  <li>Vantagem 1 - Explicação detalhada</li>
  <li>Vantagem 2 - Explicação detalhada</li>
  <li>Vantagem 3 - Explicação detalhada</li>
</ul>

<h2>❌ Contras</h2>
<ul>
  <li>Desvantagem 1 - Explicação detalhada</li>
  <li>Desvantagem 2 - Explicação detalhada</li>
</ul>

<h2>💰 Relação Custo-Benefício</h2>
<p>Avaliação se vale a pena o investimento considerando preço, qualidade e funcionalidades...</p>

<h2>⭐ Nota Final</h2>
<p><strong>Nota: X/10</strong></p>
<p>Resumo da avaliação e recomendação final. Quem deve comprar e quem deve evitar.</p>

<h2>🛒 Onde Comprar</h2>
<p>Links para compra (se aplicável):</p>
<ul>
  <li><a href="#">Loja oficial</a></li>
  <li><a href="#">Outras opções</a></li>
</ul>`,
    category: 'Review'
  },
  {
    name: 'Lista',
    description: 'Template para posts em formato de lista',
    content: `<h1>Top [Número]: [Título da Lista]</h1>

<p>Nesta lista, apresento os [número] melhores [categoria] que você precisa conhecer. Cada item foi cuidadosamente selecionado com base em [critérios específicos].</p>

<h2>🎯 Critérios de Avaliação</h2>
<p>Os itens foram selecionados com base em:</p>
<ul>
  <li>Critério 1</li>
  <li>Critério 2</li>
  <li>Critério 3</li>
</ul>

<h2>📋 A Lista</h2>

<h3>1. [Nome do Item]</h3>
<p>Descrição detalhada do primeiro item, incluindo características principais e por que foi escolhido...</p>

<h3>2. [Nome do Item]</h3>
<p>Descrição detalhada do segundo item, incluindo características principais e por que foi escolhido...</p>

<h3>3. [Nome do Item]</h3>
<p>Descrição detalhada do terceiro item, incluindo características principais e por que foi escolhido...</p>

<h3>4. [Nome do Item]</h3>
<p>Descrição detalhada do quarto item, incluindo características principais e por que foi escolhido...</p>

<h3>5. [Nome do Item]</h3>
<p>Descrição detalhada do quinto item, incluindo características principais e por que foi escolhido...</p>

<h2>🏆 Menção Honrosa</h2>
<p>Item que quase entrou na lista principal e por que vale a pena mencionar...</p>

<h2>💡 Conclusão</h2>
<p>Resumo da lista, padrões observados e recomendações finais para os leitores...</p>`,
    category: 'Lista'
  },
  {
    name: 'Notícia',
    description: 'Template para posts de notícias',
    content: `<h1>[Título da Notícia]</h1>

<p><strong>Data:</strong> [Data da notícia] | <strong>Fonte:</strong> [Fonte da informação]</p>

<h2>📰 Resumo</h2>
<p>Resumo executivo da notícia em 2-3 parágrafos, destacando os pontos principais...</p>

<h2>🔍 O que aconteceu?</h2>
<p>Descrição detalhada dos fatos, incluindo informações sobre quem, o que, quando, onde e por que...</p>

<h2>📊 Contexto</h2>
<p>Informações de contexto relevantes que ajudam a entender melhor a notícia e suas implicações...</p>

<h2>🎯 Impacto</h2>
<p>Análise do impacto da notícia em diferentes setores, pessoas ou organizações afetadas...</p>

<h2>🔮 Perspectivas</h2>
<p>O que esperar para o futuro baseado nesta notícia, possíveis desenvolvimentos e consequências...</p>

<h2>📚 Contexto Adicional</h2>
<p>Informações de contexto que ajudam a entender melhor a notícia, histórico relevante...</p>

<h2>🔗 Fontes e Links Relacionados</h2>
<ul>
  <li><a href="#">Fonte oficial</a></li>
  <li><a href="#">Análise complementar</a></li>
  <li><a href="#">Documentos relacionados</a></li>
</ul>`,
    category: 'Notícia'
  }
];

export default function PostTemplates({
  templates,
  onSelectTemplate,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate
}: PostTemplatesProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    content: '',
    category: ''
  });

  const handleCreateTemplate = () => {
    if (newTemplate.name && newTemplate.content) {
      onCreateTemplate(newTemplate);
      setNewTemplate({ name: '', description: '', content: '', category: '' });
      setShowCreateForm(false);
    }
  };

  const handleSelectDefaultTemplate = (template: typeof defaultTemplates[0]) => {
    onSelectTemplate({
      id: `default-${Date.now()}`,
      name: template.name,
      description: template.description,
      content: template.content,
      category: template.category,
      createdAt: new Date()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Templates de Posts</h2>
          <p className="text-muted-foreground">
            Use templates para criar posts mais rapidamente
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Default Templates */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Templates Padrão</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {defaultTemplates.map((template, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  size="sm"
                  onClick={() => handleSelectDefaultTemplate(template)}
                  className="w-full"
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Usar Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Meus Templates</h3>
        {templates.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Você ainda não criou nenhum template personalizado
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTemplate(template.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{template.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                    className="w-full"
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Template Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do template"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Input
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Categoria"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do template"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Conteúdo</label>
              <Textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Conteúdo HTML do template"
                rows={10}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTemplate}>
                Criar Template
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTemplate({ name: '', description: '', content: '', category: '' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
