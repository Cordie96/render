import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SearchResults from '../SearchResults';

const mockResults = [
  {
    id: 'video1',
    title: 'Test Song 1',
    thumbnail: 'https://example.com/thumb1.jpg',
    duration: '3:45',
    channelTitle: 'Test Channel 1',
  },
  {
    id: 'video2',
    title: 'Test Song 2',
    thumbnail: 'https://example.com/thumb2.jpg',
    duration: '4:20',
    channelTitle: 'Test Channel 2',
  },
];

describe('SearchResults', () => {
  it('renders search results correctly', () => {
    render(<SearchResults results={mockResults} onAdd={() => {}} />);

    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Test Song 2')).toBeInTheDocument();
    expect(screen.getByText('Test Channel 1')).toBeInTheDocument();
    expect(screen.getByText('Test Channel 2')).toBeInTheDocument();
  });

  it('calls onAdd with correct video when add button is clicked', () => {
    const onAdd = vi.fn();
    render(<SearchResults results={mockResults} onAdd={onAdd} />);

    const addButtons = screen.getAllByText('Add to Queue');
    fireEvent.click(addButtons[0]);

    expect(onAdd).toHaveBeenCalledWith(mockResults[0]);
  });

  it('shows duration for each result', () => {
    render(<SearchResults results={mockResults} onAdd={() => {}} />);

    expect(screen.getByText('3:45')).toBeInTheDocument();
    expect(screen.getByText('4:20')).toBeInTheDocument();
  });

  it('renders thumbnails with correct alt text', () => {
    render(<SearchResults results={mockResults} onAdd={() => {}} />);

    const thumbnails = screen.getAllByRole('img');
    expect(thumbnails).toHaveLength(2);
    expect(thumbnails[0]).toHaveAttribute('alt', 'Test Song 1');
    expect(thumbnails[1]).toHaveAttribute('alt', 'Test Song 2');
  });
}); 