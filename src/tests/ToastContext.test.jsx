import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../context/ToastContext.jsx';
import { useToast } from '../hooks/useToast.js';

/* Two buttons that each show a toast */
function ToastButtons() {
  const { showToast } = useToast();
  return (
    <>
      <button type="button" onClick={() => showToast('Crop added', 'success')}>
        Success
      </button>
      <button type="button" onClick={() => showToast("Couldn't save", 'error')}>
        Error
      </button>
    </>
  );
}

describe('ToastContext', () => {
  it('shows success toasts with role="status" and errors with role="alert"', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastButtons />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Success' }));
    await user.click(screen.getByRole('button', { name: 'Error' }));

    expect(screen.getByRole('status')).toHaveTextContent('Crop added');
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't save");
  });
});
