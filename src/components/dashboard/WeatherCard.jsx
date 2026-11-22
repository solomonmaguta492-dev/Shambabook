import { Link } from 'react-router-dom';
import Icon from '../Icon.jsx';
import Spinner from '../Spinner.jsx';
import { useWeather } from '../../hooks/useWeather.js';
import { describeWeather } from '../../utils/weatherCodes.js';

const linkClasses = 'mt-3 inline-block font-medium text-green-700 hover:text-green-800 hover:underline';

/*
  Today's weather for the farm. It handles its own loading and errors,
  so the rest of the dashboard keeps working if the weather fails.
*/
function WeatherCard({ location, locationLoading }) {
  const { data, loading, error } = useWeather(location);

  function renderBody() {
    if (locationLoading || loading) {
      return <Spinner size="small" label="Loading weather…" />;
    }

    if (!location) {
      return (
        <>
          <p className="mt-2 text-stone-600">Set your farm location to see the weather here.</p>
          <Link to="/profile" className={linkClasses}>
            Set your farm location →
          </Link>
        </>
      );
    }

    if (error || !data) {
      return <p className="mt-2 text-stone-600">Weather is not available right now.</p>;
    }

    const weather = describeWeather(data.current.weatherCode);

    return (
      <>
        <div className="mt-3 flex items-center gap-4">
          <Icon name={weather.icon} label={weather.label} className="h-12 w-12 text-green-700" />
          <div>
            <p className="text-3xl font-bold text-stone-900">{Math.round(data.current.temperature)}°C</p>
            <p className="text-stone-600">{weather.label}</p>
          </div>
        </div>
        <Link to="/weather" className={linkClasses}>
          See 7-day forecast →
        </Link>
      </>
    );
  }

  return (
    <section aria-labelledby="weather-heading" className="rounded-xl border border-stone-300 bg-white p-5 shadow-sm">
      <h2 id="weather-heading" className="font-medium text-stone-600">
        Today's weather
      </h2>
      {location && (
        <p className="text-sm text-stone-500">
          {location.region ? `${location.name}, ${location.region}` : location.name}
        </p>
      )}
      <div aria-live="polite">{renderBody()}</div>
    </section>
  );
}

export default WeatherCard;
