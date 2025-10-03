import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface ShareButtonProps {
  postTitle: string;
  postId: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

const ShareButton: React.FC<ShareButtonProps> = ({
  postTitle,
  postId,
  className = '',
  variant = 'ghost',
  size = 'sm'
}) => {
  const [copied, setCopied] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);
  
  // Build URL based on environment
  const getBaseUrl = () => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Environment detection for URL construction
    
    // Check if we're in development mode (Vite dev server)
    const isDevelopment = hostname === 'localhost' || 
                         hostname === '127.0.0.1' || 
                         hostname.startsWith('192.168.') ||
                         hostname.startsWith('172.16.') ||
                         hostname.startsWith('10.');
    
    if (isDevelopment) {
      // In development, prefer localhost for better compatibility
      const devPort = port || '8081';
      return `http://localhost:${devPort}`;
    }
    
    // For production, use the current origin
    return window.location.origin;
  };
  
  const postUrl = `${getBaseUrl()}/posts/${postId}`;
  const shareText = `Confira este post: "${postTitle}"`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedText = encodeURIComponent(shareText);
  
  // Debug logs removed for production

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:text-blue-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'hover:text-blue-400'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:text-blue-700'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodedText}%0A%0A${encodedUrl}`,
      color: 'hover:text-gray-600'
    }
  ];

  const handleCopyLink = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(postUrl);
      } else {
        // Use fallback method for non-secure contexts
        // Enhanced fallback method
        const textArea = document.createElement('textarea');
        textArea.value = postUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';
        textArea.setAttribute('readonly', '');
        textArea.setAttribute('contenteditable', 'true');
        
        document.body.appendChild(textArea);
        
        // Focus and select
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        
        // Try to copy
        let success = false;
        try {
          success = document.execCommand('copy');
        } catch {
          // execCommand failed
        }
        
        // Remove element
        document.body.removeChild(textArea);
        
        // If execCommand failed, try a different approach
        if (!success) {
          // Create a temporary input element
          const input = document.createElement('input');
          input.value = postUrl;
          input.style.position = 'fixed';
          input.style.left = '-999999px';
          input.style.top = '-999999px';
          input.style.opacity = '0';
          document.body.appendChild(input);
          input.select();
          input.setSelectionRange(0, 99999);
          
          try {
            success = document.execCommand('copy');
          } catch {
            // Alternative copy failed
          }
          
          document.body.removeChild(input);
        }
        
        if (!success) {
          // If all automatic methods fail, show manual copy dialog
          setShowManualCopy(true);
          return;
        }
      }
      
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link do post foi copiado para a área de transferência.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link. Tente selecionar e copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          text: shareText,
          url: postUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    }
  };

  const handleSocialShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 ${className}`}
          >
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Compartilhar</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          {/* Native Share (mobile) */}
          {navigator.share && (
            <>
              <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Copy Link */}
          <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-green-600">Link copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar link
              </>
            )}
          </DropdownMenuItem>
          
          
          <DropdownMenuSeparator />
          
          {/* Social Media Options */}
          {shareOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <DropdownMenuItem
                key={option.name}
                onClick={() => handleSocialShare(option.url)}
                className={`cursor-pointer ${option.color}`}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {option.name}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Manual Copy Dialog */}
      <Dialog open={showManualCopy} onOpenChange={setShowManualCopy}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Copiar Link</DialogTitle>
            <DialogDescription>
              A cópia automática não funcionou. Selecione o link abaixo e copie manualmente (Ctrl+C ou Cmd+C):
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <label htmlFor="link" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Link do post
                  </label>
                  <input
                    id="link"
                    value={postUrl}
                    readOnly
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              className="px-3"
              onClick={() => {
                const input = document.getElementById('link') as HTMLInputElement;
                input.select();
                input.setSelectionRange(0, 99999);
                toast({
                  title: "Link selecionado!",
                  description: "Agora pressione Ctrl+C (ou Cmd+C) para copiar.",
                });
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareButton;
