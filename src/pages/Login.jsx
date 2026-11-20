import { Link } from 'react-router-dom';

/* Placeholder login page, the form comes later */
function Login() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-900 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold text-green-700">Log in</h1>
      <p>
        No account yet?{' '}
        <Link to="/register" className="font-medium text-green-700 hover:underline">
          Create one
        </Link>
      </p>
    </main>
  );
}

export default Login;
