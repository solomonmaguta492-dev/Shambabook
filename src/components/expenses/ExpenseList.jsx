import Icon from '../Icon.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

const iconButton =
  'rounded-lg p-3 text-stone-500 focus-visible:outline-2 focus-visible:outline-green-700 disabled:opacity-40';

/*
  A list of expenses with Edit and Delete buttons on each row.
  Set showCrop to false when every row is for the same crop, like on a crop's own page.
*/
function ExpenseList({ expenses, crops, showCrop = true, deletingIds = [], onEdit, onDelete }) {
  /* Look up a crop's name from its id */
  function cropName(cropId) {
    return crops.find((crop) => crop.id === cropId)?.name || 'Unknown crop';
  }

  return (
    <ul className="divide-y divide-stone-200 rounded-xl border border-stone-300 bg-white">
      {expenses.map((expense) => {
        const details = [showCrop && cropName(expense.cropId), expense.note].filter(Boolean).join(' · ');
        const date = formatDate(expense.date);
        /* The date makes each label different, even when there are many expenses of one category */
        const label = `${expense.category} expense from ${date}`;

        return (
          <li key={expense.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-stone-900">{expense.category}</p>
              {details && <p className="truncate text-sm text-stone-600">{details}</p>}
              <p className="text-sm text-stone-500">{date}</p>
            </div>

            <p className="font-semibold whitespace-nowrap text-stone-900">{formatCurrency(expense.amount)}</p>

            <div className="flex">
              <button
                type="button"
                onClick={() => onEdit(expense)}
                aria-label={`Edit ${label}`}
                className={`${iconButton} hover:bg-stone-100 hover:text-stone-900`}
              >
                <Icon name="edit" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(expense)}
                disabled={deletingIds.includes(expense.id)}
                aria-label={`Delete ${label}`}
                className={`${iconButton} hover:bg-rose-50 hover:text-rose-700`}
              >
                <Icon name="trash" className="h-5 w-5" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default ExpenseList;
