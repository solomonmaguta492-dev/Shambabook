import Icon from './Icon.jsx';

/* Friendly box shown when a list has nothing in it */
function EmptyState({ icon = 'crops', title, message, action }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
        <Icon name={icon} />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-stone-900">{title}</h2>
      {message && <p className="mt-1 max-w-sm text-stone-600">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
