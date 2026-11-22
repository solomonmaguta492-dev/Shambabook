import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CropForm from '../components/crops/CropForm.jsx';

/* Date inputs are easiest to fill by setting their value directly */
function setDate(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe('CropForm', () => {
  it('shows errors for empty fields and focuses the first one', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CropForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Save crop' }));

    expect(screen.getByText('Crop name is required')).toBeInTheDocument();
    expect(screen.getByText('Plot size is required')).toBeInTheDocument();
    expect(screen.getByText('Planting date is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Crop name')).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows errors for a plot size of 0 and a harvest date before planting', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CropForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Crop name'), 'Maize');
    await user.type(screen.getByLabelText('Plot size (acres)'), '0');
    setDate('Planting date', '2026-03-01');
    setDate('Expected harvest date', '2026-02-01');
    await user.click(screen.getByRole('button', { name: 'Save crop' }));

    expect(screen.getByText('Plot size must be a number greater than 0')).toBeInTheDocument();
    expect(screen.getByText('Harvest date cannot be before the planting date')).toBeInTheDocument();
    expect(screen.getByLabelText('Plot size (acres)')).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with the cleaned-up data when valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue();
    render(<CropForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Crop name'), '  Maize ');
    await user.type(screen.getByLabelText('Variety (optional)'), 'H614');
    await user.type(screen.getByLabelText('Plot size (acres)'), '2.5');
    setDate('Planting date', '2026-03-01');
    setDate('Expected harvest date', '2026-07-15');
    await user.selectOptions(screen.getByLabelText('Status'), 'Growing');
    await user.click(screen.getByRole('button', { name: 'Save crop' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Maize',
      variety: 'H614',
      plotSize: 2.5,
      plantingDate: '2026-03-01',
      expectedHarvestDate: '2026-07-15',
      status: 'Growing',
    });
  });

  it('fills in the fields when editing a crop', () => {
    const crop = {
      id: 'crop1',
      name: 'Beans',
      variety: '',
      plotSize: 1,
      plantingDate: '2026-04-01',
      expectedHarvestDate: '',
      status: 'Planted',
    };
    render(<CropForm crop={crop} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Crop name')).toHaveValue('Beans');
    expect(screen.getByLabelText('Plot size (acres)')).toHaveValue(1);
  });
});
