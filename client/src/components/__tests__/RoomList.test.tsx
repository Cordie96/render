import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../tests/utils';
import { server } from '../../tests/mocks/server';
import { rest } from 'msw';
import RoomList from '../RoomList';

const baseUrl = import.meta.env.VITE_API_URL;

describe('RoomList', () => {
  it('renders room list and allows creation of new room', async () => {
    render(<RoomList />);

    // Wait for rooms to load
    await waitFor(() => {
      expect(screen.getByText('Test Room')).toBeInTheDocument();
    });

    // Check if create button exists
    const createButton = screen.getByText('Create Room');
    expect(createButton).toBeInTheDocument();

    // Check room details
    expect(screen.getByText('Hosted by testuser')).toBeInTheDocument();
    expect(screen.getByText('2 participants')).toBeInTheDocument();
  });

  it('shows empty state when no rooms exist', async () => {
    // Override the handler to return empty array
    server.use(
      rest.get(`${baseUrl}/api/rooms`, (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );

    render(<RoomList />);

    await waitFor(() => {
      expect(screen.getByText('No active rooms. Create one to get started!')).toBeInTheDocument();
    });
  });

  it('handles error when fetching rooms fails', async () => {
    server.use(
      rest.get(`${baseUrl}/api/rooms`, (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<RoomList />);

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });

  it('handles room creation and navigation', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();

    render(<RoomList />, {
      wrapper: ({ children }) => (
        <TestWrapper navigate={navigate}>{children}</TestWrapper>
      ),
    });

    const createButton = screen.getByText('Create Room');
    await user.click(createButton);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/screen?roomId=new-room-id');
    });
  });

  it('handles room creation error', async () => {
    server.use(
      rest.post(`${baseUrl}/api/rooms`, (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const user = userEvent.setup();
    render(<RoomList />);

    const createButton = screen.getByText('Create Room');
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });
}); 