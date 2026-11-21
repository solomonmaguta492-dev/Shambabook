import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Profile from '../pages/Profile.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useFarm } from '../hooks/useFarm.js';

/* Fake useAuth, useFarm and useToast so each test can choose what the page receives */
vi.mock('../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../hooks/useFarm.js', () => ({
  useFarm: vi.fn(),
}));

const mockShowToast = vi.fn();
vi.mock('../hooks/useToast.js', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const nakuru = { name: 'Nakuru', region: 'Nakuru County', latitude: -0.28, longitude: 36.07 };

function mockAuth() {
  const auth = {
    user: { displayName: 'Amina Njeri', email: 'amina@example.com' },
    updateName: vi.fn().mockResolvedValue(),
    logout: vi.fn().mockResolvedValue(),
  };
  vi.mocked(useAuth).mockReturnValue(auth);
  return auth;
}

function mockFarm(overrides = {}) {
  const farm = {
    profile: null,
    profileLoading: false,
    saveLocation: vi.fn().mockResolvedValue(),
    ...overrides,
  };
  vi.mocked(useFarm).mockReturnValue(farm);
  return farm;
}

/* A fake fetch response with the given towns in Open-Meteo's format */
function townsResponse(places) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ results: places }),
  };
}

function renderProfile() {
  render(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<p>Landing page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Profile page', () => {
  beforeEach(() => {
    mockShowToast.mockReset();
    vi.stubGlobal('fetch', vi.fn());
    mockAuth();
    mockFarm();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the email as read-only and the current name', () => {
    renderProfile();

    expect(screen.getByLabelText('Email')).toHaveValue('amina@example.com');
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Full name')).toHaveValue('Amina Njeri');
  });

  it('requires a name before saving', async () => {
    const user = userEvent.setup();
    const auth = mockAuth();
    renderProfile();

    await user.clear(screen.getByLabelText('Full name'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveFocus();
    expect(auth.updateName).not.toHaveBeenCalled();
  });

  it('saves a new name and shows a toast', async () => {
    const user = userEvent.setup();
    const auth = mockAuth();
    renderProfile();

    await user.clear(screen.getByLabelText('Full name'));
    await user.type(screen.getByLabelText('Full name'), 'Amina Wanjiru');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(auth.updateName).toHaveBeenCalledWith('Amina Wanjiru');
    expect(mockShowToast).toHaveBeenCalledWith('Name updated', 'success');
  });

  it('shows "No location set yet" when no town is saved', () => {
    renderProfile();
    expect(screen.getByText('No location set yet')).toBeInTheDocument();
  });

  it('shows the saved town and region', () => {
    mockFarm({ profile: { location: nakuru } });
    renderProfile();

    expect(screen.getByText('Nakuru, Nakuru County')).toBeInTheDocument();
  });

  it('needs at least 2 letters before searching', async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.type(screen.getByLabelText('Search your town'), 'N');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.getByText('Please type at least 2 letters')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows a spinner while searching, then the results', async () => {
    const user = userEvent.setup();
    /* Keep the request waiting until we decide to answer it */
    let answer;
    vi.mocked(fetch).mockReturnValue(new Promise((resolve) => (answer = resolve)));
    renderProfile();

    await user.type(screen.getByLabelText('Search your town'), 'Nakuru');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.getByRole('status')).toHaveTextContent('Searching…');

    answer(townsResponse([{ name: 'Nakuru', admin1: 'Nakuru County', latitude: -0.28, longitude: 36.07 }]));

    expect(await screen.findByRole('button', { name: 'Nakuru, Nakuru County' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('saves the town that is clicked', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    vi.mocked(fetch).mockResolvedValue(
      townsResponse([{ name: 'Nakuru', admin1: 'Nakuru County', latitude: -0.28, longitude: 36.07 }])
    );
    renderProfile();

    await user.type(screen.getByLabelText('Search your town'), 'Nakuru');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await user.click(await screen.findByRole('button', { name: 'Nakuru, Nakuru County' }));

    expect(farm.saveLocation).toHaveBeenCalledWith(nakuru);
    expect(mockShowToast).toHaveBeenCalledWith('Location saved: Nakuru', 'success');
  });

  it('shows "No towns found" when nothing matches', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}) });
    renderProfile();

    await user.type(screen.getByLabelText('Search your town'), 'Zzzz');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByText('No towns found')).toBeInTheDocument();
  });

  it('shows an error with Retry when the API fails', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });
    renderProfile();

    await user.type(screen.getByLabelText('Search your town'), 'Nakuru');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't search for towns.");

    /* Retry sends the same search again */
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('logs out and goes to the landing page', async () => {
    const user = userEvent.setup();
    const auth = mockAuth();
    renderProfile();

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(auth.logout).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith("You've been logged out", 'success');
    expect(screen.getByText('Landing page')).toBeInTheDocument();
  });
});
