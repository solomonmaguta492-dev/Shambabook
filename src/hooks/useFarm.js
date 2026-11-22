import { useContext } from 'react';
import { FarmContext } from '../context/FarmContext.jsx';

/* Shortcut for reading the farm records from any logged-in page */
export function useFarm() {
  const context = useContext(FarmContext);

  if (!context) {
    throw new Error('useFarm must be used inside a FarmProvider');
  }

  return context;
}
