import React from 'react';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const handleTabClick = (tab: string, path: string, implemented: boolean = true) => {
    if (implemented) {
      onTabChange(tab);
      navigate(path);
    } else {
      // Mostra un toast per le funzionalità non ancora implementate
      toast({
        title: "Funzionalità in arrivo",
        description: "Questa sezione sarà disponibile presto!",
        variant: "default"
      });
    }
  };

  return (
    <nav className="bg-white shadow-lg py-3 px-4 fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-screen-xl mx-auto flex justify-between">
        <button 
          onClick={() => handleTabClick('home', '/', true)}
          className={`flex flex-col items-center ${activeTab === 'home' ? 'text-primary' : 'text-neutral-400'}`}
        >
          <i className={`ri-home-${activeTab === 'home' ? '5' : '3'}-line text-xl`}></i>
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button 
          onClick={() => handleTabClick('calendar', '/calendar', true)}
          className={`flex flex-col items-center ${activeTab === 'calendar' ? 'text-primary' : 'text-neutral-400'}`}
        >
          <i className="ri-calendar-line text-xl"></i>
          <span className="text-xs mt-1">Calendario</span>
        </button>
        
        <Link href="/events/create">
          <button className="flex flex-col items-center bg-primary text-white p-3 rounded-full -mt-6 shadow-md">
            <i className="ri-add-line text-2xl"></i>
          </button>
        </Link>
        
        <button 
          onClick={() => handleTabClick('payments', '/', false)}
          className={`flex flex-col items-center ${activeTab === 'payments' ? 'text-primary' : 'text-neutral-400'}`}
        >
          <i className="ri-wallet-3-line text-xl"></i>
          <span className="text-xs mt-1">Pagamenti</span>
        </button>
        
        <button 
          onClick={() => handleTabClick('settings', '/', false)}
          className={`flex flex-col items-center ${activeTab === 'settings' ? 'text-primary' : 'text-neutral-400'}`}
        >
          <i className="ri-settings-3-line text-xl"></i>
          <span className="text-xs mt-1">Impostazioni</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavigation;
