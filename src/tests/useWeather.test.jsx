import { act, renderHook, waitFor } from '@testing-library/react';
import { useWeather } from '../hooks/useWeather.js';
import { getForecast } from '../services/weatherApi.js';

/* Fake the API so the hook never goes online */
vi.mock('../services/weatherApi.js', () => ({
  getForecast: vi.fn(),
}));

const nakuru = { name: 'Nakuru', region: 'Nakuru County', latitude: -0.28, longitude: 36.07 };
const forecast = { current: { temperature: 24 }, days: [] };

describe('useWeather', () => {
  beforeEach(() => {
    vi.mocked(getForecast).mockReset();
  });

  it('is loading first, then gives the data', async () => {
    vi.mocked(getForecast).mockResolvedValue(forecast);

    const { result } = renderHook(() => useWeather(nakuru));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(forecast);
    expect(result.current.error).toBe('');
    expect(getForecast).toHaveBeenCalledWith(-0.28, 36.07, expect.any(AbortSignal));
  });

  it('gives an error message when the request fails, and refetch tries again', async () => {
    vi.mocked(getForecast).mockRejectedValueOnce(new Error('Weather request failed (status 500)'));

    const { result } = renderHook(() => useWeather(nakuru));

    await waitFor(() => expect(result.current.error).toBe("Couldn't load the weather. Check your connection."));
    expect(result.current.data).toBeNull();

    vi.mocked(getForecast).mockResolvedValueOnce(forecast);
    act(() => result.current.refetch());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual(forecast));
    expect(getForecast).toHaveBeenCalledTimes(2);
  });

  it('does nothing without a location', () => {
    const { result } = renderHook(() => useWeather(undefined));

    expect(getForecast).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ data: null, loading: false, error: '' });
  });

  it('cancels the request when the component goes away', () => {
    vi.mocked(getForecast).mockReturnValue(new Promise(() => {}));

    const { unmount } = renderHook(() => useWeather(nakuru));
    const signal = vi.mocked(getForecast).mock.calls[0][2];
    unmount();

    expect(signal.aborted).toBe(true);
  });
});
