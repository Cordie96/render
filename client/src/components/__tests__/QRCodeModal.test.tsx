import { render, screen } from '@testing-library/react';
import QRCodeModal from '../modals/QRCodeModal';

describe('QRCodeModal', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    opened: true,
    onClose: mockOnClose,
    roomId: 'test-room-123',
    roomName: 'Test Room',
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
      },
      writable: true,
    });
  });

  it('renders modal with room information', () => {
    render(<QRCodeModal {...defaultProps} />);

    expect(screen.getByText(/join test room/i)).toBeInTheDocument();
    expect(screen.getByText(/or share this link/i)).toBeInTheDocument();
    expect(screen.getByText('http://localhost:3000/remote/test-room-123')).toBeInTheDocument();
  });

  it('renders QR code with correct value', () => {
    render(<QRCodeModal {...defaultProps} />);

    const qrCode = screen.getByRole('img');
    expect(qrCode).toHaveAttribute(
      'value',
      'http://localhost:3000/remote/test-room-123'
    );
  });

  it('does not render when closed', () => {
    render(<QRCodeModal {...defaultProps} opened={false} />);

    expect(screen.queryByText(/join test room/i)).not.toBeInTheDocument();
  });
}); 