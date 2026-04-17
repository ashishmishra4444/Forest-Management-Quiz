import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signInWithPopup,
  signOut,
} from "firebase/auth";
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
let auth = null;

if (hasFirebaseConfig) {
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
}

export function isRealtimeEnabled() {
  return hasFirebaseConfig && Boolean(database);
}

export function isFirebaseEnabled() {
  return hasFirebaseConfig && Boolean(auth);
}

export function subscribeToAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export function getFriendlyAuthError(error) {
  switch (error?.code) {
    case "auth/popup-closed-by-user":
      return "The Google sign-in popup was closed before completing sign-in. Redirect sign-in will be used instead.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup. Redirect sign-in will be used instead.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Authentication yet. Add localhost to Firebase Auth authorized domains.";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled for this Firebase project yet.";
    default:
      return error?.message ?? "Unable to sign in with Google right now.";
  }
}

export async function resolveRedirectSignIn() {
  if (!auth) {
    return null;
  }

  try {
    return await getRedirectResult(auth);
  } catch (error) {
    throw new Error(getFriendlyAuthError(error));
  }
}

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error("Firebase auth is not configured.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/popup-blocked") {
      await signInWithRedirect(auth, provider);
      return null;
    }

    throw new Error(getFriendlyAuthError(error));
  }
}

export async function signOutUser() {
  if (!auth) {
    return;
  }

  await signOut(auth);
}

export async function getUserIdToken(forceRefresh = false) {
  if (!auth?.currentUser) {
    return "";
  }

  return auth.currentUser.getIdToken(forceRefresh);
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
