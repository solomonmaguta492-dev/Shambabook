import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase.js';

/* Every user has their own expenses list at users/{uid}/expenses */
function expensesCollection(uid) {
  return collection(db, 'users', uid, 'expenses');
}

function expenseDoc(uid, id) {
  return doc(db, 'users', uid, 'expenses', id);
}

export function addExpense(uid, data) {
  return addDoc(expensesCollection(uid), { ...data, createdAt: serverTimestamp() });
}

export function updateExpense(uid, id, data) {
  return updateDoc(expenseDoc(uid, id), data);
}

export function deleteExpense(uid, id) {
  return deleteDoc(expenseDoc(uid, id));
}

/*
  Listens to the expenses list, newest date first.
  Returns a function that stops listening.
*/
export function subscribeToExpenses(uid, onData, onError) {
  const expensesQuery = query(expensesCollection(uid), orderBy('date', 'desc'));

  return onSnapshot(
    expensesQuery,
    (snapshot) => {
      const expenses = snapshot.docs.map((expenseSnapshot) => ({
        id: expenseSnapshot.id,
        ...expenseSnapshot.data(),
      }));
      onData(expenses);
    },
    onError
  );
}
