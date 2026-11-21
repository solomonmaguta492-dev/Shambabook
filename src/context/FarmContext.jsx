import { createContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import * as cropsService from '../services/cropsService.js';
import * as expensesService from '../services/expensesService.js';
import { expensesForCrop } from '../utils/calculations.js';

/* Shares the farm records (crops and expenses) with every logged-in page */
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

  /* The pages don't need to know the uid, these add it for them */
  function addCrop(data) {
    return cropsService.addCrop(uid, data);
  }

  function updateCrop(id, data) {
    return cropsService.updateCrop(uid, id, data);
  }

  /* Deleting a crop also deletes its expenses, so none are left without a crop */
  function deleteCrop(id) {
    const cropExpenses = expensesForCrop(expenses, id);
    return Promise.all([
      cropsService.deleteCrop(uid, id),
      ...cropExpenses.map((expense) => expensesService.deleteExpense(uid, expense.id)),
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
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}
