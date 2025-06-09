'use client';

import * as React from 'react';

const SidebarContext = React.createContext({ isOpen: false, toggle: () => {} });

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = useSidebar();
  return (
    <aside
      className={`transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      } bg-gray-100 dark:bg-gray-900 h-screen p-4`}
    >
      {children}
    </aside>
  );
};

export const SidebarTrigger = () => {
  const { toggle } = useSidebar();
  return (
    <button onClick={toggle} className="p-2">
      Toggle
    </button>
  );
};

export const SidebarInset = ({ children }: { children: React.ReactNode }) => (
  <div className="ml-64">{children}</div>
);
