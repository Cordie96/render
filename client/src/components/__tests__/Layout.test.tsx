import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderWithProviders = (children: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Layout', () => {
  it('renders children content', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders app title', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Karaoke Party')).toBeInTheDocument();
  });

  it('shows user info when logged in', () => {
    // Mock user in AuthContext
    vi.mock('../../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: { username: 'testuser' },
        logout: vi.fn(),
      }),
    }));

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('handles logout click', () => {
    const mockLogout = vi.fn();
    
    // Mock user in AuthContext
    vi.mock('../../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: { username: 'testuser' },
        logout: mockLogout,
      }),
    }));

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    fireEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
  });
}); 