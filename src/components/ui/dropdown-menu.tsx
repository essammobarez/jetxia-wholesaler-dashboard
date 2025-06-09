// /src/components/ui/dropdown-menu.tsx
import React from 'react';

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  return <div className="dropdown-menu">{children}</div>;
};

export const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="dropdown-menu-content">{children}</div>;
};

export const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="dropdown-menu-group">{children}</div>;
};

// Add other exports like DropdownMenuItem, DropdownMenuTrigger, etc., if you need them.
