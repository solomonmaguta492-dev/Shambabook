/*
  A labelled input with an error message underneath.
  aria-describedby links the error to the input so screen readers read it out.
*/
function Input({ id, label, type = 'text', value, onChange, error, ref, ...props }) {
  const errorId = `${id}-error`;
  const borderColour = error
    ? 'border-rose-700 focus:outline-rose-700'
    : 'border-stone-300 focus:outline-green-700';

  return (
    <div>
      <label htmlFor={id} className="block font-medium text-stone-700">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-stone-900 focus:outline-2 focus:outline-offset-1 ${borderColour}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
