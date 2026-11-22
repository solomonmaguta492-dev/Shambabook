import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CropCard from '../components/crops/CropCard.jsx';

const maize = {
  id: 'crop1',
  name: 'Maize',
  variety: 'H614',
  plotSize: 2.5,
  plantingDate: '2026-03-01',
  expectedHarvestDate: '2026-07-15',
  status: 'Growing',
};

function renderCard(onEdit = vi.fn(), onDelete = vi.fn()) {
  render(
    <MemoryRouter>
      <CropCard crop={maize} onEdit={onEdit} onDelete={onDelete} />
    </MemoryRouter>
  );
}

describe('CropCard', () => {
  it('shows the crop details and links to its page', () => {
    renderCard();

    expect(screen.getByRole('link', { name: 'Maize' })).toHaveAttribute('href', '/crops/crop1');
    expect(screen.getByText('Growing')).toBeInTheDocument();
    expect(screen.getByText('H614 · 2.5 acres · Planted 1 Mar 2026')).toBeInTheDocument();
  });

  it('calls onEdit and onDelete with the crop', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderCard(onEdit, onDelete);

    await user.click(screen.getByRole('button', { name: 'Edit Maize' }));
    expect(onEdit).toHaveBeenCalledWith(maize);

    await user.click(screen.getByRole('button', { name: 'Delete Maize' }));
    expect(onDelete).toHaveBeenCalledWith(maize);
  });
});
