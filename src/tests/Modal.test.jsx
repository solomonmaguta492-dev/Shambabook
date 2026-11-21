import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

describe('Modal', () => {
  function renderModal(onClose = vi.fn()) {
    render(
      <Modal open title="Add a crop" onClose={onClose}>
        <label htmlFor="name">Name</label>
        <input id="name" />
      </Modal>
    );
  }

  it('shows nothing when closed', () => {
    render(
      <Modal open={false} title="Add a crop" onClose={vi.fn()}>
        <p>Hidden</p>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is a labelled dialog that focuses the first input', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Add a crop' })).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });

  it('closes on Escape and on the close button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(onClose);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('ConfirmDialog', () => {
  function renderDialog(onConfirm = vi.fn(), onCancel = vi.fn()) {
    render(
      <ConfirmDialog
        open
        title="Delete Maize?"
        message="This can't be undone."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
  }

  it('calls onConfirm when Delete is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderDialog(onConfirm);

    expect(screen.getByRole('dialog', { name: 'Delete Maize?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('focuses Cancel first and calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderDialog(vi.fn(), onCancel);

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
