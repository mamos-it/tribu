import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';

const Login: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", { username, password });
      
      // Effettua una vera richiesta di login al server
      const response = await apiRequest('POST', '/api/login', {
        username,
        password
      });
      
      const data = await response.json();
      console.log("Login response:", data);
      
      // Salva l'ID utente e un token di sessione
      localStorage.setItem('userId', data.id.toString());
      localStorage.setItem('sessionTimestamp', Date.now().toString());
      
      toast({
        title: "Login effettuato",
        description: "Benvenuto su Tribù!"
      });
      
      // Aggiungiamo un breve ritardo prima della navigazione
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (error) {
      console.error("Errore durante il login:", error);
      toast({
        title: "Errore",
        description: "Credenziali non valide",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Effettua la richiesta di registrazione
      const response = await apiRequest('POST', '/api/users', {
        username,
        email,
        name,
        password // In a real app, this would be hashed
      });
      
      const data = await response.json();
      
      // Salva l'ID utente e un token di sessione
      localStorage.setItem('userId', data.id.toString());
      localStorage.setItem('sessionTimestamp', Date.now().toString());
      
      toast({
        title: "Account creato",
        description: "Benvenuto su Tribù!"
      });
      navigate('/');
    } catch (error) {
      console.error("Errore durante la registrazione:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare l'account. L'username potrebbe essere già in uso.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Reindirizza l'utente all'endpoint di autenticazione Google
    window.location.href = '/auth/google';
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 mb-6">
          <img 
            src="/assets/logo.png" 
            alt="Tribù Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-primary mb-1">Tribù</h1>
        <p className="text-neutral-500 mb-6">La festa inizia qui</p>
        
        <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-sm">
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 mb-6 bg-white border border-primary/50 rounded-lg overflow-hidden">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">Accedi</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-white">Registrati</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email o username</Label>
                  <Input 
                    id="email-login" 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="mario.rossi@email.com"
                    className="bg-white border-neutral-200 focus:border-primary focus:placeholder:opacity-0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password-login">Password</Label>
                    <a href="#" className="text-xs text-primary hover:underline">Password dimenticata?</a>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password-login" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-white border-neutral-200 focus:border-primary focus:placeholder:opacity-0 pr-10"
                      required
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <i className="ri-eye-off-line"></i>
                      ) : (
                        <i className="ri-eye-line"></i>
                      )}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Caricamento..." : "Accedi"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mario Rossi"
                    className="bg-white border-neutral-200 focus:border-primary focus:placeholder:opacity-0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="mariorossi"
                    className="bg-white border-neutral-200 focus:border-primary focus:placeholder:opacity-0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input 
                    id="email-signup" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mario.rossi@email.com"
                    className="bg-white border-neutral-200 focus:border-primary focus:placeholder:opacity-0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password-signup" 
                      type={showSignupPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-white border-neutral-200 focus:border-primary focus:placeholder:opacity-0 pr-10"
                      required
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? (
                        <i className="ri-eye-off-line"></i>
                      ) : (
                        <i className="ri-eye-line"></i>
                      )}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Caricamento..." : "Registrati"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-500">oppure</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" className="text-primary">
              <path
                fill="currentColor"
                d="M12 22Q10.15 22 8.5 21.288Q6.85 20.575 5.638 19.362Q4.425 18.15 3.712 16.5Q3 14.85 3 13Q3 11.15 3.712 9.5Q4.425 7.85 5.638 6.638Q6.85 5.425 8.5 4.712Q10.15 4 12 4Q13.6 4 15.088 4.575Q16.575 5.15 17.775 6.175L15.825 8.15Q15.0625 7.475 14.0625 7.088Q13.0625 6.7 12 6.7Q9.375 6.7 7.537 8.537Q5.7 10.375 5.7 13Q5.7 15.625 7.537 17.462Q9.375 19.3 12 19.3Q13.275 19.3 14.4 18.837Q15.525 18.375 16.225 17.525Q16.9 16.675 17.288 15.675Q17.675 14.675 17.675 13.5H12V11H21V13Q21 15.825 19.463 17.963Q17.925 20.1 15.5 21.05Q13.075 22 12 22Z"
              />
            </svg>
            Continua con Google
          </Button>
        </div>
      </div>
      
      <div className="text-center py-4 text-xs text-neutral-500">
        © 2025 Tribù. Tutti i diritti riservati.
      </div>
    </div>
  );
};

export default Login;