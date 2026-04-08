import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface NaverMapContextValue {
  isLoaded: boolean;
  error: string | null;
}

const NaverMapContext = createContext<NaverMapContextValue>({
  isLoaded: false,
  error: null,
});

export function useNaverMapLoaded() {
  return useContext(NaverMapContext);
}

const SCRIPT_ID = 'naver-map-sdk';

interface NaverMapProviderProps {
  clientId: string;
  children: ReactNode;
  submodules?: string[];
}

export default function NaverMapProvider({ clientId, children, submodules = [] }: NaverMapProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.naver?.maps) {
      setIsLoaded(true);
      return;
    }

    if (document.getElementById(SCRIPT_ID)) return;

    const submoduleParam = submodules.length > 0 ? `&submodules=${submodules.join(',')}` : '';
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}${submoduleParam}`;
    script.async = true;

    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Naver Maps SDK 로드에 실패했습니다.');

    document.head.appendChild(script);
  }, [clientId, submodules]);

  return (
    <NaverMapContext.Provider value={{ isLoaded, error }}>
      {children}
    </NaverMapContext.Provider>
  );
}
