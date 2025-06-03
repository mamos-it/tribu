import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import ExpensesList from '@/components/ExpensesList';
import PaymentSection from '@/components/PaymentSection';
import ParticipantsList from '@/components/ParticipantsList';
import DateVoting from '@/components/DateVoting';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

interface EventDetailProps {
  eventId: number;
  userId: number;
}

const EventDetail: React.FC<EventDetailProps> = ({ eventId, userId }) => {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('expenses');
  const { toast } = useToast();

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    staleTime: 60000, // 1 minute
  });

  // Fetch expenses
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/expenses`],
    staleTime: 60000, // 1 minute
  });

  // Fetch participants
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/participants`],
    staleTime: 60000, // 1 minute
  });

  // Fetch payment summary
  const { data: paymentSummary, isLoading: paymentLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/payment-summary`],
    staleTime: 60000, // 1 minute
  });

  // Fetch date options
  const { data: dateOptions = [], isLoading: dateOptionsLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/date-options`],
    staleTime: 60000, // 1 minute
  });

  // Fetch user votes
  const { data: userVotes = [], isLoading: userVotesLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/user/${userId}/votes`],
    staleTime: 60000, // 1 minute
  });

  // Find current user's payment info
  const userPaymentInfo = paymentSummary?.paymentSummary?.find(
    (p: any) => p.userId === userId
  );

  // Find current user's participant record
  const userParticipant = participants.find(
    (p: any) => p.userId === userId
  );

  // Format the date if available
  const formattedDate = event?.date
    ? format(new Date(event.date), 'd MMMM, yyyy', { locale: it })
    : 'Data da definire';
  
  const formattedTime = event?.date
    ? format(new Date(event.date), 'HH:mm', { locale: it })
    : '';

  if (eventLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="px-4 max-w-screen-xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-neutral-700 mb-4">Evento non trovato</h2>
        <p className="text-neutral-500 mb-6">L'evento che stai cercando non esiste o è stato rimosso.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium"
        >
          Torna alla home
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 max-w-screen-xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center mb-6">
          <button 
            className="mr-3 bg-neutral-100 p-2 rounded-full"
            onClick={() => navigate('/')}
          >
            <i className="ri-arrow-left-line text-neutral-700"></i>
          </button>
          <h2 className="text-2xl font-bold font-heading">{event.name}</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="h-48 bg-primary-light/10 relative flex items-center justify-center p-8">
            <Dialog>
              <DialogTrigger asChild>
                <button className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-sm hover:bg-neutral-50 transition-colors cursor-pointer text-4xl">
                  {event.emoji || '🎉'}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                  <DialogTitle>Scegli un'emoji</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-8 gap-2 p-4">
                  {['🎉','🎂','🎈','🎊','🎭','🎪','🎨','🎯','🎲','🎸','🎺','🎷','🎹','🎼','🎤','🎬'].map((emoji) => (
                    <button 
                      key={emoji}
                      className="text-2xl p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                      onClick={() => {
                        // TODO: Implement emoji update
                        toast({
                          title: "Emoji aggiornata",
                          description: "L'emoji dell'evento è stata aggiornata"
                        });
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <div className="absolute top-4 right-4 bg-white rounded-lg px-6 py-3 shadow-sm">
              <div className="font-medium text-lg">{event.name}</div>
              <div className="text-sm text-neutral-500 flex items-center mt-1">
                <i className="ri-calendar-line mr-2"></i>
                <span>
                  {formattedDate}
                  {formattedTime && `, ${formattedTime}`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex-1 min-w-[150px]">
                <h4 className="text-sm text-neutral-400 mb-1">Luogo</h4>
                <p className="font-medium">{event.location || 'Da definire'}</p>
              </div>
              <div className="flex-1 min-w-[150px]">
                <h4 className="text-sm text-neutral-400 mb-1">Partecipanti</h4>
                <p className="font-medium">{participants.length} {participants.length === 1 ? 'confermato' : 'confermati'}</p>
              </div>
              <div className="flex-1 min-w-[150px]">
                <h4 className="text-sm text-neutral-400 mb-1">Budget totale</h4>
                <p className="font-medium text-primary">€{(event.totalBudget || 0).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="mt-6 col-span-full">
              <h4 className="text-sm text-neutral-400 mb-2">Descrizione</h4>
              <p className="text-neutral-700">
                {event.description || 'Nessuna descrizione disponibile.'}
              </p>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <i className="ri-share-forward-line mr-2"></i>
                    Invita amici
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white">
                  <DialogHeader>
                    <DialogTitle>Invita amici alla festa</DialogTitle>
                    <div className="text-sm text-neutral-500 mt-1">Condividi questo evento con i tuoi amici</div>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Link di invito</Label>
                      <div className="flex">
                        <Input 
                          readOnly 
                          value={`${window.location.origin}/events/${event.id}`} 
                          className="rounded-r-none border-r-0"
                        />
                        <Button 
                          variant="outline" 
                          className="rounded-l-none border-l-0 bg-primary text-white hover:bg-primary-dark hover:text-white" 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`);
                            toast({
                              title: "Link copiato",
                              description: "Link d'invito copiato negli appunti"
                            });
                          }}
                        >
                          <i className="ri-file-copy-line"></i>
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Condividi tramite</Label>
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-primary hover:bg-primary-dark" onClick={() => {
                          window.open(`https://wa.me/?text=${encodeURIComponent(`Partecipa alla festa "${event.name}": ${window.location.origin}/events/${event.id}`)}`, '_blank');
                        }}>
                          <i className="ri-whatsapp-line mr-2"></i> WhatsApp
                        </Button>
                        <Button variant="outline" className="flex-1 text-primary border-primary hover:bg-primary/5" onClick={() => {
                          window.open(`mailto:?subject=${encodeURIComponent(`Invito alla festa: ${event.name}`)}&body=${encodeURIComponent(`Partecipa alla festa "${event.name}": ${window.location.origin}/events/${event.id}`)}`, '_blank');
                        }}>
                          <i className="ri-mail-line mr-2"></i> Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center justify-center border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg font-medium transition-colors">
                    <i className="ri-notification-2-line mr-2"></i>
                    Notifiche
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-white">
                  <DialogHeader>
                    <DialogTitle>Notifiche dell'evento</DialogTitle>
                    <div className="text-sm text-neutral-500 mt-1">Attività e aggiornamenti recenti</div>
                  </DialogHeader>
                  <div className="h-96 border border-neutral-200 rounded-lg flex flex-col">
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                      <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                            <i className="ri-megaphone-line"></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="font-medium">Organizzatore</div>
                              <div className="text-xs text-neutral-500">Oggi, 14:30</div>
                            </div>
                            <div className="mt-1">Benvenuti alla festa! Non dimenticate di votare per la data migliore.</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600">
                            <i className="ri-money-euro-circle-line"></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="font-medium">Demo User</div>
                              <div className="text-xs text-neutral-500">Oggi, 12:15</div>
                            </div>
                            <div className="mt-1">Ha aggiunto una nuova spesa</div>
                            <div className="mt-2 text-sm rounded-lg p-2 bg-white">
                              <span className="font-medium">€25.50</span> - Bevande
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-600">
                            <i className="ri-user-add-line"></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="font-medium">Demo User</div>
                              <div className="text-xs text-neutral-500">Ieri, 18:40</div>
                            </div>
                            <div className="mt-1">Si è unito all'evento</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center justify-center border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg font-medium transition-colors">
                    <i className="ri-pencil-line mr-2"></i>
                    Modifica
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white">
                  <DialogHeader>
                    <DialogTitle>Modifica evento</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="event-name">Nome evento</Label>
                      <Input id="event-name" defaultValue={event.name} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-date">Data</Label>
                      <Input id="event-date" type="datetime-local" defaultValue={event.date ? new Date(event.date).toISOString().slice(0, 16) : ''} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-location">Luogo</Label>
                      <Input id="event-location" defaultValue={event.location || ''} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-description">Descrizione</Label>
                      <textarea 
                        id="event-description" 
                        className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue={event.description || ''}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-budget">Budget totale (€)</Label>
                      <Input id="event-budget" type="number" defaultValue={event.totalBudget || 0} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Annulla</Button>
                    </DialogClose>
                    <Button className="bg-primary hover:bg-primary-dark">Salva modifiche</Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center justify-center border border-red-200 bg-white hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors">
                    <i className="ri-delete-bin-line mr-2"></i>
                    Elimina
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white">
                  <DialogHeader>
                    <DialogTitle>Elimina evento</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="mb-4">Sei sicuro di voler eliminare questo evento? Questa azione non può essere annullata.</p>
                    <p className="mb-4 font-medium">{event.name}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Annulla</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={() => {
                      toast({
                        title: "Evento eliminato",
                        description: "L'evento è stato eliminato con successo"
                      });
                      navigate('/');
                    }}>Elimina evento</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="flex border-b border-neutral-200">
          <button 
            className={`flex-1 py-3 font-medium ${
              activeTab === 'expenses' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('expenses')}
          >
            Spese
          </button>
          <button 
            className={`flex-1 py-3 font-medium ${
              activeTab === 'participants' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('participants')}
          >
            Partecipanti
          </button>
          <button 
            className={`flex-1 py-3 font-medium ${
              activeTab === 'dates' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('dates')}
          >
            Date
          </button>
        </div>
        
        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          expensesLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <ExpensesList 
              expenses={expenses}
              eventId={eventId}
              userId={userId}
              totalBudget={event.totalBudget || 0}
              participantsCount={participants.length || 0}
            />
          )
        )}
        
        {/* Participants Tab */}
        {activeTab === 'participants' && (
          participantsLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <ParticipantsList 
              participants={participants}
              eventId={eventId}
              userId={userId}
            />
          )
        )}
        
        {/* Dates Tab */}
        {activeTab === 'dates' && (
          dateOptionsLoading || userVotesLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <DateVoting 
              dateOptions={dateOptions}
              userVotes={userVotes}
              eventId={eventId}
              userId={userId}
            />
          )
        )}
      </div>
      
      {/* Payment Section */}
      {userPaymentInfo && userParticipant && (
        <PaymentSection 
          participantId={userParticipant.id}
          eventId={eventId}
          amount={userPaymentInfo.amountOwed || 0}
          hasPaid={userPaymentInfo.hasPaid}
        />
      )}
    </div>
  );
};

export default EventDetail;
