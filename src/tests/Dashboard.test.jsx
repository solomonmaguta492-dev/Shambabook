import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard.jsx';
import { useFarm } from '../hooks/useFarm.js';

/* Fake useAuth and useFarm so each test can choose what the page receives */
vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ user: { displayName: 'Amina Njeri', email: 'amina@example.com' } }),
}));

vi.mock('../hooks/useFarm.js', () => ({
  useFarm: vi.fn(),
}));

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
  it('shows the four summary cards with a profit in green', () => {
    mockFarm({
      expenses: [
        { id: 'e1', cropId: 'c1', amount: 5000 },
        { id: 'e2', cropId: 'c2', amount: 1000 },
      ],
      harvests: [{ id: 'h1', cropId: 'c1', quantity: 20, pricePerUnit: 3500 }],
    });
    renderDashboard();

    expect(screen.getByRole('heading', { name: 'Hello, Amina Njeri' })).toBeInTheDocument();
    expect(cardValue('Crops')).toHaveTextContent('2');
    expect(cardValue('Total expenses')).toHaveTextContent('KES 6,000');
    expect(cardValue('Total income')).toHaveTextContent('KES 70,000');
    expect(cardValue('Net profit')).toHaveTextContent('KES 64,000');
    expect(cardValue('Net profit')).toHaveClass('text-green-700');
  });

  it('shows a loss in rose', () => {
    mockFarm({
      expenses: [{ id: 'e1', cropId: 'c1', amount: 3000 }],
      harvests: [{ id: 'h1', cropId: 'c1', quantity: 10, pricePerUnit: 100 }],
    });
    renderDashboard();

    expect(cardValue('Net profit')).toHaveTextContent('-KES 2,000');
    expect(cardValue('Net profit')).toHaveClass('text-rose-700');
  });

  it('names the most profitable crop when there is income', () => {
    mockFarm({
      expenses: [{ id: 'e1', cropId: 'c1', amount: 60000 }],
      harvests: [
        { id: 'h1', cropId: 'c1', quantity: 20, pricePerUnit: 3500 },
        { id: 'h2', cropId: 'c2', quantity: 50, pricePerUnit: 300 },
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
});
