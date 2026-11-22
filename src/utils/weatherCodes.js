/*
  Open-Meteo describes the weather with WMO code numbers.
  This turns a code into words and the name of an icon from Icon.jsx.
*/
export function describeWeather(code) {
  if (code === 0) {
    return { label: 'Clear sky', icon: 'sun' };
  }
  if (code >= 1 && code <= 3) {
    return { label: 'Partly cloudy', icon: 'cloud' };
  }
  if (code === 45 || code === 48) {
    return { label: 'Fog', icon: 'cloud' };
  }
  if (code >= 51 && code <= 57) {
    return { label: 'Drizzle', icon: 'rain' };
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { label: 'Rain', icon: 'rain' };
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { label: 'Snow', icon: 'cloud' };
  }
  if (code >= 95 && code <= 99) {
    return { label: 'Thunderstorm', icon: 'storm' };
  }
  return { label: 'Unknown', icon: 'cloud' };
}
