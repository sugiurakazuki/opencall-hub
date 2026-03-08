import { expect, test, vi, beforeEach, describe } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DashboardPage from '../app/dashboard/page';

// Mock fetch
global.fetch = vi.fn();

describe('User Dashboard Page', () => {
  beforeEach(() => {
    (fetch as any).mockClear();
  });

  test('renders user dashboard and saved grants', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, title: 'Saved Art Grant', category: 'Art', deadline: '2026-05-01' },
      ],
    });

    render(<DashboardPage />);

    // Should call fetch for saved grants (assuming user_id 1 for now)
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/users/1/saved-grants'));

    // Should display saved grants after loading
    await waitFor(() => {
      expect(screen.getByText('Saved Art Grant')).toBeDefined();
    });

    expect(screen.getByText(/Your Saved Grants/i)).toBeDefined();

    // Should have an unsave button
    const unsaveButton = screen.getByRole('button', { name: /Unsave/i });
    expect(unsaveButton).toBeDefined();

    // Mock successful DELETE for unsaving
    (fetch as any).mockResolvedValueOnce({ ok: true });
    fireEvent.click(unsaveButton);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/users/1/saved-grants/1'), expect.objectContaining({ method: 'DELETE' }));
  });
});
