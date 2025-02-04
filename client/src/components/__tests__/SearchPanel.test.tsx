import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SearchPanel from '../search/SearchPanel';
import { youtubeService } from '../../services/youtubeService';

// Mock the YouTube service
vi.mock('../../services/youtubeService', () => ({
  youtubeService: {
    search: vi.fn(),
  },
}));

describe('SearchPanel', () => {
  const mockOnAdd = vi.fn();
  const mockSearchResults = [
    {
      id: 'video1',
      title: 'Test Video 1',
      channelTitle: 'Test Channel 1',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      duration: '3:45',
    },
    {
      id: 'video2',
      title: 'Test Video 2',
      channelTitle: 'Test Channel 2',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      duration: '4:20',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (youtubeService.search as jest.Mock).mockResolvedValue(mockSearchResults);
  });

  it('renders search input', () => {
    render(<SearchPanel onAdd={mockOnAdd} />);
    
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('performs search on input change', async () => {
    render(<SearchPanel onAdd={mockOnAdd} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'test query' } });

    await waitFor(() => {
      expect(youtubeService.search).toHaveBeenCalledWith('test query');
    });
  });

  it('displays search results', async () => {
    render(<SearchPanel onAdd={mockOnAdd} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'test query' } });

    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument();
      expect(screen.getByText('Test Video 2')).toBeInTheDocument();
      expect(screen.getByText('Test Channel 1')).toBeInTheDocument();
      expect(screen.getByText('Test Channel 2')).toBeInTheDocument();
    });
  });

  it('calls onAdd when add button is clicked', async () => {
    render(<SearchPanel onAdd={mockOnAdd} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'test query' } });

    await waitFor(() => {
      const addButtons = screen.getAllByRole('button', { name: /add/i });
      fireEvent.click(addButtons[0]);
    });

    expect(mockOnAdd).toHaveBeenCalledWith(mockSearchResults[0]);
  });

  it('shows loading state during search', async () => {
    render(<SearchPanel onAdd={mockOnAdd} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(screen.getByTestId('search-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('search-loading')).not.toBeInTheDocument();
    });
  });

  it('handles search errors', async () => {
    const error = new Error('Search failed');
    (youtubeService.search as jest.Mock).mockRejectedValue(error);

    render(<SearchPanel onAdd={mockOnAdd} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'test query' } });

    await waitFor(() => {
      expect(screen.getByText(/search failed/i)).toBeInTheDocument();
    });
  });

  it('debounces search requests', async () => {
    vi.useFakeTimers();
    render(<SearchPanel onAdd={mockOnAdd} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'tes' } });
    fireEvent.change(input, { target: { value: 'test' } });

    vi.runAllTimers();

    await waitFor(() => {
      expect(youtubeService.search).toHaveBeenCalledTimes(1);
      expect(youtubeService.search).toHaveBeenCalledWith('test');
    });

    vi.useRealTimers();
  });
}); 