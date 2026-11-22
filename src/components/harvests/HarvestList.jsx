import Icon from '../Icon.jsx';
import { formatCurrency, formatDate, formatQuantity } from '../../utils/format.js';
import { harvestIncome } from '../../utils/calculations.js';

const iconButton =
  'rounded-lg p-3 text-stone-500 focus-visible:outline-2 focus-visible:outline-green-700 disabled:opacity-40';

/*
  A list of harvests with Edit and Delete buttons on each row.
  Set showCrop to false when every row is for the same crop, like on a crop's own page.
*/
function HarvestList({ harvests, crops, showCrop = true, deletingIds = [], onEdit, onDelete }) {
  /* Look up a crop's name from its id */
  function cropName(cropId) {
    return crops.find((crop) => crop.id === cropId)?.name || 'Unknown crop';
  }

  return (
    <ul className="divide-y divide-stone-200 rounded-xl border border-stone-300 bg-white">
      {harvests.map((harvest) => {
        const name = cropName(harvest.cropId);
        const date = formatDate(harvest.date);
        /* The date makes each label different, even when one crop has many harvests */
        const label = `${name} harvest from ${date}`;

        return (
          <li key={harvest.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              {showCrop && <p className="font-medium text-stone-900">{name}</p>}
              <p className={showCrop ? 'text-sm text-stone-600' : 'font-medium text-stone-900'}>
                {formatQuantity(harvest.quantity, harvest.unit)} × {formatCurrency(harvest.pricePerUnit)}
              </p>
              <p className="text-sm text-stone-500">{date}</p>
            </div>

            <p className="font-semibold whitespace-nowrap text-green-700">{formatCurrency(harvestIncome(harvest))}</p>

            <div className="flex">
              <button
                type="button"
                onClick={() => onEdit(harvest)}
                aria-label={`Edit ${label}`}
                className={`${iconButton} hover:bg-stone-100 hover:text-stone-900`}
              >
                <Icon name="edit" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(harvest)}
                disabled={deletingIds.includes(harvest.id)}
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

export default HarvestList;
