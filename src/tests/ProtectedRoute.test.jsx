import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { useAuth } from '../hooks/useAuth.js';

/* Fake useAuth so each test can choose whether someone is logged in */
vi.mock('../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

/* A small set of routes: /dashboard is protected, /login is not */
function renderAt(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<p>Dashboard page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('shows loading while Firebase is checking', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true });

    renderAt('/dashboard');

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument();
  });

  it('redirects to /login when logged out', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false });

    renderAt('/dashboard');

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument();
  });

  it('shows the page when logged in', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { email: 'amina@example.com' }, loading: false });

    renderAt('/dashboard');

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });
});
