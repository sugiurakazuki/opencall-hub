import { expect, test, vi, beforeEach, describe } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Page from '../app/page';

// Mock fetch
global.fetch = vi.fn();

describe('Grant Listing Page', () => {
  beforeEach(() => {
    (fetch as any).mockClear();
  });

  test('renders grant listing and filters', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, title: 'Art Grant', category: 'Art', deadline: '2026-05-01' },
        { id: 2, title: 'Science Grant', category: 'Science', deadline: '2026-04-01' },
      ],
    });

    render(<Page />);

    // Should display grants after loading
    await waitFor(() => {
      expect(screen.getByText('Art Grant')).toBeDefined();
      expect(screen.getByText('Science Grant')).toBeDefined();
    });

    // Should display deadline info (including countdown)
    expect(screen.getAllByText(/days left/i)).toHaveLength(2);

    // Should have a search input
    expect(screen.getByPlaceholderText(/Search grants/i)).toBeDefined();

    // Should have a save button for unsaved grants
    const saveButtons = screen.getAllByRole('button', { name: /Save/i });
    expect(saveButtons).toHaveLength(2);

    // Mock successful POST for saving
    (fetch as any).mockResolvedValueOnce({ ok: true });
    fireEvent.click(saveButtons[0]);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/users/saved-grants'), expect.objectContaining({ method: 'POST' }));
  });
});
