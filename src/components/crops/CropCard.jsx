import { Link } from 'react-router-dom';
import Icon from '../Icon.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatAcres, formatDate } from '../../utils/format.js';

const iconButton =
  'rounded-lg p-3 text-stone-500 focus-visible:outline-2 focus-visible:outline-green-700';

/* One crop in the list, with buttons to edit or delete it */
function CropCard({ crop, deleting = false, onEdit, onDelete }) {
  /* Only show the parts we have, joined with dots */
  const details = [crop.variety, formatAcres(crop.plotSize), `Planted ${formatDate(crop.plantingDate)}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="flex w-full flex-col gap-3 rounded-xl border border-stone-300 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold">
          <Link to={`/crops/${crop.id}`} className="text-stone-900 hover:text-green-700 hover:underline">
            {crop.name}
          </Link>
        </h2>
        <StatusBadge status={crop.status} />
      </div>

      <p className="text-sm text-stone-600">{details}</p>

      <div className="mt-auto flex justify-end gap-1">
        <button
          type="button"
          onClick={() => onEdit(crop)}
          aria-label={`Edit ${crop.name}`}
          className={`${iconButton} hover:bg-stone-100 hover:text-stone-900`}
        >
          <Icon name="edit" className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(crop)}
          disabled={deleting}
          aria-label={`Delete ${crop.name}`}
          className={`${iconButton} hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40`}
        >
          <Icon name="trash" className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

export default CropCard;
