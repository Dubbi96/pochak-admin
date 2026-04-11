import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SidebarContextType {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  toggle: () => void;
  collapse: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  expanded: true,
  setExpanded: () => {},
  toggle: () => {},
  collapse: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1279px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setExpanded(!e.matches);
    };
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = () => setExpanded((p) => !p);
  const collapse = () => setExpanded(false);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggle, collapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
