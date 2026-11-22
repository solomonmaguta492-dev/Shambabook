import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard.jsx';
import { useFarm } from '../hooks/useFarm.js';
import { useWeather } from '../hooks/useWeather.js';

/* Fake useAuth, useFarm and useWeather so each test can choose what the page receives */
vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ user: { displayName: 'Amina Njeri', email: 'amina@example.com' } }),
}));

vi.mock('../hooks/useFarm.js', () => ({
  useFarm: vi.fn(),
}));

vi.mock('../hooks/useWeather.js', () => ({
  useWeather: vi.fn(),
}));

const nakuru = { name: 'Nakuru', region: 'Nakuru County', latitude: -0.28, longitude: 36.07 };

const crops = [
  { id: 'c1', name: 'Maize' },
  { id: 'c2', name: 'Beans' },
];

function mockFarm(overrides = {}) {
  vi.mocked(useFarm).mockReturnValue({
    crops,
    cropsLoading: false,
    expenses: [],
    expensesLoading: false,
    harvests: [],
    harvestsLoading: false,
    profile: null,
    profileLoading: false,
    ...overrides,
  });
}

function renderDashboard() {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

/* Finds a summary card by its label and returns the big number inside it */
function cardValue(label) {
  return screen.getByRole('heading', { name: label }).parentElement.nextElementSibling;
}

describe('Dashboard', () => {
  beforeEach(() => {
    /* Pretend today is 22 Nov 2026, so "upcoming" harvests don't change as real days pass */
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 22));
    vi.mocked(useWeather).mockReturnValue({ data: null, loading: false, error: '', refetch: vi.fn() });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the four summary cards with a profit in green', () => {
    mockFarm({
      expenses: [
        { id: 'e1', cropId: 'c1', amount: 5000, date: '2026-03-01' },
        { id: 'e2', cropId: 'c2', amount: 1000, date: '2026-03-01' },
      ],
      harvests: [{ id: 'h1', cropId: 'c1', quantity: 20, pricePerUnit: 3500, date: '2026-03-01' }],
    });
    renderDashboard();

    expect(screen.getByRole('heading', { name: 'Hello, Amina Njeri' })).toBeInTheDocument();
    expect(cardValue('Crops')).toHaveTextContent('2');
    expect(cardValue('Total expenses')).toHaveTextContent('KES 6,000');
    expect(cardValue('Total income')).toHaveTextContent('KES 70,000');
    expect(cardValue('Net profit')).toHaveTextContent('KES 64,000');
    expect(cardValue('Net profit')).toHaveClass('text-green-700');
  });

  it('shows a loss in rose, labelled "Net loss"', () => {
    mockFarm({
      expenses: [{ id: 'e1', cropId: 'c1', amount: 3000, date: '2026-03-01' }],
      harvests: [{ id: 'h1', cropId: 'c1', quantity: 10, pricePerUnit: 100, date: '2026-03-01' }],
    });
    renderDashboard();

    expect(cardValue('Net loss')).toHaveTextContent('-KES 2,000');
    expect(cardValue('Net loss')).toHaveClass('text-rose-700');
  });

  it('names the most profitable crop when there is income', () => {
    mockFarm({
      expenses: [{ id: 'e1', cropId: 'c1', amount: 60000, date: '2026-03-01' }],
      harvests: [
        { id: 'h1', cropId: 'c1', quantity: 20, pricePerUnit: 3500, date: '2026-03-01' },
        { id: 'h2', cropId: 'c2', quantity: 50, pricePerUnit: 300, date: '2026-03-01' },
      ],
    });
    renderDashboard();

    /* Maize earns more (70,000) but costs 60,000, so Beans (15,000, no costs) makes more profit */
    expect(screen.getByText(/Most profitable crop:/)).toHaveTextContent(
      'Most profitable crop: Beans (KES 15,000 profit)'
    );
    expect(screen.getByRole('link', { name: 'Beans' })).toHaveAttribute('href', '/crops/c2');
  });

  it('hides the most profitable crop line when there is no income', () => {
    mockFarm();
    renderDashboard();

    expect(screen.queryByText(/Most profitable crop:/)).not.toBeInTheDocument();
  });

  it('shows "…" while loading', () => {
    mockFarm({ harvestsLoading: true });
    renderDashboard();

    expect(cardValue('Net profit')).toHaveTextContent('…');
  });

  it("shows today's weather when a location is set", () => {
    mockFarm({ profile: { location: nakuru } });
    vi.mocked(useWeather).mockReturnValue({
      data: { current: { temperature: 24.4, humidity: 60, windSpeed: 12, weatherCode: 61 }, days: [] },
      loading: false,
      error: '',
      refetch: vi.fn(),
    });
    renderDashboard();

    const card = screen.getByRole('region', { name: "Today's weather" });
    expect(card).toHaveTextContent('Nakuru, Nakuru County');
    expect(card).toHaveTextContent('24°C');
    expect(within(card).getByRole('img', { name: 'Rain' })).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'See 7-day forecast →' })).toHaveAttribute('href', '/weather');
    expect(useWeather).toHaveBeenCalledWith(nakuru);
  });

  it('asks for a farm location when none is set', () => {
    mockFarm();
    renderDashboard();

    const card = screen.getByRole('region', { name: "Today's weather" });
    expect(within(card).getByRole('link', { name: 'Set your farm location →' })).toHaveAttribute('href', '/profile');
  });

  it('shows a short message when the weather fails, and the rest still works', () => {
    mockFarm({ profile: { location: nakuru } });
    vi.mocked(useWeather).mockReturnValue({ data: null, loading: false, error: 'Failed', refetch: vi.fn() });
    renderDashboard();

    expect(screen.getByRole('region', { name: "Today's weather" })).toHaveTextContent(
      'Weather is not available right now.'
    );
    expect(cardValue('Crops')).toHaveTextContent('2');
  });

  it('shows the next harvest, skipping past dates and harvested crops', () => {
    mockFarm({
      crops: [
        { id: 'c1', name: 'Maize', status: 'Growing', expectedHarvestDate: '2027-01-10' },
        { id: 'c2', name: 'Beans', status: 'Growing', expectedHarvestDate: '2026-12-05' },
        { id: 'c3', name: 'Kale', status: 'Harvested', expectedHarvestDate: '2026-11-25' },
        { id: 'c4', name: 'Sukuma', status: 'Growing', expectedHarvestDate: '2026-11-01' },
      ],
    });
    renderDashboard();

    const card = screen.getByRole('region', { name: 'Next harvest' });
    expect(within(card).getByRole('link', { name: 'Beans' })).toHaveAttribute('href', '/crops/c2');
    expect(card).toHaveTextContent('Expected 5 Dec 2026');
  });

  it('says "No upcoming harvests" when there are none', () => {
    mockFarm();
    renderDashboard();

    expect(screen.getByRole('region', { name: 'Next harvest' })).toHaveTextContent('No upcoming harvests');
  });

  it('lists recent activity newest first, with expenses and income told apart', () => {
    mockFarm({
      expenses: [
        { id: 'e1', cropId: 'c1', amount: 5000, date: '2026-03-01' },
        { id: 'e2', cropId: 'c2', amount: 800, date: '2026-03-20' },
      ],
      harvests: [{ id: 'h1', cropId: 'c1', quantity: 20, pricePerUnit: 3500, date: '2026-03-10' }],
    });
    renderDashboard();

    const rows = within(screen.getByRole('region', { name: 'Recent activity' })).getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent('Expense · Beans');
    expect(rows[0]).toHaveTextContent('20 Mar 2026');
    expect(within(rows[0]).getByText('-KES 800')).toHaveClass('text-rose-700');
    expect(rows[1]).toHaveTextContent('Harvest · Maize');
    expect(within(rows[1]).getByText('+KES 70,000')).toHaveClass('text-green-700');
    expect(rows[2]).toHaveTextContent('Expense · Maize');
  });

  it('shows links to add records when there is no activity', () => {
    mockFarm();
    renderDashboard();

    const section = screen.getByRole('region', { name: 'Recent activity' });
    expect(within(section).getByRole('link', { name: 'Add an expense' })).toHaveAttribute('href', '/expenses');
    expect(within(section).getByRole('link', { name: 'add a harvest' })).toHaveAttribute('href', '/harvests');
  });

  it('shows one Retry for all lists when a list fails to load', () => {
    const farm = {
      expensesError: "We couldn't load your expenses.",
      retryCrops: vi.fn(),
      retryExpenses: vi.fn(),
      retryHarvests: vi.fn(),
    };
    mockFarm(farm);
    renderDashboard();

    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't load some of your farm records");
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(farm.retryCrops).toHaveBeenCalled();
    expect(farm.retryExpenses).toHaveBeenCalled();
    expect(farm.retryHarvests).toHaveBeenCalled();
  });
});
