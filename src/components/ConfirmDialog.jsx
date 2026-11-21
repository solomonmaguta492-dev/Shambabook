import Modal from './Modal.jsx';
import Button from './Button.jsx';

/* Asks "are you sure?" before something that can't be undone, like deleting */
function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-stone-600">{message}</p>

      <div className="mt-6 flex justify-end gap-3">
        {/* Cancel gets focus first, so pressing Enter by accident does no harm */}
        <Button variant="secondary" onClick={onCancel} data-autofocus>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
