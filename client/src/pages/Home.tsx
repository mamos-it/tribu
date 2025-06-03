
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Modifica questa esportazione da default a named export
export async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <ul>
      {todos?.map((todo) => (
        <li>{todo}</li>
      ))}
    </ul>
  )
}


import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import EventCard from '@/components/EventCard';
import PendingSection, { PendingAction } from '@/components/PendingSection';
import { requestNotificationPermission } from '@/lib/notifications';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';

interface HomeProps {
  userId: number;
}

// Definiamo un tipo più preciso per l'evento
interface EventData {
  id: number;
  name: string;
  date: string | null;
  location: string | null;
  createdBy: number;
  participants: {
    userId: number;
    status: 'confirmed' | 'pending';
  }[];
  totalBudget?: number;
  emoji?: string;
}

const Home: React.FC<HomeProps> = ({ userId }) => {
  const queryClient = useQueryClient();
  const supabase = createSupabaseClient();
  
  useEffect(() => {
    requestNotificationPermission();
    
    // Recupera eventi direttamente da Supabase
    const fetchEvents = async () => {
      try {
        console.log('Recupero eventi da Supabase per userId:', userId);
        const { data, error } = await supabase
          .from('events')
          .select('*');
          
        if (error) {
          console.error('Errore nel recupero eventi:', error);
          return;
        }
        
        console.log('Eventi recuperati da Supabase:', data);
        
        // Aggiorna la cache di React Query
        queryClient.setQueryData([`/api/events?userId=${userId}`], data);
      } catch (err) {
        console.error('Errore nella chiamata Supabase:', err);
      }
    };
    
    if (userId) {
      fetchEvents();
    }
  }, [userId, supabase, queryClient]);

  // Fetch degli eventi con refetch automatico
  const { data: events = [], isLoading: eventsLoading, refetch } = useQuery<EventData[]>({
    queryKey: [`/api/events?userId=${userId}`],
    enabled: !!userId,
    staleTime: 30000, // 30 secondi
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Log per debug
  useEffect(() => {
    console.log('Eventi nella cache di React Query:', events);
  }, [events]);

  // Azioni pendenti (se necessario)
  const pendingActions: PendingAction[] = [];

  return (
    <div className="px-4 max-w-screen-xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold font-heading mb-1">Le tue feste</h2>
          <p className="text-neutral-400">Organizza e gestisci i tuoi eventi</p>
        </div>
        <Link href="/events/create">
          <button className="mt-4 sm:mt-0 flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <i className="ri-add-line mr-2"></i>
            Crea una festa
          </button>
        </Link>
      </div>

      {/* Sezione Eventi */}
      <section className="mb-10">
        <h3 className="text-lg font-medium mb-4">Tutti gli eventi</h3>
        
        {eventsLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-primary/10 rounded-xl shadow-sm p-8 text-center border-2 border-primary/20">
            <div className="bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2 text-primary-dark">Nessun evento trovato</h3>
            <p className="text-neutral-600 mb-6">Crea il tuo primo evento!</p>
            <Link href="/events/create">
              <button className="flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors mx-auto shadow-md">
                <i className="ri-add-line mr-2"></i>
                Crea evento
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => {
              // Determina il ruolo dell'utente per questo evento
              let userRoleStatus: 'Organizzatore' | 'Parteciperai' | 'In Attesa' | null = null;
              
              if (event.createdBy === userId) {
                userRoleStatus = 'Organizzatore';
              } else {
                const participantInfo = event.participants?.find(p => p.userId === userId);
                if (participantInfo) {
                  userRoleStatus = participantInfo.status === 'confirmed' ? 'Parteciperai' : 'In Attesa';
                }
              }
              
              return (
                <EventCard
                  key={event.id}
                  id={event.id}
                  name={event.name}
                  date={event.date}
                  location={event.location || 'Luogo da definire'}
                  participants={event.participants || []}
                  budget={event.totalBudget || 0}
                  userRoleStatus={userRoleStatus}
                  emoji={event.emoji}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Pulsante per forzare il refresh */}
      <div className="text-center mb-10">
        <button 
          onClick={() => {
            refetch();
            // Forza anche il recupero diretto da Supabase
            supabase
              .from('events')
              .select('*')
              .eq('createdBy', userId)
              .then(({ data }) => {
                if (data) {
                  queryClient.setQueryData([`/api/events?userId=${userId}`], data);
                }
              });
          }} 
          className="text-primary hover:text-primary-dark flex items-center justify-center mx-auto"
        >
          <i className="ri-refresh-line mr-2"></i>
          Aggiorna eventi
        </button>
      </div>

      {/* Sezione azioni pendenti */}
      {pendingActions.length > 0 && (
        <PendingSection actions={pendingActions} />
      )}
    </div>
  );
};

export default Home;
