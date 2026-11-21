import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useFarm } from '../hooks/useFarm.js';

/* Greets the farmer and shows a quick summary of their farm */
function Dashboard() {
  const { user } = useAuth();
  const { crops, cropsLoading } = useFarm();

  /* Use the name if we have one, otherwise the email */
  const name = user?.displayName || user?.email;

  return (
    <section>
      <h1 className="text-2xl font-bold md:text-3xl">Hello, {name}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-stone-300 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-stone-600">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-700">
              <Icon name="crops" className="h-5 w-5" />
            </span>
            <h2 className="font-medium">Crops</h2>
          </div>
          <p className="mt-3 text-3xl font-bold text-stone-900">{cropsLoading ? '…' : crops.length}</p>
          <Link
            to="/crops"
            className="mt-2 inline-block font-medium text-green-700 hover:text-green-800 hover:underline"
          >
            View crops →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
