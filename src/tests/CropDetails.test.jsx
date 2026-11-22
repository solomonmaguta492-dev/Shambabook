import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CropDetails from '../pages/CropDetails.jsx';
import { useFarm } from '../hooks/useFarm.js';

/* Fake useFarm and useToast so each test can choose what the page receives */
vi.mock('../hooks/useFarm.js', () => ({
  useFarm: vi.fn(),
}));

const mockShowToast = vi.fn();
vi.mock('../hooks/useToast.js', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const maize = {
  id: 'c1',
  name: 'Maize',
  variety: 'H614',
  plotSize: 2,
  plantingDate: '2026-03-01',
  expectedHarvestDate: '2026-07-15',
  status: 'Growing',
};

function mockFarm(overrides = {}) {
  const farm = {
    crops: [maize],
    cropsLoading: false,
    updateCrop: vi.fn().mockResolvedValue(),
    deleteCrop: vi.fn().mockResolvedValue(),
    expenses: [],
    addExpense: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
    harvests: [],
    addHarvest: vi.fn(),
    updateHarvest: vi.fn(),
    deleteHarvest: vi.fn(),
    ...overrides,
  };
  vi.mocked(useFarm).mockReturnValue(farm);
  return farm;
}

function renderAt(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/crops/:id" element={<CropDetails />} />
        <Route path="/crops" element={<p>All crops page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

/* Finds a summary card by its label and returns the big number inside it */
function cardValue(label) {
  return screen.getByRole('heading', { name: label }).parentElement.nextElementSibling;
}

describe('CropDetails page', () => {
  beforeEach(() => {
    mockShowToast.mockReset();
  });

  it('shows a profit in green', () => {
    mockFarm({
      expenses: [{ id: 'e1', cropId: 'c1', category: 'Seed', amount: 5000, date: '2026-03-01', note: '' }],
      harvests: [{ id: 'h1', cropId: 'c1', quantity: 20, unit: 'bags', pricePerUnit: 3500, date: '2026-07-20' }],
    });
    renderAt('/crops/c1');

    expect(screen.getByRole('heading', { level: 1, name: 'Maize' })).toBeInTheDocument();
    expect(cardValue('Total expenses')).toHaveTextContent('KES 5,000');
    expect(cardValue('Total income')).toHaveTextContent('KES 70,000');
    expect(cardValue('Profit')).toHaveTextContent('KES 65,000');
    expect(cardValue('Profit')).toHaveClass('text-green-700');
  });

  it('shows a loss in rose with a minus sign', () => {
    mockFarm({
      expenses: [{ id: 'e1', cropId: 'c1', category: 'Labour', amount: 3000, date: '2026-03-01', note: '' }],
      harvests: [{ id: 'h1', cropId: 'c1', quantity: 10, unit: 'kg', pricePerUnit: 100, date: '2026-07-20' }],
    });
    renderAt('/crops/c1');

    expect(cardValue('Loss')).toHaveTextContent('-KES 2,000');
    expect(cardValue('Loss')).toHaveClass('text-rose-700');
  });

  it('lists only this crop\'s harvests and opens the form with the crop chosen', async () => {
    const user = userEvent.setup();
    mockFarm({
      crops: [maize, { id: 'c2', name: 'Beans' }],
      harvests: [
        { id: 'h1', cropId: 'c1', quantity: 20, unit: 'bags', pricePerUnit: 3500, date: '2026-07-20' },
        { id: 'h2', cropId: 'c2', quantity: 50, unit: 'kg', pricePerUnit: 120, date: '2026-07-21' },
      ],
    });
    renderAt('/crops/c1');

    expect(screen.getByText('20 bags × KES 3,500')).toBeInTheDocument();
    expect(screen.queryByText('50 kg × KES 120')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '+ Add harvest' }));

    expect(screen.getByRole('dialog', { name: 'Add a harvest' })).toBeInTheDocument();
    expect(screen.getByLabelText('Crop')).toHaveValue('c1');
  });

  it('warns that deleting the crop deletes its expenses and harvests', async () => {
    const user = userEvent.setup();
    mockFarm({
      expenses: [{ id: 'e1', cropId: 'c1', category: 'Seed', amount: 500, date: '2026-03-01', note: '' }],
      harvests: [{ id: 'h1', cropId: 'c1', quantity: 2, unit: 'bags', pricePerUnit: 3000, date: '2026-07-20' }],
    });
    renderAt('/crops/c1');

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('This will also delete its 1 expense and 1 harvest.');
  });

  it('shows "Crop not found" for an unknown id', () => {
    mockFarm();
    renderAt('/crops/nope');

    expect(screen.getByRole('heading', { name: 'Crop not found' })).toBeInTheDocument();
  });

  it("shows an error with Retry instead of \"Crop not found\" when crops fail to load", async () => {
    const user = userEvent.setup();
    const retryCrops = vi.fn();
    mockFarm({ crops: [], cropsError: "We couldn't load your crops.", retryCrops });
    renderAt('/crops/c1');

    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't load your crops.");
    expect(screen.queryByText('Crop not found')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retryCrops).toHaveBeenCalled();
  });

  it('sets the page title to the crop name', () => {
    mockFarm();
    renderAt('/crops/c1');

    expect(document.title).toBe('Maize · ShambaBook');
  });

  it('shows a spinner while crops load', () => {
    mockFarm({ cropsLoading: true });
    renderAt('/crops/c1');

    expect(screen.getByRole('status')).toHaveTextContent('Loading crop…');
  });

  it('shows the crop details and empty expense and harvest lists', () => {
    mockFarm();
    renderAt('/crops/c1');

    expect(screen.getByText('H614')).toBeInTheDocument();
    expect(screen.getByText('1 Mar 2026')).toBeInTheDocument();
    expect(screen.getByText('No expenses for this crop yet.')).toBeInTheDocument();
    expect(screen.getByText('No harvests for this crop yet.')).toBeInTheDocument();
  });

  it('has a link back to the crops list when the crop is not found', async () => {
    const user = userEvent.setup();
    mockFarm();
    renderAt('/crops/nope');

    expect(document.title).toBe('Crop not found · ShambaBook');
    await user.click(screen.getByRole('link', { name: '← Back to crops' }));

    expect(screen.getByText('All crops page')).toBeInTheDocument();
  });

  it('edits the crop', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    renderAt('/crops/c1');

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const name = within(screen.getByRole('dialog', { name: 'Edit crop' })).getByLabelText('Crop name');
    await user.clear(name);
    await user.type(name, 'Yellow maize');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(farm.updateCrop).toHaveBeenCalledWith('c1', expect.objectContaining({ name: 'Yellow maize' }));
    expect(mockShowToast).toHaveBeenCalledWith('Crop updated', 'success');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the edit form without saving when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    renderAt('/crops/c1');

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(farm.updateCrop).not.toHaveBeenCalled();
  });

  it('deletes the crop and goes back to the crops list', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    renderAt('/crops/c1');

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(within(screen.getByRole('dialog', { name: 'Delete Maize?' })).getByRole('button', { name: 'Delete' }));

    expect(farm.deleteCrop).toHaveBeenCalledWith('c1');
    expect(mockShowToast).toHaveBeenCalledWith('Crop deleted', 'success');
    expect(screen.getByText('All crops page')).toBeInTheDocument();
  });

  it('keeps the crop when Cancel is clicked in the delete dialog', async () => {
    const user = userEvent.setup();
    const farm = mockFarm();
    renderAt('/crops/c1');

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(farm.deleteCrop).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { level: 1, name: 'Maize' })).toBeInTheDocument();
  });

  it('shows an error toast when saving the crop fails', async () => {
    const user = userEvent.setup();
    mockFarm({ updateCrop: vi.fn().mockRejectedValue(new Error('offline')) });
    renderAt('/crops/c1');

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Couldn't save the crop. Please try again.", 'error');
    });
  });

  it('shows an error toast when deleting the crop fails', async () => {
    const user = userEvent.setup();
    mockFarm({ deleteCrop: vi.fn().mockRejectedValue(new Error('offline')) });
    renderAt('/crops/c1');

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Couldn't delete the crop. Please try again.", 'error');
    });
  });
});
