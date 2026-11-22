import { Link } from 'react-router-dom';
import Spinner from '../Spinner.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

const linkClasses = 'font-medium text-green-700 hover:text-green-800 hover:underline';

/*
  The latest expenses and harvests in one list.
  Money spent is rose with a minus, money earned is green with a plus,
  so the colour is never the only clue.
*/
function RecentActivity({ items, loading }) {
  return (
    <section aria-labelledby="activity-heading" className="rounded-xl border border-stone-300 bg-white p-5 shadow-sm">
      <h2 id="activity-heading" className="text-lg font-semibold text-stone-900">
        Recent activity
      </h2>

      {loading && <Spinner size="small" label="Loading activity…" />}

      {!loading && items.length === 0 && (
        <p className="mt-3 text-stone-600">
          Nothing recorded yet.{' '}
          <Link to="/expenses" className={linkClasses}>
            Add an expense
          </Link>{' '}
          or{' '}
          <Link to="/harvests" className={linkClasses}>
            add a harvest
          </Link>
          .
        </p>
      )}

      {!loading && items.length > 0 && (
        <ul className="mt-3 divide-y divide-stone-200">
          {items.map((item) => {
            const isExpense = item.type === 'expense';

            return (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium break-words text-stone-900">
                    {isExpense ? 'Expense' : 'Harvest'} · {item.cropName}
                  </p>
                  <p className="text-sm text-stone-500">{formatDate(item.date)}</p>
                </div>
                <p className={`shrink-0 font-semibold ${isExpense ? 'text-rose-700' : 'text-green-700'}`}>
                  {isExpense ? formatCurrency(-item.amount) : `+${formatCurrency(item.amount)}`}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default RecentActivity;
