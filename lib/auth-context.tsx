'use client';
import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'operator' | 'admin' | 'safety_auditor';

interface User {
  name: string;
  role: UserRole;
  badgeId: string;
}

interface AuthContextType {
  user: User;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
}

const defaultUser: User = {
  name: 'Samarth Dubey',
  role: 'admin',
  badgeId: 'EMP-IOCL-9402',
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  setRole: () => {},
  isAdmin: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);

  const setRole = (role: UserRole) => {
    setUser((prev) => ({
      ...prev,
      role,
      name: role === 'admin' ? 'Plant Admin (Samarth)' : role === 'safety_auditor' ? 'Safety Inspector' : 'Field Operator',
    }));
  };

  return (
    <AuthContext.Provider value={{ user, setRole, isAdmin: user.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
