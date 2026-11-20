import { Link } from 'react-router-dom';

/* Shown when no other route matches the address */
function NotFound() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-900 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold text-green-700">Page not found</h1>
      <p>
        That page does not exist.{' '}
        <Link to="/" className="font-medium text-green-700 hover:underline">
          Go back home
        </Link>
      </p>
    </main>
  );
}

export default NotFound;
