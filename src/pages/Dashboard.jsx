import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard.jsx';
import WeatherCard from '../components/dashboard/WeatherCard.jsx';
import NextHarvestCard from '../components/dashboard/NextHarvestCard.jsx';
import RecentActivity from '../components/dashboard/RecentActivity.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useFarm } from '../hooks/useFarm.js';
import { formatCurrency, profitTone, todayString } from '../utils/format.js';
import {
  mostProfitableCrop,
  nextHarvest,
  recentActivity,
  totalExpenses,
  totalIncome,
} from '../utils/calculations.js';

const linkClasses = 'mt-2 inline-block font-medium text-green-700 hover:text-green-800 hover:underline';

/* Greets the farmer and shows a quick summary of the whole farm */
function Dashboard() {
  const { user } = useAuth();
  const { crops, cropsLoading, expenses, expensesLoading, harvests, harvestsLoading, profile, profileLoading } =
    useFarm();

  /* Use the name if we have one, otherwise the email */
  const name = user?.displayName || user?.email;
  const loading = cropsLoading || expensesLoading || harvestsLoading;

  /* Whole-farm numbers: everything earned minus everything spent */
  const spent = totalExpenses(expenses);
  const earned = totalIncome(harvests);
  const netProfit = earned - spent;
  const best = mostProfitableCrop(crops, expenses, harvests);

  /* Shows "…" until Firestore has sent the records */
  function show(value) {
    return loading ? '…' : value;
  }

  return (
    <section>
      <h1 className="text-2xl font-bold md:text-3xl">Hello, {name}</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="crops" label="Crops" value={show(crops.length)}>
          <Link to="/crops" className={linkClasses}>
            View crops →
          </Link>
        </StatCard>
        <StatCard icon="expenses" label="Total expenses" value={show(formatCurrency(spent))}>
          <Link to="/expenses" className={linkClasses}>
            View expenses →
          </Link>
        </StatCard>
        <StatCard icon="harvests" label="Total income" value={show(formatCurrency(earned))}>
          <Link to="/harvests" className={linkClasses}>
            View harvests →
          </Link>
        </StatCard>
        <StatCard
          icon="chart"
          label="Net profit"
          value={show(formatCurrency(netProfit))}
          tone={loading ? 'neutral' : profitTone(netProfit)}
        />
      </div>

      {!loading && best && (
        <p className="mt-6 rounded-xl border border-stone-300 bg-white p-4 text-stone-700">
          Most profitable crop:{' '}
          <Link to={`/crops/${best.crop.id}`} className="font-semibold text-green-700 hover:underline">
            {best.crop.name}
          </Link>{' '}
          ({formatCurrency(best.profit)} profit)
        </p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <WeatherCard location={profile?.location} locationLoading={profileLoading} />
        <NextHarvestCard crop={nextHarvest(crops, todayString())} loading={cropsLoading} />
      </div>

      <div className="mt-6">
        <RecentActivity items={recentActivity(expenses, harvests, crops)} loading={loading} />
      </div>
    </section>
  );
}

export default Dashboard;
