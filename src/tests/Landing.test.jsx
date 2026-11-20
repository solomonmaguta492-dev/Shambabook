import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../pages/Landing.jsx';

describe('Landing page', () => {
  /* Links need a router, so wrap the page in MemoryRouter */
  function renderLanding() {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );
  }

  it('shows the headline and the sign up and log in links', () => {
    renderLanding();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Know if your farm is making money' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: "Sign up — it's free" })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });

  it('shows the three feature cards', () => {
    renderLanding();

    expect(screen.getByRole('heading', { name: 'Track your crops' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'See your profit' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Plan with the weather' })).toBeInTheDocument();
  });
});
