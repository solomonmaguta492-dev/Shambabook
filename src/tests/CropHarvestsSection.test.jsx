import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CropHarvestsSection from '../components/harvests/CropHarvestsSection.jsx';
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

const maizeHarvest = { id: 'h1', cropId: 'c1', quantity: 20, unit: 'bags', pricePerUnit: 3500, date: '2026-07-20' };
const beansHarvest = { id: 'h2', cropId: 'c2', quantity: 50, unit: 'kg', pricePerUnit: 120, date: '2026-07-21' };

/* Default farm values; each test can change some of them */
function mockFarm(overrides = {}) {
  const farm = {
    crops: [maize, beans],
    harvests: [maizeHarvest, beansHarvest],
    addHarvest: vi.fn().mockResolvedValue(),
    updateHarvest: vi.fn().mockResolvedValue(),
    deleteHarvest: vi.fn().mockResolvedValue(),
    ...overrides,
  };
  vi.mocked(useFarm).mockReturnValue(farm);
  return farm;
}

describe('CropHarvestsSection', () => {
  beforeEach(() => {
    mockShowToast.mockReset();
  });

  it('shows the empty message and zero income when the crop has no harvests', () => {
    mockFarm({ harvests: [beansHarvest] });
    render(<CropHarvestsSection crop={maize} />);

    expect(screen.getByText('No harvests for this crop yet.')).toBeInTheDocument();
    expect(screen.getByText(/Total income/)).toHaveTextContent('KES 0');
  });

  it("lists only this crop's harvests and adds up the income", () => {
    mockFarm();
    render(<CropHarvestsSection crop={maize} />);

    expect(screen.getByText('20 bags × KES 3,500')).toBeInTheDocument();
    expect(screen.queryByText('50 kg × KES 120')).not.toBeInTheDocument();
    expect(screen.getByText(/Total income/)).toHaveTextContent('KES 70,000');
  });

  it('adds a harvest for this crop', async () => {
    const user = userEvent.setup();
    const farm = mockFarm({ harvests: [] });
    render(<CropHarvestsSection crop={maize} />);

    await user.click(screen.getByRole('button', { name: '+ Add harvest' }));
    const dialog = screen.getByRole('dialog', { name: 'Add a harvest' });

    await user.type(within(dialog).getByLabelText('Quantity'), '10');
    await user.selectOptions(within(dialog).getByLabelText('Unit'), 'bags');
    await user.type(within(dialog).getByLabelText('Price per unit (KES)'), '3000');
    await user.click(within(dialog).getByRole('button', { name: 'Add harvest' }));

    expect(farm.addHarvest).toHaveBeenCalledWith(
      expect.objectContaining({ cropId: 'c1', quantity: 10, unit: 'bags', pricePerUnit: 3000 })
    );
    expect(mockShowToast).toHaveBeenCalledWith('Harvest added', 'success');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('edits a harvest', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    render(<CropHarvestsSection crop={maize} />);

    await user.click(screen.getByRole('button', { name: 'Edit Maize harvest from 20 Jul 2026' }));
    const quantity = within(screen.getByRole('dialog', { name: 'Edit harvest' })).getByLabelText('Quantity');
    expect(quantity).toHaveValue(20);

    await user.clear(quantity);
    await user.type(quantity, '25');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(farm.updateHarvest).toHaveBeenCalledWith('h1', expect.objectContaining({ quantity: 25 }));
    expect(mockShowToast).toHaveBeenCalledWith('Harvest updated', 'success');
  });

  it('deletes a harvest after asking first', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    render(<CropHarvestsSection crop={maize} />);

    await user.click(screen.getByRole('button', { name: 'Delete Maize harvest from 20 Jul 2026' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete this harvest?' });
    expect(dialog).toHaveTextContent('This KES 70,000 harvest will be removed for good.');

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(farm.deleteHarvest).toHaveBeenCalledWith('h1');
    expect(mockShowToast).toHaveBeenCalledWith('Harvest deleted', 'success');
  });

  it('does not delete when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    render(<CropHarvestsSection crop={maize} />);

    await user.click(screen.getByRole('button', { name: 'Delete Maize harvest from 20 Jul 2026' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(farm.deleteHarvest).not.toHaveBeenCalled();
  });

  it('shows error toasts when saving or deleting fails', async () => {
    const user = userEvent.setup();
    mockFarm({
      updateHarvest: vi.fn().mockRejectedValue(new Error('offline')),
      deleteHarvest: vi.fn().mockRejectedValue(new Error('offline')),
    });
    render(<CropHarvestsSection crop={maize} />);

    await user.click(screen.getByRole('button', { name: 'Edit Maize harvest from 20 Jul 2026' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Couldn't save the harvest. Please try again.", 'error');
    });

    await user.click(screen.getByRole('button', { name: 'Delete Maize harvest from 20 Jul 2026' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Couldn't delete the harvest. Please try again.", 'error');
    });
  });
});
