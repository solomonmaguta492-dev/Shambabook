const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/*
  Looks up Kenyan towns by name with the free Open-Meteo Geocoding API.
  Returns up to 5 places as { name, region, latitude, longitude }.
*/
export async function searchTowns(query) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json&countryCode=KE`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Town search failed (status ${response.status})`);
  }

  const data = await response.json();

  /* Open-Meteo leaves out "results" when nothing matches */
  const places = data.results ?? [];

  return places.map((place) => ({
    name: place.name,
    region: place.admin1 ?? '',
    latitude: place.latitude,
    longitude: place.longitude,
  }));
}
