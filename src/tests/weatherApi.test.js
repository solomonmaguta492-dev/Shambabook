import { getForecast } from '../services/weatherApi.js';

/* Open-Meteo's answer for 2 days, in its own format */
const apiResponse = {
  current: { temperature_2m: 24.4, relative_humidity_2m: 60, wind_speed_10m: 12.5, weather_code: 2 },
  daily: {
    time: ['2026-11-22', '2026-11-23'],
    weather_code: [61, 0],
    temperature_2m_max: [26, 31],
    temperature_2m_min: [14, 15],
    precipitation_sum: [12.4, 0],
    precipitation_probability_max: [90, 5],
  },
};

function fakeResponse(body, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(body) };
}

describe('getForecast', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds the URL with the right parameters and passes the signal', async () => {
    vi.mocked(fetch).mockResolvedValue(fakeResponse(apiResponse));
    const signal = new AbortController().signal;

    await getForecast(-0.28, 36.07, signal);

    const [url, options] = vi.mocked(fetch).mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(parsed.searchParams.get('latitude')).toBe('-0.28');
    expect(parsed.searchParams.get('longitude')).toBe('36.07');
    expect(parsed.searchParams.get('current')).toBe('temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code');
    expect(parsed.searchParams.get('daily')).toBe(
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max'
    );
    expect(parsed.searchParams.get('timezone')).toBe('Africa/Nairobi');
    expect(parsed.searchParams.get('forecast_days')).toBe('7');
    expect(options.signal).toBe(signal);
  });

  it('turns the response into current weather and one object per day', async () => {
    vi.mocked(fetch).mockResolvedValue(fakeResponse(apiResponse));

    const forecast = await getForecast(-0.28, 36.07);

    expect(forecast).toEqual({
      current: { temperature: 24.4, humidity: 60, windSpeed: 12.5, weatherCode: 2 },
      days: [
        { date: '2026-11-22', weatherCode: 61, max: 26, min: 14, rain: 12.4, rainChance: 90 },
        { date: '2026-11-23', weatherCode: 0, max: 31, min: 15, rain: 0, rainChance: 5 },
      ],
    });
  });

  it('throws a clear error when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue(fakeResponse({}, false, 503));

    await expect(getForecast(-0.28, 36.07)).rejects.toThrow('Weather request failed (status 503)');
  });
});
