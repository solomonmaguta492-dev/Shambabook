import { Link } from 'react-router-dom';

/* Placeholder sign-up page, the form comes later */
function Register() {
  return (
    <div className="flex justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-stone-300 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-2 text-stone-500">The sign-up form is coming soon.</p>
        <p className="mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-green-700 hover:text-green-800 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
