import React, { useState, useEffect } from 'react';

const SplashScreen: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="w-40 h-40 mb-4 animate-pulse">
        <img 
          src="/assets/logo.png" 
          alt="Tribù Logo" 
          className="w-full h-full object-contain" 
        />
      </div>
      <h1 className="text-2xl font-bold text-primary mt-4">Tribù</h1>
      <p className="text-neutral-500 mt-1">La festa inizia qui</p>
    </div>
  );
};

export default SplashScreen;