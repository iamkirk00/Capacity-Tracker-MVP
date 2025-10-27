
import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [userKey, setUserKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSetUserKey = useCallback((key: string) => {
    setUserKey(key);
    window.location.hash = `#/user/${key}`;
  }, []);

  const handleLogout = useCallback(() => {
    setUserKey(null);
    window.location.hash = '';
  }, []);
  
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/user\/(0x[a-fA-F0-9]+)$/);
      if (match && match[1]) {
        if (match[1] !== userKey) {
            setUserKey(match[1]);
        }
      } else if (userKey) {
        setUserKey(null);
      }
      setIsLoading(false);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [userKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="text-brand-text text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      {userKey ? (
        <Dashboard userKey={userKey} onLogout={handleLogout} />
      ) : (
        <Login onSetUserKey={handleSetUserKey} />
      )}
    </div>
  );
};

export default App;
