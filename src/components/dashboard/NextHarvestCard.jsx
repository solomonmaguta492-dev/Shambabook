import { Link } from 'react-router-dom';
import Spinner from '../Spinner.jsx';
import { formatDate } from '../../utils/format.js';

/* Shows the crop that will be ready soonest, or a short message if there is none */
function NextHarvestCard({ crop, loading }) {
  return (
    <section aria-labelledby="next-harvest-heading" className="rounded-xl border border-stone-300 bg-white p-5 shadow-sm">
      <h2 id="next-harvest-heading" className="font-medium text-stone-600">
        Next harvest
      </h2>
      {loading && <Spinner size="small" label="Loading crops…" />}
      {!loading && crop && (
        <>
          <p className="mt-3 text-2xl font-bold md:text-3xl">
            <Link to={`/crops/${crop.id}`} className="text-green-700 hover:text-green-800 hover:underline">
              {crop.name}
            </Link>
          </p>
          <p className="mt-1 text-stone-600">Expected {formatDate(crop.expectedHarvestDate)}</p>
        </>
      )}
      {!loading && !crop && <p className="mt-3 text-stone-600">No upcoming harvests</p>}
    </section>
  );
}

export default NextHarvestCard;
