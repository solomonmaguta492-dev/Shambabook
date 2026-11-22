/*
  A labelled dropdown with an error message underneath, the same as Input.
  Pass the <option> elements as children.
*/
function Select({ id, label, value, onChange, error, ref, children, ...props }) {
  const errorId = `${id}-error`;
  const borderColour = error
    ? 'border-rose-700 focus:outline-rose-700'
    : 'border-stone-300 focus:outline-green-700';

  return (
    <div>
      <label htmlFor={id} className="block font-medium text-stone-700">
        {label}
      </label>
      <select
        id={id}
        ref={ref}
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-stone-900 focus:outline-2 focus:outline-offset-1 ${borderColour}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default Select;
