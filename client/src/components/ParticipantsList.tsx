import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Clipboard } from 'lucide-react';

interface ParticipantWithUser {
  id: number;
  eventId: number;
  userId: number;
  status: string;
  hasPaid: boolean;
  user?: {
    id: number;
    name: string;
    username: string;
    email: string;
  };
}

interface ParticipantsListProps {
  participants: ParticipantWithUser[];
  eventId: number;
  userId: number;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants, eventId, userId }) => {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  
  const confirmedParticipants = participants.filter(p => p.status === 'confirmed');
  const pendingParticipants = participants.filter(p => p.status === 'pending');
  
  const generateInviteLink = () => {
    // In a real app this would generate a unique invite link
    // For now we'll just return the event link
    return `${window.location.origin}/events/${eventId}`;
  };
  
  const handleCopyInviteLink = () => {
    const link = generateInviteLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiato",
      description: "Link d'invito copiato negli appunti"
    });
  };
  
  const handleInvite = async () => {
    if (!inviteEmail) {
      toast({
        title: "Errore",
        description: "Inserisci un'email valida",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app this would send an email invitation
    // For demo purposes we'll just show a toast
    toast({
      title: "Invito inviato",
      description: `Invito inviato a ${inviteEmail}`
    });
    
    setInviteEmail('');
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-medium">Partecipanti ({participants.length})</h3>
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-sm text-primary font-medium flex items-center">
              <i className="ri-user-add-line mr-1"></i>
              Invita amici
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invita amici alla festa</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input 
                  id="invite-email" 
                  placeholder="amico@esempio.com" 
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Link di invito</Label>
                <div className="flex">
                  <Input 
                    readOnly 
                    value={generateInviteLink()} 
                    className="rounded-r-none"
                  />
                  <Button 
                    variant="outline" 
                    className="rounded-l-none" 
                    onClick={handleCopyInviteLink}
                  >
                    <Clipboard size={16} />
                  </Button>
                </div>
                <p className="text-xs text-neutral-500">
                  Condividi questo link con i tuoi amici per invitarli
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Annulla</Button>
              </DialogClose>
              <Button onClick={handleInvite}>Invia invito</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {participants.length === 0 ? (
        <div className="text-center py-8 text-neutral-400">
          Nessun partecipante ancora
        </div>
      ) : (
        <div>
          <h4 className="text-sm text-neutral-400 mb-2">Confermati ({confirmedParticipants.length})</h4>
          {confirmedParticipants.map(participant => (
            <div key={participant.id} className="flex items-center justify-between py-3 border-b border-neutral-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-neutral-700 font-medium">
                    {participant.user?.name.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{participant.user?.name || 'Utente'}</p>
                  <p className="text-sm text-neutral-400">{participant.user?.email || participant.user?.username || ''}</p>
                </div>
              </div>
              <div className="flex items-center">
                {participant.hasPaid ? (
                  <span className="text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    Pagato
                  </span>
                ) : (
                  <span className="text-sm bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full">
                    Da pagare
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {pendingParticipants.length > 0 && (
            <>
              <h4 className="text-sm text-neutral-400 mb-2 mt-4">In attesa ({pendingParticipants.length})</h4>
              {pendingParticipants.map(participant => (
                <div key={participant.id} className="flex items-center justify-between py-3 border-b border-neutral-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-neutral-700 font-medium">
                        {participant.user?.name.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{participant.user?.name || 'Utente'}</p>
                      <p className="text-sm text-neutral-400">{participant.user?.email || participant.user?.username || ''}</p>
                    </div>
                  </div>
                  <span className="text-sm text-status-warning bg-status-warning/10 px-2 py-1 rounded-full">
                    In attesa
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
      
      <button className="mt-6 w-full py-3 border border-dashed border-neutral-300 rounded-lg text-neutral-500 flex items-center justify-center hover:bg-neutral-50">
        <i className="ri-user-add-line mr-2"></i>
        Invita altri amici
      </button>
    </div>
  );
};

export default ParticipantsList;
