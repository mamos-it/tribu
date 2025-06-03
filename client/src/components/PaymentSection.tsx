import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface PaymentSectionProps {
  participantId: number;
  eventId: number;
  amount: number;
  hasPaid: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ participantId, eventId, amount, hasPaid }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('cash');
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      await apiRequest('PUT', `/api/participants/${participantId}`, {
        hasPaid: true,
        paymentMethod: selectedMethod
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/participants`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/payment-summary`] });
      
      toast({
        title: "Pagamento completato",
        description: `Pagamento di €${amount.toFixed(2)} registrato con successo`
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile registrare il pagamento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (hasPaid) {
    return (
      <div className="bg-green-50 text-green-600 p-3 rounded-lg text-center flex items-center justify-center">
        <i className="ri-checkbox-circle-line mr-2"></i>
        <span>Hai già pagato</span>
      </div>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <i className="ri-bank-card-line mr-2"></i>
          Paga €{amount.toFixed(2)}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Completa il pagamento</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <div className="text-sm text-neutral-500 mb-1">Importo da pagare</div>
            <div className="text-2xl font-bold">€{amount.toFixed(2)}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm font-medium mb-3">Seleziona il metodo di pagamento</div>
            
            <RadioGroup 
              value={selectedMethod}
              onValueChange={setSelectedMethod}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-neutral-50 cursor-pointer">
                <RadioGroupItem value="cash" id="payment-cash" />
                <Label htmlFor="payment-cash" className="flex items-center cursor-pointer">
                  <i className="ri-money-euro-box-line text-green-600 text-xl mr-2"></i>
                  <div>
                    <div className="font-medium">Contanti</div>
                    <div className="text-xs text-neutral-500">Pagamento in contanti di persona</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-neutral-50 cursor-pointer">
                <RadioGroupItem value="transfer" id="payment-transfer" />
                <Label htmlFor="payment-transfer" className="flex items-center cursor-pointer">
                  <i className="ri-bank-line text-blue-600 text-xl mr-2"></i>
                  <div>
                    <div className="font-medium">Bonifico bancario</div>
                    <div className="text-xs text-neutral-500">Dettagli bancari verranno forniti</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-neutral-50 cursor-pointer">
                <RadioGroupItem value="satispay" id="payment-satispay" />
                <Label htmlFor="payment-satispay" className="flex items-center cursor-pointer">
                  <i className="ri-smartphone-line text-primary text-xl mr-2"></i>
                  <div>
                    <div className="font-medium">Satispay</div>
                    <div className="text-xs text-neutral-500">Pagamento rapido con app</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {selectedMethod === 'transfer' && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm">
              <div className="font-medium mb-1">Dettagli per il bonifico:</div>
              <div>IBAN: IT60X0542811101000000123456</div>
              <div>Intestatario: [Nome Organizzatore]</div>
              <div>Causale: Tribù - Evento #{eventId} - Partecipante #{participantId}</div>
            </div>
          )}
          
          {selectedMethod === 'satispay' && (
            <div className="bg-primary/5 p-3 rounded-lg mb-4 text-sm">
              <div className="font-medium mb-1">Istruzioni per Satispay:</div>
              <div>1. Apri l'app Satispay sul tuo smartphone</div>
              <div>2. Cerca "[Nome Organizzatore]" tra i contatti</div>
              <div>3. Invia €{amount.toFixed(2)} specificando "Tribù - Evento #{eventId}"</div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Annulla</Button>
          </DialogClose>
          <Button 
            onClick={handlePayment}
            disabled={isLoading}
            className="bg-primary hover:bg-primary-dark"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Elaborazione...
              </>
            ) : (
              <>Conferma pagamento</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSection;