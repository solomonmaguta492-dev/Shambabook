import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicLayout from '../components/layouts/PublicLayout.jsx';
import AppLayout from '../components/layouts/AppLayout.jsx';

/* The app layout's sidebar uses these, so fake them */
vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));

vi.mock('../hooks/useToast.js', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

function renderInLayout(layout) {
  render(
    <MemoryRouter>
      <Routes>
        <Route element={layout}>
          <Route path="/" element={<p>Page content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe.each([
  ['public layout', <PublicLayout key="public" />],
  ['app layout', <AppLayout key="app" />],
])('Skip link in the %s', (name, layout) => {
  it('is the first thing Tab reaches', async () => {
    const user = userEvent.setup();
    renderInLayout(layout);

    await user.tab();

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveFocus();
  });

  it('points at the main content', () => {
    renderInLayout(layout);

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('main')).toHaveTextContent('Page content');
  });
});
