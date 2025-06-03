import React from 'react';
import { Link } from 'wouter';

export interface PendingAction {
  id: string;
  type: 'participation' | 'date' | 'payment';
  eventId: number;
  eventName: string;
  details: string;
  value?: string | number;
}

interface PendingSectionProps {
  actions: PendingAction[];
}

const PendingSection: React.FC<PendingSectionProps> = ({ actions }) => {
  if (actions.length === 0) return null;

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'participation':
        return <i className="ri-user-add-line text-primary"></i>;
      case 'date':
        return <i className="ri-calendar-line text-status-info"></i>;
      case 'payment':
        return <i className="ri-wallet-3-line text-status-error"></i>;
      default:
        return <i className="ri-question-line text-neutral-400"></i>;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'participation':
        return 'text-primary';
      case 'date':
        return 'text-status-info';
      case 'payment':
        return 'text-status-error';
      default:
        return 'text-neutral-400';
    }
  };

  const getActionBgColor = (type: string) => {
    switch (type) {
      case 'participation':
        return 'bg-primary/10';
      case 'date':
        return 'bg-status-info/10';
      case 'payment':
        return 'bg-status-error/10';
      default:
        return 'bg-neutral-100';
    }
  };

  const getButtonText = (type: string) => {
    switch (type) {
      case 'participation':
        return 'Conferma';
      case 'date':
        return 'Vota';
      case 'payment':
        return 'Paga';
      default:
        return 'Visualizza';
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-lg font-medium mb-4">Da completare</h3>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex justify-between items-center">
            <h4 className="font-bold">{actions[0].eventName}</h4>
            <span className="text-sm text-status-warning bg-status-warning/10 px-2 py-1 rounded-full">In attesa</span>
          </div>
        </div>
        
        <div className="p-4">
          {actions.map((action, index) => (
            <div 
              key={action.id}
              className={`flex items-center justify-between py-3 ${
                index < actions.length - 1 ? 'border-b border-neutral-200' : ''
              }`}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 ${getActionBgColor(action.type)} rounded-full flex items-center justify-center mr-3`}>
                  {getActionIcon(action.type)}
                </div>
                <div>
                  <p className="font-medium">
                    {action.type === 'participation' && 'Conferma partecipazione'}
                    {action.type === 'date' && 'Vota la data'}
                    {action.type === 'payment' && 'Pagamento quota'}
                  </p>
                  <p className="text-sm text-neutral-400">{action.details}</p>
                </div>
              </div>
              <Link href={`/events/${action.eventId}`}>
                <button className={`${getActionColor(action.type)} font-medium text-sm flex items-center`}>
                  {getButtonText(action.type)}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PendingSection;
