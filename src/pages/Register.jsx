import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { getAuthErrorMessage } from '../utils/authErrors.js';
import {
  validateEmail,
  validatePassword,
  validatePasswordsMatch,
  validateRequired,
} from '../utils/validators.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

function Register() {
  usePageTitle('Sign up');
  const { register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  /* Refs let us move the cursor to the first field with a mistake */
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const newErrors = {
      name: validateRequired(name, 'Full name'),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validatePasswordsMatch(password, confirmPassword),
    };
    setErrors(newErrors);

    /* Fields in the order they appear on the page */
    const fields = [
      { error: newErrors.name, ref: nameRef },
      { error: newErrors.email, ref: emailRef },
      { error: newErrors.password, ref: passwordRef },
      { error: newErrors.confirmPassword, ref: confirmPasswordRef },
    ];
    const firstInvalid = fields.find((field) => field.error);
    if (firstInvalid) {
      firstInvalid.ref.current.focus();
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      showToast('Account created!', 'success');
      navigate('/dashboard');
    } catch (error) {
      setFormError(getAuthErrorMessage(error.code));
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setFormError('');
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      /* Google gives the full name, so take the first word */
      const firstName = result.user.displayName?.split(' ')[0] || result.user.email;
      showToast(`Welcome, ${firstName}!`, 'success');
      navigate('/dashboard');
    } catch (error) {
      setFormError(getAuthErrorMessage(error.code));
      setGoogleLoading(false);
    }
  }

  /* Both buttons are disabled while either one is busy */
  const busy = submitting || googleLoading;

  return (
    <div className="flex justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md rounded-xl border border-stone-300 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-bold">Create your account</h1>

        {/* noValidate turns off the browser's own popups so our messages show instead */}
        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <Input
            id="name"
            label="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
            ref={nameRef}
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <Input
            id="confirmPassword"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={errors.confirmPassword}
            ref={confirmPasswordRef}
            autoComplete="new-password"
          />

          {formError && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
              {formError}
            </p>
          )}

          <Button type="submit" disabled={busy} className="w-full disabled:opacity-60">
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>

          <div className="flex items-center gap-3 text-sm text-stone-500">
            <span className="h-px flex-1 bg-stone-300" />
            or
            <span className="h-px flex-1 bg-stone-300" />
          </div>

          <GoogleButton
            label={googleLoading ? 'Connecting…' : 'Sign up with Google'}
            onClick={handleGoogle}
            disabled={busy}
          />
        </form>

        <p className="mt-6 text-center">
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
