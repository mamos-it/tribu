import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EventDetail from "@/pages/EventDetail";
import CreateEvent from "@/pages/CreateEvent";
import PaymentsSummary from "@/pages/PaymentsSummary";
import Calendar from "@/pages/Calendar";
import Login from "@/pages/Login";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import SplashScreen from "@/components/SplashScreen";
import { useState, useEffect } from "react";
import { AuthCheck } from "@/components/AuthCheck";

// Add Dashboard component if it doesn't exist
function Dashboard() {
  return <Home />;
}

function Router() {
  // Rimosso: const [location] = useLocation();
  // Rimosso: const navigate = useNavigate();
  // Rimosso: const [userId, setUserId] = useState<number | null>(null);
  // Rimosso: const [isLoading, setIsLoading] = useState(true);
  
  // Rimosso: useEffect per caricare userId da localStorage
  // Rimosso: useEffect per controllare l'autenticazione e reindirizzare
  // Rimosso: Controllo if (isLoading)
  
  // Recupera userId da localStorage dove necessario, o passalo diversamente
  const getUserId = () => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId) : undefined;
  };

  return (
    <Switch>
      <Route path="/">
        <AuthCheck>
          <Dashboard userId={getUserId() as number} />
        </AuthCheck>
      </Route>
      <Route path="/events/create">
        <AuthCheck>
          {getUserId() !== undefined ? (
            <CreateEvent userId={getUserId() as number} />
          ) : (
            <Login />
          )}
        </AuthCheck>
      </Route>
      <Route path="/calendar">
        <AuthCheck>
          {getUserId() !== undefined ? (
            <Calendar userId={getUserId() as number} />
          ) : (
            <Login />
          )}
        </AuthCheck>
      </Route>
      <Route path="/events/:id">
        {(params) => (
          <AuthCheck>
            {getUserId() !== undefined ? (
              <EventDetail eventId={parseInt(params.id)} userId={getUserId() as number} />
            ) : (
              <Login />
            )}
          </AuthCheck>
        )}
      </Route>
      <Route path="/events/:id/payments">
        {(params) => (
          <AuthCheck>
            <PaymentsSummary eventId={parseInt(params.id)} />
          </AuthCheck>
        )}
      </Route>
      <Route path="/login" component={Login} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [showSplash, setShowSplash] = useState(true);
  const [location] = useLocation();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Mostra solo lo splash screen se è attivo
  if (showSplash) {
    return <SplashScreen />;
  }
  
  // Don't show header or bottom nav on login page
  const isLoginPage = location === '/login';
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-800">
          {!isLoginPage && <Header />}
          
          <main className={`flex-grow ${!isLoginPage ? 'pt-20 pb-20' : ''}`}>
            <Router />
          </main>
          
          {!isLoginPage && <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />}
          
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
