import { searchTowns } from '../services/geocodingApi.js';

/* Makes a fake fetch response like the browser's */
function fakeResponse(body, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(body) };
}

describe('searchTowns', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds the right URL, with the town name made safe for a URL', async () => {
    vi.mocked(fetch).mockResolvedValue(fakeResponse({ results: [] }));

    await searchTowns('Kitale & Co');

    expect(fetch).toHaveBeenCalledWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=Kitale%20%26%20Co&count=5&language=en&format=json&countryCode=KE'
    );
  });

  it('maps each result to name, region, latitude and longitude', async () => {
    vi.mocked(fetch).mockResolvedValue(
      fakeResponse({
        results: [
          { id: 1, name: 'Nakuru', admin1: 'Nakuru County', latitude: -0.28, longitude: 36.07, country: 'Kenya' },
        ],
      })
    );

    const towns = await searchTowns('Nakuru');

    expect(towns).toEqual([{ name: 'Nakuru', region: 'Nakuru County', latitude: -0.28, longitude: 36.07 }]);
  });

  it('returns an empty list when there are no results', async () => {
    /* Open-Meteo sends no "results" key at all when nothing matches */
    vi.mocked(fetch).mockResolvedValue(fakeResponse({ generationtime_ms: 0.5 }));

    expect(await searchTowns('Zzzz')).toEqual([]);
  });

  it('throws a clear error when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue(fakeResponse({}, false, 500));

    await expect(searchTowns('Nakuru')).rejects.toThrow('Town search failed (status 500)');
  });
});
