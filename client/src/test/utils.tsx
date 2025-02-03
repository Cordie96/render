import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { RoomProvider } from '../contexts/RoomContext';
import { MantineProvider } from '@mantine/core';
import { theme } from '../theme';

interface WrapperProps {
  children: React.ReactNode;
}

export const AllTheProviders = ({ children }: WrapperProps) => {
  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <BrowserRouter>
        <AuthProvider>
          <RoomProvider>
            {children}
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  );
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react'; 