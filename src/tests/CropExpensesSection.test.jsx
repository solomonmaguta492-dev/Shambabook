import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CropExpensesSection from '../components/expenses/CropExpensesSection.jsx';
import { useFarm } from '../hooks/useFarm.js';

/* Fake useFarm and useToast so each test can choose what the section receives */
vi.mock('../hooks/useFarm.js', () => ({
  useFarm: vi.fn(),
}));

const mockShowToast = vi.fn();
vi.mock('../hooks/useToast.js', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const maize = { id: 'c1', name: 'Maize' };
const beans = { id: 'c2', name: 'Beans' };

const seedExpense = { id: 'e1', cropId: 'c1', category: 'Seed', amount: 5000, date: '2026-03-01', note: '' };
const beansExpense = { id: 'e2', cropId: 'c2', category: 'Labour', amount: 900, date: '2026-03-02', note: '' };

/* Default farm values; each test can change some of them */
function mockFarm(overrides = {}) {
  const farm = {
    crops: [maize, beans],
    expenses: [seedExpense, beansExpense],
    addExpense: vi.fn().mockResolvedValue(),
    updateExpense: vi.fn().mockResolvedValue(),
    deleteExpense: vi.fn().mockResolvedValue(),
    ...overrides,
  };
  vi.mocked(useFarm).mockReturnValue(farm);
  return farm;
}

describe('CropExpensesSection', () => {
  beforeEach(() => {
    mockShowToast.mockReset();
  });

  it('shows the empty message and a zero total when the crop has no expenses', () => {
    mockFarm({ expenses: [beansExpense] });
    render(<CropExpensesSection crop={maize} />);

    expect(screen.getByText('No expenses for this crop yet.')).toBeInTheDocument();
    expect(screen.getByText('KES 0')).toBeInTheDocument();
  });

  it("lists only this crop's expenses and adds up their total", () => {
    mockFarm();
    render(<CropExpensesSection crop={maize} />);

    expect(screen.getByRole('button', { name: 'Edit Seed expense from 1 Mar 2026' })).toBeInTheDocument();
    expect(screen.queryByText(/Labour/)).not.toBeInTheDocument();
    expect(screen.getByText('Total:')).toHaveTextContent('KES 5,000');
  });

  it('adds an expense for this crop', async () => {
    const user = userEvent.setup();
    const farm = mockFarm({ expenses: [] });
    render(<CropExpensesSection crop={maize} />);

    await user.click(screen.getByRole('button', { name: '+ Add expense' }));
    const dialog = screen.getByRole('dialog', { name: 'Add an expense' });
    expect(within(dialog).getByLabelText('Crop')).toHaveValue('c1');

    await user.selectOptions(within(dialog).getByLabelText('Category'), 'Fertiliser');
    await user.type(within(dialog).getByLabelText('Amount (KES)'), '1500');
    await user.click(within(dialog).getByRole('button', { name: 'Add expense' }));

    expect(farm.addExpense).toHaveBeenCalledWith(
      expect.objectContaining({ cropId: 'c1', category: 'Fertiliser', amount: 1500 })
    );
    expect(mockShowToast).toHaveBeenCalledWith('Expense added', 'success');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('edits an expense', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    render(<CropExpensesSection crop={maize} />);

    await user.click(screen.getByRole('button', { name: 'Edit Seed expense from 1 Mar 2026' }));
    const amount = within(screen.getByRole('dialog', { name: 'Edit expense' })).getByLabelText('Amount (KES)');
    expect(amount).toHaveValue(5000);

    await user.clear(amount);
    await user.type(amount, '6000');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(farm.updateExpense).toHaveBeenCalledWith('e1', expect.objectContaining({ amount: 6000 }));
    expect(mockShowToast).toHaveBeenCalledWith('Expense updated', 'success');
  });

  it('deletes an expense after asking first', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    render(<CropExpensesSection crop={maize} />);

    await user.click(screen.getByRole('button', { name: 'Delete Seed expense from 1 Mar 2026' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete Seed expense?' });
    expect(dialog).toHaveTextContent('This KES 5,000 expense will be removed for good.');

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(farm.deleteExpense).toHaveBeenCalledWith('e1');
    expect(mockShowToast).toHaveBeenCalledWith('Expense deleted', 'success');
  });

  it('does not delete when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    render(<CropExpensesSection crop={maize} />);

    await user.click(screen.getByRole('button', { name: 'Delete Seed expense from 1 Mar 2026' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(farm.deleteExpense).not.toHaveBeenCalled();
  });

  it('shows error toasts when saving or deleting fails', async () => {
    const user = userEvent.setup();
    mockFarm({
      updateExpense: vi.fn().mockRejectedValue(new Error('offline')),
      deleteExpense: vi.fn().mockRejectedValue(new Error('offline')),
    });
    render(<CropExpensesSection crop={maize} />);

    await user.click(screen.getByRole('button', { name: 'Edit Seed expense from 1 Mar 2026' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Couldn't save the expense. Please try again.", 'error');
    });

    await user.click(screen.getByRole('button', { name: 'Delete Seed expense from 1 Mar 2026' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Couldn't delete the expense. Please try again.", 'error');
    });
  });
});
