import Button from './Button.jsx';

/*
  A red box that explains what went wrong, with a Retry button.
  role="alert" makes screen readers read it out as soon as it appears.
*/
function ErrorMessage({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-4">
          Retry
        </Button>
      )}
    </div>
  );
}

export default ErrorMessage;
