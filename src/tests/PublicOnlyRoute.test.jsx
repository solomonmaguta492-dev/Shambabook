import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicOnlyRoute from '../components/PublicOnlyRoute.jsx';
import { useAuth } from '../hooks/useAuth.js';

/* Fake useAuth so each test can choose whether someone is logged in */
vi.mock('../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

function renderAtLogin() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/dashboard" element={<p>Dashboard page</p>} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<p>Login page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('PublicOnlyRoute', () => {
  it('redirects a logged-in user from /login to /dashboard', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { email: 'amina@example.com' }, loading: false });

    renderAtLogin();

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('shows the login page when logged out', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false });

    renderAtLogin();

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});
