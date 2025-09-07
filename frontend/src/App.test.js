import { render, screen } from '@testing-library/react';
import App from './App';

test('renders prompt introspector app', () => {
  render(<App />);
  const titleElement = screen.getByText(/prompt introspector/i);
  expect(titleElement).toBeInTheDocument();
});
