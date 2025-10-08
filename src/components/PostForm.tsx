import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichEditorPro from "@/components/RichEditorPro";
import TagsInput from "@/components/TagsInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, X } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { ERROR_MESSAGES } from "@/lib/constants";
import { showValidationError, showPostSuccess, showUnexpectedError } from "@/lib/toast-helpers";
import { calculateReadingTime } from "@/lib/formatters";

interface Post {
  id?: string;
  title: string;
  content: string;
  is_public?: boolean;
  tags?: string[];
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
    tags: initialData?.tags || [],
  });
  const [preview, setPreview] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);

  const { errors, validateForm, clearError } = useFormValidation({
    title: {
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    content: {
      required: true,
      minLength: 10,
    },
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't validate if image editor is open
    if (showImageEditor) return;
    
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
        tags: formData.tags,
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
    <div className="h-screen flex">
      <div className={`${preview ? 'w-1/2' : 'w-full'} transition-all duration-500 ease-in-out border-r border-border/50 overflow-y-auto`}>
        <div className="p-6">
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
              <Label id="content-label" className="text-foreground font-medium">Conteúdo</Label>
              <div className={`${preview ? 'h-[600px]' : 'h-[500px]'} flex flex-col`}>
                <RichEditorPro
                  id="content"
                  value={formData.content}
                  onChange={(html) => handleInputChange("content", html)}
                  preview={preview}
                  onTogglePreview={setPreview}
                  title={formData.title}
                  onImageEditorToggle={setShowImageEditor}
                />
              </div>
              {errors.content && (<p className="text-sm text-destructive mt-1">{errors.content}</p>)}
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-medium">Tags</Label>
              <TagsInput
                tags={formData.tags}
                onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                placeholder="Adicione tags para categorizar seu post..."
                maxTags={8}
              />
              <p className="text-xs text-muted-foreground">
                Tags ajudam a organizar e encontrar posts relacionados. Use palavras-chave relevantes.
              </p>
            </div>

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
                disabled={isLoading || showImageEditor}
                className="transition-all duration-300 order-2 sm:order-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isLoading || showImageEditor}
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
      </div>

      {preview && (
        <div className="w-1/2 bg-white overflow-y-auto preview-enter">
          <div className="p-6">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  Preview
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                {formData.title || "Título do Post"}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center space-x-2">
                  <span>📅</span>
                  <span>{new Date().toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>•</span>
                  <span>Tempo de leitura: {calculateReadingTime(formData.content)} min</span>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: formData.content || "<p><em>Comece a escrever para ver o preview...</em></p>" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostForm;