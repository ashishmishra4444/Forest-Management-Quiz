import { initializeApp } from "firebase/app";
import {
  getDatabase,
  onDisconnect,
  onValue,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  set,
} from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

let database = null;

if (hasFirebaseConfig) {
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
}

export function isRealtimeEnabled() {
  return hasFirebaseConfig && Boolean(database);
}

export function subscribeToActiveUsers(callback) {
  if (!database) {
    callback(0);
    return () => {};
  }

  const presenceRef = ref(database, "presence");

  return onValue(presenceRef, (snapshot) => {
    const users = snapshot.val() ?? {};
    callback(Object.keys(users).length);
  });
}

export function startPresenceTracking(sessionId) {
  if (!database) {
    return () => {};
  }

  const sessionRef = ref(database, `presence/${sessionId}`);

  set(sessionRef, {
    active: true,
    lastSeen: serverTimestamp(),
  });

  onDisconnect(sessionRef).remove();

  return () => {
    remove(sessionRef);
  };
}

export function subscribeToTestTakers(callback) {
  if (!database) {
    callback(0);
    return () => {};
  }

  const statsRef = ref(database, "stats/testTakers");

  return onValue(statsRef, (snapshot) => {
    callback(snapshot.val() ?? 0);
  });
}

export function incrementTestTakers() {
  if (!database) {
    return Promise.resolve();
  }

  const statsRef = ref(database, "stats/testTakers");
  return runTransaction(statsRef, (currentValue) => (currentValue ?? 0) + 1);
}
