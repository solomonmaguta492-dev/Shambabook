import Button from '../components/Button.jsx';

/* Shown when no other route matches the address */
function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-100 p-6 text-center text-stone-900">
      <p className="text-5xl font-bold text-green-700">404</p>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="max-w-md text-stone-600">
        Sorry, we couldn't find that page. It may have moved, or the address may be wrong.
      </p>
      <Button to="/">Go back home</Button>
    </main>
  );
}

export default NotFound;
