import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import YouTubePlayer from '../YouTubePlayer';

// Mock YouTube component
vi.mock('react-youtube', () => ({
  default: vi.fn(({ onStateChange, onEnd, onReady }) => {
    return (
      <div data-testid="youtube-player">
        <button onClick={() => onStateChange({ data: 1 })}>Play</button>
        <button onClick={() => onStateChange({ data: 2 })}>Pause</button>
        <button onClick={onEnd}>End</button>
        <button onClick={() => onReady({ target: { loadVideoById: vi.fn() } })}>Ready</button>
      </div>
    );
  }),
}));

describe('YouTubePlayer', () => {
  it('renders placeholder when no video is provided', () => {
    render(<YouTubePlayer />);
    expect(screen.getByText('No video selected')).toBeInTheDocument();
  });

  it('renders YouTube player when video is provided', () => {
    render(<YouTubePlayer videoId="test-video-id" />);
    expect(screen.getByTestId('youtube-player')).toBeInTheDocument();
  });

  it('calls onStateChange when player state changes', () => {
    const onStateChange = vi.fn();
    render(<YouTubePlayer videoId="test-video-id" onStateChange={onStateChange} />);

    screen.getByText('Play').click();
    expect(onStateChange).toHaveBeenCalledWith(1);

    screen.getByText('Pause').click();
    expect(onStateChange).toHaveBeenCalledWith(2);
  });

  it('calls onEnd when video ends', () => {
    const onEnd = vi.fn();
    render(<YouTubePlayer videoId="test-video-id" onEnd={onEnd} />);

    screen.getByText('End').click();
    expect(onEnd).toHaveBeenCalled();
  });

  it('loads new video when videoId changes', () => {
    const { rerender } = render(<YouTubePlayer videoId="video-1" />);
    const loadVideoById = vi.fn();

    // Simulate player ready
    screen.getByText('Ready').click();

    // Change video ID
    rerender(<YouTubePlayer videoId="video-2" />);
    expect(loadVideoById).toHaveBeenCalledWith('video-2');
  });
}); 