import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../app/page';

test('Page renders correctly', () => {
  render(<Page />);
  // Check for any text that exists on the default Next.js page
  expect(screen.getByText(/Documentation/i)).toBeDefined();
});
