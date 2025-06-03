import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { format, addDays, isEqual, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateOption {
  id: number;
  eventId: number;
  date: string;
  votes: number;
}

interface UserVote {
  dateOptionId: number;
  date: string;
  hasVoted: boolean;
  voteId?: number;
}

interface DateVotingProps {
  dateOptions: DateOption[];
  userVotes: UserVote[];
  eventId: number;
  userId: number;
}

const DateVoting: React.FC<DateVotingProps> = ({ dateOptions, userVotes, eventId, userId }) => {
  const { toast } = useToast();
  const [newDate, setNewDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [viewMode, setViewMode] = useState('list');

  const formatDateOption = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE d MMMM, HH:mm', { locale: it });
  };
  
  const handleAddDateOption = async () => {
    let finalDate: Date;
    
    if (selectedDate) {
      // Combine selected date with selected time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      finalDate = new Date(selectedDate);
      finalDate.setHours(hours, minutes);
    } else if (newDate) {
      finalDate = new Date(newDate);
    } else {
      toast({
        title: "Errore",
        description: "Scegli una data e un orario",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await apiRequest('POST', '/api/date-options', {
        eventId,
        date: finalDate.toISOString(),
        votes: 0
      });
      
      toast({
        title: "Data aggiunta",
        description: "Opzione di data aggiunta con successo"
      });
      
      setNewDate('');
      setSelectedDate(undefined);
      setSelectedTime('19:00');
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/date-options`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/user/${userId}/votes`] });
      
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere l'opzione di data",
        variant: "destructive"
      });
    }
  };
  
  const handleVote = async (dateOptionId: number) => {
    try {
      await apiRequest('POST', '/api/date-votes', {
        dateOptionId,
        userId
      });
      
      toast({
        title: "Voto registrato",
        description: "Il tuo voto è stato registrato"
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/date-options`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/user/${userId}/votes`] });
      
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile registrare il voto",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveVote = async (voteId?: number) => {
    if (!voteId) return;
    
    try {
      await apiRequest('DELETE', `/api/date-votes/${voteId}`);
      
      toast({
        title: "Voto rimosso",
        description: "Il tuo voto è stato rimosso"
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/date-options`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/user/${userId}/votes`] });
      
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile rimuovere il voto",
        variant: "destructive"
      });
    }
  };

  // Get all unique dates (without time) for calendar view
  const uniqueDates = dateOptions.reduce<Date[]>((acc, option) => {
    const date = new Date(option.date);
    date.setHours(0, 0, 0, 0);
    
    if (!acc.some(d => isSameDay(d, date))) {
      acc.push(date);
    }
    
    return acc;
  }, []);
  
  // Group options by date for calendar view
  const optionsByDate = dateOptions.reduce<Record<string, DateOption[]>>((acc, option) => {
    const dateKey = format(new Date(option.date), 'yyyy-MM-dd');
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    
    acc[dateKey].push(option);
    
    return acc;
  }, {});
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-medium">Date proposte</h3>
        <div className="flex items-center gap-3">
          <Tabs defaultValue="list" className="w-auto" onValueChange={setViewMode} value={viewMode}>
            <TabsList className="bg-neutral-100">
              <TabsTrigger value="list" className="text-xs">
                <i className="ri-list-check mr-1"></i>
                Lista
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs">
                <i className="ri-calendar-line mr-1"></i>
                Calendario
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-sm text-primary font-medium flex items-center">
                <i className="ri-add-line mr-1"></i>
                Proponi data
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Proponi una nuova data</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <Tabs defaultValue="calendar">
                  <TabsList className="mb-4">
                    <TabsTrigger value="calendar">
                      <i className="ri-calendar-line mr-1"></i>
                      Calendario
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                      <i className="ri-input-method-line mr-1"></i>
                      Manuale
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="calendar">
                    <div className="flex flex-col space-y-4">
                      <div>
                        <Label>Seleziona giorno</Label>
                        <div className="mt-1 border rounded-md p-3">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={it}
                            className="mx-auto"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="time-picker">Seleziona orario</Label>
                        <div className="grid grid-cols-4 gap-2 mt-1">
                          {['10:00', '12:00', '15:00', '17:00', '19:00', '20:00', '20:30', '21:00'].map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={`px-2 py-1 text-sm rounded-md ${
                                selectedTime === time 
                                  ? 'bg-primary text-white' 
                                  : 'bg-neutral-100 hover:bg-neutral-200'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="manual">
                    <div className="grid gap-2">
                      <Label htmlFor="new-date">Data e ora</Label>
                      <Input 
                        id="new-date" 
                        type="datetime-local" 
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Annulla</Button>
                </DialogClose>
                <Button onClick={handleAddDateOption}>Aggiungi</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {dateOptions.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-lg">
          <div className="text-5xl mb-3">📅</div>
          <h4 className="font-medium mb-1 text-neutral-600">Nessuna data proposta</h4>
          <p className="text-sm text-neutral-500 mb-3">Aggiungi una nuova data per questo evento</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <i className="ri-add-line mr-1"></i>
                Proponi data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Proponi una nuova data</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-date-empty">Data e ora</Label>
                  <Input 
                    id="new-date-empty" 
                    type="datetime-local"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Annulla</Button>
                </DialogClose>
                <Button onClick={handleAddDateOption}>Aggiungi</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {dateOptions.map(option => {
            const userVote = userVotes.find(v => v.dateOptionId === option.id);
            const hasVoted = userVote?.hasVoted || false;
            
            return (
              <div key={option.id} className={`rounded-lg p-4 border ${hasVoted ? 'border-primary bg-primary/5' : 'bg-neutral-100 border-transparent'}`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{formatDateOption(option.date)}</h4>
                  <span className="text-sm font-medium">{option.votes} {option.votes === 1 ? 'voto' : 'voti'}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${option.votes > 0 ? (option.votes / Math.max(...dateOptions.map(o => o.votes))) * 100 : 0}%` }}
                  ></div>
                </div>
                {hasVoted ? (
                  <button 
                    onClick={() => handleRemoveVote(userVote?.voteId)}
                    className="w-full py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20"
                  >
                    <i className="ri-check-line mr-1"></i>
                    Hai votato
                  </button>
                ) : (
                  <button 
                    onClick={() => handleVote(option.id)}
                    className="w-full py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg font-medium"
                  >
                    Vota questa data
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border rounded-lg">
          <div className="p-3 border-b">
            <Calendar
              mode="single"
              selected={undefined}
              onSelect={() => {}}
              locale={it}
              modifiers={{
                highlighted: uniqueDates
              }}
              modifiersStyles={{
                highlighted: {
                  backgroundColor: 'rgba(255, 165, 0, 0.15)',
                  color: 'currentColor',
                  fontWeight: '500'
                }
              }}
              className="mx-auto"
            />
          </div>
          <div className="p-4">
            <h4 className="font-medium text-sm text-neutral-500 mb-3">Date proposte</h4>
            <div className="grid gap-3">
              {Object.entries(optionsByDate).map(([dateKey, options]) => {
                const formattedDay = format(new Date(dateKey), 'EEEE d MMMM', { locale: it });
                const totalVotes = options.reduce((acc, opt) => acc + opt.votes, 0);
                
                return (
                  <div key={dateKey} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-sm">{formattedDay}</h5>
                      <span className="text-xs bg-neutral-100 px-2 py-1 rounded-full">
                        {totalVotes} {totalVotes === 1 ? 'voto' : 'voti'} totali
                      </span>
                    </div>
                    <div className="grid gap-2">
                      {options.map(option => {
                        const userVote = userVotes.find(v => v.dateOptionId === option.id);
                        const hasVoted = userVote?.hasVoted || false;
                        const time = format(new Date(option.date), 'HH:mm');
                        
                        return (
                          <div 
                            key={option.id} 
                            className={`flex items-center justify-between p-2 rounded-md text-sm ${
                              hasVoted 
                                ? 'bg-primary/10 border border-primary/20' 
                                : 'bg-neutral-50 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className={`${hasVoted ? 'text-primary' : 'text-neutral-700'} font-medium`}>{time}</span>
                              {hasVoted && <i className="ri-check-line ml-1 text-primary"></i>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{option.votes} {option.votes === 1 ? 'voto' : 'voti'}</span>
                              {hasVoted ? (
                                <button
                                  onClick={() => handleRemoveVote(userVote?.voteId)}
                                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md hover:bg-primary/20"
                                >
                                  Rimuovi voto
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleVote(option.id)}
                                  className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200"
                                >
                                  Vota
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      <Dialog>
        <DialogTrigger asChild>
          <button className="mt-6 w-full py-3 border border-dashed border-neutral-300 rounded-lg text-neutral-500 flex items-center justify-center hover:bg-neutral-50">
            <i className="ri-add-line mr-2"></i>
            Proponi una nuova data
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Proponi una nuova data</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-date-modal">Data e ora</Label>
              <Input 
                id="new-date-modal" 
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Annulla</Button>
            </DialogClose>
            <Button onClick={handleAddDateOption}>Aggiungi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DateVoting;
