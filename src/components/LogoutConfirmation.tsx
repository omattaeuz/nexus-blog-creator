import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, AlertTriangle } from "lucide-react";

interface LogoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail?: string;
}

const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-left">
                Confirmar saída da conta
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <DialogDescription className="text-left space-y-3">
          <p>
            Tem certeza que deseja sair da sua conta?
          </p>
          {userEmail && (
            <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-muted-foreground/20">
              <p className="text-sm text-muted-foreground">
                <strong>Conta:</strong> {userEmail}
              </p>
            </div>
          )}
          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Você precisará fazer login novamente para acessar seus posts e configurações.
            </p>
          </div>
        </DialogDescription>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground order-1 sm:order-2"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sim, sair da conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutConfirmation;