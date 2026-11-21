import Button from '../components/Button.jsx';
import Icon from '../components/Icon.jsx';

const features = [
  {
    title: 'Track your crops',
    text: 'Keep a record of every crop you plant, when you planted it and where.',
    icon: 'crops',
  },
  {
    title: 'See your profit',
    text: 'Add your expenses and harvests, and see which crops are making you money.',
    icon: 'chart',
  },
  {
    title: 'Plan with the weather',
    text: 'Check the forecast for your area before you plant, spray or harvest.',
    icon: 'weather',
  },
];

/* Home page shown at "/" */
function Landing() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Know if your farm is making money
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Record your crops, expenses and harvests, see the profit from each crop, and check the
            weather — all from your phone.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/register" className="px-6 py-3">
              Sign up — it's free
            </Button>
            <Button to="/login" variant="secondary" className="px-6 py-3">
              Log in
            </Button>
          </div>
        </div>

        {/* Decorative example summary, hidden from screen readers */}
        <div
          aria-hidden="true"
          className="rounded-xl bg-linear-to-br from-green-700 to-green-900 p-6 text-white shadow-lg md:p-8"
        >
          <p className="text-sm text-green-100">Maize · Long rains 2026</p>
          <dl className="mt-6 space-y-3">
            <div className="flex justify-between">
              <dt className="text-green-100">Harvest sales</dt>
              <dd className="font-medium">KES 120,000</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-green-100">Expenses</dt>
              <dd className="font-medium">KES 62,500</dd>
            </div>
            <div className="flex justify-between border-t border-green-600 pt-3 text-xl font-bold">
              <dt>Net profit</dt>
              <dd>KES 57,500</dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="mx-auto max-w-6xl px-4 pb-16">
        <h2 id="features-heading" className="text-2xl font-bold">
          What you can do
        </h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <li key={feature.title} className="rounded-xl border border-stone-300 bg-white p-6">
              <span className="inline-flex rounded-lg bg-green-50 p-2 text-green-700">
                <Icon name={feature.icon} />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-stone-600">{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default Landing;
