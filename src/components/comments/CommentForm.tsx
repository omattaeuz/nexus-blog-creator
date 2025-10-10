import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface CommentFormProps {
  onSubmit: (content: string, authorName: string, authorEmail: string) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  submitLabel?: string;
}

export default function CommentForm({ 
  onSubmit, 
  isLoading = false, 
  placeholder = "Escreva seu comentário...",
  submitLabel = "Comentar"
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !authorName.trim() || !authorEmail.trim()) return;

    try {
      await onSubmit(content.trim(), authorName.trim(), authorEmail.trim());
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const isFormValid = content.trim() && authorName.trim() && authorEmail.trim();

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-lg">Adicionar Comentário</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="authorName" className="block text-sm font-medium mb-2">
                Nome
              </label>
              <Input
                id="authorName"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Seu nome"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="authorEmail" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="authorEmail"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Comentário
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              rows={4}
              required
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={!isFormValid || isLoading}
            className="w-full"
          >
            {isLoading ? 'Enviando...' : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}