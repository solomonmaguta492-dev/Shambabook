import { createContext, useState } from 'react';

/* Lets any component show a short message at the top of the screen */
/* eslint-disable-next-line react-refresh/only-export-components */
export const ToastContext = createContext(null);

const styles = {
  success: 'bg-green-700 text-white',
  error: 'bg-rose-700 text-white',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = 'success') {
    /* A unique id so we know which toast to remove later */
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);

    /* Remove this toast again after 3 seconds */
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Success toasts are read out politely; errors use role="alert" so they are read out at once */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`rounded-lg px-4 py-3 font-medium shadow-lg ${styles[toast.type]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
