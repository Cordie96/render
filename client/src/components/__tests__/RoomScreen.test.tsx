import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RoomScreen from '../RoomScreen';
import { renderWithProviders } from '../../test/utils';

// Mock hooks
vi.mock('../../hooks/useSocket', () => ({
  useSocket: () => ({
    socket: { emit: vi.fn() },
  }),
}));

vi.mock('../../hooks/useQueueManagement', () => ({
  useQueueManagement: () => ({
    queue: [],
    currentItem: null,
    loading: false,
    addToQueue: vi.fn(),
    removeFromQueue: vi.fn(),
    reorderQueue: vi.fn(),
  }),
}));

vi.mock('../../contexts/RoomContext', () => ({
  useRoom: () => ({
    room: { id: 'test-room', name: 'Test Room' },
    isHost: true,
    loading: false,
  }),
}));

describe('RoomScreen', () => {
  const renderComponent = () => {
    return renderWithProviders(
      <MemoryRouter initialEntries={['/screen/test-room-id']}>
        <Routes>
          <Route path="/screen/:roomId" element={<RoomScreen />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders room name', () => {
    renderComponent();
    expect(screen.getByText('Test Room')).toBeInTheDocument();
  });

  it('shows QR code for host', () => {
    renderComponent();
    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
  });

  it('handles player state changes', () => {
    const mockEmit = vi.fn();
    vi.mock('../../hooks/useSocket', () => ({
      useSocket: () => ({
        socket: { emit: mockEmit },
      }),
    }));

    renderComponent();
    const player = screen.getByTestId('youtube-player');
    
    // Simulate play
    fireEvent.click(screen.getByText('Play'));
    expect(mockEmit).toHaveBeenCalledWith('player-command', {
      roomId: 'test-room-id',
      command: 'play',
    });

    // Simulate pause
    fireEvent.click(screen.getByText('Pause'));
    expect(mockEmit).toHaveBeenCalledWith('player-command', {
      roomId: 'test-room-id',
      command: 'pause',
    });
  });

  it('shows loading state when queue is loading', () => {
    vi.mock('../../hooks/useQueueManagement', () => ({
      useQueueManagement: () => ({
        queue: [],
        currentItem: null,
        loading: true,
        addToQueue: vi.fn(),
        removeFromQueue: vi.fn(),
        reorderQueue: vi.fn(),
      }),
    }));

    renderComponent();
    expect(screen.getByText('Loading queue...')).toBeInTheDocument();
  });
}); 