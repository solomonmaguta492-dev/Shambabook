/* Big spinner for whole pages, small one for inside a card */
const sizes = {
  large: { box: 'py-12', circle: 'h-8 w-8 border-4' },
  small: { box: 'py-4', circle: 'h-5 w-5 border-2' },
};

/* A spinning circle; the hidden text tells screen readers what is happening */
function Spinner({ label = 'Loading…', size = 'large' }) {
  return (
    <div role="status" className={`flex justify-center ${sizes[size].box}`}>
      <span className={`animate-spin rounded-full border-stone-200 border-t-green-700 ${sizes[size].circle}`} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default Spinner;
