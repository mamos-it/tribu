import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';

interface CalendarProps {
  userId: number;
}

const Calendar: React.FC<CalendarProps> = ({ userId }) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  // Fetch user's events
  const { data: events = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/events?userId=${userId}`],
    enabled: !!userId,
    // Aggiungi gestione errori
    onError: (error) => console.error("Errore nel fetch eventi:", error)
  });

  // Funzione per evidenziare i giorni con eventi
  const eventDays = events.reduce((acc: { [key: string]: any[] }, event) => {
    if (event.date) {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
    }
    return acc;
  }, {});

  // Funzione per gestire il click su un giorno
  const handleDayClick = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayEvents = eventDays[dateKey] || [];

    if (dayEvents.length > 0) {
      // Se ci sono eventi in questo giorno, naviga al primo evento
      navigate(`/events/${dayEvents[0].id}`);
    }
  };

  // Funzione per personalizzare lo stile dei giorni con eventi
  const modifiersStyles = {
    hasEvent: {
      backgroundColor: 'rgba(var(--primary) / 0.1)',
      color: 'rgb(var(--primary))',
      fontWeight: 'bold'
    }
  };

  // Funzione per determinare quali giorni hanno eventi
  const modifiers = {
    hasEvent: (date: Date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return dateKey in eventDays;
    }
  };

  useEffect(() => {
    console.log("Eventi ricevuti:", events);
  }, [events]);

  return (
    <div className="px-4 max-w-screen-xl mx-auto pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading mb-1">Calendario Eventi</h2>
        <p className="text-neutral-400">Visualizza e gestisci i tuoi eventi</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={it}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          onDayClick={handleDayClick}
          className="mx-auto"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default Calendar;