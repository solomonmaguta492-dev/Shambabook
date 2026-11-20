import { Link } from 'react-router-dom';

/* Home page shown at "/" */
function Landing() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-900 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold text-green-700">ShambaBook</h1>
      <p>Keep simple, clear records for your farm.</p>
      <div className="flex gap-6">
        <Link to="/login" className="font-medium text-green-700 hover:underline">
          Log in
        </Link>
        <Link to="/register" className="font-medium text-green-700 hover:underline">
          Register
        </Link>
      </div>
    </main>
  );
}

export default Landing;
