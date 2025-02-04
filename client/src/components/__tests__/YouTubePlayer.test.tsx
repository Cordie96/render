import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import YouTubePlayer from '../player/YouTubePlayer';

// Mock YouTube iframe API
const mockYT = {
  Player: vi.fn(() => ({
    loadVideoById: vi.fn(),
    playVideo: vi.fn(),
    pauseVideo: vi.fn(),
    seekTo: vi.fn(),
    getPlayerState: vi.fn(),
    getCurrentTime: vi.fn(),
    getDuration: vi.fn(),
  })),
};

global.YT = mockYT;

describe('YouTubePlayer', () => {
  const defaultProps = {
    videoId: 'test123',
    onStateChange: vi.fn(),
    onReady: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    render(<YouTubePlayer {...defaultProps} loading={true} />);
    
    expect(screen.getByTestId('youtube-loading')).toBeInTheDocument();
  });

  it('renders player with correct video ID', () => {
    render(<YouTubePlayer {...defaultProps} />);
    
    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toHaveAttribute('src', expect.stringContaining(defaultProps.videoId));
  });

  it('updates video when videoId changes', () => {
    const { rerender } = render(<YouTubePlayer {...defaultProps} />);
    
    rerender(<YouTubePlayer {...defaultProps} videoId="newVideo123" />);
    
    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toHaveAttribute('src', expect.stringContaining('newVideo123'));
  });

  it('maintains aspect ratio', () => {
    render(<YouTubePlayer {...defaultProps} />);
    
    const container = screen.getByTestId('youtube-container');
    expect(container).toHaveStyle({ aspectRatio: '16/9' });
  });
}); 