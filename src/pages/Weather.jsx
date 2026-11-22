import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import Spinner from '../components/Spinner.jsx';
import { useFarm } from '../hooks/useFarm.js';
import { useWeather } from '../hooks/useWeather.js';
import { describeWeather } from '../utils/weatherCodes.js';
import { getFarmingTips } from '../utils/weatherTips.js';
import { formatWeekday } from '../utils/format.js';

/* 24.4 → "24°C" */
function formatTemperature(value) {
  return `${Math.round(value)}°C`;
}

function TodayCard({ current }) {
  const weather = describeWeather(current.weatherCode);

  return (
    <section aria-labelledby="today-heading" className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 id="today-heading" className="text-lg font-semibold text-stone-900">
        Today
      </h2>
      <div className="mt-3 flex items-center gap-4">
        <Icon name={weather.icon} label={weather.label} className="h-14 w-14 text-green-700" />
        <div>
          <p className="text-4xl font-bold text-stone-900">{formatTemperature(current.temperature)}</p>
          <p className="text-stone-600">{weather.label}</p>
        </div>
      </div>
      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-stone-700">
        <div>
          <dt className="text-sm text-stone-500">Humidity</dt>
          <dd className="font-medium">{current.humidity}%</dd>
        </div>
        <div>
          <dt className="text-sm text-stone-500">Wind</dt>
          <dd className="font-medium">{Math.round(current.windSpeed)} km/h</dd>
        </div>
      </dl>
    </section>
  );
}

function TipsBox({ tips }) {
  return (
    <section aria-labelledby="tips-heading" className="rounded-xl border border-green-200 bg-green-50 p-5">
      <h2 id="tips-heading" className="text-lg font-semibold text-green-800">
        Farming tips
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-800">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </section>
  );
}

function DayCard({ day, isToday }) {
  const weather = describeWeather(day.weatherCode);

  return (
    <li className="flex flex-col items-center rounded-xl border border-stone-300 bg-white p-4 text-center">
      <h3 className="font-semibold text-stone-900">{isToday ? 'Today' : formatWeekday(day.date)}</h3>
      <Icon name={weather.icon} label={weather.label} className="mt-2 h-8 w-8 text-green-700" />
      <p className="mt-1 text-sm text-stone-600">{weather.label}</p>
      <p className="mt-2 font-medium text-stone-900">
        {formatTemperature(day.max)} <span className="text-stone-500">/ {formatTemperature(day.min)}</span>
      </p>
      <p className="mt-1 text-sm text-stone-600">{day.rain} mm</p>
      <p className="text-sm text-stone-600">{day.rainChance}% chance</p>
    </li>
  );
}

function Weather() {
  const { profile, profileLoading } = useFarm();
  const location = profile?.location;
  const { data, loading, error, refetch } = useWeather(location);

  if (profileLoading) {
    return <Spinner label="Loading your farm location…" />;
  }

  if (!location) {
    return (
      <section>
        <h1 className="text-2xl font-bold md:text-3xl">Weather</h1>
        <div className="mt-6">
          <EmptyState
            icon="weather"
            title="Set your farm location to see the forecast"
            message="Pick your town on the Profile page and we'll show the weather for your farm."
            action={<Button to="/profile">Set location</Button>}
          />
        </div>
      </section>
    );
  }

  /* Picks what to show: loading, an error, or the forecast */
  function renderStatus() {
    if (loading) {
      return <Spinner label="Loading forecast…" />;
    }

    if (error) {
      return (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
          <p>{error}</p>
          <Button variant="secondary" onClick={refetch} className="mt-4">
            Retry
          </Button>
        </div>
      );
    }

    return null;
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Weather</h1>
          <p className="mt-1 text-stone-600">
            {location.region ? `${location.name}, ${location.region}` : location.name}{' '}
            <Link to="/profile" className="font-medium text-green-700 underline hover:text-green-800">
              Change
            </Link>
          </p>
        </div>
      </div>

      <div aria-live="polite" className="mt-6">
        {renderStatus()}
      </div>

      {data && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <TodayCard current={data.current} />
            <TipsBox tips={getFarmingTips(data.days)} />
          </div>

          <section aria-labelledby="forecast-heading">
            <h2 id="forecast-heading" className="text-lg font-semibold text-stone-900">
              7-day forecast
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
              {data.days.map((day, index) => (
                <DayCard key={day.date} day={day} isToday={index === 0} />
              ))}
            </ul>
          </section>
        </div>
      )}
    </section>
  );
}

export default Weather;
