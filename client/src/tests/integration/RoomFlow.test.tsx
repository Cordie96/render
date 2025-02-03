import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../mocks/server';
import App from '../../App';
import { createTestRoom } from '../utils/testHelpers';

describe('Room Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('completes full room creation and joining flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Login
    await user.click(screen.getByText(/login/i));
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Create room
    await waitFor(() => {
      expect(screen.getByText(/create room/i)).toBeInTheDocument();
    });
    await user.click(screen.getByText(/create room/i));

    // Verify room creation
    await waitFor(() => {
      expect(screen.getByText(/room created/i)).toBeInTheDocument();
    });

    // Search for a song
    const searchInput = screen.getByPlaceholderText(/search for songs/i);
    await user.type(searchInput, 'test song');
    await user.keyboard('{Enter}');

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('Test Song Karaoke Version')).toBeInTheDocument();
    });

    // Add song to queue
    await user.click(screen.getByText(/add to queue/i));

    // Verify song was added
    await waitFor(() => {
      expect(screen.getByText('Test Song Karaoke Version')).toBeInTheDocument();
    });
  });

  it('handles room joining through QR code', async () => {
    const user = userEvent.setup();
    const { roomId } = await createTestRoom();

    // Mock QR code scanning
    server.use(
      rest.post('/api/rooms/join', (req, res, ctx) => {
        return res(ctx.json({ roomId }));
      })
    );

    render(<App />);

    // Navigate to remote mode
    await user.click(screen.getByText(/remote mode/i));

    // Mock QR code scan
    await user.click(screen.getByText(/scan qr code/i));

    // Verify joined room
    await waitFor(() => {
      expect(screen.getByText(/connected to room/i)).toBeInTheDocument();
    });
  });

  it('synchronizes queue between devices', async () => {
    const user = userEvent.setup();
    const { roomId } = await createTestRoom();

    // Render two instances of the app
    const { container: screenApp } = render(<App />);
    const { container: remoteApp } = render(<App />);

    // Join room from both apps
    await user.click(within(screenApp).getByText(/screen mode/i));
    await user.click(within(remoteApp).getByText(/remote mode/i));

    // Add song from remote
    const searchInput = within(remoteApp).getByPlaceholderText(/search for songs/i);
    await user.type(searchInput, 'test song');
    await user.keyboard('{Enter}');
    await user.click(within(remoteApp).getByText(/add to queue/i));

    // Verify song appears in both apps
    await waitFor(() => {
      expect(within(screenApp).getByText('Test Song Karaoke Version')).toBeInTheDocument();
      expect(within(remoteApp).getByText('Test Song Karaoke Version')).toBeInTheDocument();
    });
  });
}); 