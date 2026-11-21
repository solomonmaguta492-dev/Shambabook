import { useAuth } from '../hooks/useAuth.js';

/* Greets the farmer, farm records will show here later */
function Dashboard() {
  const { user } = useAuth();

  /* Use the name if we have one, otherwise the email */
  const name = user?.displayName || user?.email;

  return (
    <section>
      <h1 className="text-2xl font-bold md:text-3xl">Hello, {name}</h1>
      <p className="mt-2 text-stone-600">Your farm records will appear here soon.</p>
    </section>
  );
}

export default Dashboard;
