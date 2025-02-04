import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import PlayerControls from '../player/PlayerControls';

describe('PlayerControls', () => {
  const defaultProps = {
    isPlaying: false,
    currentTime: 0,
    duration: 180, // 3 minutes
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onSeek: vi.fn(),
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders play button when not playing', () => {
    render(<PlayerControls {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument();
  });

  it('renders pause button when playing', () => {
    render(<PlayerControls {...defaultProps} isPlaying={true} />);
    
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /play/i })).not.toBeInTheDocument();
  });

  it('calls onPlay when play button is clicked', () => {
    render(<PlayerControls {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(defaultProps.onPlay).toHaveBeenCalled();
  });

  it('calls onPause when pause button is clicked', () => {
    render(<PlayerControls {...defaultProps} isPlaying={true} />);
    
    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(defaultProps.onPause).toHaveBeenCalled();
  });

  it('displays correct time format', () => {
    render(<PlayerControls {...defaultProps} currentTime={65} />); // 1:05
    
    expect(screen.getByText('1:05')).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument(); // duration
  });

  it('disables controls when disabled prop is true', () => {
    render(<PlayerControls {...defaultProps} disabled={true} />);
    
    expect(screen.getByRole('button', { name: /play/i })).toBeDisabled();
    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('calls onSeek when slider value changes', () => {
    render(<PlayerControls {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '90' } });
    
    expect(defaultProps.onSeek).toHaveBeenCalledWith(90);
  });
}); 