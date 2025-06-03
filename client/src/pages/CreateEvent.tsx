import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { notifyEventUpdate } from '@/lib/notifications';

interface CreateEventProps {
  userId: number;
}

const CreateEvent: React.FC<CreateEventProps> = ({ userId }) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    budget: '',
    isBudgetPerPerson: false
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id.replace('event-', '')]: value
    });
  };
  
  const handleBudgetTypeChange = (type: boolean) => {
    setFormData({
      ...formData,
      isBudgetPerPerson: type
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Errore",
        description: "Il nome dell'evento è obbligatorio",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Assicuriamoci che tutti i campi siano nel formato corretto
      const eventData = {
        name: formData.name,
        description: formData.description || "",
        location: formData.location || "",
        date: formData.date ? new Date(formData.date).toISOString() : null,
        createdBy: userId,
        totalBudget: formData.isBudgetPerPerson ? 0 : (parseFloat(formData.budget) || 0),
        budgetPerPerson: formData.isBudgetPerPerson ? (parseFloat(formData.budget) || 0) : 0,
        isBudgetPerPerson: formData.isBudgetPerPerson,
        status: 'planning'
      };
      
      console.log("Inviando dati evento:", eventData);
      const response = await apiRequest('POST', '/api/events', eventData);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Errore API:", errorData);
        throw new Error(errorData.message || "Errore nella creazione dell'evento");
      }
      
      const newEvent = await response.json();
      
      toast({
        title: "Evento creato",
        description: "La tua festa è stata creata con successo"
      });
      
      // Send notification
      notifyEventUpdate(newEvent.name, "Evento creato", "La tua nuova festa è stata creata");
      
      // Invalidate events query to refresh the list
      // Assicurati che la chiave corrisponda a quella usata in Home.tsx
      queryClient.invalidateQueries({ queryKey: [`/api/events?userId=${userId}`] });
      
      // Navigate to event detail
      navigate(`/events/${newEvent.id}`);
      
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare l'evento",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };
  
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
          <h2 className="text-2xl font-bold font-heading">Crea una festa</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="event-name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Nome evento*
                </label>
                <input 
                  type="text" 
                  id="event-name" 
                  placeholder="Es. Compleanno di Marco" 
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="mb-5">
                <label htmlFor="event-date" className="block text-sm font-medium text-neutral-700 mb-1">
                  Data e ora
                </label>
                <input 
                  type="datetime-local" 
                  id="event-date" 
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="mb-5">
                <label htmlFor="event-location" className="block text-sm font-medium text-neutral-700 mb-1">
                  Luogo
                </label>
                <input 
                  type="text" 
                  id="event-location" 
                  placeholder="Es. Casa mia, Milano" 
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="mb-5">
                <label htmlFor="event-description" className="block text-sm font-medium text-neutral-700 mb-1">
                  Descrizione
                </label>
                <textarea 
                  id="event-description" 
                  rows={3} 
                  placeholder="Di cosa si tratta?" 
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="mb-5">
                <label htmlFor="event-budget" className="block text-sm font-medium text-neutral-700 mb-1">
                  Budget stimato
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">€</span>
                  <input 
                    type="number" 
                    id="event-budget" 
                    placeholder="0.00" 
                    className="w-full pl-10 px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                    value={formData.budget}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Tipo di budget
                </label>
                <div className="flex gap-3">
                  <label className={`
                    flex-1 border rounded-lg p-3 cursor-pointer hover:border-primary
                    ${!formData.isBudgetPerPerson ? 'border-primary' : 'border-neutral-200'}
                  `}>
                    <input 
                      type="radio" 
                      name="budget-type" 
                      className="sr-only" 
                      checked={!formData.isBudgetPerPerson}
                      onChange={() => handleBudgetTypeChange(false)}
                    />
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-neutral-300 rounded-full mr-2 flex items-center justify-center">
                        <div className={`w-3 h-3 rounded-full ${!formData.isBudgetPerPerson ? 'bg-primary' : 'bg-transparent'}`}></div>
                      </div>
                      <span>Totale</span>
                    </div>
                  </label>
                  <label className={`
                    flex-1 border rounded-lg p-3 cursor-pointer hover:border-primary
                    ${formData.isBudgetPerPerson ? 'border-primary' : 'border-neutral-200'}
                  `}>
                    <input 
                      type="radio" 
                      name="budget-type" 
                      className="sr-only"
                      checked={formData.isBudgetPerPerson}
                      onChange={() => handleBudgetTypeChange(true)}
                    />
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-neutral-300 rounded-full mr-2 flex items-center justify-center">
                        <div className={`w-3 h-3 rounded-full ${formData.isBudgetPerPerson ? 'bg-primary' : 'bg-transparent'}`}></div>
                      </div>
                      <span>Per persona</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="mt-8">
                <button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-70"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creazione in corso...' : 'Crea evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;

// Dopo la creazione dell'evento
try {
  await apiRequest('POST', '/api/events', eventData);
  
  // Invalida la cache degli eventi
  queryClient.invalidateQueries({ queryKey: ['/api/events'] });
  
  // Naviga alla home
  navigate('/');
} catch (error) {
  console.error('Errore durante la creazione dell\'evento:', error);
}
