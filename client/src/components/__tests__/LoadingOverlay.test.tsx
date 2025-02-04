import { render, screen } from '@testing-library/react';
import LoadingOverlay from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  it('renders loading message', () => {
    render(<LoadingOverlay message="Test loading" />);
    expect(screen.getByText('Test loading')).toBeInTheDocument();
  });

  it('uses default message when none provided', () => {
    render(<LoadingOverlay />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
}); 