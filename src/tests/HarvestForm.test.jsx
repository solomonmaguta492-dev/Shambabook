import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HarvestForm from '../components/harvests/HarvestForm.jsx';

const crops = [
  { id: 'c1', name: 'Maize' },
  { id: 'c2', name: 'Beans' },
];

describe('HarvestForm', () => {
  it('shows errors for empty fields and focuses the first one', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<HarvestForm crops={crops} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Save harvest' }));

    expect(screen.getByText('Please choose a crop')).toBeInTheDocument();
    expect(screen.getByText('Quantity is required')).toBeInTheDocument();
    expect(screen.getByText('Please choose a unit')).toBeInTheDocument();
    expect(screen.getByText('Price per unit is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Crop')).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the income as the farmer types', async () => {
    const user = userEvent.setup();
    render(<HarvestForm crops={crops} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('Income: KES 0')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Quantity'), '20');
    await user.type(screen.getByLabelText('Price per unit (KES)'), '3500');

    expect(screen.getByText('Income: KES 70,000')).toBeInTheDocument();
  });

  it('calls onSubmit with numbers when valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<HarvestForm crops={crops} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText('Crop'), 'Maize');
    await user.type(screen.getByLabelText('Quantity'), '20');
    await user.selectOptions(screen.getByLabelText('Unit'), 'bags');
    await user.type(screen.getByLabelText('Price per unit (KES)'), '3500');
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-12' } });
    await user.click(screen.getByRole('button', { name: 'Save harvest' }));

    expect(onSubmit).toHaveBeenCalledWith({
      cropId: 'c1',
      quantity: 20,
      unit: 'bags',
      pricePerUnit: 3500,
      date: '2026-03-12',
    });
  });

  it('starts with the given crop already chosen', () => {
    render(<HarvestForm crops={crops} defaultCropId="c2" onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Crop')).toHaveValue('c2');
  });

  it('fills in the fields and the income when editing', () => {
    const harvest = { id: 'h1', cropId: 'c1', quantity: 10, unit: 'crates', pricePerUnit: 800, date: '2026-03-02' };
    render(<HarvestForm harvest={harvest} crops={crops} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Unit')).toHaveValue('crates');
    expect(screen.getByText('Income: KES 8,000')).toBeInTheDocument();
  });
});
