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
import { toast } from '@/hooks/use-toast';

interface ShareButtonProps {
  postTitle: string;
  postId: string;
  postContent?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

const ShareButton: React.FC<ShareButtonProps> = ({
  postTitle,
  postId,
  postContent,
  className = '',
  variant = 'ghost',
  size = 'sm'
}) => {
  const [copied, setCopied] = useState(false);
  
  const postUrl = `${window.location.origin}/posts/${postId}`;
  const shareText = `Confira este post: "${postTitle}"`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedText = encodeURIComponent(shareText);

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
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(postUrl);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = postUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link do post foi copiado para a área de transferência.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link. Tente novamente.",
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
  );
};

export default ShareButton;
