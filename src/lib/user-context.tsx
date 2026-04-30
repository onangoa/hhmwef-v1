'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, getUser, setUserOnly, removeUser } from './auth-client';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getUser();
    setUserState(storedUser);
  }, []);

  const setUser = (newUser: User | null) => {
    if (newUser) {
      setUserOnly(newUser);
      setUserState(newUser);
    } else {
      removeUser();
      setUserState(null);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}