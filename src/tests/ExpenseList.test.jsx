import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseList from '../components/expenses/ExpenseList.jsx';

const crops = [{ id: 'c1', name: 'Maize' }];
const expenses = [
  { id: 'e1', cropId: 'c1', category: 'Fertiliser', amount: 12500, date: '2026-03-12', note: '2 bags of DAP' },
  { id: 'e2', cropId: 'c1', category: 'Labour', amount: 800, date: '2026-03-02', note: '' },
];

describe('ExpenseList', () => {
  it('shows a row for each expense with its details', () => {
    render(<ExpenseList expenses={expenses} crops={crops} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Fertiliser');
    expect(rows[0]).toHaveTextContent('Maize · 2 bags of DAP');
    expect(rows[0]).toHaveTextContent('12 Mar 2026');
    expect(rows[0]).toHaveTextContent('KES 12,500');
  });

  it('can hide the crop name', () => {
    render(<ExpenseList expenses={expenses} crops={crops} showCrop={false} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(within(screen.getAllByRole('listitem')[0]).queryByText(/Maize/)).not.toBeInTheDocument();
  });

  it('calls onEdit and onDelete with the expense', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<ExpenseList expenses={expenses} crops={crops} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'Edit Fertiliser expense from 12 Mar 2026' }));
    expect(onEdit).toHaveBeenCalledWith(expenses[0]);

    await user.click(screen.getByRole('button', { name: 'Delete Labour expense from 2 Mar 2026' }));
    expect(onDelete).toHaveBeenCalledWith(expenses[1]);
  });

  it('disables Delete while that expense is being deleted', () => {
    render(
      <ExpenseList expenses={expenses} crops={crops} deletingIds={['e1']} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Delete Fertiliser expense from 12 Mar 2026' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete Labour expense from 2 Mar 2026' })).toBeEnabled();
  });
});
