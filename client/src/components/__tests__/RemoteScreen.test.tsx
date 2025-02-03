import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RemoteScreen from '../RemoteScreen';
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
  }),
}));

vi.mock('../../hooks/useYouTubeSearch', () => ({
  useYouTubeSearch: () => ({
    results: [],
    loading: false,
    search: vi.fn(),
  }),
}));

describe('RemoteScreen', () => {
  const renderComponent = () => {
    return renderWithProviders(
      <MemoryRouter initialEntries={['/remote/test-room-id']}>
        <Routes>
          <Route path="/remote/:roomId" element={<RemoteScreen />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders search input and button', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/search for songs/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('handles search input change', () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/search for songs/i);
    fireEvent.change(input, { target: { value: 'test song' } });
    expect(input).toHaveValue('test song');
  });

  it('shows loading state during search', async () => {
    vi.mock('../../hooks/useYouTubeSearch', () => ({
      useYouTubeSearch: () => ({
        results: [],
        loading: true,
        search: vi.fn(),
      }),
    }));

    renderComponent();
    expect(screen.getByRole('button', { name: /search/i })).toHaveAttribute('disabled');
  });

  it('displays search results', () => {
    vi.mock('../../hooks/useYouTubeSearch', () => ({
      useYouTubeSearch: () => ({
        results: [
          { id: '1', title: 'Test Song 1', thumbnail: 'thumb1.jpg' },
          { id: '2', title: 'Test Song 2', thumbnail: 'thumb2.jpg' },
        ],
        loading: false,
        search: vi.fn(),
      }),
    }));

    renderComponent();
    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Test Song 2')).toBeInTheDocument();
  });
}); 