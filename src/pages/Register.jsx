import { Link } from 'react-router-dom';

/* Placeholder sign-up page, the form comes later */
function Register() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-900 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold text-green-700">Create your account</h1>
      <p>
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-green-700 hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}

export default Register;
