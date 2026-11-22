import { useEffect, useId, useRef } from 'react';
import Icon from './Icon.jsx';

/* Things a keyboard user can move to with Tab */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

/*
  A pop-up window over the page.
  Escape and the close button call onClose, and Tab stays inside the modal while it is open.
*/
function Modal({ open, title, onClose, children }) {
  const titleId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    /* Remember what had focus, then move focus into the modal */
    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    const firstField = panel.querySelector('[data-autofocus], input, select, textarea');
    const target = firstField || panel.querySelector(FOCUSABLE);
    target?.focus();

    /* When the modal closes, put focus back where it was */
    return () => previouslyFocused?.focus();
  }, [open]);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      onClose();
      return;
    }

    /* Wrap Tab from the last item back to the first, and Shift+Tab the other way */
    if (event.key === 'Tab') {
      const items = panelRef.current.querySelectorAll(FOCUSABLE);
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/50 p-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-bold text-stone-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-green-700"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;
