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

/* Every user has their own harvests list at users/{uid}/harvests */
function harvestsCollection(uid) {
  return collection(db, 'users', uid, 'harvests');
}

function harvestDoc(uid, id) {
  return doc(db, 'users', uid, 'harvests', id);
}

export function addHarvest(uid, data) {
  return addDoc(harvestsCollection(uid), { ...data, createdAt: serverTimestamp() });
}

export function updateHarvest(uid, id, data) {
  return updateDoc(harvestDoc(uid, id), data);
}

export function deleteHarvest(uid, id) {
  return deleteDoc(harvestDoc(uid, id));
}

/*
  Listens to the harvests list, newest date first.
  Returns a function that stops listening.
*/
export function subscribeToHarvests(uid, onData, onError) {
  const harvestsQuery = query(harvestsCollection(uid), orderBy('date', 'desc'));

  return onSnapshot(
    harvestsQuery,
    (snapshot) => {
      const harvests = snapshot.docs.map((harvestSnapshot) => ({
        id: harvestSnapshot.id,
        ...harvestSnapshot.data(),
      }));
      onData(harvests);
    },
    onError
  );
}
