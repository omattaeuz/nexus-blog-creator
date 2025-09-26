import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Post {
  id?: string;
  title: string;
  content: string;
}

interface PostFormProps {
  initialData?: Post;
  onSubmit: (data: Omit<Post, "id">) => Promise<void>;
  isEdit?: boolean;
}

const PostForm = ({ initialData, onSubmit, isEdit = false }: PostFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
  });

  const [errors, setErrors] = useState({
    title: "",
    content: "",
  });

  const validateForm = () => {
    const newErrors = {
      title: "",
      content: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "O título deve ter pelo menos 3 caracteres";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Conteúdo é obrigatório";
    } else if (formData.content.trim().length < 10) {
      newErrors.content = "O conteúdo deve ter pelo menos 10 caracteres";
    }

    setErrors(newErrors);
    return !newErrors.title && !newErrors.content;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await onSubmit({
        title: formData.title.trim(),
        content: formData.content.trim(),
      });
      
      toast({
        title: isEdit ? "Post atualizado" : "Post criado",
        description: `Seu post foi ${isEdit ? "atualizado" : "criado"} com sucesso.`,
      });
      
      navigate("/posts");
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao ${isEdit ? "atualizar" : "criar"} post. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-gradient-surface shadow-glow border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {isEdit ? "Editar Post" : "Criar Novo Post"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground font-medium">
                Título
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Digite o título do seu post..."
                className={`transition-all duration-300 ${
                  errors.title 
                    ? "border-destructive focus:ring-destructive" 
                    : "focus:ring-primary"
                }`}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title}</p>
              )}
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-foreground font-medium">
                Conteúdo
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Escreva o conteúdo do seu post aqui..."
                rows={12}
                className={`transition-all duration-300 resize-none ${
                  errors.content 
                    ? "border-destructive focus:ring-destructive" 
                    : "focus:ring-primary"
                }`}
                disabled={isLoading}
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-1">{errors.content}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/posts")}
                disabled={isLoading}
                className="transition-all duration-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEdit ? "Atualizar Post" : "Criar Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostForm;