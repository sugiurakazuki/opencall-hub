import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../app/page';

test('Page renders correctly', () => {
  render(<Page />);
  // Check for the main heading
  expect(screen.getByText(/Art Grants & Competitions/i)).toBeDefined();
});
