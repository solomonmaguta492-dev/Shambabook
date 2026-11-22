const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/*
  Gets today's weather and a 7-day forecast from the free Open-Meteo Forecast API.
  "signal" comes from an AbortController, so the request can be cancelled.
*/
export async function getForecast(latitude, longitude, signal) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
    timezone: 'Africa/Nairobi',
    forecast_days: 7,
  });

  const response = await fetch(`${FORECAST_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`Weather request failed (status ${response.status})`);
  }

  const data = await response.json();

  /*
    The API sends each daily value as its own list (all dates, all maximums, ...).
    We join them into one object per day, using the same position in every list.
  */
  const days = data.daily.time.map((date, index) => ({
    date,
    weatherCode: data.daily.weather_code[index],
    max: data.daily.temperature_2m_max[index],
    min: data.daily.temperature_2m_min[index],
    rain: data.daily.precipitation_sum[index] ?? 0,
    rainChance: data.daily.precipitation_probability_max[index] ?? 0,
  }));

  return {
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
    },
    days,
  };
}
