import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { RoomProvider } from '../contexts/RoomContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <AuthProvider>
          <RoomProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </RoomProvider>
        </AuthProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { render }; 