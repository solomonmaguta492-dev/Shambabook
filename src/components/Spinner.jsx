/* A spinning circle; the hidden text tells screen readers what is happening */
function Spinner({ label = 'Loading…' }) {
  return (
    <div role="status" className="flex justify-center py-12">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-green-700" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default Spinner;
