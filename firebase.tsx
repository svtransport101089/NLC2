
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";

/**
 * Firebase Configuration
 * As per project guidelines, the API key must be obtained exclusively 
 * from the environment variable process.env.API_KEY.
 */
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "myecommercesite-eba8e.firebaseapp.com",
  projectId: "myecommercesite-eba8e",
  storageBucket: "myecommercesite-eba8e.firebasestorage.app",
  messagingSenderId: "425659370276",
  appId: "1:425659370276:web:bca31f863d6dcd67c881b1",
  measurementId: "G-XMFW8QS3JD"
};

// Initialize Firebase App with singleton pattern
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

/**
 * Configure offline persistence for Firestore.
 * Ensures the app remains functional even if the network is flaky or the API key 
 * takes time to validate in the cloud.
 */
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence is not supported by this browser');
    }
  });
}

// Analytics and Installations services are intentionally omitted to avoid 
// "INVALID_ARGUMENT" errors in restricted environments.
export { app, db };
