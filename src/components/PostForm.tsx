import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, X } from "lucide-react";
import { useFormValidation, commonValidationRules } from "@/hooks/useFormValidation";
import { VALIDATION_CONSTANTS, ERROR_MESSAGES } from "@/lib/constants";
import { showValidationError, showPostSuccess, showUnexpectedError } from "@/lib/toast-helpers";

interface Post {
  id?: string;
  title: string;
  content: string;
  is_public?: boolean;
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
    is_public: initialData?.is_public || false,
  });

  // Use form validation hook
  const { errors, validateForm, clearError } = useFormValidation({
    title: {
      ...commonValidationRules.title,
      minLength: VALIDATION_CONSTANTS.MIN_TITLE_LENGTH,
      maxLength: VALIDATION_CONSTANTS.MAX_TITLE_LENGTH,
    },
    content: {
      ...commonValidationRules.content,
      minLength: VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH,
      maxLength: VALIDATION_CONSTANTS.MAX_CONTENT_LENGTH,
    },
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      showValidationError();
      return;
    }

    setIsLoading(true);
    
    try {
      await onSubmit({
        title: formData.title.trim(),
        content: formData.content.trim(),
        is_public: formData.is_public,
      });
      
      showPostSuccess(isEdit);
      
      navigate("/posts");
    } catch (error) {
      showUnexpectedError(`Falha ao ${isEdit ? "atualizar" : "criar"} post. Tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) clearError(field);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
      <Card className="bg-gradient-surface shadow-glow border-border/50">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {isEdit ? "Editar Post" : "Criar Novo Post"}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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

            <div className="space-y-2">
              <Label htmlFor="content" className="text-foreground font-medium">
                Conteúdo
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Escreva o conteúdo do seu post aqui..."
                rows={8}
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

            {/* Public Post Checkbox */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_public: !!checked }))
                  }
                  disabled={isLoading}
                />
                <Label 
                  htmlFor="is_public" 
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Tornar post público
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Posts públicos podem ser visualizados por qualquer pessoa através de links compartilhados
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/posts")}
                disabled={isLoading}
                className="transition-all duration-300 order-2 sm:order-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300 order-1 sm:order-2"
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