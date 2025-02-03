import { render, screen } from '@testing-library/react';
import LoadingScreen from '../LoadingScreen';

describe('LoadingScreen', () => {
  it('renders with default message', () => {
    render(<LoadingScreen />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingScreen message="Custom loading message" />);
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('renders loader component', () => {
    render(<LoadingScreen />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('centers content vertically and horizontally', () => {
    const { container } = render(<LoadingScreen />);
    const centerElement = container.firstChild;
    expect(centerElement).toHaveStyle({
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });
}); 