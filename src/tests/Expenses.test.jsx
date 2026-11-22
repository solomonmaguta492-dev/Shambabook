import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Expenses from '../pages/Expenses.jsx';
import { useFarm } from '../hooks/useFarm.js';

/* Fake useFarm and useToast so each test can choose what the page receives */
vi.mock('../hooks/useFarm.js', () => ({
  useFarm: vi.fn(),
}));

const mockShowToast = vi.fn();
vi.mock('../hooks/useToast.js', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const sampleCrops = [
  { id: 'c1', name: 'Maize' },
  { id: 'c2', name: 'Beans' },
];

const sampleExpenses = [
  { id: 'e1', cropId: 'c1', category: 'Fertiliser', amount: 10000, date: '2026-03-12', note: '' },
  { id: 'e2', cropId: 'c1', category: 'Labour', amount: 2500, date: '2026-03-10', note: '' },
  { id: 'e3', cropId: 'c2', category: 'Seed', amount: 1500, date: '2026-03-05', note: '' },
];

/* Default farm values; each test can change some of them */
function mockFarm(overrides = {}) {
  const farm = {
    crops: sampleCrops,
    cropsLoading: false,
    expenses: sampleExpenses,
    expensesLoading: false,
    expensesError: '',
    retryExpenses: vi.fn(),
    addExpense: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
    ...overrides,
  };
  vi.mocked(useFarm).mockReturnValue(farm);
  return farm;
}

function renderExpenses() {
  render(
    <MemoryRouter>
      <Expenses />
    </MemoryRouter>
  );
}

describe('Expenses page', () => {
  beforeEach(() => {
    mockShowToast.mockReset();
  });

  it('shows a spinner while loading', () => {
    mockFarm({ expensesLoading: true });
    renderExpenses();

    expect(screen.getByRole('status')).toHaveTextContent('Loading expenses…');
  });

  it('asks to add a crop first when there are no crops', () => {
    mockFarm({ crops: [], expenses: [] });
    renderExpenses();

    expect(screen.getByRole('heading', { name: 'Add a crop first' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to crops' })).toHaveAttribute('href', '/crops');
    expect(screen.getByRole('button', { name: '+ Add expense' })).toBeDisabled();
  });

  it('shows the empty state when there are no expenses', () => {
    mockFarm({ expenses: [] });
    renderExpenses();

    expect(screen.getByRole('heading', { name: 'No expenses yet' })).toBeInTheDocument();
  });

  it('shows an error with a Retry button when loading fails', async () => {
    const user = userEvent.setup();
    const farm = mockFarm({ expensesError: "We couldn't load your expenses." });
    renderExpenses();

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(farm.retryExpenses).toHaveBeenCalled();
  });

  it('shows the list and the total', () => {
    mockFarm();
    renderExpenses();

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText(/^Total:/)).toHaveTextContent('Total: KES 14,000');
  });

  it('filters by crop and category, and updates the total', async () => {
    const user = userEvent.setup();
    mockFarm();
    renderExpenses();

    await user.selectOptions(screen.getByLabelText('Crop'), 'Maize');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText(/^Total:/)).toHaveTextContent('Total: KES 12,500');

    await user.selectOptions(screen.getByLabelText('Category'), 'Labour');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText(/^Total:/)).toHaveTextContent('Total: KES 2,500');

    await user.selectOptions(screen.getByLabelText('Category'), 'Seed');
    expect(screen.getByRole('heading', { name: 'No matching expenses' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('adds an expense and closes the form straight away', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    farm.addExpense.mockReturnValue(new Promise(() => {}));
    renderExpenses();

    await user.click(screen.getByRole('button', { name: '+ Add expense' }));
    const dialog = screen.getByRole('dialog', { name: 'Add an expense' });
    await user.selectOptions(within(dialog).getByLabelText('Crop'), 'Beans');
    await user.selectOptions(within(dialog).getByLabelText('Category'), 'Transport');
    await user.type(within(dialog).getByLabelText('Amount (KES)'), '600');
    await user.click(within(dialog).getByRole('button', { name: 'Add expense' }));

    expect(farm.addExpense).toHaveBeenCalledWith(
      expect.objectContaining({ cropId: 'c2', category: 'Transport', amount: 600 })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Expense added', 'success');
  });

  it('deletes an expense after confirming', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    farm.deleteExpense.mockResolvedValue();
    renderExpenses();

    await user.click(screen.getByRole('button', { name: 'Delete Labour expense' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete Labour expense?' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(farm.deleteExpense).toHaveBeenCalledWith('e2');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Expense deleted', 'success');
  });
});
