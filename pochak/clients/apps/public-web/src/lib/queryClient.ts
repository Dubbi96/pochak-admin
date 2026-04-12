import { QueryClient } from '@tanstack/react-query';

/** Shared cache: dedupes identical requests across routes and StrictMode remounts. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
