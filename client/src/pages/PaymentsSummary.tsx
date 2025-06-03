import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface PaymentSummaryProps {
  eventId: number;
}

interface ParticipantPayment {
  id: number;
  userId: number;
  eventId: number;
  name: string;
  email: string;
  amountOwed: number;
  hasPaid: boolean;
  paymentMethod?: string;
}

const PaymentsSummary: React.FC<PaymentSummaryProps> = ({ eventId }) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantPayment | null>(null);
  
  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    staleTime: 60000,
  });
  
  // Fetch payment summary
  const { data: paymentSummary, isLoading: paymentsLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/payment-summary`],
    staleTime: 60000,
  });
  
  // Fetch participants
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/participants`],
    staleTime: 60000,
  });
  
  // Fetch expenses
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/expenses`],
    staleTime: 60000,
  });
  
  const isLoading = eventLoading || paymentsLoading || participantsLoading || expensesLoading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Evento non trovato</h2>
        <p className="text-neutral-500 mb-4">L'evento richiesto non esiste o è stato eliminato.</p>
        <Button onClick={() => navigate('/')}>
          Torna alla home
        </Button>
      </div>
    );
  }
  
  const totalExpenses = expenses.reduce((total: number, expense: any) => total + expense.amount, 0);
  const paidAmount = participants
    .filter((p: any) => p.hasPaid)
    .reduce((total: number, p: any) => total + (paymentSummary?.paymentSummary?.find((ps: any) => ps.userId === p.userId)?.amountOwed || 0), 0);
  const remainingAmount = totalExpenses - paidAmount;
  
  const participantsWithPayments: ParticipantPayment[] = participants.map((p: any) => {
    const payment = paymentSummary?.paymentSummary?.find((ps: any) => ps.userId === p.userId);
    return {
      id: p.id,
      userId: p.userId,
      eventId: p.eventId,
      name: p.user?.name || 'Utente',
      email: p.user?.email || p.user?.username || '',
      amountOwed: payment?.amountOwed || 0,
      hasPaid: p.hasPaid,
      paymentMethod: p.paymentMethod
    };
  });
  
  const unpaidParticipants = participantsWithPayments.filter(p => !p.hasPaid);
  const paidParticipants = participantsWithPayments.filter(p => p.hasPaid);
  
  const handleMarkAsPaid = async (participantId: number) => {
    try {
      await apiRequest('PUT', `/api/participants/${participantId}`, {
        hasPaid: true
      });
      
      toast({
        title: 'Pagamento registrato',
        description: 'Il partecipante è stato segnato come pagato'
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/participants`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/payment-summary`] });
      
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile registrare il pagamento',
        variant: 'destructive'
      });
    }
  };
  
  const handleSendReminder = (participant: ParticipantPayment) => {
    toast({
      title: 'Promemoria inviato',
      description: `Promemoria di pagamento inviato a ${participant.name}`
    });
  };
  
  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          className="mr-3 bg-neutral-100 p-2 rounded-full"
          onClick={() => navigate(`/events/${eventId}`)}
        >
          <i className="ri-arrow-left-line text-neutral-700"></i>
        </button>
        <h2 className="text-2xl font-bold font-heading">Riepilogo pagamenti</h2>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-neutral-200 bg-primary/5">
          <h3 className="font-medium text-primary-dark">Stato dei pagamenti - {event.name}</h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="text-sm text-neutral-500 mb-1">Budget totale</div>
              <div className="text-2xl font-bold">€{(event.totalBudget || 0).toFixed(2)}</div>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="text-sm text-neutral-500 mb-1">Spese registrate</div>
              <div className="text-2xl font-bold">€{totalExpenses.toFixed(2)}</div>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="text-sm text-neutral-500 mb-1">Da incassare</div>
              <div className="text-2xl font-bold text-primary">€{remainingAmount.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="w-full bg-neutral-200 rounded-full h-2 mb-6">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${totalExpenses > 0 ? (paidAmount / totalExpenses) * 100 : 0}%` }}
            ></div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-3">Da pagare</h4>
            
            {unpaidParticipants.length === 0 ? (
              <div className="bg-green-50 text-green-600 p-4 rounded-lg text-center">
                <i className="ri-checkbox-circle-line text-xl mr-2"></i>
                Tutti i partecipanti hanno pagato
              </div>
            ) : (
              <div className="space-y-3">
                {unpaidParticipants.map(participant => (
                  <div 
                    key={participant.id} 
                    className="bg-neutral-50 p-4 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center mr-3">
                        <span>{participant.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-sm text-neutral-500">{participant.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <div className="font-medium">€{participant.amountOwed.toFixed(2)}</div>
                        <div className="text-xs text-red-500">Da pagare</div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendReminder(participant)}
                          className="text-primary border-primary hover:bg-primary/5"
                        >
                          <i className="ri-notification-3-line mr-1"></i>
                          Promemoria
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleMarkAsPaid(participant.id)}
                        >
                          <i className="ri-check-line mr-1"></i>
                          Segna pagato
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {paidParticipants.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Pagamenti ricevuti</h4>
              
              <div className="space-y-3">
                {paidParticipants.map(participant => (
                  <div 
                    key={participant.id} 
                    className="bg-green-50 p-4 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span>{participant.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-sm text-neutral-500">{participant.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-medium">€{participant.amountOwed.toFixed(2)}</div>
                        <div className="text-xs text-green-600 flex items-center">
                          <i className="ri-check-line mr-1"></i>
                          Pagato {participant.paymentMethod ? `(${participant.paymentMethod})` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-neutral-200">
          <h3 className="font-medium">Dettaglio spese</h3>
        </div>
        
        <div className="p-4">
          {expenses.length === 0 ? (
            <div className="text-center py-6 text-neutral-500">
              Nessuna spesa registrata
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense: any) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-shopping-bag-line text-neutral-500"></i>
                    </div>
                    <div>
                      <div className="font-medium">{expense.name}</div>
                      <div className="text-xs text-neutral-500">
                        Aggiunto da {expense.addedByUser?.name || 'Utente'} 
                        {expense.date ? ` - ${new Date(expense.date).toLocaleDateString('it-IT')}` : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="font-medium">€{expense.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsSummary;