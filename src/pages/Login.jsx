import { Link } from 'react-router-dom';

/* Placeholder login page, the form comes later */
function Login() {
  return (
    <div className="flex justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-stone-300 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="mt-2 text-stone-500">The login form is coming soon.</p>
        <p className="mt-6">
          No account yet?{' '}
          <Link to="/register" className="font-medium text-green-700 hover:text-green-800 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
