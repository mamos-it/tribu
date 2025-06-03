import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleNotificationClick = () => {
    toast({
      title: "Notifiche",
      description: "Le notifiche saranno disponibili presto!",
      variant: "default"
    });
  };

  const handleProfileClick = () => {
    toast({
      title: "Profilo",
      description: "Le impostazioni del profilo saranno disponibili presto!",
      variant: "default"
    });
  };
  
  const handleLogout = () => {
    // Rimuovi i dati di autenticazione
    localStorage.removeItem('userId');
    localStorage.removeItem('sessionTimestamp');
    
    toast({
      title: "Logout effettuato",
      description: "Hai effettuato il logout con successo"
    });
    
    // Reindirizza alla pagina di login
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm py-4 px-4 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <div className="w-8 h-8 mr-2 overflow-hidden">
              <img 
                src="/assets/logo.png" 
                alt="Tribù logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <h1 className="text-2xl font-bold font-heading text-neutral-800">
              <span className="text-primary">Tribù</span>
            </h1>
            <p className="text-sm text-neutral-400 hidden sm:block ml-3">La festa inizia qui</p>
          </div>
        </Link>
        <div className="flex items-center space-x-3">
          <button 
            className="bg-neutral-100 p-2 rounded-full hover:bg-neutral-200 transition-colors"
            onClick={handleNotificationClick}
          >
            <i className="ri-notification-3-line text-neutral-700"></i>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="bg-neutral-100 p-2 rounded-full hover:bg-neutral-200 transition-colors"
              >
                <i className="ri-user-line text-neutral-700"></i>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleProfileClick}>
                <i className="ri-user-settings-line mr-2"></i>
                Profilo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <i className="ri-logout-box-line mr-2"></i>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
