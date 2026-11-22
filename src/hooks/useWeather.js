import { useEffect, useState } from 'react';
import { getForecast } from '../services/weatherApi.js';

/*
  Fetches the forecast for a location and fetches again when the location changes.
  Returns { data, loading, error, refetch }.
*/
export function useWeather(location) {
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  const hasLocation = latitude !== undefined && longitude !== undefined;

  /* Changing this number makes the effect run again, which is how refetch works */
  const [retryCount, setRetryCount] = useState(0);

  /*
    "key" says which request this answer belongs to.
    If it doesn't match the current request yet, we are still loading.
  */
  const [result, setResult] = useState({ key: '', data: null, error: '' });
  const requestKey = `${latitude},${longitude},${retryCount}`;

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) {
      return undefined;
    }

    const key = `${latitude},${longitude},${retryCount}`;
    const controller = new AbortController();

    getForecast(latitude, longitude, controller.signal)
      .then((forecast) => {
        setResult({ key, data: forecast, error: '' });
      })
      .catch((error) => {
        /* We cancelled this request ourselves, so it is not a real error */
        if (error.name === 'AbortError') {
          return;
        }
        setResult({ key, data: null, error: "Couldn't load the weather. Check your connection." });
      });

    /* Cancel the request if the location changes or the page closes before it finishes */
    return () => controller.abort();
  }, [latitude, longitude, retryCount]);

  function refetch() {
    setRetryCount((count) => count + 1);
  }

  const answered = hasLocation && result.key === requestKey;

  return {
    data: answered ? result.data : null,
    loading: hasLocation && !answered,
    error: answered ? result.error : '',
    refetch,
  };
}
