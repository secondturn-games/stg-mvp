import React from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // For now, just render children
  // We'll integrate Clerk provider once we have the actual setup
  return <>{children}</>;
}
