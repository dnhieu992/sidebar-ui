import { createContext, useContext, type ReactNode } from 'react';
import type { SidebarContextValue } from '../types';

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebarContext(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('Sidebar components must be used within <Sidebar>');
  }
  return ctx;
}

export function SidebarProvider({
  children,
  ...value
}: SidebarContextValue & { children: ReactNode }) {
  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}
