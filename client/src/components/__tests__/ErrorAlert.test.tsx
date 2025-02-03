import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorAlert from '../ErrorAlert';

describe('ErrorAlert', () => {
  it('renders error message', () => {
    render(<ErrorAlert error="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<ErrorAlert error="Test error" onClose={onClose} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('does not show close button when onClose is not provided', () => {
    render(<ErrorAlert error="Test error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders with custom styles', () => {
    const { container } = render(<ErrorAlert error="Test error" />);
    const alert = container.firstChild;
    expect(alert).toHaveStyle({
      backgroundColor: expect.any(String),
      padding: expect.any(String),
      borderRadius: expect.any(String),
    });
  });

  it('matches snapshot with error message', () => {
    const { container } = render(
      <ErrorAlert error="Test error message" />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with close button', () => {
    const { container } = render(
      <ErrorAlert error="Test error message" onClose={() => {}} />
    );
    expect(container).toMatchSnapshot();
  });
}); 