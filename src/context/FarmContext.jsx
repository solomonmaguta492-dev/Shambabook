import { createContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import * as cropsService from '../services/cropsService.js';

/* Shares the farm records (crops for now) with every logged-in page */
/* eslint-disable-next-line react-refresh/only-export-components */
export const FarmContext = createContext(null);

export function FarmProvider({ children }) {
  const { user } = useAuth();
  const uid = user.uid;

  const [crops, setCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(true);
  const [cropsError, setCropsError] = useState('');
  /* Changing this number makes the effect below run again, which is how Retry works */
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const unsubscribe = cropsService.subscribeToCrops(
      uid,
      (newCrops) => {
        setCrops(newCrops);
        setCropsError('');
        setCropsLoading(false);
      },
      () => {
        setCropsError("We couldn't load your crops. Please check your connection.");
        setCropsLoading(false);
      }
    );

    /* Stop listening when the user logs out or the page closes */
    return unsubscribe;
  }, [uid, retryCount]);

  function retryCrops() {
    setCropsLoading(true);
    setCropsError('');
    setRetryCount((count) => count + 1);
  }

  /* The pages don't need to know the uid, these add it for them */
  function addCrop(data) {
    return cropsService.addCrop(uid, data);
  }

  function updateCrop(id, data) {
    return cropsService.updateCrop(uid, id, data);
  }

  function deleteCrop(id) {
    return cropsService.deleteCrop(uid, id);
  }

  const value = {
    crops,
    cropsLoading,
    cropsError,
    retryCrops,
    addCrop,
    updateCrop,
    deleteCrop,
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}
