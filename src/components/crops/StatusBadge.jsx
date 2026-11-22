/* Each status gets its own colour so it is easy to spot */
const colours = {
  Planted: 'bg-amber-100 text-amber-800',
  Growing: 'bg-green-100 text-green-800',
  Harvested: 'bg-stone-200 text-stone-700',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-medium ${colours[status]}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
