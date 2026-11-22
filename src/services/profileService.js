import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

/* Each user's profile is the document users/{uid} itself */
function profileDoc(uid) {
  return doc(db, 'users', uid);
}

/*
  Listens to the profile. Sends null when the user has not saved one yet.
  Returns a function that stops listening.
*/
export function subscribeToProfile(uid, onData, onError) {
  return onSnapshot(
    profileDoc(uid),
    (snapshot) => {
      onData(snapshot.exists() ? snapshot.data() : null);
    },
    onError
  );
}

/* merge: true only changes the fields we send and keeps the rest of the document */
export function saveProfile(uid, data) {
  return setDoc(profileDoc(uid), data, { merge: true });
}
