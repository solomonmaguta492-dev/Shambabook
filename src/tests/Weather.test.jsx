import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Weather from '../pages/Weather.jsx';
import { useFarm } from '../hooks/useFarm.js';
import { useWeather } from '../hooks/useWeather.js';

/* Fake useFarm and useWeather so each test can choose what the page receives */
vi.mock('../hooks/useFarm.js', () => ({
  useFarm: vi.fn(),
}));

vi.mock('../hooks/useWeather.js', () => ({
  useWeather: vi.fn(),
}));

const nakuru = { name: 'Nakuru', region: 'Nakuru County', latitude: -0.28, longitude: 36.07 };

/* 22 Nov 2026 is a Sunday; Tuesday has heavy rain and Friday is hot */
const forecast = {
  current: { temperature: 24.4, humidity: 60, windSpeed: 12.5, weatherCode: 2 },
  days: [
    { date: '2026-11-22', weatherCode: 2, max: 26, min: 14, rain: 2, rainChance: 40 },
    { date: '2026-11-23', weatherCode: 0, max: 27, min: 15, rain: 0, rainChance: 5 },
    { date: '2026-11-24', weatherCode: 63, max: 22, min: 14, rain: 18.6, rainChance: 95 },
    { date: '2026-11-25', weatherCode: 3, max: 25, min: 13, rain: 1, rainChance: 30 },
    { date: '2026-11-26', weatherCode: 95, max: 24, min: 13, rain: 6, rainChance: 70 },
    { date: '2026-11-27', weatherCode: 0, max: 31, min: 16, rain: 0, rainChance: 0 },
    { date: '2026-11-28', weatherCode: 51, max: 25, min: 14, rain: 0.4, rainChance: 20 },
  ],
};

function mockFarm(overrides = {}) {
  vi.mocked(useFarm).mockReturnValue({ profile: { location: nakuru }, profileLoading: false, ...overrides });
}

function mockWeather(overrides = {}) {
  const weather = { data: null, loading: false, error: '', refetch: vi.fn(), ...overrides };
  vi.mocked(useWeather).mockReturnValue(weather);
  return weather;
}

function renderWeather() {
  render(
    <MemoryRouter>
      <Weather />
    </MemoryRouter>
  );
}

describe('Weather page', () => {
  it('asks for a farm location when none is set', () => {
    mockFarm({ profile: null });
    mockWeather();
    renderWeather();

    expect(screen.getByRole('heading', { name: 'Set your farm location to see the forecast' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Set location' })).toHaveAttribute('href', '/profile');
  });

  it('shows a spinner while the profile loads', () => {
    mockFarm({ profileLoading: true });
    mockWeather();
    renderWeather();

    expect(screen.getByRole('status')).toHaveTextContent('Loading your farm location…');
  });

  it('shows a spinner while the forecast loads', () => {
    mockFarm();
    mockWeather({ loading: true });
    renderWeather();

    expect(screen.getByRole('status')).toHaveTextContent('Loading forecast…');
    expect(screen.getByText('Nakuru, Nakuru County')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Change' })).toHaveAttribute('href', '/profile');
  });

  it('shows today and the 7-day forecast', () => {
    mockFarm();
    mockWeather({ data: forecast });
    renderWeather();

    const today = screen.getByRole('region', { name: 'Today' });
    expect(today).toHaveTextContent('24°C');
    expect(today).toHaveTextContent('Partly cloudy');
    expect(today).toHaveTextContent('60%');
    expect(today).toHaveTextContent('13 km/h');

    const days = within(screen.getByRole('region', { name: '7-day forecast' })).getAllByRole('listitem');
    expect(days).toHaveLength(7);
    expect(days[0]).toHaveTextContent('Today');
    expect(days[1]).toHaveTextContent('Mon');
    expect(days[2]).toHaveTextContent('Tue');
    expect(days[2]).toHaveTextContent('22°C / 14°C');
    expect(days[2]).toHaveTextContent('18.6 mm');
    expect(days[2]).toHaveTextContent('95% chance');
    expect(within(days[2]).getByRole('img', { name: 'Rain' })).toBeInTheDocument();
  });

  it('shows the farming tips', () => {
    mockFarm();
    mockWeather({ data: forecast });
    renderWeather();

    const tips = screen.getByRole('region', { name: 'Farming tips' });
    expect(tips).toHaveTextContent('Heavy rain expected on Tuesday.');
    expect(tips).toHaveTextContent('Hot on Friday.');
  });

  it('shows an error with a Retry button that calls refetch', async () => {
    const user = userEvent.setup();
    mockFarm();
    const weather = mockWeather({ error: "Couldn't load the weather. Check your connection." });
    renderWeather();

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load the weather. Check your connection.");
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(weather.refetch).toHaveBeenCalled();
  });
});
