import React from 'react';

export const Collapsible = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export const CollapsibleContent = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export const CollapsibleTrigger = ({ children }: { children: React.ReactNode }) => {
  return <button>{children}</button>;
};
