import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface EventFeedItem {
  id: string;
  type: 'expense' | 'participant' | 'date' | 'payment' | 'announcement';
  timestamp: Date;
  user: {
    id: number;
    name: string;
  };
  content: string;
  metadata?: Record<string, any>;
}

interface EventFeedProps {
  eventId: number;
  items: EventFeedItem[];
}

const EventFeed: React.FC<EventFeedProps> = ({ eventId, items }) => {
  const sortedItems = [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'expense':
        return 'ri-money-euro-circle-line';
      case 'participant':
        return 'ri-user-add-line';
      case 'date':
        return 'ri-calendar-check-line';
      case 'payment':
        return 'ri-bank-card-line';
      case 'announcement':
        return 'ri-megaphone-line';
      default:
        return 'ri-notification-2-line';
    }
  };
  
  const getItemColor = (type: string) => {
    switch (type) {
      case 'expense':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'participant':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'date':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'payment':
        return 'bg-teal-50 text-teal-600 border-teal-100';
      case 'announcement':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  };
  
  const formatTimestamp = (date: Date) => {
    return format(date, 'dd MMM, HH:mm', { locale: it });
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b border-neutral-200 bg-primary/5">
        <h3 className="font-medium text-primary-dark">Attività dell'evento</h3>
      </div>
      
      <div className="p-4">
        {sortedItems.length === 0 ? (
          <div className="text-center py-6 text-neutral-500">
            Nessuna attività recente
          </div>
        ) : (
          <div className="space-y-4">
            {sortedItems.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-lg border ${getItemColor(item.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'announcement' ? 'bg-primary/20' : 'bg-white'}`}>
                    <i className={`${getIcon(item.type)} text-inherit`}></i>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{item.user.name}</div>
                      <div className="text-xs opacity-70">{formatTimestamp(item.timestamp)}</div>
                    </div>
                    <div className="mt-1">{item.content}</div>
                    
                    {item.type === 'expense' && item.metadata?.amount && (
                      <div className="mt-2 text-sm rounded-lg p-2 bg-white">
                        <span className="font-medium">€{item.metadata.amount.toFixed(2)}</span>
                        {' '}- {item.metadata.name}
                      </div>
                    )}
                    
                    {item.type === 'date' && item.metadata?.date && (
                      <div className="mt-2 text-sm rounded-lg p-2 bg-white">
                        {format(new Date(item.metadata.date), 'EEEE d MMMM, HH:mm', { locale: it })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFeed;