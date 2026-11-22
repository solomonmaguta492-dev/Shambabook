import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Crops from '../pages/Crops.jsx';
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
  { id: 'c1', name: 'Maize', variety: 'H614', plotSize: 2, plantingDate: '2026-03-01', status: 'Growing' },
  { id: 'c2', name: 'Beans', variety: '', plotSize: 1, plantingDate: '2026-04-10', status: 'Planted' },
];

/* Default farm values; each test can change some of them */
function mockFarm(overrides = {}) {
  const farm = {
    crops: [],
    cropsLoading: false,
    cropsError: '',
    retryCrops: vi.fn(),
    addCrop: vi.fn(),
    updateCrop: vi.fn(),
    deleteCrop: vi.fn(),
    expenses: [],
    ...overrides,
  };
  vi.mocked(useFarm).mockReturnValue(farm);
  return farm;
}

function renderCrops() {
  render(
    <MemoryRouter>
      <Crops />
    </MemoryRouter>
  );
}

describe('Crops page', () => {
  beforeEach(() => {
    mockShowToast.mockReset();
  });

  it('shows a spinner while loading', () => {
    mockFarm({ cropsLoading: true });
    renderCrops();

    expect(screen.getByRole('status')).toHaveTextContent('Loading crops…');
  });

  it('shows the empty state when there are no crops', () => {
    mockFarm();
    renderCrops();

    expect(screen.getByRole('heading', { name: 'No crops yet' })).toBeInTheDocument();
  });

  it('shows an error with a Retry button when loading fails', async () => {
    const user = userEvent.setup();
    const farm = mockFarm({ cropsError: "We couldn't load your crops." });
    renderCrops();

    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't load your crops.");
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(farm.retryCrops).toHaveBeenCalled();
  });

  it('shows a list of crops', () => {
    mockFarm({ crops: sampleCrops });
    renderCrops();

    expect(screen.getByRole('link', { name: 'Maize' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Beans' })).toBeInTheDocument();
  });

  it('filters the crops by status', async () => {
    const user = userEvent.setup();
    mockFarm({ crops: sampleCrops });
    renderCrops();

    await user.click(screen.getByRole('button', { name: 'Growing' }));

    expect(screen.getByRole('link', { name: 'Maize' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Beans' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Growing' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Harvested' }));

    expect(screen.getByRole('heading', { name: 'No harvested crops' })).toBeInTheDocument();
  });

  it('opens the add form in a modal', async () => {
    const user = userEvent.setup();
    mockFarm({ crops: sampleCrops });
    renderCrops();

    await user.click(screen.getByRole('button', { name: '+ Add crop' }));

    const dialog = screen.getByRole('dialog', { name: 'Add a crop' });
    expect(within(dialog).getByLabelText('Crop name')).toHaveFocus();
  });

  it('closes the dialog and shows the toast immediately after confirming delete', async () => {
    const user = userEvent.setup();
    const farm = mockFarm({ crops: sampleCrops });
    /* A promise that never finishes, like a slow server */
    farm.deleteCrop.mockReturnValue(new Promise(() => {}));
    renderCrops();

    await user.click(screen.getByRole('button', { name: 'Delete Maize' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete Maize?' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(farm.deleteCrop).toHaveBeenCalledWith('c1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Crop deleted', 'success');
    /* Still waiting for Firestore, so it can't be deleted twice */
    expect(screen.getByRole('button', { name: 'Delete Maize' })).toBeDisabled();
  });

  it('warns that deleting a crop also deletes its expenses', async () => {
    const user = userEvent.setup();
    mockFarm({
      crops: sampleCrops,
      expenses: [
        { id: 'e1', cropId: 'c1', category: 'Seed', amount: 500, date: '2026-03-01' },
        { id: 'e2', cropId: 'c1', category: 'Labour', amount: 800, date: '2026-03-02' },
      ],
    });
    renderCrops();

    await user.click(screen.getByRole('button', { name: 'Delete Maize' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('This will also delete its 2 expenses.');
  });

  it('shows an error toast if the delete fails', async () => {
    const user = userEvent.setup();
    const farm = mockFarm({ crops: sampleCrops });
    farm.deleteCrop.mockRejectedValue(new Error('permission-denied'));
    renderCrops();

    await user.click(screen.getByRole('button', { name: 'Delete Maize' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    expect(mockShowToast).toHaveBeenCalledWith("Couldn't delete the crop. Please try again.", 'error');
    expect(screen.getByRole('button', { name: 'Delete Maize' })).toBeEnabled();
  });

  it('closes the add form and shows the toast immediately after saving', async () => {
    const user = userEvent.setup();
    const farm = mockFarm({ crops: sampleCrops });
    farm.addCrop.mockReturnValue(new Promise(() => {}));
    renderCrops();

    await user.click(screen.getByRole('button', { name: '+ Add crop' }));
    const dialog = screen.getByRole('dialog', { name: 'Add a crop' });
    await user.type(within(dialog).getByLabelText('Crop name'), 'Sorghum');
    await user.type(within(dialog).getByLabelText('Plot size (acres)'), '3');
    fireEvent.change(within(dialog).getByLabelText('Planting date'), { target: { value: '2026-05-01' } });
    await user.click(within(dialog).getByRole('button', { name: 'Add crop' }));

    expect(farm.addCrop).toHaveBeenCalledWith(expect.objectContaining({ name: 'Sorghum', plotSize: 3 }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Crop added', 'success');
  });

  it('shows an error toast if saving an edit fails', async () => {
    const user = userEvent.setup();
    const farm = mockFarm({ crops: sampleCrops });
    farm.updateCrop.mockRejectedValue(new Error('offline'));
    renderCrops();

    await user.click(screen.getByRole('button', { name: 'Edit Maize' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(farm.updateCrop).toHaveBeenCalledWith('c1', expect.objectContaining({ name: 'Maize' }));
    expect(mockShowToast).toHaveBeenCalledWith('Crop updated', 'success');
    expect(mockShowToast).toHaveBeenCalledWith("Couldn't save the crop. Please try again.", 'error');
  });
});
