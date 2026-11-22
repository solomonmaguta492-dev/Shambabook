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

/* Every user has their own crops list at users/{uid}/crops */
function cropsCollection(uid) {
  return collection(db, 'users', uid, 'crops');
}

function cropDoc(uid, id) {
  return doc(db, 'users', uid, 'crops', id);
}

export function addCrop(uid, data) {
  return addDoc(cropsCollection(uid), { ...data, createdAt: serverTimestamp() });
}

export function updateCrop(uid, id, data) {
  return updateDoc(cropDoc(uid, id), data);
}

export function deleteCrop(uid, id) {
  return deleteDoc(cropDoc(uid, id));
}

/*
  Listens to the crops list. Firestore calls onData now and again after every change.
  Returns a function that stops listening.
*/
export function subscribeToCrops(uid, onData, onError) {
  const cropsQuery = query(cropsCollection(uid), orderBy('createdAt', 'desc'));

  return onSnapshot(
    cropsQuery,
    (snapshot) => {
      const crops = snapshot.docs.map((cropSnapshot) => ({
        id: cropSnapshot.id,
        ...cropSnapshot.data(),
      }));
      onData(crops);
    },
    onError
  );
}
