import React from 'react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Assicurati che l'interfaccia Props corrisponda a quella definita in Home.tsx
interface EventCardProps {
  id: number;
  name: string;
  date: string | null;
  location: string;
  participants: any[]; // O un tipo più specifico
  budget: number;
  userRoleStatus: 'Organizzatore' | 'Parteciperai' | 'In Attesa' | null; // Accetta il nuovo prop
  emoji?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  name,
  date,
  location,
  participants,
  budget,
  userRoleStatus, // Usa il nuovo prop
  emoji
}) => {
  const formattedDate = date
    ? format(new Date(date), 'd MMM, HH:mm', { locale: it })
    : 'Data da definire';

  // Funzione helper per ottenere stile e testo del badge
  const getBadgeProps = () => {
    switch (userRoleStatus) {
      case 'Organizzatore':
        return { text: 'Organizzatore', className: 'bg-blue-100 text-blue-700' };
      case 'Parteciperai':
        return { text: 'Parteciperai', className: 'bg-green-100 text-green-700' };
      case 'In Attesa':
        return { text: 'In Attesa', className: 'bg-yellow-100 text-yellow-700' };
      default:
        return null; // Nessun badge se l'utente non è coinvolto o lo stato non è noto
    }
  };

  const badgeProps = getBadgeProps();

  return (
    <Link href={`/events/${id}`}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer h-full flex flex-col">
        <div className="p-5 flex-grow">
          <div className="flex justify-between items-start mb-3">
             <div className="text-3xl mb-2">{emoji || '🎉'}</div>
             {/* Visualizza il badge se presente */}
             {badgeProps && (
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeProps.className}`}>
                  {badgeProps.text}
                </span>
              )}
          </div>
          <h3 className="font-bold text-lg mb-1 truncate">{name}</h3>
          <div className="text-sm text-neutral-500 mb-1 flex items-center">
            <i className="ri-calendar-line mr-2"></i>
            {formattedDate}
          </div>
          <div className="text-sm text-neutral-500 mb-3 flex items-center">
            <i className="ri-map-pin-line mr-2"></i>
            {location}
          </div>
        </div>
        <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200 flex justify-between items-center">
           <div className="flex -space-x-2 overflow-hidden">
            {/* Mostra avatar partecipanti (esempio) */}
            {participants.slice(0, 4).map((p, index) => (
              <div key={p.id || index} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600">
                {/* Potresti usare le iniziali del nome qui */}
                {p.user?.name?.charAt(0) || '?'}
              </div>
            ))}
            {participants.length > 4 && (
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-neutral-300 flex items-center justify-center text-xs font-medium text-neutral-700">
                +{participants.length - 4}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-primary">
            €{budget.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
