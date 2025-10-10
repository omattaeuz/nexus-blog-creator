import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  postTitle?: string;
  isLoading?: boolean;
}

const DeletePostModal: React.FC<DeletePostModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  postTitle,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <DialogTitle className="text-lg font-semibold text-white">
              Excluir Post
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-300 leading-relaxed">
            {postTitle ? (
              <>
                Tem certeza que deseja excluir o post <strong className="text-white">"{postTitle}"</strong>?
                <br />
                <br />
                Esta ação não pode ser desfeita e o post será permanentemente removido.
              </>
            ) : (
              <>
                Tem certeza que deseja excluir este post?
                <br />
                <br />
                Esta ação não pode ser desfeita e o post será permanentemente removido.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1 border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto order-1 sm:order-2 gap-2 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 transition-all duration-300"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir Post
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePostModal;