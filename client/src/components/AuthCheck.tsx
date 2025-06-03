import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface AuthCheckProps {
  children: React.ReactNode;
}

export function AuthCheck({ children }: AuthCheckProps) {
  const [, navigate] = useLocation();
  const userId = localStorage.getItem('userId');
  const sessionTimestamp = localStorage.getItem('sessionTimestamp');
  let authenticated = false;

  if (userId) {
    if (sessionTimestamp) {
      const timestamp = parseInt(sessionTimestamp);
      const now = Date.now();
      const sessionDuration = now - timestamp;
      if (sessionDuration <= 24 * 60 * 60 * 1000) {
        authenticated = true;
        localStorage.setItem('sessionTimestamp', now.toString());
      } else {
        localStorage.removeItem('userId');
        localStorage.removeItem('sessionTimestamp');
      }
    } else {
      authenticated = true;
      localStorage.setItem('sessionTimestamp', Date.now().toString());
    }
  }

  useEffect(() => {
    if (!authenticated) {
      navigate('/login');
    }
  }, [authenticated, navigate]);

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}