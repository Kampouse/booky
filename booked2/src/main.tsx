import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/styles/globals.css';
import App from '@/App';

// Configure React Query with blockchain-optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default (blockchain data is relatively static)
      staleTime: 5 * 60 * 1000,
      // Keep cached data in memory for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Don't refetch on window focus to reduce blockchain RPC calls
      refetchOnWindowFocus: false,
      // Retry failed requests 1 time (we have retry logic in bookyContract)
      retry: 1,
      // Refetch when connection is re-established
      refetchOnReconnect: true,
      // Background refetching interval (set to null to disable by default)
      refetchInterval: null,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
}
