import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions"; // Added for Cloud Functions

// 👇 Paste your own Firebase config from Firebase Console here
const firebaseConfig = {
  apiKey: "AIzaSyC-OiVgHjTsTzxcHz1pps7zRVxJ4sjlylI",
  authDomain: "mind-mosaic-472120.firebaseapp.com",
  projectId: "mind-mosaic-472120",
  storageBucket: "mind-mosaic-472120.firebasestorage.app",
  messagingSenderId: "768584416956",
  appId: "1:768584416956:web:f933be7b430fa8fb4e5ab9"
};


const app = initializeApp(firebaseConfig);

// Auth + Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);

// Firebase Functions (Added for Gemini AI integration)
export const functions = getFunctions(app);

export default app;
