import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthForm from '../auth/AuthForm';

const mockOnSubmit = jest.fn();

describe('AuthForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <AuthForm type="login" onSubmit={mockOnSubmit} />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('renders register form correctly', () => {
    render(
      <BrowserRouter>
        <AuthForm type="register" onSubmit={mockOnSubmit} />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <BrowserRouter>
        <AuthForm type="login" onSubmit={mockOnSubmit} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(
      <BrowserRouter>
        <AuthForm type="login" onSubmit={mockOnSubmit} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(
      <BrowserRouter>
        <AuthForm type="login" onSubmit={mockOnSubmit} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows error message when provided', () => {
    render(
      <BrowserRouter>
        <AuthForm 
          type="login" 
          onSubmit={mockOnSubmit} 
          error={new Error('Test error')} 
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('disables form submission while loading', () => {
    render(
      <BrowserRouter>
        <AuthForm type="login" onSubmit={mockOnSubmit} loading={true} />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });
}); 