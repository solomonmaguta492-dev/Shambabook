import Icon from './Icon.jsx';

/* Colour of the big number: green for a profit, rose for a loss, dark for anything else */
const toneClasses = {
  neutral: 'text-stone-900',
  positive: 'text-green-700',
  negative: 'text-rose-700',
};

/* A small box with a label, a big number, and optionally an icon and a link underneath */
function StatCard({ label, value, icon, tone = 'neutral', children }) {
  return (
    <div className="min-w-0 rounded-xl border border-stone-300 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3 text-stone-600">
        {/* The icon is hidden on phones, where two cards share one row and space is short */}
        {icon && (
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700 sm:flex">
            <Icon name={icon} className="h-5 w-5" />
          </span>
        )}
        <h2 className="font-medium">{label}</h2>
      </div>
      <p className={`mt-3 text-xl font-bold break-words sm:text-2xl md:text-3xl ${toneClasses[tone]}`}>{value}</p>
      {children}
    </div>
  );
}

export default StatCard;
