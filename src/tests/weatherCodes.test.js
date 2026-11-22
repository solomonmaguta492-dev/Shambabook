import { describeWeather } from '../utils/weatherCodes.js';

describe('describeWeather', () => {
  it.each([
    [0, 'Clear sky', 'sun'],
    [1, 'Partly cloudy', 'cloud'],
    [3, 'Partly cloudy', 'cloud'],
    [45, 'Fog', 'cloud'],
    [48, 'Fog', 'cloud'],
    [51, 'Drizzle', 'rain'],
    [57, 'Drizzle', 'rain'],
    [61, 'Rain', 'rain'],
    [67, 'Rain', 'rain'],
    [80, 'Rain', 'rain'],
    [82, 'Rain', 'rain'],
    [95, 'Thunderstorm', 'storm'],
    [99, 'Thunderstorm', 'storm'],
  ])('code %i is "%s" with the %s icon', (code, label, icon) => {
    expect(describeWeather(code)).toEqual({ label, icon });
  });

  it('gives "Unknown" for a code it does not know', () => {
    expect(describeWeather(1234)).toEqual({ label: 'Unknown', icon: 'cloud' });
  });
});
