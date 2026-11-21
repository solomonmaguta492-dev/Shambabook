import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HarvestList from '../components/harvests/HarvestList.jsx';

const crops = [{ id: 'c1', name: 'Maize' }];
const harvests = [
  { id: 'h1', cropId: 'c1', quantity: 20, unit: 'bags', pricePerUnit: 3500, date: '2026-03-12' },
  { id: 'h2', cropId: 'c1', quantity: 1, unit: 'bags', pricePerUnit: 3000, date: '2026-03-02' },
];

describe('HarvestList', () => {
  it('shows a row for each harvest with its details and income', () => {
    render(<HarvestList harvests={harvests} crops={crops} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Maize');
    expect(rows[0]).toHaveTextContent('20 bags × KES 3,500');
    expect(rows[0]).toHaveTextContent('12 Mar 2026');
    expect(rows[0]).toHaveTextContent('KES 70,000');
    expect(rows[1]).toHaveTextContent('1 bag × KES 3,000');
  });

  it('can hide the crop name', () => {
    render(<HarvestList harvests={harvests} crops={crops} showCrop={false} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(within(screen.getAllByRole('listitem')[0]).queryByText('Maize')).not.toBeInTheDocument();
  });

  it('calls onEdit and onDelete with the harvest', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<HarvestList harvests={harvests} crops={crops} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'Edit Maize harvest from 12 Mar 2026' }));
    expect(onEdit).toHaveBeenCalledWith(harvests[0]);

    await user.click(screen.getByRole('button', { name: 'Delete Maize harvest from 2 Mar 2026' }));
    expect(onDelete).toHaveBeenCalledWith(harvests[1]);
  });

  it('disables Delete while that harvest is being deleted', () => {
    render(<HarvestList harvests={harvests} crops={crops} deletingIds={['h1']} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Delete Maize harvest from 12 Mar 2026' })).toBeDisabled();
  });
});
