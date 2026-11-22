import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CropDetails from '../pages/CropDetails.jsx';
import { useFarm } from '../hooks/useFarm.js';

/* Fake useFarm and useToast so each test can choose what the page receives */
vi.mock('../hooks/useFarm.js', () => ({
  useFarm: vi.fn(),
}));

vi.mock('../hooks/useToast.js', () => ({
  useToast: () => ({ showToast: vi.fn() }),
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
  vi.mocked(useFarm).mockReturnValue({
    crops: [maize],
    cropsLoading: false,
    updateCrop: vi.fn(),
    deleteCrop: vi.fn(),
    expenses: [],
    addExpense: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
    harvests: [],
    addHarvest: vi.fn(),
    updateHarvest: vi.fn(),
    deleteHarvest: vi.fn(),
    ...overrides,
  });
}

function renderAt(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/crops/:id" element={<CropDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

/* Finds a summary card by its label and returns the big number inside it */
function cardValue(label) {
  return screen.getByRole('heading', { name: label }).parentElement.nextElementSibling;
}

describe('CropDetails page', () => {
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
});
