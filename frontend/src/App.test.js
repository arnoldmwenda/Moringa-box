import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Moringa Box landing screen', () => {
  render(<App />);
  expect(screen.getByText(/moringa box/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
});
