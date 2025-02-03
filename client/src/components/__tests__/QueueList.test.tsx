import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import QueueList from '../QueueList';

const mockQueue = [
  {
    id: '1',
    youtubeVideoId: 'video1',
    title: 'Test Song 1',
    position: 0,
    status: 'pending',
    addedById: 'user1',
  },
  {
    id: '2',
    youtubeVideoId: 'video2',
    title: 'Test Song 2',
    position: 1,
    status: 'pending',
    addedById: 'user1',
  },
];

describe('QueueList', () => {
  it('renders queue items correctly', () => {
    render(
      <QueueList
        queue={mockQueue}
        currentItem={null}
        isHost={false}
        onRemove={() => {}}
      />
    );

    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Test Song 2')).toBeInTheDocument();
  });

  it('shows current item when provided', () => {
    const currentItem = {
      id: '0',
      youtubeVideoId: 'video0',
      title: 'Current Song',
      position: 0,
      status: 'playing',
      addedById: 'user1',
    };

    render(
      <QueueList
        queue={mockQueue}
        currentItem={currentItem}
        isHost={false}
        onRemove={() => {}}
      />
    );

    expect(screen.getByText('Now Playing:')).toBeInTheDocument();
    expect(screen.getByText('Current Song')).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();

    render(
      <QueueList
        queue={mockQueue}
        currentItem={null}
        isHost={true}
        onRemove={onRemove}
      />
    );

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    expect(onRemove).toHaveBeenCalledWith('1');
  });

  it('shows drag handles only for host', () => {
    const { rerender } = render(
      <QueueList
        queue={mockQueue}
        currentItem={null}
        isHost={true}
        onRemove={() => {}}
      />
    );

    expect(screen.getAllByTestId('drag-handle')).toHaveLength(2);

    rerender(
      <QueueList
        queue={mockQueue}
        currentItem={null}
        isHost={false}
        onRemove={() => {}}
      />
    );

    expect(screen.queryByTestId('drag-handle')).not.toBeInTheDocument();
  });
}); 