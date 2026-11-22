import { createContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import * as cropsService from '../services/cropsService.js';
import * as expensesService from '../services/expensesService.js';
import * as harvestsService from '../services/harvestsService.js';
import * as profileService from '../services/profileService.js';
import { expensesForCrop, harvestsForCrop } from '../utils/calculations.js';

/* Shares the farm records (crops, expenses and harvests) with every logged-in page */
/* eslint-disable-next-line react-refresh/only-export-components */
export const FarmContext = createContext(null);

export function FarmProvider({ children }) {
  const { user } = useAuth();
  const uid = user.uid;

  const [crops, setCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(true);
  const [cropsError, setCropsError] = useState('');
  /* Changing this number makes the crops effect run again, which is how Retry works */
  const [cropsRetry, setCropsRetry] = useState(0);

  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState('');
  const [expensesRetry, setExpensesRetry] = useState(0);

  const [harvests, setHarvests] = useState([]);
  const [harvestsLoading, setHarvestsLoading] = useState(true);
  const [harvestsError, setHarvestsError] = useState('');
  const [harvestsRetry, setHarvestsRetry] = useState(0);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = profileService.subscribeToProfile(
      uid,
      (newProfile) => {
        setProfile(newProfile);
        setProfileLoading(false);
      },
      () => {
        setProfileLoading(false);
      }
    );

    return unsubscribe;
  }, [uid]);

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
  }, [uid, cropsRetry]);

  useEffect(() => {
    const unsubscribe = expensesService.subscribeToExpenses(
      uid,
      (newExpenses) => {
        setExpenses(newExpenses);
        setExpensesError('');
        setExpensesLoading(false);
      },
      () => {
        setExpensesError("We couldn't load your expenses. Please check your connection.");
        setExpensesLoading(false);
      }
    );

    return unsubscribe;
  }, [uid, expensesRetry]);

  useEffect(() => {
    const unsubscribe = harvestsService.subscribeToHarvests(
      uid,
      (newHarvests) => {
        setHarvests(newHarvests);
        setHarvestsError('');
        setHarvestsLoading(false);
      },
      () => {
        setHarvestsError("We couldn't load your harvests. Please check your connection.");
        setHarvestsLoading(false);
      }
    );

    return unsubscribe;
  }, [uid, harvestsRetry]);

  function retryCrops() {
    setCropsLoading(true);
    setCropsError('');
    setCropsRetry((count) => count + 1);
  }

  function retryExpenses() {
    setExpensesLoading(true);
    setExpensesError('');
    setExpensesRetry((count) => count + 1);
  }

  function retryHarvests() {
    setHarvestsLoading(true);
    setHarvestsError('');
    setHarvestsRetry((count) => count + 1);
  }

  /* The pages don't need to know the uid, these add it for them */
  function addCrop(data) {
    return cropsService.addCrop(uid, data);
  }

  function updateCrop(id, data) {
    return cropsService.updateCrop(uid, id, data);
  }

  /* Deleting a crop also deletes its expenses and harvests, so none are left without a crop */
  function deleteCrop(id) {
    return Promise.all([
      cropsService.deleteCrop(uid, id),
      ...expensesForCrop(expenses, id).map((expense) => expensesService.deleteExpense(uid, expense.id)),
      ...harvestsForCrop(harvests, id).map((harvest) => harvestsService.deleteHarvest(uid, harvest.id)),
    ]);
  }

  function addExpense(data) {
    return expensesService.addExpense(uid, data);
  }

  function updateExpense(id, data) {
    return expensesService.updateExpense(uid, id, data);
  }

  function deleteExpense(id) {
    return expensesService.deleteExpense(uid, id);
  }

  function addHarvest(data) {
    return harvestsService.addHarvest(uid, data);
  }

  function updateHarvest(id, data) {
    return harvestsService.updateHarvest(uid, id, data);
  }

  function deleteHarvest(id) {
    return harvestsService.deleteHarvest(uid, id);
  }

  /* location is { name, region, latitude, longitude } from the town search */
  function saveLocation(location) {
    return profileService.saveProfile(uid, { location });
  }

  const value = {
    crops,
    cropsLoading,
    cropsError,
    retryCrops,
    addCrop,
    updateCrop,
    deleteCrop,
    expenses,
    expensesLoading,
    expensesError,
    retryExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    harvests,
    harvestsLoading,
    harvestsError,
    retryHarvests,
    addHarvest,
    updateHarvest,
    deleteHarvest,
    profile,
    profileLoading,
    saveLocation,
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}
