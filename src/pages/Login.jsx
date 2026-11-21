import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { getAuthErrorMessage } from '../utils/authErrors.js';
import { validateEmail, validatePassword } from '../utils/validators.js';

function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* Refs let us move the cursor to the first field with a mistake */
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(newErrors);

    if (newErrors.email) {
      emailRef.current.focus();
      return;
    }
    if (newErrors.password) {
      passwordRef.current.focus();
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (error) {
      setFormError(getAuthErrorMessage(error.code));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-stone-300 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold">Log in</h1>

        {/* noValidate turns off the browser's own popups so our messages show instead */}
        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
            ref={emailRef}
            autoComplete="email"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            ref={passwordRef}
            autoComplete="current-password"
          />

          {formError && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
              {formError}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full disabled:opacity-60">
            {submitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className="mt-6 text-center">
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
