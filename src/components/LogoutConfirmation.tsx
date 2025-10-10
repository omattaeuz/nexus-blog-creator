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
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/10">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30">
              <LogOut className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-left text-white">
                Confirmar saída da conta
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <DialogDescription className="text-left space-y-3">
          <p className="text-gray-300">
            Tem certeza que deseja sair da sua conta?
          </p>
          {userEmail && (
            <div className="bg-white/5 rounded-lg p-3 border-l-4 border-blue-500/50 backdrop-blur-sm">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Conta:</strong> {userEmail}
              </p>
            </div>
          )}
          <div className="flex items-start space-x-2 text-sm text-gray-400">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-400" />
            <p>
              Você precisará fazer login novamente para acessar seus posts e configurações.
            </p>
          </div>
        </DialogDescription>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1 border-white/20 text-white hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 order-1 sm:order-2"
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