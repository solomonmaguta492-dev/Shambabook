import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Harvests from '../pages/Harvests.jsx';
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

const sampleHarvests = [
  { id: 'h1', cropId: 'c1', quantity: 20, unit: 'bags', pricePerUnit: 3500, date: '2026-03-12' },
  { id: 'h2', cropId: 'c2', quantity: 50, unit: 'kg', pricePerUnit: 120, date: '2026-03-10' },
];

/* Default farm values; each test can change some of them */
function mockFarm(overrides = {}) {
  const farm = {
    crops: sampleCrops,
    cropsLoading: false,
    harvests: sampleHarvests,
    harvestsLoading: false,
    harvestsError: '',
    retryHarvests: vi.fn(),
    addHarvest: vi.fn(),
    updateHarvest: vi.fn(),
    deleteHarvest: vi.fn(),
    ...overrides,
  };
  vi.mocked(useFarm).mockReturnValue(farm);
  return farm;
}

function renderHarvests() {
  render(
    <MemoryRouter>
      <Harvests />
    </MemoryRouter>
  );
}

describe('Harvests page', () => {
  beforeEach(() => {
    mockShowToast.mockReset();
  });

  it('shows a spinner while loading', () => {
    mockFarm({ harvestsLoading: true });
    renderHarvests();

    expect(screen.getByRole('status')).toHaveTextContent('Loading harvests…');
  });

  it('asks to add a crop first when there are no crops', () => {
    mockFarm({ crops: [], harvests: [] });
    renderHarvests();

    expect(screen.getByRole('heading', { name: 'Add a crop first' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Add harvest' })).toBeDisabled();
  });

  it('shows the empty state when there are no harvests', () => {
    mockFarm({ harvests: [] });
    renderHarvests();

    expect(screen.getByRole('heading', { name: 'No harvests yet' })).toBeInTheDocument();
  });

  it('shows an error with a Retry button when loading fails', async () => {
    const user = userEvent.setup();
    const farm = mockFarm({ harvestsError: "We couldn't load your harvests." });
    renderHarvests();

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(farm.retryHarvests).toHaveBeenCalled();
  });

  it('shows the list and the total income', () => {
    mockFarm();
    renderHarvests();

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText(/^Total income:/)).toHaveTextContent('Total income: KES 76,000');
  });

  it('filters by crop and updates the total', async () => {
    const user = userEvent.setup();
    mockFarm();
    renderHarvests();

    await user.selectOptions(screen.getByLabelText('Crop'), 'Beans');

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText(/^Total income:/)).toHaveTextContent('Total income: KES 6,000');
  });

  it('adds a harvest and closes the form straight away', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    farm.addHarvest.mockReturnValue(new Promise(() => {}));
    renderHarvests();

    await user.click(screen.getByRole('button', { name: '+ Add harvest' }));
    const dialog = screen.getByRole('dialog', { name: 'Add a harvest' });
    await user.selectOptions(within(dialog).getByLabelText('Crop'), 'Maize');
    await user.type(within(dialog).getByLabelText('Quantity'), '5');
    await user.selectOptions(within(dialog).getByLabelText('Unit'), 'crates');
    await user.type(within(dialog).getByLabelText('Price per unit (KES)'), '900');
    await user.click(within(dialog).getByRole('button', { name: 'Add harvest' }));

    expect(farm.addHarvest).toHaveBeenCalledWith(
      expect.objectContaining({ cropId: 'c1', quantity: 5, unit: 'crates', pricePerUnit: 900 })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Harvest added', 'success');
  });

  it('deletes a harvest after confirming', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    farm.deleteHarvest.mockResolvedValue();
    renderHarvests();

    await user.click(screen.getByRole('button', { name: 'Delete Beans harvest from 10 Mar 2026' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    expect(farm.deleteHarvest).toHaveBeenCalledWith('h2');
    expect(mockShowToast).toHaveBeenCalledWith('Harvest deleted', 'success');
  });
});
