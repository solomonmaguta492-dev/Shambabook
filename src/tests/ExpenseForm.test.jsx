import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseForm from '../components/expenses/ExpenseForm.jsx';

const crops = [
  { id: 'c1', name: 'Maize' },
  { id: 'c2', name: 'Beans' },
];

describe('ExpenseForm', () => {
  it('shows errors for empty fields and focuses the first one', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ExpenseForm crops={crops} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Save expense' }));

    expect(screen.getByText('Please choose a crop')).toBeInTheDocument();
    expect(screen.getByText('Please choose a category')).toBeInTheDocument();
    expect(screen.getByText('Amount is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Crop')).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows errors for an amount of 0 and a date in the future', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ExpenseForm crops={crops} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText('Crop'), 'Maize');
    await user.selectOptions(screen.getByLabelText('Category'), 'Seed');
    await user.type(screen.getByLabelText('Amount (KES)'), '0');
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2999-01-01' } });
    await user.click(screen.getByRole('button', { name: 'Save expense' }));

    expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    expect(screen.getByText('Date cannot be in the future')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount (KES)')).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with the cleaned-up data when valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ExpenseForm crops={crops} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText('Crop'), 'Beans');
    await user.selectOptions(screen.getByLabelText('Category'), 'Fertiliser');
    await user.type(screen.getByLabelText('Amount (KES)'), '2500');
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-12' } });
    await user.type(screen.getByLabelText('Note (optional)'), ' 2 bags of DAP ');
    await user.click(screen.getByRole('button', { name: 'Save expense' }));

    expect(onSubmit).toHaveBeenCalledWith({
      cropId: 'c2',
      category: 'Fertiliser',
      amount: 2500,
      date: '2026-03-12',
      note: '2 bags of DAP',
    });
  });

  it('starts with the given crop already chosen', () => {
    render(<ExpenseForm crops={crops} defaultCropId="c2" onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Crop')).toHaveValue('c2');
  });

  it('fills in the fields when editing an expense', () => {
    const expense = { id: 'e1', cropId: 'c1', category: 'Labour', amount: 800, date: '2026-03-02', note: 'Weeding' };
    render(<ExpenseForm expense={expense} crops={crops} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Category')).toHaveValue('Labour');
    expect(screen.getByLabelText('Amount (KES)')).toHaveValue(800);
    expect(screen.getByLabelText('Note (optional)')).toHaveValue('Weeding');
  });
});
