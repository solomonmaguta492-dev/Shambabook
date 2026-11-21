/* White button for signing in with Google, with a plain "G" instead of the official logo */
function GoogleButton({ label = 'Continue with Google', onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-2 font-medium text-stone-700 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:opacity-60"
    >
      <span
        aria-hidden="true"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-sm font-bold text-stone-700"
      >
        G
      </span>
      {label}
    </button>
  );
}

export default GoogleButton;
